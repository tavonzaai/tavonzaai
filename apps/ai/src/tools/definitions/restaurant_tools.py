"""
Restaurant tool definitions — approved tool inventory.
Reference: .agent/AI.md Section "Tool Gateway"
"""

TOOLS: dict[str, dict] = {
    "get_menu": {
        "required_permission": "menu.read",
        "risk_tier": "read_only",
        "schema": {
            "type": "function",
            "function": {
                "name": "get_menu",
                "description": "Get the restaurant menu with dish ingredients, prices, dietary tags, allergens, and pairing recommendations. Supports filtering by category, dietary preferences, excluded allergens, and price ceiling.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "category": {
                            "type": ["string", "null"],
                            "description": "Filter by menu section or category: 'Mains', 'Starters', 'Desserts', 'Drinks', 'Wines', 'Burgers', 'Pizza', or null for all.",
                        },
                        "dietary_preference": {
                            "type": ["string", "null"],
                            "description": "Filter by diet: 'keto', 'vegan', 'vegetarian', 'gluten_free', 'halal', 'high_protein', or null for all.",
                        },
                        "exclude_allergens": {
                            "type": ["array", "null"],
                            "items": {"type": "string"},
                            "description": "List of allergens to strictly exclude, e.g. ['nuts', 'dairy', 'gluten', 'shellfish', 'eggs'].",
                        },
                        "max_price": {
                            "type": ["number", "null"],
                            "description": "Optional maximum item price budget limit.",
                        },
                    },
                    "required": [],
                },
            },
        },
    },
    "get_table_status": {
        "required_permission": "tables.read",
        "risk_tier": "read_only",
        "schema": {
            "type": "function",
            "function": {
                "name": "get_table_status",
                "description": "Get the current status of a specific table.",
                "parameters": {
                    "type": "object",
                    "properties": {"table_id": {"type": "string"}},
                    "required": ["table_id"],
                },
            },
        },
    },
    "get_order_status": {
        "required_permission": "orders.read",
        "risk_tier": "read_only",
        "schema": {
            "type": "function",
            "function": {
                "name": "get_order_status",
                "description": "Get the current status of an order, inspect active orders for a specific table, or list all pending and active orders across the dining floor. Pass 'pending' or 'all' to retrieve all pending, preparing, ready, or payment-pending orders across all tables. For a specific table, pass the table identifier (e.g. 'Table 4', 'T-04', '4') or order ID.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "order_id": {
                            "type": ["string", "null"],
                            "description": "Optional order ID, table identifier (e.g. 'Table 4', 'T-04', '4'), or 'pending' / 'all' to inspect all pending and active floor orders.",
                        }
                    },
                    "required": [],
                },
            },
        },
    },
    "get_kitchen_queue": {
        "required_permission": "kitchen.read",
        "risk_tier": "read_only",
        "schema": {
            "type": "function",
            "function": {
                "name": "get_kitchen_queue",
                "description": "Get current active orders and tickets in the kitchen preparation queue.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "station": {
                            "type": ["string", "null"],
                            "description": "Optional station filter ('grill', 'cold', 'fryer', 'coffee', 'bar') or null for all.",
                        }
                    },
                    "required": [],
                },
            },
        },
    },
    "get_branch_summary": {
        "required_permission": "reports.read",
        "risk_tier": "read_only",
        "schema": {
            "type": "function",
            "function": {
                "name": "get_branch_summary",
                "description": "Get executive operational summary for the branch: total tables, occupied, open orders count, and audit event volume.",
                "parameters": {"type": "object", "properties": {}, "required": []},
            },
        },
    },
    "get_audit_events": {
        "required_permission": "reports.read",
        "risk_tier": "read_only",
        "schema": {
            "type": "function",
            "function": {
                "name": "get_audit_events",
                "description": "Get the most recent system audit logs and actor actions for this restaurant branch.",
                "parameters": {"type": "object", "properties": {}, "required": []},
            },
        },
    },
    "get_table_bill": {
        "required_permission": "payments.read",
        "risk_tier": "read_only",
        "schema": {
            "type": "function",
            "function": {
                "name": "get_table_bill",
                "description": "Get the current bill breakdown for a dining table including items, subtotal, tax, and balance due.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "table_id": {
                            "type": "string",
                            "description": "The table code (e.g. 'T1', 'T2') or session ID.",
                        }
                    },
                    "required": ["table_id"],
                },
            },
        },
    },
    "get_inventory": {
        "required_permission": "inventory.read",
        "risk_tier": "read_only",
        "schema": {
            "type": "function",
            "function": {
                "name": "get_inventory",
                "description": "Get current restaurant inventory stock levels, par thresholds, and identify low stock or critical ingredients.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "low_stock_only": {
                            "type": "boolean",
                            "description": "If true, only return items at or below their par level.",
                        }
                    },
                    "required": [],
                },
            },
        },
    },
}
