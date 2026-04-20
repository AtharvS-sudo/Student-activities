@echo off
echo ========================================
echo Installing Real-Time Chat Dependencies
echo ========================================
echo.

echo Installing backend dependencies...
cd backend
call npm install socket.io
echo Backend dependencies installed!
echo.

echo Installing frontend dependencies...
cd ..\frontend
call npm install socket.io-client
echo Frontend dependencies installed!
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your backend server
echo 2. Restart your frontend server
echo 3. Login as a club member
echo 4. Click "Club Chat" in the navbar
echo.
pause
