@echo off
echo Starting Backend Setup...

:: Step 1: Check if venv exists, if not, create it
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

:: Step 2: Activate the virtual environment
call venv\Scripts\activate

:: Step 3: Ensure pip is up to date
python -m ensurepip --default-pip
python -m pip install --upgrade pip setuptools wheel

:: Step 4: Install all required dependencies
if not exist requirements.txt (
    echo Generating requirements.txt...
    pip freeze > requirements.txt
)
pip install -r requirements.txt

:: Step 5: Check if Django is installed
pip show django >nul 2>&1
if errorlevel 1 (
    echo Django is not installed. Installing now...
    pip install django
)

:: Step 6: Run database migrations
python manage.py makemigrations
python manage.py migrate

:: Step 7: Start Django server
echo Starting Django Backend...
python manage.py runserver

pause
