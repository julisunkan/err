
#!/usr/bin/env python3
"""
Standalone version of Business Documents Generator
Optimized for executable packaging
"""

import os
import sys
import webbrowser
import threading
import time
from pathlib import Path

# Add current directory to path for imports
if getattr(sys, 'frozen', False):
    # Running as compiled executable
    application_path = os.path.dirname(sys.executable)
    os.chdir(application_path)
else:
    # Running as script
    application_path = os.path.dirname(os.path.abspath(__file__))

sys.path.insert(0, application_path)

def open_browser():
    """Open web browser after a delay"""
    time.sleep(2)  # Wait for server to start
    webbrowser.open('http://localhost:5000')

def create_default_database():
    """Ensure database directory exists"""
    db_dir = Path("instance")
    db_dir.mkdir(exist_ok=True)

def main():
    """Main entry point for standalone application"""
    print("="*60)
    print("    Business Documents Generator - Standalone Version")
    print("="*60)
    print()
    print("Starting application server...")
    print("URL: http://localhost:5000")
    print()
    print("The application will open automatically in your web browser.")
    print("To stop the server, press Ctrl+C or close this window.")
    print()
    print("="*60)
    
    # Ensure database exists
    create_default_database()
    
    # Start browser in separate thread
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Import and run Flask app
    try:
        from app import app
        
        # Run the Flask application
        app.run(
            host='127.0.0.1',  # localhost only for standalone
            port=5000,
            debug=False,  # Disable debug in standalone
            use_reloader=False,  # Disable reloader in standalone
            threaded=True
        )
        
    except KeyboardInterrupt:
        print("\nShutting down...")
    except Exception as e:
        print(f"Error starting application: {e}")
        print("\nPress Enter to exit...")
        input()

if __name__ == "__main__":
    main()
