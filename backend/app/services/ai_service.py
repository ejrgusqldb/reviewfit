"""
AI 답변 생성 서비스
- Provider: groq (무료) | ollama (로컬) | openai (유료)
- .env의 AI_PROVIDER로 전환 가능
"""
from __future__ import annotations
from openai import AsyncOpenAI

from app.core.config import settings

TONE_INSTRUCTIONS = {
    "friendly": "친근하고 따뜻한 말투로, 반말 없이 편안하게 작성해주세요.",
    "formal": "정중하고 격식체로, 고객을 존중하는 말투로 작성해주세요.",
    "apologetic": "불편을 끼쳐드린 점을 먼저 사과하고, 개선 의지를 보여주는 말투로 작성해주세요.",
}

PROVIDER_CONFIG = {
    "groq": {
        "base_url": "https://api.groq.com/openai/v1",
        "api_key": lambda: settings.GROQ_API_KEY,
        "model": "llama-3.1-8b-instant",
    },
    "ollama": {
        "base_url": lambda: f"{settings.OLLAMA_BASE_URL}/v1",
        "api_key": "ollama",  # Ollama는 키 불필요, 아무 값이나 OK
        "model": lambda: settings.OLLAMA_MODEL,
    },
    "openai": {
        "base_url": "https://api.openai.com/v1",
        "api_key": lambda: settings.OPENAI_API_KEY,
        "model": "gpt-4o-mini",
    },
}


def _get_client() -> tuple[AsyncOpenAI, str]:
    """현재 설정된 provider의 클라이언트와 모델명을 반환합니다"""
    provider = settings.AI_PROVIDER
    cfg = PROVIDER_CONFIG.get(provider, PROVIDER_CONFIG["groq"])

    base_url = cfg["base_url"]() if callable(cfg["base_url"]) else cfg["base_url"]
    api_key = cfg["api_key"]() if callable(cfg["api_key"]) else cfg["api_key"]
    model = cfg["model"]() if callable(cfg["model"]) else cfg["model"]

    client = AsyncOpenAI(base_url=base_url, api_key=api_key)
    return client, model


async def generate_reply(
    store_name: str,
    rating: int,
    content: str | None,
    tone: str,
) -> str:
    tone_guide = TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS["formal"])
    rating_guide = _get_rating_guide(rating)

    if not content:
        content = "내용 없음"

    prompt = f"""당신은 '{store_name}' 가게 사장님입니다.
고객이 남긴 리뷰에 대해 답변을 작성해주세요.

[리뷰 정보]
- 별점: {rating}점 / 5점
- 리뷰 내용: {content}

[답변 가이드]
- {tone_guide}
- {rating_guide}
- 답변은 3~5문장으로 간결하게 작성해주세요.
- 가게 이름이나 '사장님'이라는 표현은 사용하지 마세요.
- 답변만 출력하세요 (설명 없이).
"""

    client, model = _get_client()
    response = await client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()


def _get_rating_guide(rating: int) -> str:
    if rating >= 4:
        return "긍정적인 리뷰에 감사 인사를 전하고, 다음 방문을 기대한다는 내용을 담아주세요."
    elif rating == 3:
        return "방문해주신 것에 감사하고, 더 좋은 경험을 드리겠다는 의지를 표현해주세요."
    else:
        return "불편을 드린 점 사과하고, 구체적으로 개선하겠다는 내용을 담아주세요. 직접 연락 가능한 채널을 안내해주세요."
