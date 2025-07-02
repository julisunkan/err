window.isCodeVerified = false;
var isCodeVerified = false;

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showError('An unexpected error occurred. Please refresh the page.');
});

// Offline support functions
function handleOfflineAction(type, data) {
    if (window.pwaManager && window.pwaManager.isOffline()) {
        window.pwaManager.queueOfflineAction({ type, data });
        window.pwaManager.showToast('Action saved. Will sync when online.', 'info');
        return true;
    }
    return false;
}

// Override fetch for better offline handling
const originalFetch = window.fetch;
window.fetch = function(...args) {
    return originalFetch.apply(this, args)
        .catch(error => {
            if (!navigator.onLine) {
                throw new Error('You are offline. Please check your connection.');
            }
            throw error;
        });
};

console.log('App.js loaded successfully with offline support');