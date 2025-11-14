# Support Ticket Analyst

AI-powered support ticket categorization and priority analysis using LangGraph agents.

## 🚀 Quickstart

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
- Backend API: http://localhost:8080
- API Documentation: http://localhost:8080/docs

## 🏗️ Architecture Overview

### Tech Stack
- **Backend:** FastAPI + SQLAlchemy + LangGraph + PostgreSQL
- **Frontend:** React + TypeScript + Vite
- **Infrastructure:** Docker Compose
- **AI:** OpenAI GPT-3.5 with rule-based fallback

### Core Workflow
1. **Ticket Creation:** Users submit support tickets via web interface
2. **Batch Analysis:** LangGraph agent processes all tickets simultaneously
3. **AI Categorization:** LLM or fallback rules classify tickets by category/priority  
4. **Results Display:** Dashboard shows individual analysis + batch summary

### LangGraph Agent Architecture
```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ Fetch       │───▶│ Batch        │───▶│ Save        │
│ Tickets     │    │ Analyze      │    │ Results     │
│ Node        │    │ Node         │    │ Node        │
└─────────────┘    └──────────────┘    └─────────────┘
```

**Key Design Decision:** The agent analyzes tickets as a **batch** rather than individually, generating both per-ticket categorization and an overall summary of patterns.

## 📡 API Endpoints

### Tickets
- `POST /api/tickets/` - Create multiple tickets
- `GET /api/tickets/` - List all tickets

### Analysis  
- `POST /api/analysis/` - Trigger batch analysis
- `GET /api/analysis/latest` - Get latest analysis results

## 🧠 AI Agent Details

### LLM Integration
- **Primary:** OpenAI GPT-3.5-turbo for intelligent categorization
- **Fallback:** Keyword-based rules when no API key provided
- **Categories:** billing, bug, feature_request, authentication, general
- **Priorities:** high, medium, low

### Batch Analysis Benefits
- **Efficiency:** Single LLM call processes multiple tickets
- **Context:** Agent sees patterns across entire ticket batch
- **Summary:** Generates holistic insights beyond individual classifications

## 🌍 Environment Configuration

**Required variables:**
```bash
DATABASE_URL=postgresql://postgres:postgres@db:5432/tickets
OPENAI_API_KEY=your-openai-key-here  # Optional
ENVIRONMENT=development
```

**Without OpenAI key:** System falls back to rule-based analysis using keyword detection.

## ⏱️ Development Time & Tradeoffs

**Time Spent:** ~3 hours as requested

**Pragmatic Choices Made:**
- Direct FastAPI endpoints without service layer abstraction
- Simple rule-based fallback instead of complex NLP
- Basic React styling focused on functionality over polish
- Vite dev server instead of production nginx setup

**Production Improvements:**
- User authentication and multi-tenancy
- Advanced LangGraph workflows (parallel processing, tool use)
- Real-time WebSocket updates for analysis progress
- Comprehensive test coverage and error monitoring
- Rate limiting and API security