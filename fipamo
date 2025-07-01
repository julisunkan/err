
# Business Documents Generator

A comprehensive Flask-based web application for generating professional business documents (invoices, quotations, purchase orders, and receipts) with PDF export capabilities, user authentication, and administrative features.

## 🚀 Features

### Document Generation
- **Multiple Document Types**: Create invoices, quotations, purchase orders, and receipts
- **Live Preview**: Real-time preview of documents as you type
- **Professional PDF Export**: Generate high-quality PDF documents with business branding
- **Custom Templates**: Clean, professional templates optimized for business use

### User Management
- **User Authentication**: Secure registration, login, and password reset
- **Email Verification**: Account verification via email
- **Role-Based Access**: Admin and user roles with different permissions
- **User Dashboard**: Personal dashboard for managing documents and settings

### Business Settings
- **Company Profile**: Manage business information, logo, and signature
- **Tax Configuration**: Configurable tax rates and currency settings
- **Client Management**: Store and manage client information
- **Settings Import/Export**: Backup and restore business settings

### Security & Access Control
- **One-Time Download Codes**: Secure PDF access with expiring codes
- **Bulk Code Generation**: Generate multiple download codes for distribution
- **Session Management**: Secure user sessions with proper authentication
- **Admin Controls**: Administrative oversight of users and system settings

### Communication
- **In-App Messaging**: Internal messaging system between users and admins
- **Email Integration**: SMTP configuration for automated email notifications
- **Request System**: Users can request PDF codes from administrators

## 🛠️ Technology Stack

- **Backend**: Flask (Python web framework)
- **Database**: SQLite with SQLAlchemy ORM
- **Frontend**: Bootstrap 5.3.0, Font Awesome icons
- **PDF Generation**: Client-side PDF creation using jsPDF
- **Authentication**: Flask sessions with secure password hashing
- **Email**: SMTP integration for notifications

## 📦 Installation

### Replit Deployment (Recommended)

1. **Fork this project** on Replit
2. **Click the "Run" button**
3. **Access your app** via the provided Replit URL
4. **Configure settings** through the admin panel

### Local Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd business-documents-generator
   ```

2. **Install dependencies**
   ```bash
   pip install flask flask-sqlalchemy gunicorn psycopg2-binary email-validator werkzeug blinker click itsdangerous jinja2 markupsafe sqlalchemy
   ```

3. **Run the application**
   ```bash
   python main.py
   ```

4. **Access the application**
   Open your browser and go to: `http://0.0.0.0:5000`

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SESSION_SECRET` | Flask session secret key | Auto-generated |
| `DATABASE_URL` | Database connection string | SQLite file |

### First-Time Setup

1. **Admin Account**: Default admin credentials are `admin/admin123` (change immediately)
2. **Business Settings**: Configure your business information in the settings tab
3. **SMTP Configuration**: Set up email settings for notifications (admin panel)
4. **User Registration**: Enable user registration or create accounts manually

## 🎯 Usage

### For Administrators

1. **User Management**: View, edit, verify, and manage user accounts
2. **Code Generation**: Generate download codes for users or bulk distribution
3. **SMTP Configuration**: Set up email settings for automated notifications
4. **System Monitoring**: Monitor user activity and document requests

### For Users

1. **Document Creation**:
   - Select document type (Invoice, Quotation, Purchase Order, Receipt)
   - Fill in client and business information
   - Add line items with quantities, prices, and descriptions
   - Preview your document in real-time

2. **PDF Generation**:
   - Enter a valid download code
   - Verify the code to unlock PDF generation
   - Download your professional PDF document

3. **Account Management**:
   - Update business settings and branding
   - Manage client information
   - Request PDF codes from administrators
   - Send messages to administrators

## 🗂️ File Structure

```
business-documents-generator/
├── app.py                  # Main Flask application
├── main.py                 # Application entry point
├── models.py               # Database models
├── static/
│   ├── css/style.css       # Custom styles
│   ├── js/
│   │   ├── app.js          # Main application logic
│   │   ├── pdf-generator.js # PDF generation
│   │   └── pwa-utils.js    # PWA utilities
│   └── manifest.json       # PWA manifest
├── templates/
│   ├── auth/               # Authentication templates
│   ├── dashboard/          # User/admin dashboards
│   ├── messages/           # Messaging system
│   ├── index.html          # Main application page
│   └── code_generator.html # Code generation page
└── uploads/                # File uploads directory
```

## 🔒 Security Features

- **Password Security**: Secure password hashing with Werkzeug
- **One-Time Codes**: Download codes expire and can only be used once
- **Session Management**: Secure session handling with configurable secrets
- **Input Validation**: Form data validation and sanitization
- **Access Control**: Role-based permissions and route protection

## 🌐 API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User login
- `GET /logout` - User logout
- `POST /forgot-password` - Password reset request

### Document Management
- `POST /api/generate-code` - Generate download code
- `POST /api/verify-code` - Verify and use download code
- `GET /api/get-settings` - Get business settings
- `POST /api/save-settings` - Save business settings

### User Management (Admin)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/generate-code-for-user` - Generate code for specific user
- `DELETE /api/admin/delete-user/:id` - Delete user account

## 🚀 Deployment on Replit

This application is optimized for Replit deployment:

1. **Automatic Setup**: Dependencies are automatically installed
2. **Database Initialization**: SQLite database is created automatically
3. **Environment Configuration**: Secure defaults are provided
4. **Public Access**: Your app is instantly accessible via Replit's URL

## 🛠️ Customization

### Business Branding
- Upload your business logo (URL-based)
- Add digital signature for document authorization
- Customize business information and contact details
- Set currency and tax rates

### Document Templates
- Modify PDF generation logic in `static/js/pdf-generator.js`
- Customize styling in `static/css/style.css`
- Update document layouts and formatting

## 📞 Support

### Troubleshooting

**Application won't start:**
- Ensure all dependencies are installed
- Check Python version (3.11+ required)
- Verify database permissions

**PDF generation issues:**
- Check internet connection for external images
- Verify image URLs are publicly accessible
- Ensure business settings are properly configured

**Email not working:**
- Configure SMTP settings in admin panel
- Test email configuration with test email feature
- Check spam/junk folders for notifications

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📋 Changelog

- **v1.0.0**: Initial release with full feature set
- User authentication and management system
- Document generation with PDF export
- Administrative panel and user dashboard
- Messaging system and email integration
- Security features and access controls

---

**Built with ❤️ for professional business document generation**
