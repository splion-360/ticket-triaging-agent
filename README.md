# Ticket Triaging Agent

**Prerequisites:**
- Docker & Docker Compose

**Run the entire application:**
```bash
git clone <repository-url>
cd ticket-triaging-agent
cp .env.example .env
# Edit .env to add your OPENAI_API_KEY (optional)
docker compose up --build
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Architecture Overview

### Tech Stack
- **Backend:** FastAPI + SQLAlchemy + LangGraph + PostgreSQL
- **Frontend:** React + TypeScript + Vite
- **Infrastructure:** Docker Compose

### Workflow
1. **Ticket Creation:** Users submit support tickets via web interface
2. **AI Categorization:** LangGraph Agents take over and classify tickets by category/priority  

## API Endpoints

### Tickets
- `POST /api/tickets/` - Create multiple tickets
- `GET /api/tickets/` - List all tickets

### Analysis  
- `POST /api/analysis/` - Trigger batch analysis
- `GET /api/analysis/latest` - Get latest analysis results

## AI Agent Details

### Ticket Categories
- **Primary:** OpenAI GPT-3.5-turbo for intelligent categorization
- **Categories:** billing, bug, feature_request, authentication, general
- **Priorities:** high, medium, low


## Environment Configuration

```bash
DATABASE_URL=postgresql://postgres:postgres@db:5432/tickets
OPENAI_API_KEY=your-openai-key-here  
ENVIRONMENT=development
```
