from __future__ import annotations
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import String, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Plan(str, PyEnum):
    FREE = "free"
    STANDARD = "standard"
    PRO = "pro"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    plan: Mapped[Plan] = mapped_column(Enum(Plan), default=Plan.FREE, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    stores: Mapped[list["Store"]] = relationship("Store", back_populates="user", cascade="all, delete-orphan")
