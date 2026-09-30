"""
Action Risk Policies — Reference: .agent/AI.md Section "Action Risk"
Classifies tools into risk tiers:
- READ_ONLY: May execute automatically when authorized.
- LOW_RISK_MUTATION: May execute automatically when authorized and domain rules permit.
- HIGH_RISK_MUTATION: Requires explicit confirmation handshake or stronger policy.
"""

from enum import StrEnum


class ActionRiskTier(StrEnum):
    READ_ONLY = "read_only"
    LOW_RISK_MUTATION = "low_risk_mutation"
    HIGH_RISK_MUTATION = "high_risk_mutation"



HIGH_RISK_ACTIONS = {
    "refund_payment",
    "apply_large_discount",
    "modify_permissions",
    "cancel_entire_order",
    "delete_menu_item",
}

LOW_RISK_ACTIONS = {
    "accept_order",
    "complete_order_item",
    "serve_order",
}


def get_action_risk_tier(action_name: str) -> ActionRiskTier:
    if action_name in HIGH_RISK_ACTIONS:
        return ActionRiskTier.HIGH_RISK_MUTATION
    if action_name in LOW_RISK_ACTIONS:
        return ActionRiskTier.LOW_RISK_MUTATION
    return ActionRiskTier.READ_ONLY


def requires_confirmation(action_name: str) -> bool:
    return get_action_risk_tier(action_name) == ActionRiskTier.HIGH_RISK_MUTATION
