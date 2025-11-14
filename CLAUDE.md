# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack Support Ticket Analyst application built for a take-home assignment. The system uses an AI agent to automatically categorize and prioritize support tickets, providing batch analysis and individual ticket insights.

**Tech Stack:**
- Backend: Python + FastAPI + SQLAlchemy + LangGraph
- Database: PostgreSQL  
- Frontend: React + TypeScript + Vite
- Infrastructure: Docker + Docker Compose

## Development Commands

**Start the entire application:**
```bash
docker compose up --build
```

**Backend development (when implemented):**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend development (when implemented):**
```bash
cd frontend  
npm install
npm run dev
```

**Database migrations (when implemented):**
```bash
docker compose run backend alembic upgrade head
```

## Architecture Overview

### Core Data Flow
1. Users create multiple support tickets via the web UI
2. Users trigger batch analysis which invokes the LangGraph agent
3. LangGraph agent processes all tickets in a single workflow:
   - Fetches tickets from PostgreSQL
   - Calls LLM (or fallback rules) for batch analysis
   - Saves individual categorizations + overall batch summary
4. UI displays both individual ticket analysis and batch-level insights

### Database Schema
- `tickets`: Individual support tickets (title, description, created_at)
- `analysis_runs`: Batch analysis sessions with overall summary
- `ticket_analysis`: Link table with per-ticket categorization (category, priority, notes)

### LangGraph Agent Structure
The agent implements a linear workflow:
- `fetch_tickets_node`: Retrieves tickets from database
- `batch_analyze_node`: Single LLM call processes entire batch
- `save_results_node`: Persists individual + summary results

**Key Design**: The agent analyzes tickets as a batch rather than individually, generating both per-ticket categorization and an overall summary of patterns across all tickets.

### Backend Structure
```
backend/app/
├── models/         # SQLAlchemy ORM models
├── api/           # FastAPI route handlers  
├── agents/        # LangGraph implementation
└── schemas/       # Pydantic request/response models
```

### API Endpoints
- Endpoint names should always be a NOUN and not a VERB
- AVOID writing endpoints with hyphens, e.g `/upload-single`
- `POST /api/tickets` - Bulk ticket creation
- `POST /api/analyze` - Trigger LangGraph batch analysis
- `GET /api/analysis/latest` - Retrieve latest analysis results

## Coding Rules
- Always prefer using a `try-except` | `try-catch` blocks to effectively handle services

**Import Organization:**
- All imports at the top of files
- All imports should be absolute (No relative imports)

**Code Reusability:**
- Create shared base classes for common patterns
- Reuse functions, variables, and classes extensively
- Avoid code duplication at all costs
- Extract common logic into utility functions
- Use inheritance and composition patterns

**No Comments/Docstrings:**

## Environment Configuration

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: Optional, falls back to rule-based analysis

**Other Rules**
- Never access the `.env` file. If you need to add any `env` vars, make sure that you are adding them in `.env.example.*` 