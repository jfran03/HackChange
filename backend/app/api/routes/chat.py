from typing import List, Literal, Optional

import logging

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from openai import AsyncOpenAI

from app.core.config import settings

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None


class ChatResponse(BaseModel):
    reply: str


_async_client: Optional[AsyncOpenAI] = None

_FALLBACK_REPLY = (
    "I'm sorry, but I can't reach the safety assistant right now. "
    "If you need immediate assistance, please call 911. You can also reach the 988 Suicide & "
    "Crisis Lifeline at 988 or visit 988lifeline.org, and find local shelters via www.hud.gov/findshelters."
)

logger = logging.getLogger(__name__)

def _get_async_client() -> AsyncOpenAI:
    global _async_client
    if _async_client is None:
        api_key = settings.OPENAI_API_KEY
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OpenAI API key is not configured.",
            )
        _async_client = AsyncOpenAI(api_key=api_key)
    return _async_client


@router.post("/completions", response_model=ChatResponse)
async def create_completion(request: ChatRequest) -> ChatResponse:
    try:
        client = _get_async_client()
    except HTTPException as exc:
        if (
            exc.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            and exc.detail == "OpenAI API key is not configured."
        ):
            logger.warning("OpenAI API key is missing; returning fallback reply.")
            return ChatResponse(reply=_FALLBACK_REPLY)
        raise

    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[message.model_dump() for message in request.messages],
            max_tokens=request.max_tokens or settings.OPENAI_MAX_TOKENS,
            temperature=request.temperature or settings.OPENAI_TEMPERATURE,
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Chat completion request failed: %s", exc)
        return ChatResponse(reply=_FALLBACK_REPLY)

    choice = response.choices[0]
    message_content = (choice.message.content or "").strip()

    if not message_content:
        message_content = (
            "I'm sorry, but I couldn't craft a helpful response right now. "
            "If you need immediate assistance, please call 911 or reach the 988 Suicide & Crisis Lifeline."
        )

    return ChatResponse(reply=message_content)