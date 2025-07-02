
import os
import sys
import subprocess
import shutil
from pathlib import Path

def build_executable():
    """Build standalone executable using PyInstaller"""
    
    print("Building standalone executable...")
    
    # Install PyInstaller if not present
    try:
        import PyInstaller
    except ImportError:
        print("Installing PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
    
    # Create spec file content
    spec_content = """
# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['standalone_main.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('templates', 'templates'),
        ('static', 'static'),
        ('instance', 'instance'),
    ],
    hiddenimports=[
        'flask',
        'flask_sqlalchemy',
        'werkzeug',
        'jinja2',
        'markupsafe',
        'itsdangerous',
        'click',
        'blinker',
        'sqlalchemy',
        'email_validator',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='BusinessDocumentsGenerator',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='static/icons/icon-192.png'
)
"""
    
    # Write spec file
    with open('app.spec', 'w') as f:
        f.write(spec_content)
    
    # Build executable
    try:
        subprocess.check_call([
            sys.executable, "-m", "PyInstaller",
            "--clean",
            "--noconfirm",
            "app.spec"
        ])
        
        print("Executable built successfully!")
        print("Location: dist/BusinessDocumentsGenerator.exe")
        
        # Create portable version folder
        portable_dir = Path("BusinessDocumentsGenerator_Portable")
        if portable_dir.exists():
            shutil.rmtree(portable_dir)
        
        portable_dir.mkdir()
        
        # Copy executable
        shutil.copy2("dist/BusinessDocumentsGenerator.exe", portable_dir)
        
        # Create batch file for easy running
        batch_content = """@echo off
echo Starting Business Documents Generator...
echo The application will open in your default web browser.
echo URL: http://localhost:5000
echo.
echo Press Ctrl+C to stop the application
echo.
start http://localhost:5000
BusinessDocumentsGenerator.exe
pause
"""
        
        with open(portable_dir / "Start_Business_Documents.bat", 'w') as f:
            f.write(batch_content)
        
        # Create readme
        readme_content = """Business Documents Generator - Portable Version

INSTALLATION:
1. Extract all files to any folder
2. Double-click "Start_Business_Documents.bat"
3. The application will start and open in your web browser

USAGE:
- The application runs on http://localhost:5000
- Your data is stored locally in the database file
- To stop the application, close the command window or press Ctrl+C

REQUIREMENTS:
- Windows 7 or later
- No additional software required (all dependencies included)

SUPPORT:
If you encounter any issues, please check that:
- Port 5000 is not being used by another application
- Your antivirus is not blocking the executable
- You have sufficient disk space for the database
"""
        
        with open(portable_dir / "README.txt", 'w') as f:
            f.write(readme_content)
        
        print(f"Portable version created in: {portable_dir}")
        
    except subprocess.CalledProcessError as e:
        print(f"Error building executable: {e}")
        return False
    
    return True

if __name__ == "__main__":
    build_executable()
