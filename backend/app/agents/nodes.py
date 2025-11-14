import json
from typing import Any, TypedDict

from app.agents.fallback import categorize_ticket, generate_batch_summary
from app.config import settings
from app.database import get_db_session
from app.exceptions import AnalysisError
from app.models import AnalysisRun, Ticket, TicketAnalysis


class AnalysisState(TypedDict):
    analysis_run_id: int
    tickets: list[Ticket]
    individual_results: list[dict[str, Any]]
    batch_summary: str


def fetch_tickets_node(state: AnalysisState) -> AnalysisState:
    try:
        db = get_db_session()

        analysis_run = (
            db.query(AnalysisRun)
            .filter(AnalysisRun.id == state["analysis_run_id"])
            .first()
        )

        if not analysis_run:
            raise AnalysisError(
                f"Analysis run {state['analysis_run_id']} not found"
            )

        tickets = db.query(Ticket).filter(Ticket.status == "incomplete").all()

        state["tickets"] = tickets
        db.close()
        return state

    except Exception as e:
        raise AnalysisError(f"Failed to fetch tickets: {str(e)}")


def analyze_tickets_node(state: AnalysisState) -> AnalysisState:
    try:
        tickets = state["tickets"]
        individual_results = []

        if settings.openai_api_key:
            try:
                individual_results = llm_batch_analyze(tickets)
            except Exception:
                individual_results = [
                    categorize_ticket(ticket) for ticket in tickets
                ]
        else:
            individual_results = [
                categorize_ticket(ticket) for ticket in tickets
            ]

        batch_summary = generate_batch_summary(tickets, individual_results)

        state["individual_results"] = individual_results
        state["batch_summary"] = batch_summary
        return state

    except Exception as e:
        raise AnalysisError(f"Failed to analyze tickets: {str(e)}")


def save_results_node(state: AnalysisState) -> AnalysisState:
    try:
        db = get_db_session()

        analysis_run = (
            db.query(AnalysisRun)
            .filter(AnalysisRun.id == state["analysis_run_id"])
            .first()
        )

        analysis_run.summary = state["batch_summary"]

        for i, ticket in enumerate(state["tickets"]):
            result = state["individual_results"][i]

            ticket_analysis = TicketAnalysis(
                analysis_run_id=state["analysis_run_id"],
                ticket_id=ticket.id,
                category=result["category"],
                priority=result["priority"],
                notes=result.get("notes"),
            )
            db.add(ticket_analysis)

            ticket.status = "complete"

        db.commit()
        db.close()
        return state

    except Exception as e:
        raise AnalysisError(f"Failed to save results: {str(e)}")


def llm_batch_analyze(tickets: list[Ticket]) -> list[dict[str, Any]]:
    try:
        from langchain_openai import ChatOpenAI

        llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            api_key=settings.openai_api_key,
            temperature=0,
        )

        tickets_text = "\n".join(
            [
                f"Ticket {i+1}: Title: {ticket.title} | Description: {ticket.description}"
                for i, ticket in enumerate(tickets)
            ]
        )

        prompt = f"""Analyze these support tickets and provide categorization:

{tickets_text}

For each ticket, provide category (billing/bug/feature_request/authentication/other), 
priority (high/medium/low), and brief notes.

Respond with valid JSON array:
[{{"category": "billing", "priority": "high", "notes": "Payment processing issue"}}]"""

        response = llm.invoke(prompt)
        return json.loads(response.content)

    except Exception:
        return [categorize_ticket(ticket) for ticket in tickets]
