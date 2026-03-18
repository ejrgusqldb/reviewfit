from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.store import Store
from app.models.review import Review
from app.models.user import User
from app.services.ai_service import generate_reply

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


class ReviewResponse(BaseModel):
    id: int
    platform_review_id: str
    reviewer_name: str | None
    rating: int
    content: str | None
    is_replied: bool
    generated_reply: str | None
    final_reply: str | None

    model_config = {"from_attributes": True}


class ReplyRequest(BaseModel):
    reply: str


class ManualReviewRequest(BaseModel):
    rating: int
    reviewer_name: str | None = None
    content: str


async def _get_store(store_id: int, user: User, db: AsyncSession) -> Store:
    result = await db.execute(select(Store).where(Store.id == store_id, Store.user_id == user.id))
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="가게를 찾을 수 없습니다")
    return store


@router.post("/{store_id}/manual", response_model=ReviewResponse, status_code=201)
async def add_manual_review(
    store_id: int,
    body: ManualReviewRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """리뷰를 직접 입력합니다 (복붙 방식)"""
    from datetime import datetime, timezone
    import uuid
    await _get_store(store_id, current_user, db)
    review = Review(
        store_id=store_id,
        platform_review_id=f"manual_{uuid.uuid4().hex[:8]}",
        reviewer_name=body.reviewer_name,
        rating=body.rating,
        content=body.content,
        reviewed_at=datetime.now(timezone.utc),
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review


@router.get("/{store_id}", response_model=list[ReviewResponse])
async def list_reviews(
    store_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_store(store_id, current_user, db)
    result = await db.execute(
        select(Review).where(Review.store_id == store_id).order_by(Review.reviewed_at.desc())
    )
    return result.scalars().all()


@router.post("/{store_id}/fetch", status_code=202)
async def fetch_reviews(
    store_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """네이버 플레이스 리뷰를 크롤링해서 DB에 저장합니다"""
    store = await _get_store(store_id, current_user, db)
    background_tasks.add_task(crawl_and_save, store, db)
    return {"message": "리뷰 수집을 시작했습니다"}


async def crawl_and_save(store: Store, db: AsyncSession):
    from app.services.crawler.naver_place import crawl_naver_reviews
    reviews = await crawl_naver_reviews(store.platform_store_id)
    for r in reviews:
        # 중복 방지
        exists = await db.execute(select(Review).where(Review.platform_review_id == r["platform_review_id"]))
        if exists.scalar_one_or_none():
            continue
        review = Review(store_id=store.id, **r)
        db.add(review)
    await db.commit()


@router.post("/{store_id}/reviews/{review_id}/generate")
async def generate_review_reply(
    store_id: int,
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """AI로 답변을 생성합니다"""
    store = await _get_store(store_id, current_user, db)
    result = await db.execute(select(Review).where(Review.id == review_id, Review.store_id == store_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="리뷰를 찾을 수 없습니다")

    reply = await generate_reply(
        store_name=store.name,
        rating=review.rating,
        content=review.content,
        tone=store.tone,
    )
    review.generated_reply = reply
    await db.commit()
    return {"generated_reply": reply}


@router.post("/{store_id}/reviews/{review_id}/reply")
async def save_reply(
    store_id: int,
    review_id: int,
    body: ReplyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """최종 답변을 저장합니다 (실제 발송은 추후 구현)"""
    from datetime import datetime, timezone

    await _get_store(store_id, current_user, db)
    result = await db.execute(select(Review).where(Review.id == review_id, Review.store_id == store_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="리뷰를 찾을 수 없습니다")

    review.final_reply = body.reply
    review.is_replied = True
    review.replied_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "답변이 저장되었습니다"}
