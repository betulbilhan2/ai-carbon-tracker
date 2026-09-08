@echo off
cd /d "%~dp0"

taskkill /F /IM dotnet.exe 2>nul
taskkill /F /IM node.exe 2>nul

echo [1/3] FastAPI AI baslatiliyor...
start "FastAPI AI" cmd /k "cd EcoTrack.AI && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/3] .NET API baslatiliyor...
start "EcoTrack Backend" cmd /k "cd EcoTrack.API && dotnet run"

timeout /t 3 /nobreak >nul

echo [3/3] React Vite baslatiliyor...
start "EcoTrack Frontend" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

start http://localhost:5173
