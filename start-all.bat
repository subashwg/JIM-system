@echo off
echo ==========================================
echo   Starting JIM-System Gym Tracker Stack
echo ==========================================

echo Starting Embedded PostgreSQL (Port 54329)...
start "JIM - PostgreSQL (Port 54329)" cmd /k "npm.cmd run db:start"

timeout /t 4 /nobreak >nul

echo Starting NestJS Backend (Port 3000)...
start "JIM - Backend API (Port 3000)" cmd /k "npm.cmd run start:dev"

timeout /t 4 /nobreak >nul

echo Starting Vite Frontend (Port 5173)...
start "JIM - Frontend (Port 5173)" cmd /k "npm.cmd run frontend:dev"

echo.
echo ==========================================
echo All services are launching:
echo  - Frontend:  http://localhost:5173
echo  - Backend:   http://localhost:3000/api/v1
echo  - Swagger:   http://localhost:3000/api/docs
echo  - Demo User: demo@jim.app / Password123!
echo ==========================================
pause
