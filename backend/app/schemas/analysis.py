from app.schemas.base import BaseCreateSchema, BaseResponseSchema
from app.schemas.ticket import TicketResponse


class AnalysisRequest(BaseCreateSchema):
    ticket_ids: list[str] | None = None


class TicketAnalysisResponse(BaseResponseSchema):
    analysis_run_id: str
    ticket: TicketResponse | None = None


class AnalysisRunResponse(BaseResponseSchema):
    summary: str
    ticket_analyses: list[TicketAnalysisResponse] = []


class AnalysisResultResponse(BaseResponseSchema):
    run: AnalysisRunResponse
    total_tickets: int
    categories: dict[str, int]
    priorities: dict[str, int]
