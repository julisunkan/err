
// PWA Installation and Update Management

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        this.checkInstallation();
        this.setupInstallPrompt();
        this.setupUpdateCheck();
        this.addInstallButton();
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
