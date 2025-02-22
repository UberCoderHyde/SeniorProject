@echo off
echo Starting Backend Setup...

:: Step 1: Check if venv exists, if not, create it
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
venv\Scripts\python -m ensurepip --default-pip
venv\Scripts\python -m pip install --upgrade pip setuptools wheel
venv\Scripts\python -m pip install django
venv\Scripts\python -m pip install djangorestframework
venv\Scripts\python -m pip install django-cors-headers
venv\Scripts\python -m pip install -r requirements.txt
:: Step 6: Start Django server
echo run venv\Scripts\activate in your terminal to do anything else with the terminal
echo Starting Django Backend...

venv\Scripts\python manage.py runserver
echo to start venv in terminal use: venv\Scripts\activate
echo if there is a error run in venv python -m pip install -r requirements.txt

pause

