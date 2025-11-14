import json
from typing import Any, TypedDict

from app.agents.fallback import categorize_ticket, generate_batch_summary
from app.config import (
    MAX_TOKENS,
    MODEL,
    SUMMARY_TOKENS,
    TEMPERATURE,
    get_async_openai_client,
    setup_logger,
)
from app.database import get_db_session
from app.exceptions import AnalysisError
from app.models import AnalysisRun, Ticket, TicketAnalysis


logger = setup_logger(__name__)


class AnalysisState(TypedDict):
    analysis_run_id: int
    tickets: list[Ticket]
    results: list[dict[str, Any]]
    summary: str


def node_fetch_tickets(state: AnalysisState) -> AnalysisState:
    """
    LangGraph node that fetches tickets from the database
    """
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
        raise AnalysisError(f"Failed to fetch tickets: {str(e)}") from e


async def node_classify_tickets(state: AnalysisState) -> AnalysisState:
    try:
        tickets = state["tickets"]
        results = []

        try:
            results = await get_analysis(tickets)
        except Exception:
            logger.warning(
                "Trouble with the provided client. Falling back to non-LLM generated response"
            )
            results = [categorize_ticket(ticket) for ticket in tickets]

        state["results"] = results
        return state

    except Exception as e:
        raise AnalysisError(f"Failed to classify tickets: {str(e)}") from e


async def node_summarize_tickets(state: AnalysisState) -> AnalysisState:
    try:
        tickets = state["tickets"]

        try:
            summary = await get_summary(tickets)
        except Exception:
            logger.warning(
                "Trouble with the provided client. Falling back to non-LLM generated summary"
            )
            summary = generate_batch_summary(tickets, [])

        state["summary"] = summary
        return state

    except Exception as e:
        raise AnalysisError(f"Failed to summarize tickets: {str(e)}") from e


def node_save_results(state: AnalysisState) -> AnalysisState:
    db = get_db_session()
    try:
        analysis_run = (
            db.query(AnalysisRun)
            .filter(AnalysisRun.id == state["analysis_run_id"])
            .first()
        )

        analysis_run.summary = state["summary"]

        for i, ticket in enumerate(state["tickets"]):
            result = state["results"][i]

            merged_ticket = db.merge(
                ticket
            )  # Merge the ticket to ensure it's tracked by current session! Interesting :)
            merged_ticket.status = "complete"

            ticket_analysis = TicketAnalysis(
                analysis_run_id=state["analysis_run_id"],
                ticket_id=ticket.id,
                category=result["category"],
                priority=result["priority"],
                notes=result.get("notes"),
            )
            db.add(ticket_analysis)

        db.commit()
        return state

    except Exception as e:
        db.rollback()
        raise AnalysisError(f"Failed to save results: {str(e)}") from e
    finally:
        db.close()


async def get_analysis(tickets: list[Ticket]) -> list[dict[str, Any]]:
    try:
        client = get_async_openai_client()

        tickets_text = "\n".join(
            [
                f"Ticket {i+1}: Title: {ticket.title} | Description: {ticket.description}"
                for i, ticket in enumerate(tickets)
            ]
        )

        prompt = f"""
        Analyze these support tickets and provide categorization:

        {tickets_text}

        For each ticket, provide category (billing/bug/feature_request/authentication/other), priority (high/medium/low), and brief notes.

        Respond with valid JSON array:
        [{{"category": "billing", "priority": "high", "notes": "Payment processing issue"}}]"""

        response = await client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS,
        )

        data = response.choices[0].message.content
        logger.info(f"Preview of response from classify agent: {data[:50]}")
        return json.loads(data)

    except Exception as e:
        raise e


async def get_summary(tickets: list[Ticket]) -> str:
    try:
        client = get_async_openai_client()

        tickets_text = "\n".join(
            [
                f"Ticket {i+1}: Title: {ticket.title} | Description: {ticket.description}"
                for i, ticket in enumerate(tickets)
            ]
        )

        prompt = f"""

        You are a SUMMARIZING AGENT. Your task is to summarize these support tickets in 100 words or less:
        TICKETS:
        {tickets_text}

        Provide a brief overview of the main issues without MISSING ANY details.
        """

        response = await client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=TEMPERATURE,
            max_tokens=SUMMARY_TOKENS,
        )
        data = response.choices[0].message.content.strip()
        logger.info(f"Preview of response from summary agent: {data[:50]}")
        return data

    except Exception as e:
        raise e
