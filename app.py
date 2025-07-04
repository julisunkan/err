import os
import json
import logging
import secrets
import string

from datetime import datetime, timedelta
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.utils import secure_filename
from functools import wraps

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///business_docs.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Import models and initialize database
from models import db, User, UserPDFCode, PDFRequest, Message, DownloadCode, BusinessSettings, UserBusinessSettings, ClientSettings, ActivityLog, GeneratedDocument, SystemSettings

# Initialize the app with the extension
db.init_app(app)

with app.app_context():
    db.create_all()

    # Create default admin user if none exists
    admin = User.query.filter_by(is_admin=True).first()
    if not admin:
        admin = User(
            username='admin',
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            is_admin=True,
            is_verified=True
        )
        admin.set_password('admin123')  # Change this password!
        db.session.add(admin)
        db.session.commit()
        logging.info("Default admin user created: admin/admin123")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'error')
            return redirect(url_for('login'))

        user = User.query.get(session['user_id'])
        if not user or not user.is_admin:
            flash('Admin access required.', 'error')
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    return decorated_function

def log_activity(user_id, activity_type, description, ip_address=None, user_agent=None):
    """Log user activity"""
    try:
        activity = ActivityLog(
            user_id=user_id,
            activity_type=activity_type,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.session.add(activity)
        db.session.commit()
    except Exception as e:
        logging.error(f"Failed to log activity: {str(e)}")

def send_email(to_email, subject, body, is_html=False):
    """Email functionality disabled - SMTP settings removed"""
    logging.info(f"Email sending disabled - would have sent to {to_email}: {subject}")
    return True

@app.route('/')
def index():
    """Main application page with document generator"""
    try:
        return render_template('index.html')
    except Exception as e:
        logging.error(f"Error in index route: {str(e)}")
        return f"<h1>Error loading page</h1><p>{str(e)}</p><p>Please check the console for more details.</p>", 500

@app.route('/test')
def test():
    """Simple test route"""
    return "<h1>Flask App is Working!</h1><p>If you can see this, the app is running correctly.</p>"

@app.route('/debug-admin')
def debug_admin():
    """Debug route to check admin user"""
    try:
        admin = User.query.filter_by(is_admin=True).first()
        if admin:
            return f"<h1>Admin User Found</h1><p>Username: {admin.username}</p><p>Email: {admin.email}</p><p>Is Verified: {admin.is_verified}</p>"
        else:
            return "<h1>No Admin User Found</h1>"
    except Exception as e:
        return f"<h1>Database Error</h1><p>{str(e)}</p>"

@app.route('/api/admin/register-user', methods=['POST'])
@admin_required
def admin_register_user():
    """Admin-only user registration"""
    try:
        data = request.get_json()

        # Validate input
        required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'error': f'{field} is required'}), 400

        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'success': False, 'error': 'Username already exists'}), 400

        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'error': 'Email already exists'}), 400

        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            is_verified=True,  # Auto-verify users created by admin
            is_admin=data.get('is_admin', False)  # Allow admin to create other admins
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        # Log registration activity
        admin_user = User.query.get(session['user_id'])
        log_activity(session['user_id'], 'admin_user_creation', f"Admin {admin_user.username} created user {user.username}", request.remote_addr, request.user_agent.string)

        return jsonify({
            'success': True, 
            'message': 'User created successfully!',
            'user_id': user.id
        })

    except Exception as e:
        logging.error(f"Error creating user: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to create user'}), 500

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if request.method == 'POST':
        try:
            data = request.get_json()
            if not data:
                return jsonify({'success': False, 'error': 'No data provided'}), 400

            username = data.get('username', '').strip()
            password = data.get('password', '')

            if not username or not password:
                return jsonify({'success': False, 'error': 'Username and password required'}), 400

            user = User.query.filter_by(username=username).first()

            if user and user.check_password(password):
                # Users can login without email verification (requirement #2)
                session['user_id'] = user.id
                session['username'] = user.username
                session['is_admin'] = user.is_admin

                user.last_login = datetime.utcnow()
                db.session.commit()

                # Log login activity
                log_activity(user.id, 'login', f"User {user.username} logged in", request.remote_addr, request.user_agent.string)

                return jsonify({'success': True, 'redirect': url_for('dashboard')})
            else:
                return jsonify({'success': False, 'error': 'Invalid username or password'}), 400

        except Exception as e:
            logging.error(f"Login error: {str(e)}")
            return jsonify({'success': False, 'error': 'Login failed. Please try again.'}), 500

    return render_template('auth/login.html')

@app.route('/logout')
def logout():
    """User logout"""
    user_id = session.get('user_id')
    username = session.get('username')

    if user_id:
        log_activity(user_id, 'logout', f"User {username} logged out", request.remote_addr, request.user_agent.string)

    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

# Email verification and forgot password routes removed

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """User profile management"""
    user = User.query.get(session['user_id'])

    if request.method == 'POST':
        data = request.get_json()

        # Check if username or email already exists (excluding current user)
        existing_username = User.query.filter(User.username == data.get('username'), User.id != user.id).first()
        if existing_username:
            return jsonify({'success': False, 'error': 'Username already exists'}), 400

        existing_email = User.query.filter(User.email == data.get('email'), User.id != user.id).first()
        if existing_email:
            return jsonify({'success': False, 'error': 'Email already exists'}), 400

        # Update user details
        old_username = user.username
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)

        # Update password if provided
        if data.get('password'):
            user.set_password(data['password'])

        db.session.commit()

        # Log profile edit activity
        log_activity(user.id, 'profile_edit', f"User {old_username} updated profile details", request.remote_addr, request.user_agent.string)

        # Update session if username changed
        session['username'] = user.username

        return jsonify({'success': True, 'message': 'Profile updated successfully'})

    return render_template('profile.html', user=user)

