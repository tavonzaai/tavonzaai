"""
Role Definitions & Role-Based Access Control Policies.
Aligns with:
- packages/authorization/src/role.ts
- packages/authorization/src/permission.ts
- .agent/AUTHORIZATION.md
- .agent/AI.md
"""

from enum import StrEnum
from typing import Final


class RoleLabel(StrEnum):
    CUSTOMER = "customer"
    WAITER = "waiter"
    KITCHEN = "kitchen"
    CASHIER = "cashier"
    MANAGER = "manager"
    OWNER = "owner"
    SUPER_ADMIN = "super_admin"


# Canonical default permissions mirroring packages/authorization/src/role.ts
ROLE_DEFAULT_PERMISSIONS: Final[dict[str, list[str]]] = {
    RoleLabel.CUSTOMER: [
        "menu.read",
        "orders.read",
        "orders.create",
        "table_sessions.read",
        "table_sessions.join",
        "payments.create",
        "feedback.create",
        "customer_sessions.read",
        "customer_sessions.create",
        "alerts.create",
    ],
    RoleLabel.WAITER: [
        "menu.read",
        "orders.read",
        "orders.create",
        "orders.accept",
        "orders.reject",
        "orders.serve",
        "tables.read",
        "tables.update",
        "table_sessions.read",
        "alerts.read",
        "alerts.acknowledge",
        "alerts.resolve",
        "customers.create",
    ],
    RoleLabel.KITCHEN: [
        "orders.read",
        "kitchen.read",
        "kitchen.update",
    ],
    RoleLabel.CASHIER: [
        "orders.read",
        "payments.read",
        "payments.create",
        "table_sessions.read",
        "table_sessions.close",
    ],
    RoleLabel.MANAGER: [
        "menu.read",
        "menu.update",
        "orders.read",
        "orders.accept",
        "orders.reject",
        "orders.update",
        "orders.serve",
        "tables.read",
        "tables.update",
        "table_sessions.read",
        "table_sessions.close",
        "payments.read",
        "payments.create",
        "payments.refund",
        "staff.read",
        "reports.read",
        "inventory.read",
        "kitchen.read",
    ],
    RoleLabel.OWNER: ["*"],
    RoleLabel.SUPER_ADMIN: ["*"],
}

# The 8 approved AI tools in tavonza-ai
ALL_RESTRICTED_TOOLS: Final[set[str]] = {
    "get_menu",
    "get_table_status",
    "get_order_status",
    "get_kitchen_queue",
    "get_branch_summary",
    "get_audit_events",
    "get_table_bill",
    "get_inventory",
}

# Approved tools per role
ROLE_ALLOWED_TOOLS: Final[dict[str, set[str]]] = {
    RoleLabel.CUSTOMER: {"get_menu", "get_order_status", "get_table_bill"},
    RoleLabel.WAITER: {"get_menu", "get_table_status", "get_order_status"},
    RoleLabel.KITCHEN: {"get_order_status", "get_kitchen_queue"},
    RoleLabel.CASHIER: {"get_order_status", "get_table_bill"},
    RoleLabel.MANAGER: {
        "get_menu",
        "get_table_status",
        "get_order_status",
        "get_kitchen_queue",
        "get_branch_summary",
        "get_audit_events",
        "get_table_bill",
        "get_inventory",
    },
    RoleLabel.OWNER: set(ALL_RESTRICTED_TOOLS),
    RoleLabel.SUPER_ADMIN: set(ALL_RESTRICTED_TOOLS),
}


ROLE_ALIASES: Final[dict[str, str]] = {
    "branch_manager": RoleLabel.MANAGER,
    "manager": RoleLabel.MANAGER,
    "kitchen_staff": RoleLabel.KITCHEN,
    "kitchen": RoleLabel.KITCHEN,
    "chef": RoleLabel.KITCHEN,
    "cook": RoleLabel.KITCHEN,
    "bartender": RoleLabel.KITCHEN,
    "waiter": RoleLabel.WAITER,
    "server": RoleLabel.WAITER,
    "host": RoleLabel.WAITER,
    "cashier": RoleLabel.CASHIER,
    "customer": RoleLabel.CUSTOMER,
    "guest": RoleLabel.CUSTOMER,
    "admin": RoleLabel.SUPER_ADMIN,
    "super_admin": RoleLabel.SUPER_ADMIN,
    "owner": RoleLabel.OWNER,
    "restaurant_owner": RoleLabel.OWNER,
}


def normalize_role(role: str | None) -> str:
    """Normalizes platform/staff/global role strings into canonical RoleLabel."""
    if not role:
        return ""
    clean = str(role).strip().lower().replace("-", "_").replace(" ", "_")
    return ROLE_ALIASES.get(clean, clean)


def resolve_role_permissions(
    role: str | None,
    explicit_permissions: list[str] | None = None,
) -> list[str]:
    """
    Combines role defaults with explicit permissions, mirroring
    packages/authorization/src/role.ts `resolvePermissions`.
    """
    if not role:
        return list(dict.fromkeys(explicit_permissions or []))
    canonical_role = normalize_role(role)
    defaults = ROLE_DEFAULT_PERMISSIONS.get(canonical_role, [])
    if "*" in defaults or (explicit_permissions and "*" in explicit_permissions):
        return ["*"]
    combined = set(defaults)
    if explicit_permissions:
        combined.update(explicit_permissions)
    return sorted(combined)


def get_allowed_tools_for_role(role: str) -> set[str]:
    """Returns the set of AI tools approved for this role."""
    canonical_role = normalize_role(role)
    return ROLE_ALLOWED_TOOLS.get(canonical_role, set())


def get_blocked_tools_for_role(role: str) -> set[str]:
    """Returns the set of AI tools strictly blocked for this role."""
    canonical_role = normalize_role(role)
    allowed = ROLE_ALLOWED_TOOLS.get(canonical_role)
    if allowed is None:
        # Unknown role: fail closed, block all tools
        return set(ALL_RESTRICTED_TOOLS)
    return ALL_RESTRICTED_TOOLS - allowed


def is_tool_allowed_for_role(tool_name: str, role: str) -> bool:
    """Check if tool is in the allowed set for the given role."""
    canonical_role = normalize_role(role)
    allowed = ROLE_ALLOWED_TOOLS.get(canonical_role)
    if allowed is None:
        return False
    return tool_name in allowed
