from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Ticket
from app.schemas import TicketCreate, TicketResponse, TicketListCreate
from app.exceptions import DatabaseError

router = APIRouter(prefix="/api/tickets", tags=["tickets"])

@router.post("/", response_model=List[TicketResponse])
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

@router.get("/", response_model=List[TicketResponse])
def get_tickets(db: Session = Depends(get_db)):
    try:
        return db.query(Ticket).all()
    except Exception as e:
        raise DatabaseError(str(e))