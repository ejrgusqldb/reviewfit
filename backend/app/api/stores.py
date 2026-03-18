from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.store import Store, Platform, Tone
from app.models.user import User

router = APIRouter(prefix="/api/stores", tags=["stores"])


class StoreCreate(BaseModel):
    name: str
    platform: Platform
    platform_store_id: str
    tone: Tone = Tone.FORMAL
    auto_reply: bool = False


class StoreUpdate(BaseModel):
    tone: Tone | None = None
    auto_reply: bool | None = None


class StoreResponse(BaseModel):
    id: int
    name: str
    platform: Platform
    platform_store_id: str
    tone: Tone
    auto_reply: bool

    model_config = {"from_attributes": True}


@router.get("", response_model=list[StoreResponse])
async def list_stores(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Store).where(Store.user_id == current_user.id))
    return result.scalars().all()


@router.post("", response_model=StoreResponse, status_code=201)
async def create_store(
    body: StoreCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 무료 플랜은 1개 가게만 등록 가능
    if current_user.plan == "free":
        result = await db.execute(select(Store).where(Store.user_id == current_user.id))
        if len(result.scalars().all()) >= 1:
            raise HTTPException(status_code=403, detail="무료 플랜은 1개 가게만 등록할 수 있습니다")

    store = Store(user_id=current_user.id, **body.model_dump())
    db.add(store)
    await db.commit()
    await db.refresh(store)
    return store


@router.patch("/{store_id}", response_model=StoreResponse)
async def update_store(
    store_id: int,
    body: StoreUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Store).where(Store.id == store_id, Store.user_id == current_user.id))
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="가게를 찾을 수 없습니다")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(store, field, value)

    await db.commit()
    await db.refresh(store)
    return store


@router.delete("/{store_id}", status_code=204)
async def delete_store(
    store_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Store).where(Store.id == store_id, Store.user_id == current_user.id))
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="가게를 찾을 수 없습니다")

    await db.delete(store)
    await db.commit()
