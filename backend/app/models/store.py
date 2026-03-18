from __future__ import annotations
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import String, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Platform(str, PyEnum):
    NAVER = "naver"
    BAEMIN = "baemin"
    KAKAO = "kakao"


class Tone(str, PyEnum):
    FRIENDLY = "friendly"      # 친근하게
    FORMAL = "formal"          # 정중하게
    APOLOGETIC = "apologetic"  # 사과형


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    platform: Mapped[Platform] = mapped_column(Enum(Platform), nullable=False)
    platform_store_id: Mapped[str] = mapped_column(String(200), nullable=False)  # 네이버 플레이스 ID 등
    tone: Mapped[Tone] = mapped_column(Enum(Tone), default=Tone.FORMAL, nullable=False)
    auto_reply: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="stores")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="store", cascade="all, delete-orphan")
