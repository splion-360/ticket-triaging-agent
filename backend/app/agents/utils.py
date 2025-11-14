import json
import re
from typing import Any

from pydantic import BaseModel

from app.config import (
    MAX_TOKENS,
    MODEL,
    TEMPERATURE,
    get_async_openai_client,
)
from app.models import Ticket


def default_categorizer(ticket: Ticket) -> dict[str, Any]:
    title_desc = f"{ticket.title} {ticket.description}".lower()

    if any(
        word in title_desc
        for word in ["payment", "billing", "invoice", "subscription", "charge"]
    ):
        category = "billing"
        priority = (
            "high"
            if any(
                urgent in title_desc
                for urgent in ["urgent", "critical", "asap"]
            )
            else "medium"
        )
    elif any(
        word in title_desc
        for word in ["bug", "error", "crash", "broken", "not working"]
    ):
        category = "bug"
        priority = (
            "high"
            if any(
                critical in title_desc
                for critical in ["crash", "down", "critical"]
            )
            else "medium"
        )
    elif any(
        word in title_desc
        for word in ["feature", "enhancement", "request", "add", "new"]
    ):
        category = "feature_request"
        priority = "low"
    elif any(
        word in title_desc
        for word in ["login", "password", "access", "permission"]
    ):
        category = "authentication"
        priority = "high"
    else:
        category = "other"
        priority = "medium"

    return {
        "category": category,
        "priority": priority,
        "notes": "Auto-categorized based on keywords in title/description",
    }


def default_summarizer(
    tickets: list[Ticket], results: list[dict[str, Any]]
) -> str:
    """
    Creates a summary with attributes availabe within tiekcts and the results

    """
    total_tickets = len(tickets)
    if total_tickets == 0:
        return "No tickets processed!"

    category_counts = {}
    priority_counts = {"high": 0, "medium": 0, "low": 0}

    for result in results:
        if isinstance(result, dict):
            category = result.get("category", "N/A")
            priority = result.get("priority", "N/A").lower()

            category_counts[category] = category_counts.get(category, 0) + 1
            if priority in priority_counts:
                priority_counts[priority] += 1

    processed_tickets = len([r for r in results if isinstance(r, dict)])
    failed_tickets = total_tickets - processed_tickets

    summary_parts = [
        f"Processed {processed_tickets} out of {total_tickets} tickets."
    ]

    if failed_tickets > 0:
        summary_parts.append(f"{failed_tickets} tickets failed processing.")

    if category_counts:
        category_summary = ", ".join(
            [f"{count} {cat}" for cat, count in sorted(category_counts.items())]
        )
        summary_parts.append(f"Categories: {category_summary}.")

    priority_summary = f"Priorities: {priority_counts['high']} high, {priority_counts['medium']} medium, {priority_counts['low']} low."
    summary_parts.append(priority_summary)

    if category_counts:
        top_category = max(category_counts.items(), key=lambda x: x[1])
        summary_parts.append(
            f"Most common issue: {top_category[0]} ({top_category[1]} tickets)."
        )

    return " ".join(summary_parts)


async def get_structured_llm_response(
    prompt: str,
    response_format: BaseModel = None,
    model: str = MODEL,
    temperature: float = TEMPERATURE,
    max_tokens: int = MAX_TOKENS,
    is_markdown: bool = False,
) -> Any:
    """
    Makes an async request to the provider and parses the response in the provided structured format

    """

    client = get_async_openai_client()

    try:

        if response_format and isinstance(response_format, BaseModel):
            response = await client.chat.completions.parse(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_tokens,
                response_format=response_format,
            )

            if response.choices[0].message.refusal:
                raise Exception("Refusal for structured output parsing")

            parsed = response.choices[0].message.parsed
            return parsed.model_dump()

        else:
            response = await client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_tokens,
            )

            data = response.choices[0].message.content
            if not data or not data.strip():
                raise Exception("Empty response from LLM")

            if is_markdown:
                return extract_markdown(data)

            else:
                return extract_json(data)

    except Exception as e:
        raise e


def extract_markdown(content: str) -> str | None:
    """
    Extracts MD embedded content from the LLM response
    Raises ValueError if no appropriate TAGS are found
    """
    match = re.search(r"```md\s*(.*?)\s*```", content, re.DOTALL)
    if match:
        return match.group(1).strip()
    raise ValueError("No MD tags found")


def extract_json(content: str) -> str | None:
    """
    Extract JSON embedded content from the LLM response
    Returns None if no appropriate TAGS are found

    """
    match = re.search(r"```(?:json)?\s*(.*?)\s*```", content, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    raise ValueError("No JSON tags found")
