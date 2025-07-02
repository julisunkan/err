
#!/usr/bin/env python3
"""
Master build script for Business Documents Generator
Builds both EXE and MSI packages
"""

import os
import sys
import subprocess
from pathlib import Path

def install_build_dependencies():
    """Install required build tools"""
    print("Installing build dependencies...")
    
    dependencies = [
        "pyinstaller",
        "cx_freeze"
    ]
    
    for dep in dependencies:
        try:
            __import__(dep.replace('-', '_'))
            print(f"✓ {dep} already installed")
        except ImportError:
            print(f"Installing {dep}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep])

def build_executable():
    """Build standalone executable"""
    print("\n" + "="*50)
    print("BUILDING EXECUTABLE")
    print("="*50)
    
    try:
        subprocess.check_call([sys.executable, "build_exe.py"])
        return True
    except subprocess.CalledProcessError:
        print("Failed to build executable")
        return False

def build_msi_installer():
    """Build MSI installer"""
    print("\n" + "="*50)
    print("BUILDING MSI INSTALLER") 
    print("="*50)
    
    try:
        subprocess.check_call([sys.executable, "build_msi.py"])
        return True
    except subprocess.CalledProcessError:
        print("Failed to build MSI installer")
        return False

def main():
    """Main build process"""
    print("Business Documents Generator - Build Script")
    print("="*50)
    
    # Check Python version
    if sys.version_info < (3, 7):
        print("Error: Python 3.7 or higher is required")
        sys.exit(1)
    
    # Install dependencies
    install_build_dependencies()
    
    # Build executable
    exe_success = build_executable()
    
    # Build MSI
    msi_success = build_msi_installer()
    
    # Summary
    print("\n" + "="*50)
    print("BUILD SUMMARY")
    print("="*50)
    
    if exe_success:
        print("✓ Executable built successfully")
        print("  - Location: dist/BusinessDocumentsGenerator.exe")
        print("  - Portable: BusinessDocumentsGenerator_Portable/")
    else:
        print("✗ Executable build failed")
    
    if msi_success:
        print("✓ MSI installer built successfully")
        print("  - Location: dist/*.msi")
    else:
        print("✗ MSI installer build failed")
    
    print("\nBuild process completed!")

if __name__ == "__main__":
    main()
