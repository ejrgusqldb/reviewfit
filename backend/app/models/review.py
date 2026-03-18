from __future__ import annotations
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey, Integer, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id"), nullable=False)
    platform_review_id: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    reviewer_name: Mapped[str] = mapped_column(String(100), nullable=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1~5
    content: Mapped[str] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # 답변 관련
    is_replied: Mapped[bool] = mapped_column(Boolean, default=False)
    generated_reply: Mapped[str] = mapped_column(Text, nullable=True)   # AI 생성 답변
    final_reply: Mapped[str] = mapped_column(Text, nullable=True)       # 실제 발송된 답변
    replied_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    store: Mapped["Store"] = relationship("Store", back_populates="reviews")
