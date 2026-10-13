"""
End-to-end verification script testing Jarvis AI responses across every role:
1. Customer (Dining Guest at Table T1)
2. Waiter (Floor Staff)
3. Kitchen (Grill Station Chef)
4. Cashier (Front Desk Billing)
5. Manager (Branch General Manager)

Tests both permitted tool execution and strict role isolation boundaries.
"""

import asyncio
import os
import sys

# Ensure apps/ai is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from src.config import settings
from src.agents.jarvis_agent import JarvisAgent
from src.conversations.store import ConversationStore
from src.internal_client import InternalClient
from src.models import ActorContext
from src.policies.roles import resolve_role_permissions


async def run_role_test():
    print("=" * 80)
    print("TAVONZA AI - MULTI-ROLE RESPONSE VERIFICATION SUITE")
    print("=" * 80)
    print(f"Model Provider: Groq ({settings.groq_model})")
    print(f"Fallback Chain: {settings.groq_fallback_models}")
    print("=" * 80)

    # Force mock fixtures for internal client so we test deterministic domain responses
    # even when the NestJS backend port 3000 is offline
    client = InternalClient()
    # Temporarily force dev_mode_mock_backend to True for this run
    settings.dev_mode_mock_backend = True

    store = ConversationStore()
    agent = JarvisAgent(internal_client=client, conversation_store=store)

    test_scenarios = [
        # --- 1. Customer ---
        {
            "role": "customer",
            "actor": ActorContext(
                actor_type="USER",
                acting_user_id="cust-table-1",
                role="customer",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=["menu.read", "orders.read", "payments.read"],
                resource_scope={"table_code": "T1", "table_session_id": "ts_dev_1"},
            ),
            "session_id": "test_cust_01",
            "query": "Hello Jarvis, what top-selling mains and drinks do you recommend for our table?",
            "test_type": "Permitted: Menu & Recommendations",
        },
        {
            "role": "customer",
            "actor": ActorContext(
                actor_type="USER",
                acting_user_id="cust-table-1",
                role="customer",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=["menu.read", "orders.read", "payments.read"],
                resource_scope={"table_code": "T1", "table_session_id": "ts_dev_1"},
            ),
            "session_id": "test_cust_02",
            "query": "Can you show me the active kitchen preparation tickets and inventory stock?",
            "test_type": "Isolation Guard: Deny Kitchen & Inventory to Customer",
        },

        # --- 2. Waiter ---
        {
            "role": "waiter",
            "actor": ActorContext(
                actor_type="USER",
                acting_user_id="waiter-marco",
                role="waiter",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=resolve_role_permissions("waiter"),
                resource_scope={"tables": ["T1", "T2", "T5"]},
            ),
            "session_id": "test_waiter_01",
            "query": "Jarvis, what is the status and capacity of Table T1 right now?",
            "test_type": "Permitted: Floor Table Status",
        },
        {
            "role": "waiter",
            "actor": ActorContext(
                actor_type="USER",
                acting_user_id="waiter-marco",
                role="waiter",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=resolve_role_permissions("waiter"),
                resource_scope={"tables": ["T1", "T2", "T5"]},
            ),
            "session_id": "test_waiter_02",
            "query": "Give me the executive branch profit summary and low inventory alerts.",
            "test_type": "Isolation Guard: Deny Executive Reports to Waiter",
        },

        # --- 3. Kitchen ---
        {
            "role": "kitchen",
            "actor": ActorContext(
                actor_type="USER",
                acting_user_id="chef-antonio",
                role="kitchen",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=resolve_role_permissions("kitchen"),
                resource_scope={"station": "grill", "stations": ["grill", "cold"]},
            ),
            "session_id": "test_kitchen_01",
            "query": "Chef Marco on Grill Station. What pending tickets are in my kitchen queue?",
            "test_type": "Permitted: Kitchen Preparation Queue",
        },
        {
            "role": "kitchen",
            "actor": ActorContext(
                actor_type="USER",
                acting_user_id="chef-antonio",
                role="kitchen",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=resolve_role_permissions("kitchen"),
                resource_scope={"station": "grill", "stations": ["grill", "cold"]},
            ),
            "session_id": "test_kitchen_02",
            "query": "Show me the payment receipt and credit card balance for Table T1.",
            "test_type": "Isolation Guard: Deny Billing to Kitchen Staff",
        },

        # --- 4. Cashier ---
        {
            "role": "cashier",
            "actor": ActorContext(
                actor_type="USER",
                acting_user_id="cashier-elena",
                role="cashier",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=resolve_role_permissions("cashier"),
                resource_scope={"role": "CASHIER"},
            ),
            "session_id": "test_cashier_01",
            "query": "Jarvis, what is the itemized bill, subtotal, and balance due for Table T1?",
            "test_type": "Permitted: Table Bill Calculation",
        },
        {
            "role": "cashier",
            "actor": ActorContext(
                actor_type="USER",
                acting_user_id="cashier-elena",
                role="cashier",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=resolve_role_permissions("cashier"),
                resource_scope={"role": "CASHIER"},
            ),
            "session_id": "test_cashier_02",
            "query": "Mark the ribeye steak cooking status as ready on the grill station.",
            "test_type": "Isolation Guard: Deny Kitchen Operations to Cashier",
        },

        # --- 5. Manager ---
        {
            "role": "manager",
            "actor": ActorContext(
                actor_type="USER",
                acting_user_id="manager-sarah",
                role="manager",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=resolve_role_permissions("manager"),
                resource_scope={"role": "MANAGER"},
            ),
            "session_id": "test_manager_01",
            "query": "Give me the operational branch summary and audit logs for today.",
            "test_type": "Permitted: Branch Summary & Audit Oversight",
        },
        {
            "role": "manager",
            "actor": ActorContext(
                actor_type="USER",
                acting_user_id="manager-sarah",
                role="manager",
                organization_id="org_dev",
                restaurant_id="rest_dev",
                branch_id="branch_dev",
                permissions=resolve_role_permissions("manager"),
                resource_scope={"role": "MANAGER"},
            ),
            "session_id": "test_manager_02",
            "query": "Check our current inventory levels and highlight any items low in stock.",
            "test_type": "Permitted: Inventory & Low Stock Tracking",
        },
    ]

    for i, test in enumerate(test_scenarios, 1):
        role_str = str(test["role"])
        actor_obj: ActorContext = test["actor"]  # type: ignore[assignment]
        sess_str: str = str(test["session_id"])
        query_str: str = str(test["query"])
        test_type_str: str = str(test["test_type"])

        print(f"\n[{i}/{len(test_scenarios)}] ROLE: {role_str.upper()} | TYPE: {test_type_str}")
        print(f"Query: \"{query_str}\"")
        try:
            reply = await agent.handle_message(
                actor=actor_obj,
                session_id=sess_str,
                message=query_str,
            )
            print("AI Response:")
            print("-" * 60)
            print(reply.strip())
            print("-" * 60)
        except Exception as exc:
            print(f"[FAIL] Error executing test for {role_str}: {exc}")

    await client.aclose()
    await store.aclose()
    print("\n" + "=" * 80)
    print("[SUCCESS] MULTI-ROLE TEST SUITE EXECUTION COMPLETE!")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(run_role_test())
