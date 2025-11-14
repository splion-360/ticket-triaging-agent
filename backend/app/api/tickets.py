
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.exceptions import DatabaseError
from app.models import Ticket, TicketAnalysis
from app.schemas import TicketListCreate, TicketResponse


router = APIRouter(prefix="/api/tickets", tags=["tickets"])

@router.post("/", response_model=list[TicketResponse])
def create_tickets(ticket_data: TicketListCreate, db: Session = Depends(get_db)):
    try:
        created_tickets = []
        for ticket_create in ticket_data.tickets:
            db_ticket = Ticket(**ticket_create.model_dump())
            db.add(db_ticket)
            created_tickets.append(db_ticket)

        db.commit()

        for ticket in created_tickets:
            db.refresh(ticket)

        return created_tickets
    except Exception as e:
        db.rollback()
        raise DatabaseError(str(e))

@router.get("/", response_model=list[TicketResponse])
def get_tickets(db: Session = Depends(get_db)):
    try:
        tickets = db.query(Ticket).all()
        result = []
        
        for ticket in tickets:
            latest_analysis = (
                db.query(TicketAnalysis)
                .filter(TicketAnalysis.ticket_id == ticket.id)
                .order_by(desc(TicketAnalysis.created_at))
                .first()
            )
            
            ticket_data = TicketResponse(
                id=ticket.id,
                created_at=ticket.created_at,
                title=ticket.title,
                description=ticket.description,
                status=ticket.status,
                category=latest_analysis.category if latest_analysis else None,
                priority=latest_analysis.priority if latest_analysis else None,
                notes=latest_analysis.notes if latest_analysis else None,
            )
            result.append(ticket_data)
        
        return result
    except Exception as e:
        raise DatabaseError(str(e))
