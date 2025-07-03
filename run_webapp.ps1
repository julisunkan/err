
# Business Documents Generator Launcher
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Business Documents Generator" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Starting Flask web application..." -ForegroundColor Yellow
Write-Host "The application will open in your browser automatically."
Write-Host ""
Write-Host "URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop the application, close this window or press Ctrl+C"
Write-Host ""

# Start Flask application in background
$flaskProcess = Start-Process python -ArgumentList "main.py" -PassThru -WindowStyle Hidden

# Wait for server to start
Start-Sleep -Seconds 3

# Open web browser
Start-Process "http://localhost:5000"

Write-Host "Web browser opened. Server is running..." -ForegroundColor Green
Write-Host "Flask Process ID: $($flaskProcess.Id)" -ForegroundColor Gray
Write-Host "Press any key to stop the application and exit..." -ForegroundColor Yellow

# Wait for user input to stop
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop Flask process
if (!$flaskProcess.HasExited) {
    Stop-Process -Id $flaskProcess.Id -Force
    Write-Host "Application stopped." -ForegroundColor Red
}
