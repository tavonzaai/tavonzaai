import json
import logging
from collections.abc import AsyncGenerator

from ..context.context_builder import build_context
from ..conversations.store import ConversationStore
from ..internal_client import InternalClient
from ..models import ActorContext
from ..providers.groq_provider import GroqProvider
from ..tools.executor.executor import ToolExecutionError, ToolExecutor
from ..tools.registry.registry import tools_for_actor

logger = logging.getLogger(__name__)

MAX_TOOL_ITERATIONS = 5

SYSTEM_PROMPT_TEMPLATE = """You are JARVIS, an autonomous AI Dining Concierge and Restaurant Operations Assistant for the Tavonza platform.
Acting as agent: {agent_id}
Branch: {branch_id}
Actor Role: {role_label}

{role_instructions}

AUTHORIZED READ-ONLY TOOLS:
{authorized_tools}

HOSPITALITY & DINING EXPERTISE:
- When recommending dishes, highlight flavors, ingredients, and pairings in an appetizing, hospitable manner.
- ALLERGEN SAFETY IS PARAMOUNT: When a guest mentions an allergy (e.g. nuts, dairy, gluten, shellfish, eggs), always invoke get_menu with appropriate filters or strictly verify that every suggested item is allergen-safe. If uncertain, advise the guest to notify floor staff.
- DIETARY PREFERENCES: When asked for Vegan, Vegetarian, Keto, Low-Carb, or Halal dishes, recommend only dishes matching those verified tags.
- SOMMELIER & DRINK PAIRINGS: Proactively suggest complementary wine or beverage pairings for main dishes (e.g. bold reds like Chianti for steak/burgers; crisp whites like Chardonnay for seafood).
- Always include dish prices so guests have complete dining information.

FORMATTING & MOBILE DISPLAY RULES:
- Customers read your responses on mobile screens. DO NOT format responses as raw markdown tables with pipes (| ... |). Raw tables look cramped and broken on mobile phones.
- Present food and drink recommendations as clean, structured, easy-to-read bullet lists.
- For each dish, format as:
  • **[Dish Name]** — $[Price]
    *[Dietary Tags]* • *Allergens: [Allergens or 'None']*
    [Short 1-sentence appetizing description]
- Keep responses warm, appetizing, concise, and beautifully structured with line breaks. Be concise, helpful, and specific.

DINING CONCIERGE & RECOMMENDATION RULES:
- When guests or staff ask for "top selling items", "best sellers", "popular dishes", "recommendations", or "what to order" (e.g. "show me the toop seling item in this branch"):
  1. ALWAYS invoke `get_menu` to retrieve the active menu items, popularity tags, and prices.
  2. Present our top-selling favorites and chef specialties (such as the Classic Wagyu Smash Burger and Pan-Seared Line-Caught Seabass) with enthusiasm and appetizing descriptions.
  3. NEVER tell a dining guest to check the "Manager Portal" or "Sales Analytics Dashboard" when they ask about popular food or recommendations. You are their hospitable dining concierge!

CRITICAL SECURITY RULES:
- You have ZERO database write permissions. You CANNOT write, modify, add inventory, cancel orders, or process payments directly.
- If a user asks you to add inventory, modify stock, change order status, or process refunds, explicitly inform them that JARVIS operates in read-only advisory mode for security, and direct them to the appropriate portal dashboard.
- You may only use the read-only tools made available to you in this conversation. NEVER attempt to invent or call unauthorized tools outside this list.
- Never assume, fabricate, or hallucinate dishes, prices, or orders not present in tool results.

Current operational context: {context_summary}
Be polite, concise, hospitable, and specific."""


