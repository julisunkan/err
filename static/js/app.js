
// Business Documents Generator - Main Application
console.log('App.js loading...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');

    // Test if the page is working
    const body = document.body;
    if (body) {
        console.log('Page loaded successfully');
        body.style.opacity = '1';
    }

    // Initialize the application
    try {
        initializeApp();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to initialize application: ' + error.message);
    }
});

function initializeApp() {
    console.log('Initializing application...');

    // Basic form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });

    // Basic button handlers
    const buttons = document.querySelectorAll('button[data-action]');
    buttons.forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });

    console.log('Application initialized successfully');
}

function handleFormSubmit(event) {
    console.log('Form submitted:', event.target);
    // Basic form handling logic here
}

function handleButtonClick(event) {
    const action = event.target.getAttribute('data-action');
    console.log('Button clicked with action:', action);
    // Basic button handling logic here
}

function showError(message) {
    console.error(message);

    // Create error alert
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Insert at top of main content
    const main = document.querySelector('main') || document.body;
    main.insertBefore(alert, main.firstChild);
}

function showSuccess(message) {
    console.log('Success:', message);

    // Create success alert
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Insert at top of main content
    const main = document.querySelector('main') || document.body;
    main.insertBefore(alert, main.firstChild);
}

// Global variables
window.isCodeVerified = false;
var isCodeVerified = false;

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showError('An unexpected error occurred. Please refresh the page.');
});

// Verify download code
function verifyDownloadCode() {
    const code = document.getElementById('pdfDownloadCode').value.trim();

    if (!code) {
        showError('Please enter a download code');
        return;
    }

    fetch('/api/verify-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.isCodeVerified = true;
            // Also set the global variable for broader access
            if (typeof isCodeVerified !== 'undefined') {
                isCodeVerified = true;
            }

            // Update business settings with verified data
            if (data.business_settings) {
                businessSettings = data.business_settings;
                console.log('Business settings updated from verification:', businessSettings);

                // Ensure business settings are not empty
                if (!businessSettings.businessName || businessSettings.businessName.trim() === '') {
                    businessSettings.businessName = 'Business Documents Generator';
                }
            }

            showSuccess('Code verified! You can now generate and download documents.');

            // Update preview with new settings
            updatePreview();
        } else {
            window.isCodeVerified = false;
            if (typeof isCodeVerified !== 'undefined') {
                isCodeVerified = false;
            }
            showError(data.error || 'Invalid code');
        }
    })
    .catch(error => {
        console.error('Error verifying code:', error);
        showError('Error verifying code');
    });
}

// Collect document data including all business settings
function collectDocumentData() {
    // Get form data
    const formData = new FormData(document.getElementById('documentForm'));
    
    // Build document data object
    const documentData = {
        type: formData.get('documentType') || 'invoice',
        number: formData.get('documentNumber') || 'INV-001',
        date: formData.get('documentDate') || new Date().toISOString().split('T')[0],
        dueDate: formData.get('dueDate') || '',
        
        // Business settings (use current businessSettings)
        business: {
            businessName: businessSettings.businessName || 'Your Business Name',
            businessAddress: businessSettings.businessAddress || '',
            businessPhone: businessSettings.businessPhone || '',
            businessEmail: businessSettings.businessEmail || '',
            businessLogoUrl: businessSettings.businessLogoUrl || '',
            signatureUrl: businessSettings.signatureUrl || '',
            taxRate: businessSettings.taxRate || 0,
            currency: businessSettings.currency || 'USD'
        },
        
        // Client information
        client: {
            name: formData.get('clientName') || '',
            address: formData.get('clientAddress') || '',
            phone: formData.get('clientPhone') || '',
            email: formData.get('clientEmail') || ''
        },
        
        // Items
        items: collectItems(),
        
        // Totals
        totals: calculateTotals(),
        
        // Currency
        currency: businessSettings.currency || 'USD'
    };

    console.log('Collected document data:', documentData);
    return documentData;
}

// Generate and download PDF function
async function generatePDF() {
    if (!isCodeVerified) {
        showError('Please verify your download code first');
        return;
    }

    try {
        if (!window.EnhancedPDFGenerator) {
            throw new Error('Enhanced PDF Generator not available. Please refresh the page.');
        }

        const documentData = collectDocumentData();
        console.log('Generating PDF with document data:', documentData);

        // Show loading message
        showSuccess('Generating PDF... Please wait.');

        // Generate and download PDF
        await window.EnhancedPDFGenerator.downloadPDF(documentData);
        
        // Show success message
        showSuccess('PDF generated and downloaded successfully!');

    } catch (error) {
        console.error('Error generating PDF:', error);
        showError('Error generating PDF: ' + error.message);
    }
}

// Generate and download HTML function
function generateHTML() {
    if (!isCodeVerified) {
        showError('Please verify your download code first');
        return;
    }

    try {
        if (!window.EnhancedPDFGenerator) {
            throw new Error('Enhanced PDF Generator not available. Please refresh the page.');
        }

        const documentData = collectDocumentData();
        console.log('Generating HTML with document data:', documentData);

        // Generate and download HTML
        window.EnhancedPDFGenerator.downloadHTML(documentData);
        
        // Show success message
        showSuccess('HTML document generated and downloaded successfully!');

    } catch (error) {
        console.error('Error generating HTML:', error);
        showError('Error generating HTML: ' + error.message);
    }
}

console.log('App.js loaded successfully');
