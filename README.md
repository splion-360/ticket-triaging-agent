# Support Ticket Analyst

An intelligent support ticket management system that automatically categorizes and prioritizes incoming support tickets


## Getting Started

**Prerequisites:**
- Make sure to have docker engine [installed](https://docs.docker.com/engine/install/)
- **NOTE:** This entire project was developed in a Ubuntu computer with RTX-3050


**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Database (pgAdmin): http://localhost:5050 (admin@traige.com / triage123456789)

## Architecture

### Tech Stack & Design Decisions

**Backend Framework:** _FastAPI_ chosen for its async support, swagger, and Pydantic integration for type safety. Also, I have built several projects with it 

**Database:** _PostgreSQL_ selected for `ACID` compliance and complex relational queries (FKEYS) between tickets, analysis runs, and results.

**AI Workflow:** _LangGraph_ for structured workflow management.

**Frontend:** _React_ + _TypeScript_ w _Vite_ provides fast development builds.

**Directory:**

```
ticket-triaging-agent/
├── backend/
│   ├── app/
│   │   ├── agents/           # Langgraph utilities
│   │   │   ├── graph.py     
│   │   │   ├── nodes.py     
│   │   │   └── utils.py     
│   │   ├── api/              # Analysis endpoints
│   │   │   ├── analysis.py   
│   │   │   └── tickets.py    
│   │   ├── models/           # SQLAlchemy ORM models
│   │   │   ├── analysis.py   
│   │   │   ├── base.py      
│   │   │   └── ticket.py     
│   │   ├── schemas/          # pydantic request/response models
│   │   │   ├── analysis.py  
│   │   │   ├── base.py       
│   │   │   └── ticket.py     
│   │   ├── config.py         # project configuration
│   │   ├── database.py       # Database connection & session management
│   │   ├── exceptions.py     
│   │   └── main.py           
│   ├── assets/               
│   └── requirements.txt      
├── frontend/
│   ├── src/
│   │   ├── components/       # React UI components
│   │   │   ├── *Pane.tsx     
│   │   │   └── *.tsx         
│   │   ├── contexts/         
│   │   ├── services/         # API client functions
│   │   ├── types/            
│   │   └── App.tsx          
│   ├── package.json          
│   └── vite.config.ts        
├── docker-compose.yml        # Multi-container orchestration
└── .env.example              # Environment template
```

### LangGraph Workflow Architecture

The system uses a parallel processing workflow implemented with LangGraph:

![Workflow Graph](/backend/assets/workflow_graph.png)


**State Management:** LangGraph maintains shared state (`AnalysisState`) containing ticket data, analysis results, and summary across all nodes.

**DB Integration:** Nodes actively interact with PostgreSQL through SQLAlchemy, ensuring transactional consistency.
**Error Handling:** Failed LLM calls automatically fall back to rule-based categorization using keyword matching.

### DB Schema

**tickets**
- `id` (UUID, PK)
- `title` (text)
- `description` (text)
- `status` (text)
- `created_at` (timestamp)

**analysis_runs**
- `id` (UUID, PK) 
- `summary` (text)
- `created_at` (timestamp)

**ticket_analysis**
- `id` (UUID, PK)
- `analysis_run_id` (FK -> `analysis_runs`)
- `ticket_id` (FK -> `tickets`)
- `category` (text)
- `priority` (text)
- `notes` (text)


### Tradeoffs
For the sake of quick completion, I did not get enough chance to experiment with the below
- User Auth
- Limited test coverage 
- Additional features like **selective ticket analysis**, **ticket editing**


## API Reference

All API endpoints return JSON responses

### Ticket Management

#### Create Tickets
**POST** `/api/tickets/`

Create one or multiple support tickets.

**Request Body:**
```json
{
  "tickets": [
    {
      "title": "title 1",
      "description": "desc 1",
    }
  ]
}
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-15T10:30:00Z",
    "title": "title 1",
    "description": "desc 1",
    "status": "incomplete",
  }
]
```

#### Get All Tickets
**GET** `/api/tickets/`

Retrieve all tickets with their current status and analysis results (if available).

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-15T10:30:00Z",
    "title": "title 1",
    "description": "desc 1",
    "status": "complete",
    "category": "cat 1",
    "priority": "high",
    "notes": "notes"
  }
]
```

### Analysis Operations

#### Trigger Analysis
**POST** `/api/analysis/`

Start batch analysis of pending tickets. Can analyze all pending tickets or *specific* ones.

**Request Body (All pending tickets):**
```json
{
  "ticket_ids": null
}
```

**Request Body (Specific pending tickets):**
```json
{
  "ticket_ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
  ]
}
```

**Response:**
```json
{
  "id": "analysis-run-uuid",
  "created_at": "2024-01-15T10:35:00Z",
  "summary": "summary.....",
  "ticket_analyses": [
    {
      "id": "550e8400-e29b-41d4-a716-446655499000",
      "created_at": "2024-01-15T10:35:00Z",
      "analysis_run_id": "analysis-run-uuid",
      "ticket": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Login issue with mobile app",
        "description": "Users cannot login..."
      }
    }
  ]
}
```

#### Get Latest Analysis
**GET** `/api/analysis/latest`

Retrieve the most recent analysis results.

**Response:** Same format as POST `/api/analysis/` response.



## Configuration

### Environment Variables

The system uses environment variables for configuration. Copy the example file and update with your values:

```bash
cp .env.example .env
```

**Required Variables:**

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - | `postgresql://postgres:postgres@db:5432/triage` |
| `ENVIRONMENT` | Application environment | `development` | `development`, `production` |
| `LLM_API_KEY` | API key for LLM service | - | `your-api-key-here` |


### Database Connection

The backend connects to PostgreSQL using SQLAlchemy with the `DATABASE_URL` environment variable. In Docker Compose mode:
- Host: `db` (Docker service name)
- Port: `5432`
- Database: `triage`
- User/Password: `postgres`/`postgres`

For local development, update the connection string to point to your local PostgreSQL instance.

### LLM Configuration

The system supports both local and cloud LLM providers. Configuration is handled in `backend/app/config.py`:

**Default (Ollama Local):**
```python
MODEL = "gemma3"
API_URL = "http://host.docker.internal:11434/v1"
```

**OpenAI Configuration:**
To use OpenAI instead of local Ollama:
1. Set `LLM_API_KEY` in your `.env` file
2. Update `config.py`:
```python
MODEL = "gpt-3.5-turbo" # or any other model of your choosing
API_URL = "https://api.openai.com/v1"
```


## Development

### 1. Local Development Setup
In two separate terminals, start the services as follows
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### 2. Docker Compose (Recommended)
```bash
cd ticket-triaging-agent
cp .env.example .env # Add your API_KEYS 
docker compose up --build -d # In a detached mode
```
\