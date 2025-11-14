from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import analysis, tickets
from app.database import engine
from app.exceptions import BaseAppException
from app.models import Base


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Ticket Triaging Agent API",
    description="Support ticket analysis with LangGraph agent",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(BaseAppException)
async def app_exception_handler(request: Request, exc: BaseAppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

app.include_router(tickets.router)
app.include_router(analysis.router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
