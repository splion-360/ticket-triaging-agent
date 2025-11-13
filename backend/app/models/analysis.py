from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel

class AnalysisRun(BaseModel):
    __tablename__ = "analysis_runs"
    
    summary: Mapped[str] = mapped_column(Text)

class TicketAnalysis(BaseModel):
    __tablename__ = "ticket_analysis"
    
    analysis_run_id: Mapped[int] = mapped_column(ForeignKey("analysis_runs.id"))
    ticket_id: Mapped[int] = mapped_column(ForeignKey("tickets.id"))
    category: Mapped[str] = mapped_column(String(100))
    priority: Mapped[str] = mapped_column(String(20))
    notes: Mapped[str] = mapped_column(Text, nullable=True)