from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class Ticket(BaseModel):
    __tablename__ = "tickets"

    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
