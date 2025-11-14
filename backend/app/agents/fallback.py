from typing import Any

from app.models import Ticket


def categorize_ticket(ticket: Ticket) -> dict[str, Any]:
    title_desc = f"{ticket.title} {ticket.description}".lower()

    if any(word in title_desc for word in ["payment", "billing", "invoice", "subscription", "charge"]):
        category = "billing"
        priority = "high" if any(urgent in title_desc for urgent in ["urgent", "critical", "asap"]) else "medium"
    elif any(word in title_desc for word in ["bug", "error", "crash", "broken", "not working"]):
        category = "bug"
        priority = "high" if any(critical in title_desc for critical in ["crash", "down", "critical"]) else "medium"
    elif any(word in title_desc for word in ["feature", "enhancement", "request", "add", "new"]):
        category = "feature_request"
        priority = "low"
    elif any(word in title_desc for word in ["login", "password", "access", "permission"]):
        category = "authentication"
        priority = "high"
    else:
        category = "general"
        priority = "medium"

    return {
        "category": category,
        "priority": priority,
        "notes": "Auto-categorized based on keywords in title/description"
    }

def generate_batch_summary(tickets: list[Ticket], analyses: list[dict[str, Any]]) -> str:
    total = len(tickets)
    categories = {}
    priorities = {}

    for analysis in analyses:
        cat = analysis["category"]
        pri = analysis["priority"]
        categories[cat] = categories.get(cat, 0) + 1
        priorities[pri] = priorities.get(pri, 0) + 1

    cat_summary = ", ".join([f"{count} {cat}" for cat, count in categories.items()])
    pri_summary = ", ".join([f"{count} {pri}" for pri, count in priorities.items()])

    return f"Analyzed {total} tickets. Categories: {cat_summary}. Priorities: {pri_summary}. Most common category: {max(categories, key=categories.get)} ({categories[max(categories, key=categories.get)]} tickets)."
