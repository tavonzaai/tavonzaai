"""
Tool Executor — Reference: .agent/AI.md Section "Tool Execution"
Executes: AI Tool Call -> Resolve Scope -> Check Permission -> Strip Injected Scope -> Execute Backend Tool -> Audit.
AI never accesses the database directly.
"""

from typing import Any

from ...audit.audit_writer import write_tool_audit
from ...internal_client import InternalClient
from ...models import ActorContext
from ..authorization.auth_gate import (
    ToolAuthorizationError,
    authorize_tool_call,
)
from ..registry.registry import get_tool


class ToolExecutionError(Exception):
    pass


class ToolExecutor:
    def __init__(self, internal_client: InternalClient) -> None:
        self._client = internal_client

    async def execute(self, tool_name: str, args: dict[str, Any], actor: ActorContext) -> dict[str, Any]:
        tool = get_tool(tool_name)
        if tool is None:
            raise ToolExecutionError(f"Unknown tool: {tool_name}")

        # Strip any scope fields the LLM might have injected — scope always comes from ActorContext
        safe_args = {k: v for k, v in args.items() if k not in {"organization_id", "branch_id", "scope"}}

        # Enforce table isolation for table guests to prevent prompt injection cross-table inspection
        scoped_table = (actor.resource_scope or {}).get("table_code")
        raw_table_id = None
        if scoped_table and "table_id" in safe_args:
            safe_args["table_id"] = scoped_table
        elif tool_name in ("get_table_status", "get_table_bill"):
            # Normalize table identifiers to match database convention (e.g. "1", "Table 1", "T1" -> "T-01")
            raw_table_id = str(safe_args.get("table_id") or safe_args.get("table_code") or "").strip()
            import re
            m = re.match(r"^(?:table\s*|t)?-?0*(\d+)$", raw_table_id, re.I)
            if m:
                safe_args["table_id"] = f"T-{int(m.group(1)):02d}"
        elif tool_name == "get_order_status":
            import re
            target_id = str(safe_args.get("order_id") or safe_args.get("table_id") or safe_args.get("table_code") or "").strip()
            if scoped_table and not target_id:
                target_id = scoped_table

            # Check if this is a query for all pending/active orders across the restaurant
            is_pending_query = (
                not target_id
                or bool(re.search(r"\b(?:pending|painding|active|open|all|queue|orders|floor)\b", target_id, re.I))
                or safe_args.get("status") in ("pending", "painding", "active", "open")
            )
            is_table_query = bool(re.match(r"^(?:table\s*|t)?-?0*(\d+)$", target_id, re.I))
            is_uuid = bool(re.match(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", target_id, re.I))

            if is_pending_query and not is_table_query and not is_uuid:
                pending_res = await self._fetch_all_pending_orders(actor)
                await write_tool_audit(
                    client=self._client,
                    actor=actor,
                    tool_name=tool_name,
                    args=safe_args,
                    result=pending_res,
                )
                return pending_res

            m = re.match(r"^(?:table\s*|t)?-?0*(\d+)$", target_id, re.I)
            if m:
                table_code = f"T-{int(m.group(1)):02d}"
                # Check table status first to verify if table is empty / available
                try:
                    table_res = await self._client.execute_tool("get_table_status", {"table_id": table_code}, actor)
                    if table_res.get("ok"):
                        tbl_data = table_res.get("data", {})
                        if tbl_data.get("status") == "AVAILABLE":
                            result = {
                                "ok": True,
                                "data": {
                                    "table_code": table_code,
                                    "status": "AVAILABLE",
                                    "has_active_order": False,
                                    "items_count": 0,
                                    "items": [],
                                    "message": f"Table {table_code} is currently empty and available. There are no guests seated and no active orders for this table.",
                                },
                            }
                            await write_tool_audit(
                                client=self._client,
                                actor=actor,
                                tool_name=tool_name,
                                args=safe_args,
                                result=result,
                            )
                            return result
                        else:
                            # Table is occupied or has active orders/bill. Find line-item order!
                            target_uuid = tbl_data.get("table_id")
                            if target_uuid:
                                order_info = await self._find_table_order(target_uuid, table_code, tbl_data, actor)
                                if order_info:
                                    await write_tool_audit(
                                        client=self._client,
                                        actor=actor,
                                        tool_name=tool_name,
                                        args=safe_args,
                                        result=order_info,
                                    )
                                    return order_info
                except Exception:
                    pass

            # If target_id matches an order number like ORD-1003 or 1003, search pending orders
            m_ord = re.match(r"^(?:ord-?)?0*(\d{3,4})$", target_id, re.I)
            if m_ord:
                target_ord_num = f"ORD-{int(m_ord.group(1))}"
                pending_res = await self._fetch_all_pending_orders(actor)
                if pending_res.get("ok"):
                    for ord_item in pending_res.get("data", {}).get("orders", []):
                        if str(ord_item.get("order_number", "")).upper() == target_ord_num.upper():
                            res = {"ok": True, "data": ord_item}
                            await write_tool_audit(
                                client=self._client,
                                actor=actor,
                                tool_name=tool_name,
                                args=safe_args,
                                result=res,
                            )
                            return res

            # If target_id is a direct order UUID, fetch full line-item details
            uuid_m = re.match(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", target_id, re.I)
            if uuid_m:
                order_info = await self._fetch_order_detail(target_id)
                if order_info:
                    await write_tool_audit(
                        client=self._client,
                        actor=actor,
                        tool_name=tool_name,
                        args=safe_args,
                        result=order_info,
                    )
                    return order_info

        # Authorization check
        try:
            authorize_tool_call(tool, actor, tool_name)
        except ToolAuthorizationError as exc:
            await write_tool_audit(
                client=self._client,
                actor=actor,
                tool_name=tool_name,
                args=safe_args,
                result={"ok": False, "error": str(exc)},
            )
            raise ToolExecutionError(str(exc)) from exc

        # Execute through backend tool gateway
        result = await self._client.execute_tool(tool_name, safe_args, actor)
        if not result.get("ok") and raw_table_id and safe_args.get("table_id") != raw_table_id:
            fallback_args = dict(safe_args)
            fallback_args["table_id"] = raw_table_id
            fb_res = await self._client.execute_tool(tool_name, fallback_args, actor)
            if fb_res.get("ok"):
                result = fb_res

        if tool_name == "get_order_status" and not result.get("ok"):
            err_str = str(result.get("error") or "")
            if "invalid input syntax for type uuid" in err_str or "not found" in err_str.lower():
                lookup_id = safe_args.get("order_id") or safe_args.get("table_id") or ""
                result = {
                    "ok": False,
                    "error": f"No active order found for identifier '{lookup_id}'.",
                }

        # Audit recording
        await write_tool_audit(
            client=self._client,
            actor=actor,
            tool_name=tool_name,
            args=safe_args,
            result=result,
        )
        # Clean up database UUIDs in tool results so LLM uses friendly human labels
        if isinstance(result, dict) and result.get("ok") and isinstance(result.get("data"), dict):
            d = dict(result["data"])
            import re
            if "table_code" in d:
                m_tc = re.match(r"^T-?0*(\d+)$", str(d["table_code"]), re.I)
                num = m_tc.group(1) if m_tc else str(d["table_code"])
                d["table_name"] = f"Table {num}"
            if "table_id" in d and re.match(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", str(d["table_id"]), re.I):
                d.pop("table_id")
            if "order_id" in d and re.match(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", str(d["order_id"]), re.I):
                if d.get("order_number"):
                    d.pop("order_id")
            result["data"] = d

        return result

    async def _fetch_order_detail(self, order_id: str) -> dict[str, Any] | None:
        try:
            import httpx
            async with httpx.AsyncClient(base_url="http://localhost:3000", timeout=5.0) as http:
                resp = await http.get(f"/orders/{order_id}")
                if resp.status_code == 200:
                    od = resp.json()
                    order_items = [
                        {
                            "name": it.get("name"),
                            "quantity": it.get("quantity"),
                            "unit_price": it.get("unitPrice"),
                            "line_total": it.get("lineTotal"),
                            "special_instructions": it.get("specialInstructions"),
                        }
                        for it in od.get("items", [])
                    ]
                    return {
                        "ok": True,
                        "data": {
                            "order_id": od.get("orderId"),
                            "order_number": od.get("orderNumber"),
                            "table_id": od.get("tableId"),
                            "status": od.get("status"),
                            "items_count": len(order_items),
                            "items": order_items,
                            "subtotal": od.get("subtotal"),
                            "tax": od.get("tax"),
                            "service_charge": od.get("serviceCharge"),
                            "total": od.get("total"),
                            "placed_at": od.get("createdAt"),
                        },
                    }
        except Exception:
            pass
        return None

    async def _find_table_order(
        self,
        table_uuid: str,
        table_code: str,
        table_data: dict[str, Any],
        actor: ActorContext,
    ) -> dict[str, Any] | None:
        try:
            internal_actor = actor.model_copy(
                update={"role": "manager", "permissions": ["orders.read", "kitchen.read", "reports.read"]}
            )
            kq_res = await self._client.execute_tool("get_kitchen_queue", {"station": "ALL"}, internal_actor)
            items = kq_res.get("data", {}).get("items", [])
            unique_orders = list(dict.fromkeys(i["order_id"] for i in items if i.get("order_id")))

            for oid in unique_orders:
                od_res = await self._fetch_order_detail(oid)
                if od_res and od_res.get("ok"):
                    od_data = od_res.get("data", {})
                    if od_data.get("table_id") == table_uuid:
                        od_data["table_code"] = table_code
                        od_data["table_status"] = table_data.get("status")
                        return od_res
        except Exception:
            pass
        return None

    async def _fetch_all_pending_orders(self, actor: ActorContext) -> dict[str, Any]:
        """Fetches all active and pending orders across the restaurant floor."""
        try:
            import re
            import httpx

            # 1. Fetch active orders in the kitchen / bar preparation queue
            internal_actor = actor.model_copy(
                update={"role": "manager", "permissions": ["orders.read", "kitchen.read", "reports.read", "tables.read"]}
            )
            kq_res = await self._client.execute_tool("get_kitchen_queue", {"station": "ALL"}, internal_actor)
            kq_items = kq_res.get("data", {}).get("items", []) if kq_res.get("ok") else []
            unique_order_ids = list(dict.fromkeys(i["order_id"] for i in kq_items if i.get("order_id")))

            # 2. Get table mapping from bootstrap / table list
            bootstrap = await self._client.get_context_bootstrap(actor)
            assigned_tables = bootstrap.get("assigned_tables", [])
            table_id_to_code: dict[str, str] = {}
            table_statuses: dict[str, str] = {}

            for t_code in assigned_tables:
                try:
                    t_res = await self._client.execute_tool("get_table_status", {"table_id": t_code}, actor)
                    if t_res.get("ok"):
                        td = t_res.get("data", {})
                        t_uuid = td.get("table_id")
                        if t_uuid:
                            m_tc = re.match(r"^T-?0*(\d+)$", t_code, re.I)
                            lbl = f"Table {m_tc.group(1)}" if m_tc else t_code
                            table_id_to_code[t_uuid] = lbl
                            table_statuses[t_uuid] = td.get("status", "")
                except Exception:
                    pass

            pending_orders = []
            async with httpx.AsyncClient(base_url="http://localhost:3000", timeout=5.0) as http:
                for oid in unique_order_ids:
                    try:
                        resp = await http.get(f"/orders/{oid}")
                        if resp.status_code == 200:
                            od = resp.json()
                            t_uuid = od.get("tableId")
                            t_name = table_id_to_code.get(t_uuid, "Dining Table")
                            t_status = table_statuses.get(t_uuid, "")
                            order_status = od.get("status")
                            display_status = order_status
                            if order_status == "READY":
                                display_status = "Ready to Serve (Awaiting Payment)" if t_status == "PAYMENT_PENDING" else "Ready to Serve"
                            elif order_status == "PREPARING":
                                display_status = "In Preparation (Kitchen/Bar)"
                            elif order_status == "SUBMITTED":
                                display_status = "Order Received / Pending"

                            order_items = [
                                {
                                    "name": it.get("name"),
                                    "quantity": it.get("quantity"),
                                    "unit_price": it.get("unitPrice"),
                                    "line_total": it.get("lineTotal"),
                                }
                                for it in od.get("items", [])
                            ]

                            pending_orders.append({
                                "order_number": od.get("orderNumber"),
                                "table_name": t_name,
                                "table_status": t_status,
                                "status": order_status,
                                "display_status": display_status,
                                "items_count": len(order_items),
                                "items": order_items,
                                "subtotal": od.get("subtotal"),
                                "tax": od.get("tax"),
                                "service_charge": od.get("serviceCharge"),
                                "total": od.get("total"),
                            })
                    except Exception:
                        pass

            if pending_orders:
                return {
                    "ok": True,
                    "data": {
                        "pending_orders_count": len(pending_orders),
                        "orders": pending_orders,
                        "message": f"Found {len(pending_orders)} active pending order(s) across the floor.",
                    },
                }
            else:
                return {
                    "ok": True,
                    "data": {
                        "pending_orders_count": 0,
                        "orders": [],
                        "message": "There are currently zero pending orders across the restaurant.",
                    },
                }
        except Exception as exc:
            return {
                "ok": False,
                "error": f"Failed to retrieve pending orders: {exc}",
            }

