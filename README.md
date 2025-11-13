# Recipe Finder – Fullstack

Modern, user-friendly recipe finder powered by:

- React + Vite + TypeScript frontend
- Supabase (Postgres + Auth)
- Node.js API (Express) for recipes + orchestration
- Python FastAPI service for Gemini Flash 2.5 recipe generation
- GitHub Actions CI for frontend and backend

## Structure

- `frontend/` – Vite React app (UI, Supabase client, calls Node & Python)
- `node-api/` – Express API for recipes, search & generating recipes via LLM service
- `python-llm/` – FastAPI service wrapping Gemini Flash 2.5 (with a safe fallback when no key)
- `.github/workflows/` – CI pipelines for frontend and backend

## Quickstart (local dev)

### 1. Supabase

1. Create a Supabase project.
2. Create a `recipes` table with columns like:
   - `id uuid primary key`
   - `title text`
   - `image_url text`
   - `cook_time_minutes int`
   - `difficulty text`
   - `rating numeric`
   - `tags text[]`
   - `ingredients text[]`
   - `steps text[]`
   - `servings int`
   - `calories int`
3. Grab:
   - Project URL
   - Anon public key
   - Service role key

### 2. Python LLM service

```bash
cd python-llm
pip install -r requirements.txt
export GEMINI_API_KEY=your-key
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Node API

```bash
cd node-api
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PYTHON_LLM_URL
npm install
npm run dev
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_NODE_API_URL, VITE_PYTHON_LLM_URL
npm install
npm run dev
```

Then open http://localhost:5173 to use the Recipe Finder UI.
