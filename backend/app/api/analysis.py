from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AnalysisRun, TicketAnalysis, Ticket
from app.schemas import AnalysisRequest, AnalysisRunResponse, TicketAnalysisResponse
from app.exceptions import DatabaseError, AnalysisRunNotFoundError
from app.agents import run_ticket_analysis

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

@router.post("/", response_model=AnalysisRunResponse)
def run_analysis(request: AnalysisRequest, db: Session = Depends(get_db)):
    try:
        analysis_run = run_ticket_analysis(db, request.ticket_ids)
        
        ticket_analyses = db.query(TicketAnalysis).filter(
            TicketAnalysis.analysis_run_id == analysis_run.id
        ).all()
        
        analysis_responses = []
        for ta in ticket_analyses:
            ticket = db.query(Ticket).filter(Ticket.id == ta.ticket_id).first()
            analysis_responses.append(TicketAnalysisResponse(
                id=ta.id,
                created_at=ta.created_at,
                analysis_run_id=ta.analysis_run_id,
                ticket_id=ta.ticket_id,
                category=ta.category,
                priority=ta.priority,
                notes=ta.notes,
                ticket=ticket
            ))
        
        return AnalysisRunResponse(
            id=analysis_run.id,
            created_at=analysis_run.created_at,
            summary=analysis_run.summary,
            ticket_analyses=analysis_responses
        )
    except Exception as e:
        db.rollback()
        raise DatabaseError(str(e))

@router.get("/latest", response_model=Optional[AnalysisRunResponse])
def get_latest_analysis(db: Session = Depends(get_db)):
    try:
        latest_run = db.query(AnalysisRun).order_by(AnalysisRun.created_at.desc()).first()
        
        if not latest_run:
            raise AnalysisRunNotFoundError()
        
        ticket_analyses = db.query(TicketAnalysis).filter(
            TicketAnalysis.analysis_run_id == latest_run.id
        ).all()
        
        analysis_responses = []
        for ta in ticket_analyses:
            ticket = db.query(Ticket).filter(Ticket.id == ta.ticket_id).first()
            analysis_responses.append(TicketAnalysisResponse(
                id=ta.id,
                created_at=ta.created_at,
                analysis_run_id=ta.analysis_run_id,
                ticket_id=ta.ticket_id,
                category=ta.category,
                priority=ta.priority,
                notes=ta.notes,
                ticket=ticket
            ))
        
        return AnalysisRunResponse(
            id=latest_run.id,
            created_at=latest_run.created_at,
            summary=latest_run.summary,
            ticket_analyses=analysis_responses
        )
    except Exception as e:
        raise DatabaseError(str(e))