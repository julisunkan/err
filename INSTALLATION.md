# Installation Guide - Business Documents Generator

## Quick Start (Recommended)

### Option 1: Run on Replit (Easiest)
1. Fork this Replit project
2. Click the "Run" button
3. Access your app at the provided URL
4. No additional setup required!

### Option 2: Local Installation

#### Prerequisites
- Python 3.11 or higher
- Web browser

#### Steps
1. **Download the project files**
   - Download all files to a folder on your computer

2. **Install Python dependencies**
   ```bash
   pip install flask flask-sqlalchemy gunicorn
   ```

3. **Run the application**
   ```bash
   python main.py
   ```

4. **Open in browser**
   - Go to: `http://localhost:5000`
   - You should see the Business Documents Generator

## First Time Setup

### 1. Configure Your Business Information
- Click the "Settings" tab
- Fill in:
  - Business name
  - Business address
  - Phone number
  - Email address
  - Tax rate (if applicable)

### 2. Add Business Logo and Signature (Optional)
- Upload your logo and signature images to any image hosting service
- Copy the image URLs
- Paste them in the "Business Logo URL" and "Signature URL" fields
- Save settings

### 3. Test the Application
- Go back to the "Document Generator" tab
- Fill in some sample client information
- Add a test item
- Watch the live preview update
- Generate a download code (click "Generate Download Code" link)
- Use the code to download a test PDF

## Features Overview

### Document Types Available
- **Invoice**: For billing customers
- **Quotation**: For price estimates
- **Purchase Order**: For ordering supplies
- **Receipt**: For payment confirmations

### Key Features
- **Live Preview**: See your document update as you type
- **Secure Downloads**: One-time codes protect your PDFs
- **Professional Layout**: Clean, business-ready documents
- **Mobile Friendly**: Works on phones and tablets
- **Settings Backup**: Export/import your business settings

## Usage Tips

### Creating Documents
1. Select document type from dropdown
2. Document number auto-generates
3. Fill in client details
4. Add items with quantity, price, discount
5. Totals calculate automatically
6. Live preview shows final appearance

### Getting PDFs
1. Click "Generate Download Code" (opens new tab)
2. Copy the generated code
3. Return to main page
4. Enter code in "Download Code" field
5. Click "Verify & Download PDF"

### Managing Settings
- **Export**: Download your settings as backup file
- **Import**: Upload previously saved settings
- **Auto-save**: Settings save automatically when changed

## Troubleshooting

### Common Issues

**App won't start:**
- Make sure Python is installed
- Install required packages: `pip install flask flask-sqlalchemy gunicorn`
- Check if port 5000 is available

**Images not showing in PDF:**
- Ensure image URLs are publicly accessible
- Try opening the image URL in a new browser tab
- Use direct image links (ending in .jpg, .png, etc.)

**Download codes not working:**
- Codes expire after 24 hours
- Each code can only be used once
- Generate a new code if needed

### Getting Help
- Check the live preview to see if data is entered correctly
- Verify all required fields are filled
- Try refreshing the page if something seems stuck

## Security Features
- One-time download codes prevent unauthorized access
- Live preview cannot be downloaded or printed
- Session data is securely managed
- No data is stored permanently without permission

## Customization
- Colors and styling can be modified in `static/css/style.css`
- Business information appears on all documents
- Tax rates and currency can be configured per business
- Document numbering follows standard business formats

This application is designed to be simple to use while providing professional results for your business documentation needs.