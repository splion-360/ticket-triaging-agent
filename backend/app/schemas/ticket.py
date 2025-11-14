
from typing import Optional
from pydantic import Field

from app.schemas.base import BaseCreateSchema, BaseResponseSchema


class TicketCreate(BaseCreateSchema):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    status: Optional[str] = "incomplete"

class TicketResponse(BaseResponseSchema):
    title: str
    description: str
    status: str
    category: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None

class TicketListCreate(BaseCreateSchema):
    tickets: list[TicketCreate]

class TicketListResponse(BaseResponseSchema):
    tickets: list[TicketResponse]
