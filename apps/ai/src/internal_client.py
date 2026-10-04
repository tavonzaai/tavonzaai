"""
InternalClient — the ONLY module in tavonza-ai that communicates with the platform backend.
Enforces the architectural principle from .agent/AI.md:
  AI -> Agent Runtime -> Tool Gateway -> Authorization -> Application -> Database
Never:
  AI -> SQL -> Database
"""

import logging
from typing import Any

import httpx

from .config import settings
from .models import ActorContext
from .policies.roles import resolve_role_permissions

logger = logging.getLogger(__name__)


class BackendUnavailableError(Exception):
    """Raised when the backend is unreachable and we are NOT in dev mock mode."""


class InternalClient:
    def __init__(self) -> None:
        headers = {}
        if settings.internal_api_service_token:
            headers["Authorization"] = f"Bearer {settings.internal_api_service_token}"
        self._client = httpx.AsyncClient(
            base_url=settings.internal_api_base_url,
            headers=headers,
            timeout=10.0,
        )

    async def aclose(self) -> None:
        await self._client.aclose()

    # ---- 1. Role-based auth ----
    async def resolve_actor(self, user_token: str) -> ActorContext | None:
        if settings.dev_mode_mock_backend:
            return self._mock_actor(user_token)

        try:
            resp = await self._client.post("/auth/resolve-actor", json={"token": user_token})
            if resp.status_code == 200:
                return ActorContext(**resp.json())
            if resp.status_code in (401, 403):
                # Backend explicitly rejected token
                return None
            raise BackendUnavailableError(
                f"Backend returned HTTP {resp.status_code}: {resp.text}"
            )
        except httpx.RequestError as e:
            # Network failure in production — fail closed (Rule 4: Fail closed)
            raise BackendUnavailableError(
                f"Backend unreachable: {type(e).__name__}"
            ) from e

    # ---- 2. Context bootstrap ----
    async def get_context_bootstrap(self, actor: ActorContext) -> dict[str, Any]:
        if settings.dev_mode_mock_backend:
            return {
                "assigned_tables": actor.resource_scope.get("tables", []),
                "active_sessions": ["TS_dev_001"],
            }
        try:
            resp = await self._client.get(
                "/context/bootstrap",
                params={
                    "actor_id": actor.acting_user_id or actor.ai_agent_id,
                    "branch_id": actor.branch_id,
                },
            )
            resp.raise_for_status()
            return resp.json()
        except Exception:
            return {
                "assigned_tables": actor.resource_scope.get("tables", []),
                "active_sessions": [],
            }

    # ---- 3. Tool execution (Tool Gateway) ----
    async def execute_tool(self, tool_name: str, args: dict[str, Any], actor: ActorContext) -> dict[str, Any]:
        if settings.dev_mode_mock_backend:
            return self._mock_tool_result(tool_name, args)
        try:
            resp = await self._client.post(
                "/tools/execute",
                json={
                    "tool": tool_name,
                    "args": args,
                    "scope": {
                        "organization_id": actor.organization_id,
                        "branch_id": actor.branch_id,
                    },
                    "actor": actor.model_dump(),
                },
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as exc:
            logger.error("Backend tool execution failed for '%s': %s", tool_name, exc)
            return {"ok": False, "error": f"Tool execution failed: {exc}"}

    # ---- 4. Confirmation handshake (high-risk tools) ----
    async def confirm_tool(self, pending_confirmation_id: str, actor: ActorContext) -> dict[str, Any]:
        if settings.dev_mode_mock_backend:
            return {"ok": True, "data": {"confirmed": True}}
        resp = await self._client.post(
            "/tools/execute/confirm",
            json={"pending_confirmation_id": pending_confirmation_id, "actor": actor.model_dump()},
        )
        resp.raise_for_status()
        return resp.json()

    # ---- 5. Audit ----
    async def write_audit(self, record: dict[str, Any]) -> None:
        if settings.dev_mode_mock_backend:
            logger.debug("[AUDIT-MOCK] %s", record)
            return
        try:
            await self._client.post("/audit", json=record)
        except Exception as exc:
            logger.error("[AUDIT-FALLBACK] Failed to write audit: %s. Record: %s", exc, record)

    # ---- Local fixtures (used only when DEV_MODE_MOCK_BACKEND=true) ----
    def _mock_actor(self, user_token: str = "") -> ActorContext:
        import base64
        import json

        token_lower = (user_token or "").lower()

        # 1. JWT Token Parsing
        if user_token and "." in user_token:
            try:
                parts = user_token.split(".")
                if len(parts) >= 2:
                    padding = "=" * (4 - len(parts[1]) % 4)
                    payload_bytes = base64.urlsafe_b64decode(parts[1] + padding)
                    payload = json.loads(payload_bytes.decode("utf-8"))
                    role = payload.get("role")
                    permissions = payload.get("permissions") or resolve_role_permissions(str(role) if role else None)
                    return ActorContext(
                        actor_type=payload.get("actor_type", "USER"),
                        acting_user_id=str(payload.get("acting_user_id") or payload.get("sub", "dev-user-1")),
                        ai_agent_id=payload.get("ai_agent_id", settings.ai_agent_default_id),
                        role=role,
                        organization_id=str(payload.get("organization_id", "org_dev")),
                        restaurant_id=str(payload.get("restaurant_id", "rest_dev")),
                        branch_id=str(payload.get("branch_id", "branch_dev")),
                        permissions=permissions,
                        resource_scope=payload.get("resource_scope", {}),
                    )
            except Exception:
                pass

        token_lower = (user_token or "").lower()
        if any(k in token_lower for k in ("customer", "guest")):
            return ActorContext(
                actor_type="USER",
                acting_user_id="cust-dev-01",
                role="customer",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=resolve_role_permissions("customer"),
                resource_scope={"role": "CUSTOMER", "table_code": "T1", "table_session_id": "ts_dev_1"},
            )
        if any(k in token_lower for k in ("waiter", "server")):
            return ActorContext(
                actor_type="USER",
                acting_user_id="waiter-dev-01",
                role="waiter",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=resolve_role_permissions("waiter"),
                resource_scope={"role": "WAITER", "tables": ["T1", "T2", "T5"]},
            )
        if any(k in token_lower for k in ("kitchen", "chef")):
            return ActorContext(
                actor_type="USER",
                acting_user_id="chef-dev-01",
                role="kitchen",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=resolve_role_permissions("kitchen"),
                resource_scope={"role": "KITCHEN", "stations": ["grill", "cold", "fryer"]},
            )
        if "cashier" in token_lower:
            return ActorContext(
                actor_type="USER",
                acting_user_id="cashier-dev-01",
                role="cashier",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=resolve_role_permissions("cashier"),
                resource_scope={"role": "CASHIER"},
            )
        if "manager" in token_lower:
            return ActorContext(
                actor_type="USER",
                acting_user_id="manager-dev-01",
                role="manager",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=resolve_role_permissions("manager"),
                resource_scope={"role": "MANAGER"},
            )
        if any(k in token_lower for k in ("owner", "admin", "super", "system", "internal")):
            return ActorContext(
                actor_type="USER",
                acting_user_id="owner-dev-01",
                role="owner",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=["*"],
                resource_scope={"role": "ADMIN"},
            )
        return ActorContext(
            actor_type="USER",
            acting_user_id="waiter-staff",
            ai_agent_id=settings.ai_agent_default_id,
            role="manager",
            organization_id="org_dev",
            restaurant_id="rest_dev",
            branch_id="branch_dev",
            permissions=resolve_role_permissions("waiter"),
            resource_scope={"role": "WAITER", "tables": ["T1", "T2", "T5"]},
        )

    def _mock_tool_result(self, tool_name: str, args: dict[str, Any]) -> dict[str, Any]:
        if tool_name == "get_menu":
            all_items: list[dict[str, Any]] = [
                {
                    "name": "Classic Wagyu Smash Burger",
                    "price": 26.50,
                    "category": "Mains",
                    "dietary": ["high_protein", "high-protein"],
                    "allergens": ["gluten", "dairy"],
                    "description": "Double American wagyu beef patties, aged cheddar, smoked bacon jam, brioche bun. #1 top-selling guest favorite.",
                    "pairing": "2021 Tuscan Chianti Classico Riserva or Craft IPA",
                    "tags": ["top-seller", "bestseller", "popular"],
                    "is_bestseller": True,
                },
                {
                    "name": "Pan-Seared Line-Caught Seabass",
                    "price": 34.00,
                    "category": "Mains",
                    "dietary": ["keto", "gluten_free", "gluten-free", "high_protein", "high-protein", "organic"],
                    "allergens": ["fish"],
                    "description": "Crispy skin sea bass, braised baby carrots, fennel crisp, herb citrus reduction. Chef signature top-seller.",
                    "pairing": "2022 Oaked Chardonnay or Crisp Pinot Grigio",
                    "tags": ["top-seller", "bestseller", "chef-special"],
                    "is_bestseller": True,
                },
                {
                    "name": "Grilled Prime Ribeye (300g)",
                    "price": 38.00,
                    "category": "Mains",
                    "dietary": ["keto", "gluten_free", "gluten-free", "high_protein", "high-protein", "halal"],
                    "allergens": [],
                    "description": "Prime Black Angus ribeye with roasted rosemary garlic butter and red wine jus.",
                    "pairing": "2021 Tuscan Chianti Classico Riserva",
                    "tags": ["top-seller", "premium"],
                    "is_bestseller": True,
                },
                {
                    "name": "Caesar Salad",
                    "price": 9.0,
                    "category": "Starters",
                    "dietary": ["vegetarian"],
                    "allergens": ["dairy"],
                    "description": "Romaine lettuce, parmesan, garlic croutons.",
                    "tags": ["starter", "classic"],
                    "is_bestseller": False,
                },
                {
                    "name": "Avocado Green Salad Bowl",
                    "price": 14.0,
                    "category": "Starters",
                    "dietary": ["vegan", "gluten-free", "organic", "keto"],
                    "allergens": [],
                    "description": "Fresh avocado, mixed baby greens, citrus vinaigrette.",
                    "tags": ["popular", "healthy", "vegan"],
                    "is_bestseller": False,
                },
                {
                    "name": "Wild Mushroom Truffle Risotto",
                    "price": 24.00,
                    "category": "Mains",
                    "dietary": ["vegetarian", "gluten_free", "gluten-free"],
                    "allergens": ["dairy"],
                    "description": "Carnaroli rice, wild forest porcini, white truffle oil, shaved pecorino.",
                    "pairing": "Light Pinot Noir",
                },
                {
                    "name": "Arancini al Tartufo",
                    "price": 14.50,
                    "category": "Starters",
                    "dietary": ["vegetarian", "organic"],
                    "allergens": ["gluten", "dairy"],
                    "description": "Crispy black truffle risotto croquettes, aged parmesan, roasted garlic aioli.",
                    "pairing": "Sparkling Prosecco Superiore",
                },
                {
                    "name": "Organic Garden Caesar Salad",
                    "price": 11.00,
                    "category": "Starters",
                    "dietary": ["vegetarian", "organic"],
                    "allergens": ["dairy", "gluten", "eggs"],
                    "description": "Crisp baby gem lettuce, sourdough croutons, shaved parmesan, garlic emulsion.",
                    "pairing": "Sauvignon Blanc",
                },
                {
                    "name": "Flourless Dark Chocolate Torte",
                    "price": 10.00,
                    "category": "Desserts",
                    "dietary": ["vegetarian", "gluten_free", "gluten-free"],
                    "allergens": ["dairy", "eggs"],
                    "description": "70% Valrhona dark chocolate cake, espresso mascarpone, raspberry coulis.",
                    "pairing": "Espresso or Vintage Port",
                },
                {
                    "name": "2021 Tuscan Chianti Classico Riserva",
                    "price": 14.00,
                    "category": "Wines",
                    "dietary": ["vegan", "gluten_free", "gluten-free"],
                    "allergens": ["sulfites"],
                    "description": "Full-bodied dry red with wild blackberry, dark cherry, and cedar oak notes.",
                },
                {
                    "name": "2022 Oaked Chardonnay",
                    "price": 12.00,
                    "category": "Wines",
                    "dietary": ["vegan", "gluten_free", "gluten-free"],
                    "allergens": ["sulfites"],
                    "description": "Creamy white wine with notes of green apple, toasted brioche, and vanilla.",
                },
                {
                    "name": "Citrus Botanical Craft IPA",
                    "price": 8.00,
                    "category": "Drinks",
                    "dietary": ["vegan"],
                    "allergens": ["gluten"],
                    "description": "Locally brewed hazy IPA with passionfruit, citrus zest, and mosaic hops. Best-selling beverage.",
                    "tags": ["bestseller", "drink"],
                    "is_bestseller": True,
                },
            ]

            filtered = all_items
            cat = str(args.get("category") or "").strip().lower()
            if cat and cat != "all":
                filtered = [it for it in filtered if cat in str(it.get("category", "")).lower()]

            diet = str(args.get("dietary_preference") or "").strip().lower().replace("-", "_")
            if diet:
                filtered = [
                    it for it in filtered
                    if any(diet in str(d).lower().replace("-", "_") for d in (it.get("dietary") or []))
                ]

            raw_exclude = args.get("exclude_allergens")
            exclude_allergens = []
            if isinstance(raw_exclude, list):
                exclude_allergens = [str(a).lower().strip() for a in raw_exclude if isinstance(a, str)]
            elif isinstance(raw_exclude, str) and raw_exclude.strip():
                exclude_allergens = [a.strip().lower() for a in raw_exclude.split(",") if a.strip()]

            if exclude_allergens:
                filtered = [
                    it for it in filtered
                    if isinstance(it.get("allergens"), list)
                    and not any(allg in it["allergens"] for allg in exclude_allergens)
                ]

            max_p = args.get("max_price")
            if max_p is not None:
                try:
                    price_limit = float(max_p)
                    filtered = [it for it in filtered if float(it.get("price", 0.0)) <= price_limit]
                except (ValueError, TypeError):
                    pass

            return {"ok": True, "data": {"items": filtered, "total_count": len(filtered)}}

        fixtures: dict[str, Any] = {
            "get_table_status": {"table_id": args.get("table_id"), "status": "OCCUPIED"},
            "get_order_status": {"order_id": args.get("order_id"), "status": "PREPARING"},
            "get_kitchen_queue": {
                "station": args.get("station") or "ALL",
                "pending_count": 3,
                "items": [
                    {"name": "Ribeye Steak", "station": "grill", "quantity": 1, "status": "IN_PREPARATION", "table": "T1"},
                    {"name": "Caesar Salad", "station": "cold", "quantity": 2, "status": "RECEIVED", "table": "T2"},
                    {"name": "French Fries", "station": "fryer", "quantity": 1, "status": "IN_PREPARATION", "table": "T1"},
                ],
            },
            "get_branch_summary": {
                "total_tables": 3, "occupied_tables": 1, "available_tables": 2,
                "open_orders": 2, "audit_events_count": 95,
            },
            "get_audit_events": {
                "events": [
                    {"action": "order.created", "actor": "Customer T1", "timestamp": "Just now"},
                    {"action": "kitchen.item_started", "actor": "Priya Nair", "timestamp": "1m ago"},
                ],
            },
            "get_table_bill": {
                "table_code": args.get("table_id") or "T1",
                "subtotal": 52.5, "tax": 5.25, "total": 57.75,
                "paid_amount": 0.0, "balance_due": 57.75, "status": "UNPAID",
                "items": [
                    {"name": "Wagyu Burger", "quantity": 2, "price": 18.5, "line_total": 37.0},
                    {"name": "Caesar Salad", "quantity": 1, "price": 8.5, "line_total": 8.5},
                    {"name": "Craft IPA", "quantity": 1, "price": 7.0, "line_total": 7.0},
                ],
            },
            "get_inventory": {
                "branch_id": "branch_dev",
                "total_items": 15, "low_stock_count": 1, "critical_count": 0,
                "items": [
                    {"sku_code": "PARMESAN", "name": "Parmesan grated", "on_hand": 1.8, "par_level": 2.0, "unit": "kg", "status": "LOW_STOCK"},
                    {"sku_code": "BEEF-PATTY", "name": "Beef patty 150g", "on_hand": 18.0, "par_level": 10.0, "unit": "kg", "status": "HEALTHY"},
                ],
            },
        }
        return {"ok": True, "data": fixtures.get(tool_name, {})}