@app.route('/dashboard')
@login_required
def dashboard():
    """User dashboard"""
    user = User.query.get(session['user_id'])

    if user.is_admin:
        return redirect(url_for('admin_dashboard'))

    # Get user's PDF codes
    pdf_codes = UserPDFCode.query.filter_by(user_id=user.id).order_by(UserPDFCode.uploaded_at.desc()).all()

    # Get user's PDF requests
    pdf_requests = PDFRequest.query.filter_by(user_id=user.id).order_by(PDFRequest.created_at.desc()).all()

    # Get unread messages
    unread_messages = Message.query.filter_by(recipient_id=user.id, is_read=False).count()

    return render_template('dashboard/user_dashboard.html', 
                         user=user, 
                         pdf_codes=pdf_codes, 
                         pdf_requests=pdf_requests,
                         unread_messages=unread_messages)

@app.route('/admin')
@admin_required
def admin_dashboard():
    """Admin dashboard"""
    # Show all users except the current admin user
    current_admin_id = session['user_id']
    users = User.query.filter(User.id != current_admin_id).order_by(User.created_at.desc()).all()
    pending_requests = PDFRequest.query.filter_by(status='pending').order_by(PDFRequest.created_at.desc()).all()
    recent_uploads = UserPDFCode.query.order_by(UserPDFCode.uploaded_at.desc()).limit(10).all()

    return render_template('dashboard/admin_dashboard.html', 
                         users=users, 
                         pending_requests=pending_requests,
                         recent_uploads=recent_uploads)

