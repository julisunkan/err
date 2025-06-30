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

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showError('An unexpected error occurred. Please refresh the page.');
});

console.log('App.js loaded successfully');