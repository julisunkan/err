
@echo off
echo ========================================
echo   Business Documents Generator
echo ========================================
echo.
echo Starting Flask web application...
echo The application will open in your browser automatically.
echo.
echo URL: http://localhost:5000
echo.
echo To stop the application, close this window or press Ctrl+C
echo.

REM Start the Flask application in background
start /B python main.py

REM Wait 3 seconds for server to start
timeout /t 3 /nobreak >nul

REM Open the web browser
start http://localhost:5000

REM Keep the window open to show server logs
echo Web browser opened. Server is running...
echo Close this window to stop the application.
echo.
pause >nul
