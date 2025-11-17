# Selenium UI Tests for RecipeFinder

## Prerequisites

- Windows with **Python 3.10+**
- **Google Chrome** installed
- Internet access for the app's backend (Supabase, Node API, Python LLM) if you want full flows
- Frontend running locally at `http://localhost:5173` (or edit `config.py`)

## Structure

- `config.py` – base URL for the frontend
- `conftest.py` – pytest fixtures for Chrome WebDriver and login helper
- `tests/` – Selenium end-to-end tests mapped to the E2E test cases in `Selenium.xlsx`
- `run_selenium.bat` – Windows helper script to create a venv, install deps, and run tests in Chrome

## How to run

1. Ensure the frontend is running (e.g. `npm run dev` in `frontend/`).
2. (Optional) Update `BASE_URL` in `config.py` if not using `http://localhost:5173`.
3. Double-click `run_selenium.bat` on Windows, or run from a terminal:

```bat
run_selenium.bat
```

This will:
- create `.venv` inside this folder (if not present),
- install Python dependencies,
- launch Chrome,
- run all tests under `tests/` with pytest.
