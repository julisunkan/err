
@echo off
echo ========================================
echo Business Documents Generator Builder
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.7 or higher
    pause
    exit /b 1
)

echo Python found. Starting build process...
echo.

REM Run the main build script
python build_all.py

echo.
echo ========================================
echo Build process completed!
echo ========================================
echo.
echo Check the following locations:
echo - EXE: dist\BusinessDocumentsGenerator.exe
echo - Portable: BusinessDocumentsGenerator_Portable\
echo - MSI: dist\*.msi
echo.
pause
