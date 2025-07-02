
import os
import sys
import subprocess
import uuid
from pathlib import Path

def build_msi():
    """Build MSI installer using cx_Freeze"""
    
    print("Building MSI installer...")
    
    # Install cx_Freeze if not present
    try:
        import cx_Freeze
    except ImportError:
        print("Installing cx_Freeze...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "cx_freeze"])
    
    # Create setup script for cx_Freeze
    setup_content = '''
import sys
from cx_Freeze import setup, Executable
import os

# Dependencies are automatically detected, but it might need fine tuning.
build_options = {
    "packages": [
        "flask", "flask_sqlalchemy", "werkzeug", "jinja2", "markupsafe",
        "itsdangerous", "click", "blinker", "sqlalchemy", "email_validator",
        "secrets", "string", "json", "logging", "smtplib", "datetime",
        "functools", "os", "uuid"
    ],
    "excludes": ["unittest", "test", "tests"],
    "include_files": [
        ("templates/", "templates/"),
        ("static/", "static/"),
        ("instance/", "instance/"),
    ],
    "zip_include_packages": ["*"],
    "zip_exclude_packages": []
}

# GUI applications require a different base on Windows
base = 'Console'

executables = [
    Executable(
        'standalone_main.py',
        base=base,
        target_name='BusinessDocumentsGenerator',
        icon='static/icons/icon-192.png'
    )
]

# MSI options
bdist_msi_options = {
    'upgrade_code': '{12345678-1234-5678-9012-123456789012}',
    'add_to_path': False,
    'initial_target_dir': r'[ProgramFilesFolder]\\BusinessDocumentsGenerator',
    'install_icon': 'static/icons/icon-192.png'
}

setup(
    name='Business Documents Generator',
    version='1.0.0',
    description='Professional business document generator with PDF export',
    author='Your Business Name',
    options={
        'build_exe': build_options,
        'bdist_msi': bdist_msi_options
    },
    executables=executables
)
'''
    
    # Write setup script
    with open('setup_msi.py', 'w') as f:
        f.write(setup_content)
    
    try:
        # Build MSI
        subprocess.check_call([
            sys.executable, "setup_msi.py", "bdist_msi"
        ])
        
        print("MSI installer built successfully!")
        
        # Find the MSI file
        dist_dir = Path("dist")
        msi_files = list(dist_dir.glob("*.msi"))
        
        if msi_files:
            print(f"MSI Location: {msi_files[0]}")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Error building MSI: {e}")
        return False

if __name__ == "__main__":
    build_msi()
