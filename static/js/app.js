window.isCodeVerified = false;
var isCodeVerified = false;

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showError('An unexpected error occurred. Please refresh the page.');
});

console.log('App.js loaded successfully');