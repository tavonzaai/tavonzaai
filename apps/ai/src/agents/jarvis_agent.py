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

SYSTEM_PROMPT_TEMPLATE = """You are JARVIS, an AI dining concierge and assistant for restaurant guests and staff in the Tavonza platform.
Acting as agent: {agent_id}
Branch: {branch_id}
You have access to read-only informational and advisory tools ONLY (such as get_menu, get_inventory, get_table_status, get_order_status, get_kitchen_queue, get_branch_summary, get_table_bill).

CRITICAL SECURITY RULE:
- You have ZERO database write permissions. You CANNOT write, modify, add inventory, or alter database records under any circumstances.
- If a user asks you to add inventory, update stock, modify order status, or process payments, explicitly inform them that JARVIS is strictly read-only for security purposes.
- Advise the manager to add or update stock directly through the Manager Portal Dashboard.
- You may only use the read-only tools made available to you in this conversation.
- Never assume or fabricate data you were not given by a tool result.
Current operational context: {context_summary}

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
  3. NEVER tell a dining guest to check the "Manager Portal" or "Sales Analytics Dashboard" when they ask about popular food or recommendations. You are their hospitable dining concierge!"""


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

        system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
            agent_id=actor.ai_agent_id or "jarvis",
            branch_id=actor.branch_id,
            context_summary=context_summary,
        )

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

        system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
            agent_id=actor.ai_agent_id or "jarvis",
            branch_id=actor.branch_id,
            context_summary=context_summary,
        )

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
