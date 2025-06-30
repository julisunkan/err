# Business Documents Generator

A comprehensive Flask-based web application for generating professional business documents (invoices, quotations, purchase orders, and receipts) with PDF export capabilities and live preview.

## Features

- **Multiple Document Types**: Create invoices, quotations, purchase orders, and receipts
- **Live Preview**: Real-time preview of documents as you type
- **PDF Export**: Generate and download professional PDF documents
- **Business Settings**: Manage business profile, logo, signature, and tax rates
- **Secure Downloads**: One-time download codes for PDF access
- **Settings Import/Export**: Backup and restore business settings
- **Responsive Design**: Works on desktop and mobile devices

## Installation

### Prerequisites

- Python 3.11 or higher
- pip (Python package manager)

### Quick Installation

1. **Clone or Download the Project**
   ```bash
   git clone <repository-url>
   cd business-documents-generator
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   
   Or install packages individually:
   ```bash
   pip install flask flask-sqlalchemy gunicorn psycopg2-binary
   ```

3. **Set Environment Variables** (Optional)
   ```bash
   export SESSION_SECRET="your-secret-key-here"
   export DATABASE_URL="sqlite:///business_docs.db"
   ```

4. **Run the Application**
   ```bash
   python main.py
   ```
   
   Or using Gunicorn for production:
   ```bash
   gunicorn --bind 0.0.0.0:5000 --reload main:app
   ```

5. **Access the Application**
   Open your web browser and go to: `http://localhost:5000`

### Production Deployment

For production deployment, set these environment variables:

- `SESSION_SECRET`: A secure random string for session encryption
- `DATABASE_URL`: PostgreSQL connection string (optional, defaults to SQLite)

Example:
```bash
export SESSION_SECRET="your-very-secure-secret-key"
export DATABASE_URL="postgresql://user:password@localhost/business_docs"
```

### Replit Deployment

This project is configured to run on Replit:

1. **Import to Replit**: Use the "Import from GitHub" option
2. **Install Dependencies**: Replit will automatically install dependencies
3. **Run**: Click the "Run" button
4. **Access**: Use the provided Replit URL

## Usage

### Getting Started

1. **Configure Business Settings**:
   - Go to the "Settings" tab
   - Fill in your business information
   - Add business logo and signature URLs
   - Set tax rate and currency
   - Save settings

2. **Create a Document**:
   - Select document type (Invoice, Quotation, etc.)
   - Fill in client information
   - Add items with quantities, prices, and discounts
   - View live preview on the right side

3. **Generate Download Code**:
   - Click "Generate Download Code" in the navigation
   - Copy the generated code

4. **Download PDF**:
   - Enter the download code in the main form
   - Click "Verify & Download PDF"

### Document Types

- **Invoice**: For billing clients
- **Quotation**: For price estimates  
- **Purchase Order**: For ordering from suppliers
- **Receipt**: For payment confirmations

### Settings Management

- **Export Settings**: Download your business settings as JSON
- **Import Settings**: Upload previously exported settings
- **Business Logo**: Add logo image URL for professional appearance
- **Signature**: Add signature image URL for document authorization

## File Structure

```
business-documents-generator/
├── app.py              # Main Flask application
├── main.py             # Application entry point
├── models.py           # Database models
├── requirements.txt    # Python dependencies
├── templates/          # HTML templates
│   ├── index.html      # Main application page
│   └── code_generator.html
├── static/             # Static files
│   ├── css/
│   │   └── style.css   # Custom styles
│   └── js/
│       ├── app.js      # Main application logic
│       └── pdf-generator.js
└── README.md           # This file
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SESSION_SECRET` | Flask session secret key | Auto-generated |
| `DATABASE_URL` | Database connection string | SQLite file |

### Database

The application supports both SQLite and PostgreSQL:

- **SQLite**: Default option, no setup required
- **PostgreSQL**: Set `DATABASE_URL` environment variable

## Security Features

- **One-time Download Codes**: Secure PDF access with expiring codes
- **Session Management**: Secure user sessions
- **Preview Protection**: Live preview prevents downloads/printing
- **Input Validation**: Form data validation and sanitization

## Troubleshooting

### Common Issues

1. **Application won't start**:
   - Ensure Python 3.11+ is installed
   - Install all required dependencies
   - Check for port conflicts (default: 5000)

2. **Database errors**:
   - SQLite file permissions
   - PostgreSQL connection issues

3. **PDF generation issues**:
   - Check internet connection for external images
   - Verify image URLs are accessible

### Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the application logs
3. Ensure all dependencies are properly installed

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.