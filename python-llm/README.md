# Python LLM service

FastAPI wrapper around Gemini Flash 2.5 (or fallback stub) used by the Recipe Finder frontend
and Node API.

## Quickstart

```bash
cd python-llm
pip install -r requirements.txt
export GEMINI_API_KEY=your-key
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
