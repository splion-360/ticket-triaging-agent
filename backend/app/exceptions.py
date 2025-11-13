from typing import Optional
from fastapi import HTTPException

class BaseAppException(HTTPException):
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(status_code=status_code, detail=message)

class DatabaseError(BaseAppException):
    def __init__(self, message: str):
        super().__init__(f"Database error: {message}", 500)

class TicketNotFoundError(BaseAppException):
    def __init__(self, ticket_id: int):
        super().__init__(f"Ticket {ticket_id} not found", 404)

class AnalysisRunNotFoundError(BaseAppException):
    def __init__(self, run_id: Optional[int] = None):
        msg = f"Analysis run {run_id} not found" if run_id else "No analysis runs found"
        super().__init__(msg, 404)

class AnalysisError(BaseAppException):
    def __init__(self, message: str):
        super().__init__(f"Analysis failed: {message}", 500)

class ValidationError(BaseAppException):
    def __init__(self, message: str):
        super().__init__(f"Validation error: {message}", 400)

class ExternalServiceError(BaseAppException):
    def __init__(self, service: str, message: str):
        super().__init__(f"{service} service error: {message}", 503)