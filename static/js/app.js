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

// Initialize the app
    window.DocumentApp = {
        settings: {},
        init: function() {
            console.log('Document loaded, initializing...');
            this.loadSettings();
            this.checkUserSession();
        },

        checkUserSession: function() {
            // Check if user is logged in and store username
            fetch('/api/get-current-user')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.username) {
                        sessionStorage.setItem('current_username', data.username);
                    }
                })
                .catch(error => {
                    console.log('No user session found');
                });
        },
function updateLivePreview() {
            const documentData = collectFormData();
            const previewContainer = document.getElementById('livePreview');

            if (!previewContainer) return;

            // Generate HTML preview with logo and signature
            let html = `
                <div class="document-preview">
                    <!-- Header -->
                    <div class="document-header" style="position: relative;">
                        <div class="business-info" style="padding-right: ${documentData.business.businessLogoUrl ? '60px' : '0'};">
                            <h2>${documentData.business.businessName || 'Your Business Name'}</h2>
                            <div class="contact-info">
                                ${documentData.business.businessAddress ? `<div>${documentData.business.businessAddress.replace(/\n/g, '<br>')}</div>` : ''}
                                <div>
                                    ${documentData.business.businessPhone ? `Phone: ${documentData.business.businessPhone}` : ''}
                                    ${documentData.business.businessPhone && documentData.business.businessEmail ? ' | ' : ''}
                                    ${documentData.business.businessEmail ? `Email: ${documentData.business.businessEmail}` : ''}
                                </div>
                            </div>
                        </div>
                        ${documentData.business.businessLogoUrl ? `
                            <div class="business-logo" style="position: absolute; top: 0; right: 0; width: 50px; height: 50px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden;">
                                <img src="${documentData.business.businessLogoUrl}" 
                                     alt="Business Logo" 
                                     style="width: 100%; height: 100%; object-fit: contain; background: white;"
                                     onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;font-size:10px;color:#999;\\'>Logo</div>'">
                            </div>
                        ` : ''}
                    </div>

                    <hr class="document-separator">

                    <!-- Document Info -->
                    <div class="document-info">
                        <div class="doc-type-number">
                            <h3>${documentData.type.charAt(0).toUpperCase() + documentData.type.slice(1).replace('_', ' ')}</h3>
                            <div class="doc-number"># ${documentData.number}</div>
                        </div>
                        <div class="doc-date">Date: ${formatDateForDisplay(documentData.date)}</div>
                    </div>

                    <!-- Client Info -->
                    <div class="client-section">
                        <h4>BILL TO:</h4>
                        <div class="client-info">
                            ${documentData.clientName ? `<div class="client-name">${documentData.clientName}</div>` : ''}
                            ${documentData.clientAddress ? `<div class="client-address">${documentData.clientAddress.replace(/\n/g, '<br>')}</div>` : ''}
                            ${documentData.clientPhone ? `<div>Phone: ${documentData.clientPhone}</div>` : ''}
                            ${documentData.clientEmail ? `<div>Email: ${documentData.clientEmail}</div>` : ''}
                        </div>
                    </div>

                    <!-- Items Table -->
                    <div class="items-section">
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th style="text-align: left; width: 48%;">DESCRIPTION</th>
                                    <th style="text-align: center; width: 12%;">QTY</th>
                                    <th style="text-align: right; width: 20%;">UNIT PRICE</th>
                                    <th style="text-align: right; width: 20%;">AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${generateItemsHTML(documentData.items, documentData.business.currency)}
                            </tbody>
                        </table>
                    </div>

                    <!-- Totals -->
                    <div class="totals-section">
                        ${generateTotalsHTML(documentData.totals, documentData.business.currency)}
                    </div>

                    <!-- Notes -->
                    ${documentData.notes ? `
                        <div class="notes-section">
                            <h4>NOTES:</h4>
                            <div class="notes-content">${documentData.notes.replace(/\n/g, '<br>')}</div>
                        </div>
                    ` : ''}

                    <!-- Footer -->
                    <div class="document-footer" style="position: relative; margin-top: 30px;">
                        <div class="footer-message" style="text-align: ${documentData.business.signatureUrl ? 'left' : 'center'};">
                            Thank you for your business!
                        </div>
                        ${documentData.business.signatureUrl ? `
                            <div class="signature-area" style="position: absolute; bottom: 0; right: 0; text-align: center;">
                                <div style="width: 60px; height: 30px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; margin-bottom: 5px; background: white;">
                                    <img src="${documentData.business.signatureUrl}" 
                                         alt="Signature" 
                                         style="width: 100%; height: 100%; object-fit: contain;"
                                         onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;font-size:8px;color:#999;\\'>Signature</div>'">
                                </div>
                                <div style="font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 2px;">
                                    Authorized Signature
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            previewContainer.innerHTML = html;
        }

console.log('App.js loaded successfully with offline support');