def _format_role_context(actor: ActorContext) -> tuple[str, str]:
    role = (actor.role or "").lower()
    table_code = (actor.resource_scope or {}).get("table_code")

    if role == "customer" or table_code:
        role_label = f"Customer / Dining Guest{' (Table ' + table_code + ')' if table_code else ''}"
        role_instructions = (
            "- You are serving a seated guest. Offer hospitality, appetizing menu descriptions, dietary advice, allergen checks, and order status for their table.\n"
            "- STRICT ROLE ISOLATION: The guest has NO access to restaurant staff operations. Tools like get_kitchen_queue, get_table_status, get_inventory, get_branch_summary, and get_audit_events are strictly blocked. If the guest asks about kitchen tickets, inventory stock, other tables, or financial reports, politely explain that this information is restricted to restaurant staff."
        )
    elif role == "waiter":
        role_label = "Waiter / Floor Staff"
        role_instructions = (
            "- You are assisting floor service staff. You can check table status, menu details, and order progress.\n"
            "- STRICT ROLE ISOLATION: Staff in this role do not have access to kitchen preparation queues, cashier bill settlement, inventory stock levels, or managerial reports. If asked, inform the user these belong to other departments."
        )
    elif role == "kitchen":
        role_label = "Kitchen Staff / Culinary Team"
        role_instructions = (
            "- You are assisting the kitchen prep team. Focus on active orders, station tickets, and the kitchen preparation queue.\n"
            "- STRICT ROLE ISOLATION: Front-of-house table arrangements, guest billing, and management reports are not accessible."
        )
    elif role == "cashier":
        role_label = "Cashier Staff"
        role_instructions = (
            "- You are assisting the cashier desk with table bills, item subtotals, balances due, and order statuses.\n"
            "- STRICT ROLE ISOLATION: Floor table updates, kitchen queue inspection, inventory management, and executive reports are restricted."
        )
    elif role in ("manager", "owner", "super_admin"):
        role_label = "Operations Manager / Executive"
        role_instructions = (
            "- You have comprehensive operational oversight across the branch: dining room, kitchen queue, inventory stock, staff audits, and performance summaries."
        )
    else:
        role_label = f"User ({actor.actor_type})"
        role_instructions = "- Only execute tools explicitly provided in your function inventory."

    return role_label, role_instructions


def _build_system_prompt(actor: ActorContext, context_summary: str, tools: list[dict]) -> str:
    tool_names = [t["function"]["name"] for t in tools]
    authorized_tools_str = ", ".join(tool_names) if tool_names else "None (all restricted for this role)"
    role_label, role_instructions = _format_role_context(actor)

    return SYSTEM_PROMPT_TEMPLATE.format(
        agent_id=actor.ai_agent_id or "jarvis",
        branch_id=actor.branch_id,
        role_label=role_label,
        role_instructions=role_instructions,
        authorized_tools=authorized_tools_str,
        context_summary=context_summary,
    )


