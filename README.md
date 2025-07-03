
# Business Documents Generator

A powerful Flask web application for generating professional business documents including invoices, quotations, receipts, and custom documents with PDF generation capabilities.

## 🚀 Features

### Document Generation
- **Invoices**: Professional invoice generation with itemized billing
- **Quotations**: Detailed quotations with terms and conditions
- **Receipts**: Simple receipt generation for transactions
- **Custom Documents**: Flexible document creation with templates
- **PDF Export**: High-quality PDF generation with company branding

### Business Management
- **Client Management**: Store and manage client information
- **Business Settings**: Configure company details, logo, and branding
- **User Authentication**: Secure login and registration system
- **Admin Dashboard**: Administrative controls and user management
- **File Upload**: Support for document attachments and company logos

### Technical Features
- **Progressive Web App (PWA)**: Install and use offline
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Database Management**: SQLite for local storage, PostgreSQL for production
- **Download Codes**: Secure document sharing system
- **Backup System**: Automated database and file backups

## 📋 Requirements

- Python 3.11+
- Flask 3.1.1
- SQLAlchemy
- jsPDF for client-side PDF generation
- Modern web browser

## 🛠️ Installation

### Quick Start (Replit)
1. Fork this repl
2. Click the "Run" button
3. Access the application at the provided URL

### Local Installation

#### Prerequisites
```bash
# Ensure Python 3.11+ is installed
python --version

# Install required packages
pip install flask flask-sqlalchemy gunicorn psycopg2-binary email-validator
```

#### Setup
1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd business-documents-generator
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python main.py
   ```

4. **Access the application**:
   Open your browser to `http://localhost:5000`

## 🖥️ Desktop Shortcut Setup

For easy access, you can create a desktop shortcut that automatically starts the web application and opens it in your browser.

### Windows Users

#### Method 1: Using Batch File
1. **Create Desktop Shortcut**:
   - Right-click on desktop → "New" → "Shortcut"
   - Browse to your project folder and select `run_webapp.bat`
   - Name it "Business Documents Generator"
   - Click "Finish"

2. **Customize Icon** (Optional):
   - Right-click shortcut → "Properties"
   - Click "Change Icon"
   - Browse to `static/icons/icon-192.png` or use system icon

#### Method 2: Using PowerShell Script
1. **Create Shortcut**:
   - Right-click on desktop → "New" → "Shortcut"
   - Enter target: `powershell.exe -ExecutionPolicy Bypass -File "C:\path\to\your\project\run_webapp.ps1"`
   - Replace with your actual project path
   - Name and finish

### What Happens When You Click the Shortcut:
1. ✅ Starts Flask server on localhost:5000
2. ✅ Waits 3 seconds for server initialization
3. ✅ Opens your default browser automatically
4. ✅ Shows server status in console window
5. ✅ Keeps running until you close the window

## 🌐 Deployment

### Replit Deployment (Recommended)
1. **Configure for Production**:
   - Set environment variables in Replit Secrets
   - Update database settings for PostgreSQL
   - Configure domain and SSL

2. **Deploy**:
   - Use Replit's deployment feature
   - Application will be accessible via your Replit domain

### Manual Deployment
```bash
# For production deployment
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📁 Project Structure

```
business-documents-generator/
├── static/
│   ├── css/
│   │   └── style.css              # Application styles
│   ├── icons/
│   │   ├── icon-192.png           # PWA icons
│   │   └── icon-512.png
│   ├── js/
│   │   ├── app.js                 # Main application logic
│   │   ├── pdf-generator.js       # PDF generation functionality
│   │   ├── pwa-utils.js          # PWA utilities
│   │   └── NotoSans.js           # Font files for PDF
│   ├── manifest.json              # PWA manifest
│   └── sw.js                      # Service worker
├── templates/
│   ├── auth/
│   │   ├── login.html            # Login page
│   │   ├── register.html         # Registration page
│   │   ├── forgot_password.html  # Password recovery
│   │   └── reset_password.html   # Password reset
│   ├── dashboard/
│   │   ├── admin_dashboard.html  # Admin interface
│   │   └── user_dashboard.html   # User interface
│   ├── index.html                # Main application page
│   ├── profile.html              # User profile
│   └── code_generator.html       # Download code generator
├── instance/
│   └── business_docs.db          # SQLite database
├── uploads/                      # File uploads storage
├── backups/                      # Automated backups
├── app.py                        # Flask application
├── main.py                       # Application entry point
├── models.py                     # Database models
├── standalone_main.py            # Standalone version
├── run_webapp.bat               # Windows batch launcher
├── run_webapp.ps1               # PowerShell launcher
└── pyproject.toml               # Python dependencies
```

## 🔧 Configuration

### Business Settings
Configure your business information in the application:
- Company name and contact details
- Logo upload and branding
- Currency settings
- Tax rates
- Email templates

### Environment Variables
For production deployment, set these environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Flask secret key
- `FLASK_ENV`: Set to 'production'

## 👥 User Management

### Default Admin Account
- **Username**: admin
- **Password**: admin123
- **Note**: Change default credentials immediately after first login

### User Roles
- **Admin**: Full system access, user management
- **User**: Document creation and management
- **Guest**: Limited read-only access

## 📄 Document Types

### Invoice
- Client information and billing details
- Itemized products/services with pricing
- Tax calculations and totals
- Payment terms and due dates
- Company branding and signature

### Quotation
- Detailed service/product descriptions
- Pricing tiers and options
- Validity periods
- Terms and conditions
- Professional formatting

### Receipt
- Transaction details and amounts
- Payment method confirmation
- Customer information
- Reference numbers
- Company details

### Custom Documents
- Flexible template system
- Custom fields and layouts
- Dynamic content generation
- Multiple format options

## 🔒 Security Features

### Authentication
- Secure user registration and login
- Password hashing with bcrypt
- Session management
- Password recovery system

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- File upload restrictions
- Secure file storage

### Access Control
- Role-based permissions
- Document ownership verification
- Admin-only functions
- Secure API endpoints

## 📱 Progressive Web App (PWA)

### Installation
1. Open the application in your browser
2. Look for "Install" prompt or menu option
3. Follow browser-specific installation steps
4. Access from desktop/home screen

### Offline Capabilities
- Cached application files
- Offline document viewing
- Service worker for background sync
- Responsive design for all devices

## 🌐 Network Access and Sharing

### Local Network Access
Your Flask application is configured to be accessible from other devices on your network:

#### Configuration
- **Host**: `0.0.0.0` (listens on all network interfaces)
- **Port**: `5000` (accessible via http://YOUR_IP:5000)
- **Network Scope**: Local network devices can access the application

#### How Others Can Access
1. **Find your computer's IP address**:
   ```bash
   # Windows
   ipconfig
   
   # Look for your local IP (usually 192.168.x.x or 10.x.x.x)
   ```

2. **Share with others on your network**:
   - Others can access via: `http://YOUR_IP_ADDRESS:5000`
   - Example: `http://192.168.1.100:5000`

