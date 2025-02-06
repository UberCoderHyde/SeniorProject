@echo off
echo Starting Backend Setup...

:: Step 1: Check if venv exists, if not, create it
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

:: Step 2: Ensure pip is up to date
venv\Scripts\python -m ensurepip --default-pip
venv\Scripts\python -m pip install --upgrade pip setuptools wheel


:: Step 4: Check if Django is installed
venv\Scripts\python -m pip show django >nul 2>&1
if errorlevel 1 (
    echo Django is not installed. Installing now...
    venv\Scripts\python -m pip install django
)
venv\Scripts\python -m pip show djangorestframework >nul 2>&1
if errorlevel 1 (
    echo djangorestframework is not installed. Installing now...
    venv\Scripts\python -m pip install djangorestframework
)
venv\Scripts\python -m pip show django-cors-headers >nul 2>&1
if errorlevel 1 (
    echo django-cors-headers is not installed. Installing now...
    venv\Scripts\python -m pip install django-cors-headers
)
:: Step 3: Install all required dependencies
if not exist requirements.txt (
    echo Generating requirements.txt...
    venv\Scripts\python -m pip freeze > requirements.txt
)

venv\Scripts\python -m pip install -r requirements.txt

:: Step 5: Run database migrations
venv\Scripts\python manage.py makemigrations
venv\Scripts\python manage.py migrate

:: Step 6: Start Django server
echo run venv\Scripts\activate in your terminal to do anything else with the terminal
echo Starting Django Backend...
venv\Scripts\python manage.py runserver

pause