class JarvisAgent:
    def __init__(self, internal_client: InternalClient, conversation_store: ConversationStore) -> None:
        self._client = internal_client
        self._store = conversation_store
        self._provider = GroqProvider()
        self._executor = ToolExecutor(internal_client)

    async def handle_message(self, actor: ActorContext, session_id: str, message: str) -> str:
        history = await self._store.get_async(session_id)
        context_summary = await build_context(self._client, actor)
        tools = tools_for_actor(actor)

        system_prompt = _build_system_prompt(actor, context_summary, tools)

        messages: list[dict] = [
            {"role": "system", "content": system_prompt},
            *history,
            {"role": "user", "content": message},
        ]

        for _ in range(MAX_TOOL_ITERATIONS):
            try:
                response = await self._provider.generate(messages=messages, tools=tools)
            except Exception as exc:
                logger.exception("Groq error in handle_message: %s", exc)
                return "I encountered an issue processing that. Please try again."


            tool_calls = response.get("tool_calls") or []
            if not tool_calls:
                final_reply = response.get("content") or "I don't have an answer for that right now."
                await self._store.append_async(session_id, {"role": "user", "content": message})
                await self._store.append_async(session_id, {"role": "assistant", "content": final_reply})
                return final_reply

            formatted_tool_calls = [
                {
                    "id": tc["id"],
                    "type": "function",
                    "function": {
                        "name": tc["name"],
                        "arguments": json.dumps(tc["arguments"]) if isinstance(tc["arguments"], dict) else str(tc["arguments"]),
                    },
                }
                for tc in tool_calls
            ]

            messages.append({
                "role": "assistant",
                "content": response.get("content") or "",
                "tool_calls": formatted_tool_calls,
            })

            for call in tool_calls:

                tool_name = call["name"]
                args = {k: v for k, v in (call.get("arguments") or {}).items() if v is not None}
                try:
                    tool_output = await self._executor.execute(tool_name, args, actor)
                except ToolExecutionError as exc:
                    tool_output = {"ok": False, "error": str(exc)}

                messages.append({
                    "role": "tool",
                    "tool_call_id": call["id"],
                    "content": json.dumps(tool_output) if isinstance(tool_output, dict) else str(tool_output),
                })

        fallback = "I wasn't able to complete that — please rephrase or ask a staff member for help."
        await self._store.append_async(session_id, {"role": "user", "content": message})
        await self._store.append_async(session_id, {"role": "assistant", "content": fallback})
        return fallback

    async def stream_message(self, actor: ActorContext, session_id: str, message: str) -> AsyncGenerator[str, None]:
        """Streams tokens in SSE format: data: {"type": "chunk", "content": "..."}\n\n"""
        history = await self._store.get_async(session_id)
        context_summary = await build_context(self._client, actor)
        tools = tools_for_actor(actor)

        system_prompt = _build_system_prompt(actor, context_summary, tools)

        messages: list[dict] = [
            {"role": "system", "content": system_prompt},
            *history,
            {"role": "user", "content": message},
        ]

        for _ in range(MAX_TOOL_ITERATIONS):
            try:
                response = await self._provider.generate(messages=messages, tools=tools)
            except Exception as exc:
                logger.exception("Groq error in stream: %s", exc)
                err_msg = "I'm having trouble right now. Please try again in a moment."
                yield f"data: {json.dumps({'type': 'chunk', 'content': err_msg})}\n\n"
                yield f"data: {json.dumps({'type': 'done', 'reply': err_msg})}\n\n"
                return


            tool_calls = response.get("tool_calls") or []
            if not tool_calls:
                content = response.get("content") or "I don't have an answer for that right now."
                words = content.split(" ")
                for i, w in enumerate(words):
                    piece = w if i == len(words) - 1 else w + " "
                    yield f"data: {json.dumps({'type': 'chunk', 'content': piece})}\n\n"

                await self._store.append_async(session_id, {"role": "user", "content": message})
                await self._store.append_async(session_id, {"role": "assistant", "content": content})
                yield f"data: {json.dumps({'type': 'done', 'reply': content})}\n\n"
                return

            formatted_tool_calls = [
                {
                    "id": tc["id"],
                    "type": "function",
                    "function": {
                        "name": tc["name"],
                        "arguments": json.dumps(tc["arguments"]) if isinstance(tc["arguments"], dict) else str(tc["arguments"]),
                    },
                }
                for tc in tool_calls
            ]

            messages.append({
                "role": "assistant",
                "content": response.get("content") or "",
                "tool_calls": formatted_tool_calls,
            })

            for call in tool_calls:

                tool_name = call["name"]
                yield f"data: {json.dumps({'type': 'status', 'status': f'Executing {tool_name}...'})}\n\n"
                args = {k: v for k, v in (call.get("arguments") or {}).items() if v is not None}
                try:
                    tool_output = await self._executor.execute(tool_name, args, actor)
                except ToolExecutionError as exc:
                    tool_output = {"ok": False, "error": str(exc)}

                messages.append({
                    "role": "tool",
                    "tool_call_id": call["id"],
                    "content": json.dumps(tool_output) if isinstance(tool_output, dict) else str(tool_output),
                })

        fallback = "I wasn't able to complete that — please rephrase or ask a staff member for help."
        await self._store.append_async(session_id, {"role": "user", "content": message})
        await self._store.append_async(session_id, {"role": "assistant", "content": fallback})
        yield f"data: {json.dumps({'type': 'chunk', 'content': fallback})}\n\n"
        yield f"data: {json.dumps({'type': 'done', 'reply': fallback})}\n\n"