#### Replit Network Access
- **Public Access**: Your Replit app is accessible from anywhere on the internet
- **Automatic URLs**: Replit provides public URLs for easy sharing
- **No Configuration**: Network access is handled automatically

#### Security Considerations
- **Local Network**: Only devices on your WiFi/network can access locally
- **Firewall**: Windows firewall may prompt for network permissions
- **Replit**: Secure public access with built-in protections

### Access Methods Summary
| Method | Access Scope | Configuration Required |
|--------|-------------|----------------------|
| Localhost | Same computer only | None |
| Local Network | Same WiFi/network | Allow firewall access |
| Replit Public | Global internet | None (automatic) |

## 🔄 Backup and Recovery

### Automated Backups
- Database backups created automatically
- File uploads backed up regularly
- Backup files stored in `/backups/` directory
- Timestamped backup files

### Manual Backup
```bash
# Backup database
cp instance/business_docs.db backups/manual_backup_$(date +%Y%m%d).db

# Backup uploads
cp -r uploads/ backups/uploads_backup_$(date +%Y%m%d)/
```

## 🐛 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check Python version
python --version

# Reinstall dependencies
pip install -r requirements.txt

# Check for port conflicts
netstat -an | grep 5000
```

#### Database Issues
```bash
# Reset database
rm instance/business_docs.db
python main.py  # Will recreate database
```

#### PDF Generation Problems
- Ensure jsPDF library is loaded
- Check browser console for JavaScript errors
- Verify font files in `/static/js/`

### Desktop Shortcut Issues

#### Batch File Won't Run
- Ensure Python is in system PATH
- Check file paths in batch script
- Run as administrator if needed

#### PowerShell Execution Policy
```powershell
# Allow PowerShell scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🚀 Performance Optimization

### Production Settings
- Disable debug mode
- Use production WSGI server (Gunicorn)
- Configure proper database connections
- Enable gzip compression
- Set up proper caching headers

### Database Optimization
- Regular database maintenance
- Index optimization for large datasets
- Connection pooling for high traffic
- Regular backup and cleanup

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- Follow PEP 8 for Python code
- Use meaningful variable names
- Add comments for complex logic
- Include error handling
- Write tests for new features

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🆘 Support

### Getting Help
- Check troubleshooting section
- Review console logs for errors
- Test with default configuration
- Verify all dependencies are installed

### Reporting Issues
When reporting issues, include:
- Operating system and version
- Python version
- Error messages and logs
- Steps to reproduce
- Expected vs actual behavior

## 🔄 Updates and Maintenance

### Updating the Application
1. Backup your data and configuration
2. Download latest version
3. Install new dependencies
4. Test functionality
5. Deploy updated version

### Version History
- v1.0.0: Initial release with core functionality
- v1.1.0: Added PWA support and offline capabilities
- v1.2.0: Desktop shortcut and standalone features
- v1.3.0: Enhanced PDF generation and templates

---

## Quick Start Commands

```bash
# Install dependencies
pip install flask flask-sqlalchemy gunicorn psycopg2-binary email-validator

# Run application
python main.py

# Access application
# Open browser to http://localhost:5000

# Create desktop shortcut (Windows)
# Double-click run_webapp.bat or run_webapp.ps1
```

**Ready to generate professional business documents!** 🎉
