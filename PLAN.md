# Implementation Plan - Support Ticket Analyst

## Phase 1: Project Foundation (20min)

### 1.1 Repository Structure Setup (10min)
```
ticket-triaging-agent/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app entry point
│   │   ├── config.py             # Environment & database config
│   │   ├── models/               # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── base.py           # Base model class
│   │   │   ├── ticket.py         # Ticket model
│   │   │   └── analysis.py       # AnalysisRun & TicketAnalysis models
│   │   ├── database/             # Database connection & session
│   │   │   ├── __init__.py
│   │   │   └── connection.py
│   │   ├── api/                  # FastAPI routers & endpoints
│   │   │   ├── __init__.py
│   │   │   ├── tickets.py        # POST /api/tickets, GET /api/tickets
│   │   │   └── analysis.py       # POST /api/analyze, GET /api/analysis/latest
│   │   ├── agents/               # LangGraph implementation
│   │   │   ├── __init__.py
│   │   │   ├── analyzer.py       # Main LangGraph workflow
│   │   │   ├── nodes.py          # Graph node functions
│   │   │   └── fallback.py       # Rule-based categorization
│   │   ├── services/             # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── ticket.py         # Ticket operations
│   │   │   └── analysis.py       # Analysis workflow
│   │   └── schemas/              # Pydantic models
│   │       ├── __init__.py
│   │       ├── ticket.py         # Ticket DTOs
│   │       └── analysis.py       # Analysis DTOs
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TicketForm.tsx
│   │   │   ├── TicketList.tsx
│   │   │   ├── AnalysisButton.tsx
│   │   │   └── AnalysisResults.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
├── CLAUDE.md
├── plan.md
└── README.md
```

### 1.2 Initial Git Setup (10min)
- Initialize repo with meaningful first commit
- Set up .gitignore and .env.example

## Phase 2: Database & Backend Core (45min)

### 2.1 Database Models (15min)
```python
# app/models/base.py
class BaseModel(DeclarativeBase):
    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

# app/models/ticket.py  
class Ticket(BaseModel):
    __tablename__ = "tickets"
    title: Mapped[str]
    description: Mapped[str]

# app/models/analysis.py
class AnalysisRun(BaseModel):
    __tablename__ = "analysis_runs" 
    summary: Mapped[str]

class TicketAnalysis(BaseModel):
    __tablename__ = "ticket_analysis"
    analysis_run_id: Mapped[int] = mapped_column(ForeignKey("analysis_runs.id"))
    ticket_id: Mapped[int] = mapped_column(ForeignKey("tickets.id"))
    category: Mapped[str]
    priority: Mapped[str]  
    notes: Mapped[str] = mapped_column(nullable=True)
```

### 2.2 FastAPI Foundation (15min)
- Database connection setup with shared session pattern
- Basic CRUD endpoints reusing common patterns
- Error handling middleware

### 2.3 LangGraph Batch Analyzer (15min)
```python
# Reusable state and node patterns
class AnalysisState(TypedDict):
    tickets: List[Ticket]
    individual_results: List[Dict]
    batch_summary: str
    analysis_run_id: int

def create_analysis_graph():
    workflow = StateGraph(AnalysisState)
    workflow.add_node("fetch", fetch_tickets_node)
    workflow.add_node("analyze", batch_analyze_node) 
    workflow.add_node("save", save_results_node)
    workflow.add_edge("fetch", "analyze")
    workflow.add_edge("analyze", "save")
    workflow.set_entry_point("fetch")
    workflow.set_finish_point("save")
    return workflow.compile()
```

## Phase 3: LangGraph Intelligence (45min)

### 3.1 Batch Analysis Logic (30min)
- Single LLM call processing entire batch
- Structured output parsing reusing common validators
- Fallback rule engine with shared categorization logic

### 3.2 Analysis Service Integration (15min)
- POST /api/analyze endpoint triggering workflow
- Shared transaction management patterns
- Reusable error handling and response formatting

## Phase 4: Frontend (50min)

### 4.1 Core Components (30min)
- Shared component patterns and hooks
- Reusable form validation logic
- Common API service functions

### 4.2 Analysis Results Display (20min)
- Shared data transformation utilities  
- Reusable loading and error state components

## Phase 5: Infrastructure (25min)

### 5.1 Docker Compose (15min)
- Shared environment variable patterns
- Reusable health check configurations
- Common volume and network setups

### 5.2 Environment Configuration (10min)
- Shared configuration validation
- Reusable connection string builders

## Phase 6: Documentation & Testing (15min)

### 6.1 README (10min)
- Quickstart guide with shared command patterns
- API documentation reusing common examples

### 6.2 End-to-End Test (5min)
- Verify complete workflow functionality

## Key Reusability Patterns

### Backend Patterns
- BaseModel for all SQLAlchemy models
- Shared database session management
- Common API response formatting
- Reusable Pydantic schema inheritance
- Shared error handling decorators

### Frontend Patterns  
- Custom hooks for API calls
- Shared TypeScript interfaces
- Common component props patterns
- Reusable utility functions

### Infrastructure Patterns
- Shared Docker configuration templates
- Common environment variable structures
- Reusable health check implementations

## Commit Strategy
1. "Initialize project structure with shared base patterns"
2. "Add database models with reusable base classes"
3. "Implement FastAPI endpoints with shared utilities" 
4. "Add LangGraph workflow with reusable node patterns"
5. "Create React frontend with shared component patterns"
6. "Configure Docker Compose with reusable configurations"
