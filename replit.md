# Business Documents Generator

## Overview

This is a Flask-based web application for generating business documents (invoices, quotes, receipts) with PDF export functionality. The application provides a user-friendly interface for creating professional business documents with customizable business settings, item management, and secure download code generation.

## System Architecture

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Database**: SQLite (with SQLAlchemy ORM)
- **Session Management**: Flask sessions with configurable secret key
- **Proxy Support**: ProxyFix middleware for deployment behind proxies

### Frontend Architecture
- **UI Framework**: Bootstrap 5.3.0 for responsive design
- **Icons**: Font Awesome 6.4.0 for iconography
- **PDF Generation**: Client-side PDF generation using jsPDF library
- **JavaScript**: Vanilla ES6+ classes for application logic

### Database Schema
The application uses two main models:
- **DownloadCode**: Manages one-time download codes with expiration
- **BusinessSettings**: Stores customizable business information and preferences

## Key Components

### Core Application (`app.py`)
- Flask application initialization and configuration
- Database setup with SQLAlchemy
- Route definitions for main pages
- Environment-based configuration for production deployment

### Data Models (`models.py`)
- **DownloadCode Model**: Tracks download codes with usage status and expiration
- **BusinessSettings Model**: Stores business profile information including logo, signature, tax rates

### Frontend Components
- **Document Generator Interface**: Tab-based UI for creating documents and managing settings
- **Code Generator**: Separate interface for generating secure download codes
- **PDF Generator**: Client-side PDF creation with business branding

### Static Assets
- **CSS**: Custom styling with CSS variables for theming
- **JavaScript**: Modular architecture with separate files for app logic and PDF generation

## Data Flow

1. **Document Creation**: User inputs document details through the web interface
2. **Settings Management**: Business settings are stored in the database and retrieved for document generation
3. **PDF Generation**: Client-side JavaScript creates PDFs using business settings and document data
4. **Download Security**: One-time codes are generated and validated for secure document access

## External Dependencies

### Python Packages
- Flask: Web framework
- Flask-SQLAlchemy: Database ORM
- Werkzeug: WSGI utilities

### Frontend Libraries
- Bootstrap 5.3.0: UI framework (CDN)
- Font Awesome 6.4.0: Icons (CDN)
- jsPDF: Client-side PDF generation

### Environment Variables
- `SESSION_SECRET`: Flask session secret key
- `DATABASE_URL`: Database connection string (defaults to SQLite)

## Deployment Strategy

The application is configured for flexible deployment:
- **Development**: Uses SQLite database and built-in Flask server
- **Production**: Supports PostgreSQL via DATABASE_URL environment variable
- **Proxy Support**: ProxyFix middleware for deployment behind load balancers
- **Database Connection**: Pool management with connection recycling

## Installation Methods

### Method 1: Replit (Recommended)
- Fork this project on Replit
- Click "Run" button
- Access via provided Replit URL
- No additional setup required

### Method 2: Local Installation
1. Download project files
2. Install dependencies: `pip install flask flask-sqlalchemy gunicorn`
3. Run: `python main.py`
4. Access: `http://localhost:5000`

### Method 3: Production Deployment
- Set environment variables: `SESSION_SECRET`, `DATABASE_URL`
- Use Gunicorn: `gunicorn --bind 0.0.0.0:5000 main:app`
- Configure reverse proxy if needed

## Required Dependencies
- Python 3.11+
- Flask 3.1.0
- Flask-SQLAlchemy 3.1.1
- Gunicorn 23.0.0
- psycopg2-binary (for PostgreSQL support)

## First-Time Setup
1. Configure business settings (name, address, phone, email)
2. Set tax rate and currency preferences
3. Add business logo and signature URLs (optional)
4. Test document generation with sample data

## Changelog

- June 28, 2025: Initial setup with full feature implementation
- June 28, 2025: Added live preview column with real-time updates
- June 28, 2025: Created comprehensive installation documentation

## User Preferences

Preferred communication style: Simple, everyday language.