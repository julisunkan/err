
from datetime import datetime, timedelta
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
import string

# Create SQLAlchemy instance
db = SQLAlchemy()

class User(db.Model):
    """User model for authentication system"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), nullable=True)
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    pdf_codes = db.relationship('UserPDFCode', foreign_keys='UserPDFCode.user_id', backref='user', lazy=True, cascade='all, delete-orphan')
    pdf_requests = db.relationship('PDFRequest', backref='user', lazy=True, cascade='all, delete-orphan')
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender', lazy=True)
    received_messages = db.relationship('Message', foreign_keys='Message.recipient_id', backref='recipient', lazy=True)
    uploaded_pdfs = db.relationship('UserPDFCode', foreign_keys='UserPDFCode.uploaded_by_admin_id', backref='uploader', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def generate_verification_token(self):
        self.verification_token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
        return self.verification_token
    
    def generate_reset_token(self):
        self.reset_token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
        self.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        return self.reset_token
    
    def __repr__(self):
        return f'<User {self.username}>'

class UserPDFCode(db.Model):
    """Model for PDF codes assigned to users"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=True)
    uploaded_by_admin_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    downloaded_at = db.Column(db.DateTime, nullable=True)
    download_count = db.Column(db.Integer, default=0)
    
    def __repr__(self):
        return f'<UserPDFCode {self.filename}>'

class PDFRequest(db.Model):
    """Model for user requests for PDF codes"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    admin_response = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<PDFRequest {self.title}>'

class Message(db.Model):
    """Model for in-site messaging system"""
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)  # Allows HTML content
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    parent_message_id = db.Column(db.Integer, db.ForeignKey('message.id'), nullable=True)
    
    # Self-referential relationship for message threads
    replies = db.relationship('Message', backref=db.backref('parent', remote_side=[id]), lazy=True)
    
    def __repr__(self):
        return f'<Message {self.subject}>'

class DownloadCode(db.Model):
    """Model for storing one-time download codes"""
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(8), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    document_data = db.Column(db.Text, nullable=True)  # JSON data for the document
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    used_at = db.Column(db.DateTime, nullable=True)

    # Relationship
    user = db.relationship('User', backref='download_codes')

    def __repr__(self):
        return f'<DownloadCode {self.code}>'

class BusinessSettings(db.Model):
    """Model for storing global business settings"""
    id = db.Column(db.Integer, primary_key=True)
    business_name = db.Column(db.String(200), nullable=True)
    business_address = db.Column(db.Text, nullable=True)
    business_phone = db.Column(db.String(50), nullable=True)
    business_email = db.Column(db.String(100), nullable=True)
    business_logo_url = db.Column(db.String(500), nullable=True)
    signature_url = db.Column(db.String(500), nullable=True)
    tax_rate = db.Column(db.Float, default=0.0)
    currency = db.Column(db.String(10), default='USD')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<BusinessSettings {self.business_name}>'

class UserBusinessSettings(db.Model):
    """Model for storing user-specific business settings"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    business_name = db.Column(db.String(200), nullable=True)
    business_address = db.Column(db.Text, nullable=True)
    business_phone = db.Column(db.String(50), nullable=True)
    business_email = db.Column(db.String(100), nullable=True)
    business_logo_url = db.Column(db.String(500), nullable=True)
    signature_url = db.Column(db.String(500), nullable=True)
    tax_rate = db.Column(db.Float, default=0.0)
    currency = db.Column(db.String(10), default='USD')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = db.relationship('User', backref='business_settings')

    def __repr__(self):
        return f'<UserBusinessSettings {self.business_name} for User {self.user_id}>'

class ClientSettings(db.Model):
    """Model for storing client information for each user"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    client_name = db.Column(db.String(200), nullable=False)
    client_address = db.Column(db.Text, nullable=True)
    client_email = db.Column(db.String(100), nullable=True)
    client_phone = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = db.relationship('User', backref='clients')

    def __repr__(self):
        return f'<ClientSettings {self.client_name} for User {self.user_id}>'

class SMTPSettings(db.Model):
    """Model for storing SMTP configuration"""
    id = db.Column(db.Integer, primary_key=True)
    smtp_server = db.Column(db.String(200), nullable=False)
    smtp_port = db.Column(db.Integer, nullable=False, default=587)
    smtp_username = db.Column(db.String(200), nullable=False)
    smtp_password = db.Column(db.String(500), nullable=False)  # Should be encrypted in production
    use_tls = db.Column(db.Boolean, default=True)
    from_email = db.Column(db.String(200), nullable=False)
    from_name = db.Column(db.String(200), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<SMTPSettings {self.smtp_server}:{self.smtp_port}>'
