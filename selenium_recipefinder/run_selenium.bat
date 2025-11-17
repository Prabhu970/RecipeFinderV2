@echo off
setlocal

REM Create venv if it does not exist
IF NOT EXIST .venv (
    echo Creating virtual environment...
    python -m venv .venv
)

echo Activating virtual environment...
call .venv\Scripts\activate

echo Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo Running Selenium tests in visible Chrome...
pytest -vv

echo.
echo Test run complete. Press any key to close.
pause >nul
