# Recipe Finder – Production Monorepo

Full-stack recipe finder with:

- Frontend: Vite + React + TypeScript (deployed to Vercel)
- Backend: Node.js + Express + Supabase (deployed to Render)
- LLM service: FastAPI + Gemini Flash (deployed to Render)
- DB: Supabase Postgres
- CI/CD: GitHub Actions for all services

## Structure

- `frontend/` – SPA UI, calls Node API and Python LLM.
- `node-api/` – REST API, connects to Supabase and Python LLM.
- `python-llm/` – FastAPI service wrapping Gemini.
- `.github/workflows/` – CI + deploy pipelines.

## Local dev quickstart

### Python LLM

```bash
cd python-llm
pip install -r requirements.txt
export GEMINI_API_KEY=your-key
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Node API

```bash
cd node-api
cp .env.example .env
# Fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PYTHON_LLM_URL=http://localhost:8000
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Fill VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_NODE_API_URL, VITE_PYTHON_LLM_URL
npm install
npm run dev
```

Then open http://localhost:5173.
