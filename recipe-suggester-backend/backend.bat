@echo off
echo Starting Backend Setup...

:: Step 1: Check if venv exists, if not, create it
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

:: Step 2: Activate the virtual environment
call venv\Scripts\activate

:: Step 3: Generate requirements.txt (if missing)
if not exist requirements.txt (
    echo Generating requirements.txt...
    pip freeze > requirements.txt
)

:: Step 4: Install all required dependencies
echo Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

:: Step 5: Run database migrations
echo Running migrations...
python manage.py makemigrations
python manage.py migrate

:: Step 6: Start Django server
echo Starting Django Backend...
python manage.py runserver

pause