@app.route('/api/request-pdf', methods=['POST'])
@login_required
def request_pdf():
    """User requests PDF code"""
    try:
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')

        if not title or not description:
            return jsonify({'success': False, 'error': 'Title and description are required'}), 400

        pdf_request = PDFRequest(
            user_id=session['user_id'],
            title=title,
            description=description
        )

        db.session.add(pdf_request)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Request submitted successfully!'})

    except Exception as e:
        logging.error(f"Error creating PDF request: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to submit request'}), 500

@app.route('/api/upload-pdf/<int:user_id>', methods=['POST'])
@admin_required
def upload_pdf_for_user(user_id):
    """Admin uploads PDF for user"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400

        file = request.files['file']
        description = request.form.get('description', '')

        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to prevent filename conflicts
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            filename = timestamp + filename

            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            user_pdf = UserPDFCode(
                user_id=user_id,
                filename=filename,
                original_filename=file.filename,
                file_path=file_path,
                description=description,
                uploaded_by_admin_id=session['user_id']
            )

            db.session.add(user_pdf)
            db.session.commit()

            return jsonify({'success': True, 'message': 'File uploaded successfully!'})
        else:
            return jsonify({'success': False, 'error': 'Invalid file type'}), 400

    except Exception as e:
        logging.error(f"Error uploading file: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to upload file'}), 500

@app.route('/api/respond-request/<int:request_id>', methods=['POST'])
@admin_required
def respond_to_request(request_id):
    """Admin responds to PDF request"""
    try:
        data = request.get_json()
        status = data.get('status')
        response = data.get('response', '')

        if status not in ['approved', 'rejected']:
            return jsonify({'success': False, 'error': 'Invalid status'}), 400

        pdf_request = PDFRequest.query.get(request_id)
        if not pdf_request:
            return jsonify({'success': False, 'error': 'Request not found'}), 404

        pdf_request.status = status
        pdf_request.admin_response = response
        pdf_request.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({'success': True, 'message': 'Response sent successfully!'})

    except Exception as e:
        logging.error(f"Error responding to request: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to respond to request'}), 500

@app.route('/download/<int:file_id>')
@login_required
def download_file(file_id):
    """Download user file"""
    user_pdf = UserPDFCode.query.get(file_id)

    if not user_pdf:
        flash('File not found.', 'error')
        return redirect(url_for('dashboard'))

    # Check if user owns this file or is admin
    if user_pdf.user_id != session['user_id'] and not session.get('is_admin'):
        flash('Access denied.', 'error')
        return redirect(url_for('dashboard'))

    # Update download stats
    user_pdf.download_count += 1
    user_pdf.downloaded_at = datetime.utcnow()
    db.session.commit()

    return send_from_directory(app.config['UPLOAD_FOLDER'], user_pdf.filename, 
                             as_attachment=True, download_name=user_pdf.original_filename)

@app.route('/messages')
@login_required
def messages():
    """Messages page"""
    user = User.query.get(session['user_id'])

    # Get all messages for this user
    sent_messages = Message.query.filter_by(sender_id=user.id).order_by(Message.created_at.desc()).all()
    received_messages = Message.query.filter_by(recipient_id=user.id).order_by(Message.created_at.desc()).all()

    return render_template('messages/messages.html', 
                         user=user,
                         sent_messages=sent_messages,
                         received_messages=received_messages)

@app.route('/api/send-message', methods=['POST'])
@login_required
def send_message():
    """Send message"""
    try:
        data = request.get_json()
        recipient_id = data.get('recipient_id')
        subject = data.get('subject')
        content = data.get('content')
        parent_message_id = data.get('parent_message_id')

        if not recipient_id or not subject or not content:
            return jsonify({'success': False, 'error': 'All fields are required'}), 400

        # Validate recipient
        recipient = User.query.get(recipient_id)
        if not recipient:
            return jsonify({'success': False, 'error': 'Recipient not found'}), 404

        # Check if user can message this recipient (users can only message admins)
        sender = User.query.get(session['user_id'])
        if not sender.is_admin and not recipient.is_admin:
            return jsonify({'success': False, 'error': 'Users can only message administrators'}), 403

        message = Message(
            sender_id=session['user_id'],
            recipient_id=recipient_id,
            subject=subject,
            content=content,
            parent_message_id=parent_message_id
        )

        db.session.add(message)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Message sent successfully!'})

    except Exception as e:
        logging.error(f"Error sending message: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to send message'}), 500

@app.route('/api/mark-read/<int:message_id>', methods=['POST'])
@login_required
def mark_message_read(message_id):
    """Mark message as read"""
    try:
        message = Message.query.get(message_id)

        if not message or message.recipient_id != session['user_id']:
            return jsonify({'success': False, 'error': 'Message not found'}), 404

        message.is_read = True
        db.session.commit()

        return jsonify({'success': True})

    except Exception as e:
        logging.error(f"Error marking message as read: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to mark message as read'}), 500

@app.route('/api/get-message/<int:message_id>')
@login_required
def get_message_content(message_id):
    """Get message content"""
    try:
        message = Message.query.get(message_id)

        if not message:
            return jsonify({'success': False, 'error': 'Message not found'}), 404

        # Check if user can view this message
        if message.recipient_id != session['user_id'] and message.sender_id != session['user_id']:
            return jsonify({'success': False, 'error': 'Access denied'}), 403

        return jsonify({
            'success': True,
            'content': message.content,
            'subject': message.subject,
            'sender': f"{message.sender.first_name} {message.sender.last_name}",
            'created_at': message.created_at.strftime('%Y-%m-%d %H:%M')
        })

    except Exception as e:
        logging.error(f"Error getting message content: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to get message content'}), 500

@app.route('/api/get-admins')
@login_required
def get_admins():
    """Get list of admin users for messaging"""
    admins = User.query.filter_by(is_admin=True).all()
    admin_list = [{'id': admin.id, 'name': f"{admin.first_name} {admin.last_name}", 'username': admin.username} for admin in admins]

    return jsonify({'success': True, 'admins': admin_list})

# Original routes for document generation
@app.route('/code-generator')
@admin_required
def code_generator():
    """Page for generating download codes"""
    return render_template('code_generator.html')

@app.route('/api/generate-code', methods=['POST'])
@admin_required
def generate_code():
    """Generate a one-time download code for a user"""
    try:
        # Handle both JSON and form data
        try:
            if request.content_type and 'application/json' in request.content_type:
                data = request.get_json() or {}
            else:
                data = request.form.to_dict()
        except Exception:
            data = {}

        user_id = data.get('user_id')
        document_data = data.get('document_data')

        if not user_id:
            return jsonify({'success': False, 'error': 'User ID is required'}), 400

        # Verify user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        # Generate a random 8-character code
        code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))

        # Store the code in database with expiration (24 hours)
        expiry = datetime.utcnow() + timedelta(hours=24)
        download_code = DownloadCode(
            code=code, 
            user_id=user_id,
            document_data=json.dumps(document_data) if document_data else None,
            expires_at=expiry
        )
        db.session.add(download_code)
        db.session.commit()

        return jsonify({
            'success': True,
            'code': code,
            'expires_at': expiry.isoformat(),
            'user': f"{user.first_name} {user.last_name}"
        })
    except Exception as e:
        logging.error(f"Error generating code: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to generate code'}), 500

@app.route('/api/generate-bulk-codes', methods=['POST'])
def generate_bulk_codes():
    """Generate multiple one-time download codes"""
    try:
        data = request.get_json()
        quantity = data.get('quantity', 1)

        # Validate quantity
        if quantity < 1 or quantity > 100:
            return jsonify({'success': False, 'error': 'Quantity must be between 1 and 100'}), 400

        # Generate codes
        codes = []
        expiry = datetime.utcnow() + timedelta(days=365)  # 1 year expiry

        for _ in range(quantity):
            code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
            download_code = DownloadCode(code=code, expires_at=expiry)
            db.session.add(download_code)
            codes.append({
                'code': code,
                'expires_at': expiry.isoformat()
            })

        db.session.commit()

        return jsonify({
            'success': True,
            'codes': codes,
            'expires_at': expiry.isoformat()
        })
    except Exception as e:
        logging.error(f"Error generating bulk codes: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to generate codes'}), 500

@app.route('/api/verify-code', methods=['POST'])
def verify_code():
    """Verify and consume a download code"""
    try:
        data = request.get_json()
        code = data.get('code', '').upper()

        if not code:
            return jsonify({'success': False, 'error': 'Code is required'}), 400

        # Find the code in database
        download_code = DownloadCode.query.filter_by(code=code, used=False).first()

        if not download_code:
            return jsonify({'success': False, 'error': 'Invalid or already used code'}), 400

        # Check if code has expired
        if download_code.expires_at < datetime.utcnow():
            return jsonify({'success': False, 'error': 'Code has expired'}), 400

        # Prepare response data
        response_data = {
            'success': True,
            'message': 'Code verified successfully',
            'business_settings': {}
        }

        # Get user's business settings if user is associated with code
        if download_code.user_id:
            user = download_code.user
            user_settings = UserBusinessSettings.query.filter_by(user_id=user.id).first()

            response_data['user_info'] = {
                'name': f"{user.first_name} {user.last_name}",
                'email': user.email
            }

            # Add business settings if available
            if user_settings:
                response_data['business_settings'] = {
                    'businessName': user_settings.business_name or '',
                    'businessAddress': user_settings.business_address or '',
                    'businessPhone': user_settings.business_phone or '',
                    'businessEmail': user_settings.business_email or '',
                    'businessLogoUrl': user_settings.business_logo_url or '',
                    'signatureUrl': user_settings.signature_url or '',
                    'taxRate': user_settings.tax_rate or 0,
                    'currency': user_settings.currency or 'USD'
                }
            else:
                # Create empty settings for user if none exist
                response_data['business_settings'] = {
                    'businessName': '',
                    'businessAddress': '',
                    'businessPhone': '',
                    'businessEmail': '',
                    'businessLogoUrl': '',
                    'signatureUrl': '',
                    'taxRate': 0,
                    'currency': 'USD'
                }
        else:
            # For bulk codes without specific user, use default settings
            default_settings = BusinessSettings.query.first()
            if default_settings:
                response_data['business_settings'] = {
                    'businessName': default_settings.business_name or '',
                    'businessAddress': default_settings.business_address or '',
                    'businessPhone': default_settings.business_phone or '',
                    'businessEmail': default_settings.business_email or '',
                    'businessLogoUrl': default_settings.business_logo_url or '',
                    'signatureUrl': default_settings.signature_url or '',
                    'taxRate': default_settings.tax_rate or 0,
                    'currency': default_settings.currency or 'USD'
                }
            else:
                # Default empty settings
                response_data['business_settings'] = {
                    'businessName': '',
                    'businessAddress': '',
                    'businessPhone': '',
                    'businessEmail': '',
                    'businessLogoUrl': '',
                    'signatureUrl': '',
                    'taxRate': 0,
                    'currency': 'USD'
                }

        # Add document data if available
        if download_code.document_data:
            response_data['document_data'] = json.loads(download_code.document_data)

        # Mark code as used
        download_code.used = True
        download_code.used_at = datetime.utcnow()
        db.session.commit()

        return jsonify(response_data)

    except Exception as e:
        logging.error(f"Error verifying code: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to verify code'}), 500

@app.route('/api/admin/save-business-settings', methods=['POST'])
@admin_required
def save_business_settings():
    """Save global business settings (Admin only)"""
    try:
        data = request.get_json()

        # Get or create global business settings record
        business_settings = BusinessSettings.query.first()
        if not business_settings:
            business_settings = BusinessSettings()
            db.session.add(business_settings)

        # Update settings with proper handling of empty values
        business_settings.business_name = data.get('businessName', '').strip()
        business_settings.business_address = data.get('businessAddress', '').strip()
        business_settings.business_phone = data.get('businessPhone', '').strip()
        business_settings.business_email = data.get('businessEmail', '').strip()
        business_settings.business_logo_url = data.get('businessLogoUrl', '').strip()
        business_settings.signature_url = data.get('signatureUrl', '').strip()
        business_settings.tax_rate = float(data.get('taxRate', 0))
        business_settings.currency = data.get('currency', 'USD').strip()
        business_settings.updated_at = datetime.utcnow()

        db.session.commit()

        logging.info(f"Business settings saved by admin {session['user_id']}: {business_settings.business_name}")

        # Log admin activity
        log_activity(session['user_id'], 'business_settings_update', f"Admin updated business settings", request.remote_addr, request.user_agent.string)

        return jsonify({'success': True, 'message': 'Business settings saved successfully'})

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error saving business settings: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to save business settings'}), 500

@app.route('/api/get-public-settings')
def get_public_settings():
    """Get default business settings for public use"""
    try:
        # Get default global settings
        settings = BusinessSettings.query.first()
        if settings:
            return jsonify({
                'success': True,
                'settings': {
                    'businessName': settings.business_name or '',
                    'businessAddress': settings.business_address or '',
                    'businessPhone': settings.business_phone or '',
                    'businessEmail': settings.business_email or '',
                    'businessLogoUrl': settings.business_logo_url or '',
                    'signatureUrl': settings.signature_url or '',
                    'taxRate': settings.tax_rate or 0,
                    'currency': settings.currency or 'USD'
                }
            })

        # Default empty settings
        return jsonify({
            'success': True,
            'settings': {
                'businessName': '',
                'businessAddress': '',
                'businessPhone': '',
                'businessEmail': '',
                'businessLogoUrl': '',
                'signatureUrl': '',
                'taxRate': 0,
                'currency': 'USD'
            }
        })

    except Exception as e:
        logging.error(f"Error getting public settings: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to get settings'}), 500

@app.route('/api/admin/get-business-settings')
@admin_required
def get_business_settings():
    """Get business settings for admin to edit"""
    try:
        settings = BusinessSettings.query.first()
        if settings:
            return jsonify({
                'success': True,
                'settings': {
                    'businessName': settings.business_name or '',
                    'businessAddress': settings.business_address or '',
                    'businessPhone': settings.business_phone or '',
                    'businessEmail': settings.business_email or '',
                    'businessLogoUrl': settings.business_logo_url or '',
                    'signatureUrl': settings.signature_url or '',
                    'taxRate': settings.tax_rate or 0,
                    'currency': settings.currency or 'USD'
                }
            })

        # Default empty settings for new setup
        return jsonify({
            'success': True,
            'settings': {
                'businessName': '',
                'businessAddress': '',
                'businessPhone': '',
                'businessEmail': '',
                'businessLogoUrl': '',
                'signatureUrl': '',
                'taxRate': 0,
                'currency': 'USD'
            }
        })

    except Exception as e:
        logging.error(f"Error getting business settings: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to get business settings'}), 500

@app.route('/api/admin/export-business-settings')
@admin_required
def export_business_settings():
    """Export business settings as JSON (Admin only)"""
    try:
        settings = BusinessSettings.query.first()
        if not settings:
            return jsonify({'success': False, 'error': 'No business settings found'}), 404

        settings_data = {
            'businessName': settings.business_name,
            'businessAddress': settings.business_address,
            'businessPhone': settings.business_phone,
            'businessEmail': settings.business_email,
            'businessLogoUrl': settings.business_logo_url,
            'signatureUrl': settings.signature_url,
            'taxRate': settings.tax_rate,
            'currency': settings.currency,
            'exportDate': datetime.utcnow().isoformat(),
            'exportedBy': f"{session['user_id']}",
            'version': '1.0'
        }

        # Log admin activity
        log_activity(session['user_id'], 'business_settings_export', f"Admin exported business settings", request.remote_addr, request.user_agent.string)

        return jsonify({
            'success': True,
            'data': settings_data,
            'filename': f'business_settings_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        })

    except Exception as e:
        logging.error(f"Error exporting business settings: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to export business settings'}), 500

@app.route('/api/admin/import-business-settings', methods=['POST'])
@admin_required
def import_business_settings():
    """Import business settings from JSON (Admin only)"""
    try:
        data = request.get_json()
        settings_data = data.get('settings', {})

        # Validate required fields
        required_fields = ['businessName', 'businessEmail', 'businessAddress', 'businessPhone']
        for field in required_fields:
            if not settings_data.get(field, '').strip():
                return jsonify({'success': False, 'error': f'{field} is required'}), 400

        # Get or create global business settings record
        business_settings = BusinessSettings.query.first()
        if not business_settings:
            business_settings = BusinessSettings()
            db.session.add(business_settings)

        # Update settings with imported data
        business_settings.business_name = settings_data.get('businessName', '').strip()
        business_settings.business_address = settings_data.get('businessAddress', '').strip()
        business_settings.business_phone = settings_data.get('businessPhone', '').strip()
        business_settings.business_email = settings_data.get('businessEmail', '').strip()
        business_settings.business_logo_url = settings_data.get('businessLogoUrl', '').strip()
        business_settings.signature_url = settings_data.get('signatureUrl', '').strip()
        business_settings.tax_rate = float(settings_data.get('taxRate', 0))
        business_settings.currency = settings_data.get('currency', 'USD').strip()
        business_settings.updated_at = datetime.utcnow()

        db.session.commit()

        # Log admin activity
        log_activity(session['user_id'], 'business_settings_import', f"Admin imported business settings", request.remote_addr, request.user_agent.string)

        return jsonify({'success': True, 'message': 'Business settings imported successfully'})

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error importing business settings: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to import business settings'}), 500

@app.route('/api/admin/reset-business-settings', methods=['POST'])
@admin_required
def reset_business_settings():
    """Reset business settings to defaults (Admin only)"""
    try:
        # Get or create global business settings record
        business_settings = BusinessSettings.query.first()
        if not business_settings:
            business_settings = BusinessSettings()
            db.session.add(business_settings)

        # Reset to default values
        business_settings.business_name = 'Your Business Name'
        business_settings.business_address = 'Your Business Address'
        business_settings.business_phone = 'Your Phone Number'
        business_settings.business_email = 'your@email.com'
        business_settings.business_logo_url = ''
        business_settings.signature_url = ''
        business_settings.tax_rate = 0.0
        business_settings.currency = 'USD'
        business_settings.updated_at = datetime.utcnow()

        db.session.commit()

        # Log admin activity
        log_activity(session['user_id'], 'business_settings_reset', f"Admin reset business settings to defaults", request.remote_addr, request.user_agent.string)

        return jsonify({'success': True, 'message': 'Business settings reset to defaults'})

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error resetting business settings: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to reset business settings'}), 500

@app.route('/api/admin/users')
@admin_required
def get_all_users():
    """Get all users for admin"""
    try:
        users = User.query.filter_by(is_admin=False).all()
        users_data = []

        for user in users:
            user_settings = UserBusinessSettings.query.filter_by(user_id=user.id).first()
            clients = ClientSettings.query.filter_by(user_id=user.id).all()

            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'created_at': user.created_at.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'business_settings': {
                    'businessName': user_settings.business_name if user_settings else '',
                    'businessAddress': user_settings.business_address if user_settings else '',
                    'businessPhone': user_settings.business_phone if user_settings else '',
                    'businessEmail': user_settings.business_email if user_settings else '',
                    'businessLogoUrl': user_settings.business_logo_url if user_settings else '',
                    'signatureUrl': user_settings.signature_url if user_settings else '',
                    'taxRate': user_settings.tax_rate if user_settings else 0,
                    'currency': user_settings.currency if user_settings else 'USD'
                },
                'clients': [{
                    'id': client.id,
                    'name': client.client_name,
                    'address': client.client_address,
                    'email': client.client_email,
                    'phone': client.client_phone,
                    'is_active': client.is_active
                } for client in clients]
            })

        return jsonify({'success': True, 'users': users_data})

    except Exception as e:
        logging.error(f"Error getting users: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to get users'}), 500

@app.route('/api/admin/generate-code-for-user', methods=['POST'])
@admin_required
def generate_code_for_user():
    """Generate download code for a specific user"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')

        if not user_id:
            return jsonify({'success': False, 'error': 'User ID is required'}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        # Generate code
        code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        expiry = datetime.utcnow() + timedelta(hours=24)

        download_code = DownloadCode(
            code=code,
            user_id=user_id,
            expires_at=expiry
        )

        db.session.add(download_code)
        db.session.commit()

        return jsonify({
            'success': True,
            'code': code,
            'user_name': f"{user.first_name} {user.last_name}",
            'expires_at': expiry.isoformat()
        })

    except Exception as e:
        logging.error(f"Error generating code for user: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to generate code'}), 500

@app.route('/api/save-client', methods=['POST'])
@login_required
def save_client():
    """Save client information"""
    try:
        data = request.get_json()
        client_id = data.get('client_id')

        if client_id:
            # Update existing client
            client = ClientSettings.query.filter_by(id=client_id, user_id=session['user_id']).first()
            if not client:
                return jsonify({'success': False, 'error': 'Client not found'}), 404
        else:
            # Create new client
            client = ClientSettings(user_id=session['user_id'])
            db.session.add(client)

        # Update client data
        client.client_name = data.get('client_name', '')
        client.client_address = data.get('client_address', '')
        client.client_email = data.get('client_email', '')
        client.client_phone = data.get('client_phone', '')
        client.is_active = data.get('is_active', True)

        db.session.commit()

        return jsonify({'success': True, 'message': 'Client saved successfully', 'client_id': client.id})

    except Exception as e:
        logging.error(f"Error saving client: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to save client'}), 500

@app.route('/api/get-clients')
@login_required
def get_clients():
    """Get clients for current user"""
    try:
        clients = ClientSettings.query.filter_by(user_id=session['user_id'], is_active=True).all()
        clients_data = [{
            'id': client.id,
            'name': client.client_name,
            'address': client.client_address,
            'email': client.client_email,
            'phone': client.client_phone
        } for client in clients]

        return jsonify({'success': True, 'clients': clients_data})

    except Exception as e:
        logging.error(f"Error getting clients: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to get clients'}), 500

@app.route('/api/admin/toggle-user-verification/<int:user_id>', methods=['POST'])
@admin_required
def toggle_user_verification(user_id):
    """Toggle user verification status"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        if user.is_admin:
            return jsonify({'success': False, 'error': 'Cannot modify admin user verification'}), 400

        user.is_verified = not user.is_verified
        db.session.commit()

        status = 'verified' if user.is_verified else 'unverified'

        # Send email notification
        subject = f"Account Verification {'Approved' if user.is_verified else 'Revoked'}"
        body = f"""
        Dear {user.first_name} {user.last_name},

        Your account verification status has been {'approved' if user.is_verified else 'revoked'} by an administrator.

        Status: {status.capitalize()}

        Best regards,
        Business Documents Team
        """

        send_email(user.email, subject, body)

        return jsonify({
            'success': True, 
            'message': f'User {status} successfully',
            'is_verified': user.is_verified
        })

    except Exception as e:
        logging.error(f"Error toggling user verification: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to update user verification'}), 500



@app.route('/api/admin/edit-user/<int:user_id>', methods=['PUT'])
@admin_required
def edit_user(user_id):
    """Edit user details"""
    try:
        data = request.get_json()

        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        if user.is_admin:
            return jsonify({'success': False, 'error': 'Cannot edit admin users. Admin users can only be modified by other admins with appropriate permissions.'}), 400

        # Check if username or email already exists (excluding current user)
        existing_username = User.query.filter(User.username == data.get('username'), User.id != user_id).first()
        if existing_username:
            return jsonify({'success': False, 'error': 'Username already exists'}), 400

        existing_email = User.query.filter(User.email == data.get('email'), User.id != user_id).first()
        if existing_email:
            return jsonify({'success': False, 'error': 'Email already exists'}), 400

        # Update user details
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)

        db.session.commit()

        return jsonify({'success': True, 'message': 'User updated successfully'})

    except Exception as e:
        logging.error(f"Error editing user: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to update user'}), 500

@app.route('/api/admin/delete-user/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete a user"""
    try:
        user = User.query.get_or_404(user_id)

        if user.is_admin:
            return jsonify({'success': False, 'error': 'Cannot delete admin user'}), 400

        # Delete user's files and messages
        for pdf_code in user.pdf_codes:
            db.session.delete(pdf_code)

        # Delete sent messages
        for message in user.sent_messages:
            db.session.delete(message)

        # Delete received messages
        for message in user.received_messages:
            db.session.delete(message)

        for pdf_request in user.pdf_requests:
            db.session.delete(pdf_request)

        # Delete user's business settings
        user_settings = UserBusinessSettings.query.filter_by(user_id=user.id).first()
        if user_settings:
            db.session.delete(user_settings)

        # Delete user's client settings
        client_settings = ClientSettings.query.filter_by(user_id=user.id).all()
        for client in client_settings:
            db.session.delete(client)

        # Delete user's activity logs
        activity_logs = ActivityLog.query.filter_by(user_id=user.id).all()
        for log in activity_logs:
            db.session.delete(log)

        # Delete user's generated documents
        generated_docs = GeneratedDocument.query.filter_by(user_id=user.id).all()
        for doc in generated_docs:
            db.session.delete(doc)

        db.session.delete(user)
        db.session.commit()

        # Log deletion activity
        log_activity(session['user_id'], 'user_deletion', f"Admin deleted user {user.username}", request.remote_addr, request.user_agent.string)

        return jsonify({'success': True, 'message': 'User deleted successfully'})

    except Exception as e:
        db.session.rollback()
        logging.error(f"User deletion error: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to delete user'}), 500



@app.route('/api/admin/send-message/<int:user_id>', methods=['POST'])
@admin_required
def send_admin_message(user_id):
    """Send a message to a user"""
    try:
        data = request.get_json()
        message_text = data.get('message', '').strip()

        if not message_text:
            return jsonify({'success': False, 'error': 'Message cannot be empty'}), 400

        user = User.query.get_or_404(user_id)

        # Create new message
        message = Message(
            sender_id=session['user_id'],
            recipient_id=user_id,
            subject='Message from Admin',
            content=message_text
        )

        db.session.add(message)
        db.session.commit()

        # Log message activity
        log_activity(session['user_id'], 'admin_message', f"Admin sent message to user {user.username}", request.remote_addr, request.user_agent.string)

        return jsonify({'success': True, 'message': 'Message sent successfully'})

    except Exception as e:
        logging.error(f"Send message error: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to send message'}), 500

@app.route('/api/admin/update-user-password/<int:user_id>', methods=['POST'])
@admin_required
def update_user_password(user_id):
    """Admin updates user password"""
    try:
        data = request.get_json()
        new_password = data.get('password')

        if not new_password:
            return jsonify({'success': False, 'error': 'Password is required'}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        user.set_password(new_password)
        db.session.commit()

        # Log admin activity
        admin_user = User.query.get(session['user_id'])
        log_activity(session['user_id'], 'admin_password_change', f"Admin {admin_user.username} changed password for user {user.username}", request.remote_addr, request.user_agent.string)

        return jsonify({'success': True, 'message': 'Password updated successfully'})

    except Exception as e:
        logging.error(f"Error updating user password: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to update password'}), 500

@app.route('/api/admin/activity-logs')
@admin_required
def get_activity_logs():
    """Get activity logs for admin"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)

        logs = ActivityLog.query.order_by(ActivityLog.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        logs_data = []
        for log in logs.items:
            logs_data.append({
                'id': log.id,
                'user': f"{log.user.first_name} {log.user.last_name}" if log.user else 'Unknown',
                'username': log.user.username if log.user else 'Unknown',
                'activity_type': log.activity_type,
                'description': log.description,
                'ip_address': log.ip_address,
                'created_at': log.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })

        return jsonify({
            'success': True,
            'logs': logs_data,
            'total': logs.total,
            'pages': logs.pages,
            'current_page': page
        })

    except Exception as e:
        logging.error(f"Error getting activity logs: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to get activity logs'}), 500

@app.route('/api/admin/generated-documents')
@admin_required
def get_generated_documents():
    """Get all generated documents for admin"""
    try:
        documents = GeneratedDocument.query.order_by(GeneratedDocument.created_at.desc()).all()

        documents_data = []
        for doc in documents:
            documents_data.append({
                'id': doc.id,
                'user': f"{doc.user.first_name} {doc.user.last_name}",
                'username': doc.user.username,
                'document_type': doc.document_type,
                'document_title': doc.document_title,
                'file_path': doc.file_path,
                'created_at': doc.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })

        return jsonify({'success': True, 'documents': documents_data})

    except Exception as e:
        logging.error(f"Error getting generated documents: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to get generated documents'}), 500

@app.route('/api/admin/download-generated-document/<int:doc_id>')
@admin_required
def download_generated_document(doc_id):
    """Download generated document"""
    try:
        doc = GeneratedDocument.query.get(doc_id)
        if not doc:
            return jsonify({'success': False, 'error': 'Document not found'}), 404

        if os.path.exists(doc.file_path):
            return send_from_directory(
                os.path.dirname(doc.file_path),
                os.path.basename(doc.file_path),
                as_attachment=True,
                download_name=f"{doc.document_title}.pdf"
            )
        else:
            return jsonify({'success': False, 'error': 'File not found on disk'}), 404

    except Exception as e:
        logging.error(f"Error downloading document: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to download document'}), 500

@app.route('/api/save-generated-document', methods=['POST'])
@login_required
def save_generated_document():
    """Save generated document info"""
    try:
        data = request.get_json()

        # Create generated documents directory if it doesn't exist
        docs_dir = os.path.join(os.getcwd(), 'generated_documents')
        os.makedirs(docs_dir, exist_ok=True)

        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{data.get('document_type', 'document')}_{timestamp}.pdf"
        file_path = os.path.join(docs_dir, filename)

        # Save document record
        doc = GeneratedDocument(
            user_id=session['user_id'],
            document_type=data.get('document_type', 'unknown'),
            document_title=data.get('document_title', 'Untitled Document'),
            file_path=file_path
        )

        db.session.add(doc)
        db.session.commit()

        # Log PDF generation activity
        user = User.query.get(session['user_id'])
        log_activity(session['user_id'], 'pdf_generated', f"User {user.username} generated {data.get('document_type')} - {data.get('document_title')}", request.remote_addr, request.user_agent.string)

        return jsonify({
            'success': True,
            'file_path': file_path,
            'document_id': doc.id
        })

    except Exception as e:
        logging.error(f"Error saving generated document: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to save document info'}), 500

@app.route('/api/admin/backup-database', methods=['POST'])
@admin_required
def backup_database():
    """Create database backup"""
    try:
        import shutil
        from datetime import datetime

        # Create backups directory
        backup_dir = get_backup_directory()
        os.makedirs(backup_dir, exist_ok=True)

        # Generate backup filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f"database_backup_{timestamp}.db"
        backup_path = os.path.join(backup_dir, backup_filename)

        # Copy database file
        db_path = os.path.join(os.getcwd(), 'instance', 'business_docs.db')
        if os.path.exists(db_path):
            shutil.copy2(db_path, backup_path)

            # Also backup uploads and generated documents
            if os.path.exists('uploads'):
                shutil.copytree('uploads', os.path.join(backup_dir, f"uploads_backup_{timestamp}"), dirs_exist_ok=True)

            if os.path.exists('generated_documents'):
                shutil.copytree('generated_documents', os.path.join(backup_dir, f"generated_documents_backup_{timestamp}"), dirs_exist_ok=True)

            return jsonify({'success': True, 'message': 'Backup created successfully', 'backup_path': backup_path})
        else:
            return jsonify({'success': False, 'error': 'Database file not found'}), 404

    except Exception as e:
        logging.error(f"Error creating backup: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to create backup'}), 500

@app.route('/api/admin/export-database', methods=['POST'])
@admin_required
def export_database():
    """Export database data to JSON format"""
    try:
        data = {}
        
        # Export Users (excluding password hashes for security)
        users = User.query.all()
        data['users'] = []
        for user in users:
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_admin': user.is_admin,
                'is_verified': user.is_verified,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'last_login': user.last_login.isoformat() if user.last_login else None
            }
            data['users'].append(user_data)

        # Export Business Settings
        business_settings = BusinessSettings.query.all()
        data['business_settings'] = []
        for setting in business_settings:
            data['business_settings'].append({
                'id': setting.id,
                'business_name': setting.business_name,
                'business_address': setting.business_address,
                'business_phone': setting.business_phone,
                'business_email': setting.business_email,
                'business_logo_url': setting.business_logo_url,
                'signature_url': setting.signature_url,
                'tax_rate': setting.tax_rate,
                'currency': setting.currency,
                'created_at': setting.created_at.isoformat() if setting.created_at else None,
                'updated_at': setting.updated_at.isoformat() if setting.updated_at else None
            })

        # Export User Business Settings
        user_business_settings = UserBusinessSettings.query.all()
        data['user_business_settings'] = []
        for setting in user_business_settings:
            data['user_business_settings'].append({
                'id': setting.id,
                'user_id': setting.user_id,
                'business_name': setting.business_name,
                'business_address': setting.business_address,
                'business_phone': setting.business_phone,
                'business_email': setting.business_email,
                'business_logo_url': setting.business_logo_url,
                'signature_url': setting.signature_url,
                'tax_rate': setting.tax_rate,
                'currency': setting.currency,
                'created_at': setting.created_at.isoformat() if setting.created_at else None,
                'updated_at': setting.updated_at.isoformat() if setting.updated_at else None
            })

        # Export Client Settings
        client_settings = ClientSettings.query.all()
        data['client_settings'] = []
        for client in client_settings:
            data['client_settings'].append({
                'id': client.id,
                'user_id': client.user_id,
                'client_name': client.client_name,
                'client_address': client.client_address,
                'client_email': client.client_email,
                'client_phone': client.client_phone,
                'is_active': client.is_active,
                'created_at': client.created_at.isoformat() if client.created_at else None,
                'updated_at': client.updated_at.isoformat() if client.updated_at else None
            })

        # Export PDF Requests
        pdf_requests = PDFRequest.query.all()
        data['pdf_requests'] = []
        for req in pdf_requests:
            data['pdf_requests'].append({
                'id': req.id,
                'user_id': req.user_id,
                'title': req.title,
                'description': req.description,
                'status': req.status,
                'admin_response': req.admin_response,
                'created_at': req.created_at.isoformat() if req.created_at else None,
                'updated_at': req.updated_at.isoformat() if req.updated_at else None
            })

        # Export Messages
        messages = Message.query.all()
        data['messages'] = []
        for msg in messages:
            data['messages'].append({
                'id': msg.id,
                'sender_id': msg.sender_id,
                'recipient_id': msg.recipient_id,
                'subject': msg.subject,
                'content': msg.content,
                'is_read': msg.is_read,
                'parent_message_id': msg.parent_message_id,
                'created_at': msg.created_at.isoformat() if msg.created_at else None
            })

        # Export System Settings
        system_settings = SystemSettings.query.all()
        data['system_settings'] = []
        for setting in system_settings:
            data['system_settings'].append({
                'id': setting.id,
                'setting_key': setting.setting_key,
                'setting_value': setting.setting_value,
                'created_at': setting.created_at.isoformat() if setting.created_at else None,
                'updated_at': setting.updated_at.isoformat() if setting.updated_at else None
            })

        # Add export metadata
        data['export_info'] = {
            'export_date': datetime.utcnow().isoformat(),
            'version': '1.0',
            'total_records': {
                'users': len(data['users']),
                'business_settings': len(data['business_settings']),
                'user_business_settings': len(data['user_business_settings']),
                'client_settings': len(data['client_settings']),
                'pdf_requests': len(data['pdf_requests']),
                'messages': len(data['messages']),
                'system_settings': len(data['system_settings'])
            }
        }

        return jsonify({
            'success': True,
            'data': data,
            'filename': f'database_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        })

    except Exception as e:
        logging.error(f"Error exporting database: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to export database'}), 500

@app.route('/api/admin/import-database', methods=['POST'])
@admin_required
def import_database():
    """Import database data from JSON format"""
    try:
        data = request.get_json()
        import_data = data.get('data')

        if not import_data:
            return jsonify({'success': False, 'error': 'No import data provided'}), 400

        imported_counts = {}

        # Import Business Settings (non-destructive)
        if 'business_settings' in import_data:
            for setting_data in import_data['business_settings']:
                existing = BusinessSettings.query.filter_by(id=setting_data.get('id')).first()
                if not existing:
                    setting = BusinessSettings(
                        business_name=setting_data.get('business_name'),
                        business_address=setting_data.get('business_address'),
                        business_phone=setting_data.get('business_phone'),
                        business_email=setting_data.get('business_email'),
                        business_logo_url=setting_data.get('business_logo_url'),
                        signature_url=setting_data.get('signature_url'),
                        tax_rate=setting_data.get('tax_rate', 0),
                        currency=setting_data.get('currency', 'USD')
                    )
                    db.session.add(setting)
            imported_counts['business_settings'] = len(import_data['business_settings'])

        # Import System Settings (non-destructive)
        if 'system_settings' in import_data:
            for setting_data in import_data['system_settings']:
                existing = SystemSettings.query.filter_by(setting_key=setting_data.get('setting_key')).first()
                if not existing:
                    setting = SystemSettings(
                        setting_key=setting_data.get('setting_key'),
                        setting_value=setting_data.get('setting_value')
                    )
                    db.session.add(setting)
            imported_counts['system_settings'] = len(import_data['system_settings'])

        # Note: We don't import users, messages, or other sensitive data for security
        # This would require more careful handling and user confirmation

        db.session.commit()

        # Log import activity
        log_activity(session['user_id'], 'database_import', f"Admin imported database settings", request.remote_addr, request.user_agent.string)

        return jsonify({
            'success': True,
            'message': 'Database settings imported successfully',
            'imported_counts': imported_counts
        })

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error importing database: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to import database'}), 500

@app.route('/api/admin/backup-settings', methods=['GET', 'POST'])
@admin_required
def backup_settings():
    """Get or update backup settings"""
    try:
        if request.method == 'GET':
            backup_dir_setting = SystemSettings.query.filter_by(setting_key='backup_directory').first()
            backup_dir = backup_dir_setting.setting_value if backup_dir_setting else os.path.join(os.getcwd(), 'backups')

            return jsonify({'success': True, 'backup_directory': backup_dir})

        elif request.method == 'POST':
            data = request.get_json()
            new_backup_dir = data.get('backup_directory')

            if not new_backup_dir:
                return jsonify({'success': False, 'error': 'Backup directory is required'}), 400

            # Update or create setting
            backup_dir_setting = SystemSettings.query.filter_by(setting_key='backup_directory').first()
            if backup_dir_setting:
                backup_dir_setting.setting_value = new_backup_dir
                backup_dir_setting.updated_at = datetime.utcnow()
            else:
                backup_dir_setting = SystemSettings(setting_key='backup_directory', setting_value=new_backup_dir)
                db.session.add(backup_dir_setting)

            db.session.commit()

            return jsonify({'success': True, 'message': 'Backup directory updated successfully'})

    except Exception as e:
        logging.error(f"Error handling backup settings: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to handle backup settings'}), 500

def get_backup_directory():
    """Get the configured backup directory"""
    backup_dir_setting = SystemSettings.query.filter_by(setting_key='backup_directory').first()
    return backup_dir_setting.setting_value if backup_dir_setting else os.path.join(os.getcwd(), 'backups')

@app.route('/offline.html')
def offline():
    return render_template('offline.html')

@app.route('/api/get-current-user')
def get_current_user():
    """Get current logged in user info"""
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({
                'success': True,
                'username': user.username,
                'name': f"{user.first_name} {user.last_name}"
            })

    return jsonify({'success': False, 'error': 'Not logged in'}), 401

def setup_automatic_backup():
    """Setup automatic backup every 24 hours"""
    import threading
    import time

    def backup_scheduler():
        while True:
            time.sleep(24 * 60 * 60)  # 24 hours
            try:
                with app.app_context():
                    import shutil
                    from datetime import datetime

                    backup_dir = get_backup_directory()
                    os.makedirs(backup_dir, exist_ok=True)

                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

                    # Backup database
                    db_path = os.path.join(os.getcwd(), 'instance', 'business_docs.db')
                    if os.path.exists(db_path):
                        backup_db_path = os.path.join(backup_dir, f"auto_database_backup_{timestamp}.db")
                        shutil.copy2(db_path, backup_db_path)

                    # Backup uploads
                    if os.path.exists('uploads'):
                        shutil.copytree('uploads', os.path.join(backup_dir, f"auto_uploads_backup_{timestamp}"), dirs_exist_ok=True)

                    # Backup generated documents
                    if os.path.exists('generated_documents'):
                        shutil.copytree('generated_documents', os.path.join(backup_dir, f"auto_generated_documents_backup_{timestamp}"), dirs_exist_ok=True)

                    logging.info(f"Automatic backup completed: {timestamp}")

            except Exception as e:
                logging.error(f"Automatic backup failed: {str(e)}")

    # Start backup scheduler in background thread
    backup_thread = threading.Thread(target=backup_scheduler, daemon=True)
    backup_thread.start()

if __name__ == '__main__':
    setup_automatic_backup()
    app.run(host='0.0.0.0', port=5000, debug=True)