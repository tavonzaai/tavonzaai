"""
Cloud Voice Service:
1. Speech-to-Text: Groq Cloud Whisper Turbo (~150ms)
2. Text-to-Speech: Microsoft Edge Neural Voice Cloud (studio quality)
Reference: .agent/AI.md Section "AI and Realtime"
"""

import re
from collections.abc import AsyncGenerator

import edge_tts
from groq import AsyncGroq

from src.config import settings

VOICE_PERSONAS = {
    "uk_jarvis": "en-GB-RyanNeural",        # Cultured, sophisticated British AI
    "us_guy": "en-US-GuyNeural",            # Natural studio American male
    "natural_female": "en-US-JennyNeural",  # Warm, expressive natural female
    "uk_female": "en-GB-SoniaNeural",       # Calm British female
    "auto_best": "en-GB-RyanNeural",
}


def humanize_text_for_speech(text: str) -> str:
    """Pre-processes LLM Markdown and operational text into natural spoken phrasing."""
    if not text:
        return ""

    processed = text

    # Convert markdown tables into natural phrases
    lines = processed.split("\n")
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("|") and stripped.endswith("|"):
            if "---" in stripped:
                continue
            cells = [c.strip().replace("**", "") for c in stripped.split("|")[1:-1]]
            cleaned_lines.append(", ".join([c for c in cells if c and c != "-"]))
        else:
            cleaned_lines.append(line)
    processed = " ".join(cleaned_lines)

    # Conversational replacements
    processed = re.sub(r"\(kg\)", "in kilograms", processed, flags=re.IGNORECASE)
    processed = re.sub(r"\(ea\)", "in units", processed, flags=re.IGNORECASE)
    processed = re.sub(r"(\d+(?:\.\d+)?)\s*(?:kg|kilos|kilograms?)\b", r"\1 kilograms", processed, flags=re.IGNORECASE)
    processed = re.sub(r"(\d+(?:\.\d+)?)\s*(?:g|grams?)\b", r"\1 grams", processed, flags=re.IGNORECASE)
    processed = re.sub(r"(\d+)\s*(?:ea|pcs|pieces?)\b", r"\1 units", processed, flags=re.IGNORECASE)
    processed = re.sub(r"\$(\d+)\.(\d{2})\b", r"\1 dollars and \2 cents", processed)
    processed = re.sub(r"\$(\d+)\b", r"\1 dollars", processed)
    processed = re.sub(r"\bT([1-9]\d?)\b", r"Table \1", processed)
    processed = re.sub(r"\bOrder\s*#(\d+)\b", r"Order number \1", processed, flags=re.IGNORECASE)
    processed = re.sub(r"\b#(\d+)\b", r"number \1", processed)

    # Remove code blocks, markdown symbols, and emojis
    processed = re.sub(r"```[\s\S]*?```", " ", processed)
    processed = re.sub(r"`([^`]+)`", r"\1", processed)
    processed = re.sub(r"#{1,6}\s+", "", processed)
    processed = re.sub(r"[*_~]{1,3}", "", processed)
    processed = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", processed)
    processed = re.sub(r"[\U00010000-\U0010ffff\u2600-\u27bf\u2b50-\u2b55]", "", processed)
    processed = re.sub(r"\s+", " ", processed).strip()

    return processed


class VoiceService:
    def __init__(self) -> None:
        # Use a placeholder key in dev mode to avoid empty Bearer header crash (mirrors GroqProvider guard)
        api_key = settings.groq_api_key.strip() if settings.groq_api_key else "gsk_placeholder_dev_key"
        self._groq_client = AsyncGroq(api_key=api_key)

    async def transcribe_audio(
        self,
        audio_bytes: bytes,
        filename: str = "voice.webm",
        content_type: str = "audio/webm",
    ) -> str:
        """Transcribe speech audio using Groq Cloud Whisper Turbo in ~150ms."""
        if not audio_bytes:
            return ""

        safe_filename = filename or "audio.webm"
        if not safe_filename.endswith((".webm", ".wav", ".mp3", ".ogg", ".m4a")):
            safe_filename = f"{safe_filename}.webm"

        safe_content_type = content_type or "audio/webm"

        transcription = await self._groq_client.audio.transcriptions.create(
            file=(safe_filename, audio_bytes, safe_content_type),
            model="whisper-large-v3-turbo",
            response_format="json",
            temperature=0.0,
        )

        return (transcription.text or "").strip()

    async def stream_speech(
        self,
        text: str,
        persona: str = "uk_jarvis",
    ) -> AsyncGenerator[bytes, None]:
        """Stream high-definition MP3 neural voice from Microsoft Edge Cloud."""
        humanized = humanize_text_for_speech(text)
        if not humanized:
            return

        voice_name = VOICE_PERSONAS.get(persona, VOICE_PERSONAS["uk_jarvis"])
        communicate = edge_tts.Communicate(humanized, voice_name)

        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                yield chunk["data"]
