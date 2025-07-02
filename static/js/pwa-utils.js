
// PWA Installation and Update Management

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.offlineQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        this.init();
    }

    init() {
        this.checkInstallation();
        this.setupInstallPrompt();
        this.setupUpdateCheck();
        this.addInstallButton();
        this.setupOfflineSupport();
    }

    checkInstallation() {
        // Check if app is installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
        }
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallOption();
        });

        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallOption();
            this.showToast('App installed successfully!', 'success');
        });
    }

    setupUpdateCheck() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                this.showToast('App updated! Please refresh the page.', 'info');
            });
        }
    }

    addInstallButton() {
        if (!this.isInstalled && !window.matchMedia('(display-mode: standalone)').matches) {
            const navbar = document.querySelector('.navbar-nav');
            if (navbar) {
                const installItem = document.createElement('li');
                installItem.className = 'nav-item';
                installItem.innerHTML = `
                    <a class="nav-link" href="#" id="pwa-install-btn" style="display: none;">
                        <i class="fas fa-download me-1"></i>Install App
                    </a>
                `;
                navbar.appendChild(installItem);

                document.getElementById('pwa-install-btn').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.promptInstall();
                });
            }
        }
    }

    showInstallOption() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.style.display = 'block';
        }
    }

    hideInstallOption() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    async promptInstall() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const result = await this.deferredPrompt.userChoice;
            
            if (result.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            
            this.deferredPrompt = null;
            this.hideInstallOption();
        }
    }

    setupOfflineSupport() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showOnlineStatus();
            this.syncOfflineQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineStatus();
        });

        // Show initial status
        if (!this.isOnline) {
            this.showOfflineStatus();
        }
    }

    showOnlineStatus() {
        this.removeOfflineIndicator();
        this.showToast('You\'re back online! Syncing data...', 'success');
    }

    showOfflineStatus() {
        this.addOfflineIndicator();
        this.showToast('You\'re offline. Some features may be limited.', 'warning');
    }

    addOfflineIndicator() {
        // Remove existing indicator
        this.removeOfflineIndicator();
        
        // Create offline indicator
        const indicator = document.createElement('div');
        indicator.id = 'offline-indicator';
        indicator.innerHTML = `
            <div class="alert alert-warning position-fixed top-0 start-50 translate-middle-x mt-2" style="z-index: 9999;">
                <i class="fas fa-wifi-slash me-2"></i>
                You're offline - Limited functionality available
            </div>
        `;
        document.body.appendChild(indicator);
    }

    removeOfflineIndicator() {
        const existing = document.getElementById('offline-indicator');
        if (existing) {
            existing.remove();
        }
    }

    queueOfflineAction(action) {
        this.offlineQueue.push({
            ...action,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
    }

    async syncOfflineQueue() {
        if (this.offlineQueue.length === 0) return;

        const queue = [...this.offlineQueue];
        this.offlineQueue = [];
        localStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));

        for (const action of queue) {
            try {
                await this.processOfflineAction(action);
            } catch (error) {
                console.error('Failed to sync offline action:', error);
                // Re-queue failed actions
                this.queueOfflineAction(action);
            }
        }
    }

    async processOfflineAction(action) {
        switch (action.type) {
            case 'saveSettings':
                await fetch('/api/save-settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(action.data)
                });
                break;
            case 'saveClient':
                await fetch('/api/save-client', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(action.data)
                });
                break;
            default:
                console.warn('Unknown offline action type:', action.type);
        }
    }

    isOffline() {
        return !this.isOnline;
    }

    showToast(message, type = 'info') {
        // Use existing toast functionality if available
        if (window.docGenerator && window.docGenerator.showToast) {
            window.docGenerator.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize PWA Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.pwaManager = new PWAManager();
});
