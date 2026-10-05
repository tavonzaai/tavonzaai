"""
Context Builder — Reference: .agent/AI.md Section "Context"
Builds a scoped, minimal natural-language summary for the agent's system prompt.
"""

from src.context.scope_resolver import resolve_safe_scope
from src.internal_client import InternalClient
from src.models import ActorContext


async def build_context(client: InternalClient, actor: ActorContext) -> str:
    """Returns a short natural-language summary for the system prompt."""
    safe_scope = resolve_safe_scope(actor)
    table_code = safe_scope.get("table_code")

    if table_code:
        session_id = safe_scope.get("table_session_id", "active")
        return (
            f"You are speaking with a guest seated at Table {table_code} (Table Session #{session_id}). "
            f"Strictly focus on Table {table_code}. "
            f"Never show, disclose, or discuss orders from other tables."
        )

    from src.policies.roles import normalize_role

    role = normalize_role(actor.role)

    if role == "kitchen" or ("items.write" in actor.permissions and "reports.read" not in actor.permissions):
        station = safe_scope.get("station", "all stations")
        return (
            f"You are speaking with Kitchen Staff / Chef (Station: {station}). "
            "You are responsible for food preparation tickets, cooking stations, and the kitchen queue. "
            "You do NOT manage dining room tables, seating, or customer service."
        )

    if role == "waiter" or ("orders.serve" in actor.permissions and "reports.read" not in actor.permissions):
        raw = await client.get_context_bootstrap(actor)
        tables = raw.get("assigned_tables", [])
        sessions = raw.get("active_sessions", [])
        return (
            f"You are speaking with a Floor Waiter. "
            f"Assigned floor tables: {tables}. Active dining sessions: {len(sessions)}. "
            "Focus on dining room table monitoring, guest ordering, and serving ready dishes."
        )

    if role == "cashier" or ("payments.write" in actor.permissions and "reports.read" not in actor.permissions):
        raw = await client.get_context_bootstrap(actor)
        tables = raw.get("assigned_tables", [])
        sessions = raw.get("active_sessions", [])
        return (
            f"You are speaking with the Branch Cashier. "
            f"Active dining table sessions: {len(sessions)}. Tables: {tables}. "
            "You assist with checking table bills, order subtotals, tax, payment statuses, and receipt breakdowns. "
            "You do NOT manage cooking in the kitchen or take orders on the floor."
        )

    if role in ("manager", "owner", "super_admin") or "reports.read" in actor.permissions:
        raw = await client.get_context_bootstrap(actor)
        tables = raw.get("assigned_tables", [])
        sessions = raw.get("active_sessions", [])
        return (
            f"You are speaking with the General Manager. "
            f"Branch tables: {tables}. Active dining sessions: {len(sessions)}. "
            "Full operational oversight over branch KPIs, audit event logs, kitchen throughput, and floor occupancy."
        )

    raw = await client.get_context_bootstrap(actor)
    tables = raw.get("assigned_tables", [])
    sessions = raw.get("active_sessions", [])
    return f"Staff operational context. Tables: {tables}. Active sessions: {len(sessions)}."
