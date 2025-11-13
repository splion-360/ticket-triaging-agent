from typing import List, Optional
from pydantic import Field

from app.schemas.base import BaseCreateSchema, BaseResponseSchema
from app.schemas.ticket import TicketResponse

class AnalysisRequest(BaseCreateSchema):
    ticket_ids: Optional[List[int]] = None

class TicketAnalysisResponse(BaseResponseSchema):
    analysis_run_id: int
    ticket_id: int
    category: str
    priority: str
    notes: Optional[str] = None
    ticket: Optional[TicketResponse] = None

class AnalysisRunResponse(BaseResponseSchema):
    summary: str
    ticket_analyses: List[TicketAnalysisResponse] = []

class AnalysisResultResponse(BaseResponseSchema):
    run: AnalysisRunResponse
    total_tickets: int
    categories: dict[str, int]
    priorities: dict[str, int]