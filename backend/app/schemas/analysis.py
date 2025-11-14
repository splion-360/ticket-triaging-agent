

from app.schemas.base import BaseCreateSchema, BaseResponseSchema
from app.schemas.ticket import TicketResponse


class AnalysisRequest(BaseCreateSchema):
    ticket_ids: list[int] | None = None

class TicketAnalysisResponse(BaseResponseSchema):
    analysis_run_id: int
    ticket_id: int
    category: str
    priority: str
    notes: str | None = None
    ticket: TicketResponse | None = None

class AnalysisRunResponse(BaseResponseSchema):
    summary: str
    ticket_analyses: list[TicketAnalysisResponse] = []

class AnalysisResultResponse(BaseResponseSchema):
    run: AnalysisRunResponse
    total_tickets: int
    categories: dict[str, int]
    priorities: dict[str, int]
