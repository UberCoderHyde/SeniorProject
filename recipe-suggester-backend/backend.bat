@echo off
echo Starting Backend Setup...

:: Check if venv exists
if not exist venv (
    echo Error: Virtual environment not found. Run "python -m venv venv" first.
    exit /b
)

:: Activate the virtual environment
call venv\Scripts\activate

:: Install dependencies
pip install -r requirements.txt

:: Run database migrations
python manage.py makemigrations
python manage.py migrate

:: Start Django server
echo Starting Django Backend...
python manage.py runserver

pause
