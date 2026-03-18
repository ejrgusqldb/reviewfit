from __future__ import annotations
"""
토스페이먼츠 결제 연동
흐름:
  1. 프론트에서 결제 위젯으로 결제 진행
  2. 성공 시 프론트가 /api/payments/confirm 호출
  3. 백엔드가 토스 API로 결제 최종 승인
  4. 승인 성공 시 유저 플랜 업데이트
"""
import base64
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, Plan

router = APIRouter(prefix="/api/payments", tags=["payments"])

TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm"

# 플랜별 가격 (원)
PLAN_PRICES = {
    Plan.STANDARD: 9900,
    Plan.PRO: 19900,
}


class ConfirmRequest(BaseModel):
    payment_key: str   # 토스가 발급한 결제 키
    order_id: str      # 우리가 생성한 주문 ID
    amount: int        # 결제 금액
    plan: str          # "standard" or "pro"


def _toss_auth_header() -> str:
    """토스 시크릿 키를 Base64로 인코딩 (토스 API 인증 방식)"""
    encoded = base64.b64encode(f"{settings.TOSS_SECRET_KEY}:".encode()).decode()
    return f"Basic {encoded}"


@router.post("/confirm")
async def confirm_payment(
    body: ConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 플랜 유효성 검사
    try:
        plan = Plan(body.plan)
    except ValueError:
        raise HTTPException(status_code=400, detail="올바르지 않은 플랜입니다")

    # 금액 위변조 방지: 서버에서 실제 가격과 비교
    expected_amount = PLAN_PRICES.get(plan)
    if body.amount != expected_amount:
        raise HTTPException(status_code=400, detail="결제 금액이 올바르지 않습니다")

    # 토스 API로 결제 최종 승인 요청
    async with httpx.AsyncClient() as client:
        response = await client.post(
            TOSS_CONFIRM_URL,
            headers={
                "Authorization": _toss_auth_header(),
                "Content-Type": "application/json",
            },
            json={
                "paymentKey": body.payment_key,
                "orderId": body.order_id,
                "amount": body.amount,
            },
        )

    if response.status_code != 200:
        error = response.json()
        raise HTTPException(
            status_code=400,
            detail=f"결제 승인 실패: {error.get('message', '알 수 없는 오류')}",
        )

    # 결제 성공 → 유저 플랜 업데이트
    current_user.plan = plan
    await db.commit()

    return {"message": "결제가 완료되었습니다", "plan": plan}


@router.get("/plans")
async def get_plans():
    """플랜 목록과 가격 반환"""
    return [
        {
            "id": "standard",
            "name": "스탠다드",
            "price": 9900,
            "features": ["무제한 답변", "2개 플랫폼", "AI 자동 답변"],
        },
        {
            "id": "pro",
            "name": "프로",
            "price": 19900,
            "features": ["무제한 답변", "3개 플랫폼", "AI 자동 답변", "SNS 포스팅"],
        },
    ]
