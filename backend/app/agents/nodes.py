import asyncio
import json
import re
from typing import Any, TypedDict

from pydantic import BaseModel

from app.agents.defaults import default_categorizer, default_summarizer
from app.config import (
    MAX_CONCURRENT_REQUESTS,
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


class TicketStructuredOutput(BaseModel):
    category: str
    priority: str
    notes: str


class AnalysisState(TypedDict):
    analysis_run_id: str
    ticket_ids: list[str] | None
    tickets: list[Ticket]
    results: list[dict[str, Any]]
    summary: str


def node_fetch_tickets(state: AnalysisState) -> AnalysisState:
    """
    LangGraph node that fetches tickets from the database
    """
    try:
        db = get_db_session()

        ticket_ids = state.get("ticket_ids")
        logger.info(f"Ticket IDs: {ticket_ids}", "CYAN")

        if ticket_ids:
            tickets = (
                db.query(Ticket)
                .filter(Ticket.id.in_(ticket_ids))
                .filter(Ticket.status == "incomplete")
                .all()
            )

        else:
            tickets = (
                db.query(Ticket).filter(Ticket.status == "incomplete").all()
            )

        logger.info(f"Fetched {len(tickets)} tickets for processing")
        db.close()
        return {"tickets": tickets}

    except Exception as e:
        raise AnalysisError(f"Failed to fetch tickets: {str(e)}") from e


async def node_classify_tickets(state: AnalysisState) -> AnalysisState:
    try:
        tickets = state["tickets"]
        results = await get_analysis(tickets)
        return {"results": results}

    except Exception as e:
        raise AnalysisError(f"Failed to classify tickets: {str(e)}") from e


async def node_summarize_tickets(state: AnalysisState) -> AnalysisState:
    try:
        tickets = state["tickets"]

        try:
            summary = await get_summary(tickets)
        except Exception as e:
            logger.warning(
                f"Trouble with the provided client. Falling back to default summary: {e}"
            )
            summary = default_summarizer(tickets, state["results"])
        return {"summary": summary}

    except Exception as e:
        raise AnalysisError(f"Failed to summarize tickets: {str(e)}") from e


def node_save_classification(state: AnalysisState) -> None:
    db = get_db_session()
    try:
        for i, ticket in enumerate(state["tickets"]):

            result = state["results"][i]

            merged_ticket = db.merge(ticket)
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
        logger.info("Classification results saved successfully", "WHITE")
        return

    except Exception as e:
        db.rollback()
        raise AnalysisError(
            f"Failed to save classification results: {str(e)}"
        ) from e

    finally:
        db.close()


def node_save_summary(state: AnalysisState) -> None:

    db = get_db_session()
    try:
        if not state["summary"]:
            logger.warning("No summary generated, skipping summary save")
            return

        analysis_run = (
            db.query(AnalysisRun)
            .filter(AnalysisRun.id == state["analysis_run_id"])
            .first()
        )

        if analysis_run:
            analysis_run.summary = state["summary"]
            db.commit()
            logger.info("Summary saved successfully", "WHITE")
        else:
            logger.error("Analysis run not found for summary save")

        return

    except Exception as e:
        db.rollback()
        raise AnalysisError(f"Failed to save summary: {str(e)}") from e
    finally:
        db.close()


async def get_analysis(tickets: list[Ticket]) -> list[dict[str, Any]]:
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

    async def analyze_single_ticket(ticket: Ticket) -> dict[str, Any]:

        async with semaphore:

            client = get_async_openai_client()
            prompt = f"""
            Analyze this support ticket and provide categorization:

            Ticket: Title: {ticket.title} | Description: {ticket.description}

            For this ticket, provide category (billing/bug/feature_request/authentication/other), priority (high/medium/low), and brief notes.
            Respond with valid JSON object: {{"category": "billing", "priority": "high", "notes": "Payment processing issue"}}
            """

            try:
                response = await client.chat.completions.parse(
                    model=MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=TEMPERATURE,
                    max_tokens=MAX_TOKENS,
                    response_format=TicketStructuredOutput,
                )

                if response.choices[0].message.refusal:
                    raise Exception("Refusal for structured output parsing")

                parsed = response.choices[0].message.parsed
                result = {
                    "category": parsed.category,
                    "priority": parsed.priority,
                    "notes": parsed.notes,
                }
                logger.info(
                    f"Analyzed ticket {ticket.id} - Category: {result['category']}",
                    "MAGENTA",
                )
                return result

            except Exception as e:
                logger.warning(
                    f"Structured Output passign failed. Falling back to manual parser: {e}"
                )
                response = await client.chat.completions.create(
                    model=MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=TEMPERATURE,
                    max_tokens=MAX_TOKENS,
                )

                data = response.choices[0].message.content
                try:
                    match = re.search(
                        r"```(?:json)?\s*(.*?)\s*```", data, re.DOTALL
                    )
                    json_content = match.group(1) if match else data.strip()
                    parsed_data = json.loads(json_content)
                    logger.info(
                        f"Analyzed ticket {ticket.id} - Category: {parsed_data.get('category', 'unknown')}",
                        "BRIGHT_YELLOW",
                    )
                    return parsed_data

                except Exception as e:
                    logger.warning(
                        f"LLM analysis failed for ticket {ticket.id[:8]}..., using fallback: {str(e)}"
                    )
                    return default_categorizer(ticket)

    tasks = [analyze_single_ticket(ticket) for ticket in tickets]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    logger.info(f"Completed processing {len(tickets)} tickets")
    return results


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
        logger.info(f"Preview of response from summary agent: {data[:500]}")
        return data

    except Exception as e:
        raise e
