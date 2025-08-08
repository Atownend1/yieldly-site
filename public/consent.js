/**
 * GDPR Consent Management
 * Simple consent management for Yieldly website
 */

class ConsentManager {
    constructor() {
        this.consentKey = 'yieldly_consent';
        this.consentData = this.getStoredConsent();
        this.bannerShown = false;
        
        this.init();
    }
    
    init() {
        // Only show banner if no consent decision has been made
        if (!this.consentData || !this.consentData.timestamp) {
            this.showConsentBanner();
        } else if (this.consentData.analytics) {
            // If analytics consent given, initialize tracking
            this.initializeAnalytics();
        }
        
        // Check if consent is expired (1 year)
        if (this.consentData && this.isConsentExpired()) {
            this.clearConsent();
            this.showConsentBanner();
        }
    }
    
    showConsentBanner() {
        if (this.bannerShown) return;
        
        const banner = document.createElement('div');
        banner.id = 'consent-banner';
        banner.innerHTML = `
            <div style="
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: #1e3a8a;
                color: white;
                padding: 1rem;
                z-index: 10000;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                font-family: 'Lato', Arial, sans-serif;
                line-height: 1.5;
            ">
                <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 300px;">
                        <p style="margin: 0; font-size: 0.95rem;">
                            <strong>🍪 We use cookies</strong> to improve your experience and analyze site usage. 
                            Essential cookies are always active. 
                            <a href="/trust" style="color: #93c5fd; text-decoration: underline;" target="_blank">Learn more</a>
                        </p>
                    </div>
                    <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
                        <button id="consent-decline" style="
                            background: transparent;
                            border: 1px solid white;
                            color: white;
                            padding: 0.5rem 1rem;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 0.9rem;
                        ">Essential Only</button>
                        <button id="consent-accept" style="
                            background: #10b981;
                            border: none;
                            color: white;
                            padding: 0.5rem 1rem;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 0.9rem;
                        ">Accept All</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        this.bannerShown = true;
        
        // Add event listeners
        document.getElementById('consent-accept').addEventListener('click', () => {
            this.setConsent(true);
        });
        
        document.getElementById('consent-decline').addEventListener('click', () => {
            this.setConsent(false);
        });
        
        // Track banner shown
        this.trackEvent('consent_banner_shown');
    }
    
    setConsent(analyticsConsent) {
        const consent = {
            essential: true, // Always true
            analytics: analyticsConsent,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        localStorage.setItem(this.consentKey, JSON.stringify(consent));
        this.consentData = consent;
        
        // Remove banner
        const banner = document.getElementById('consent-banner');
        if (banner) {
            banner.remove();
        }
        
        // Initialize analytics if consented
        if (analyticsConsent) {
            this.initializeAnalytics();
        } else {
            this.disableAnalytics();
        }
        
        // Track consent decision
        this.trackEvent('consent_decision', {
            analytics: analyticsConsent,
            essential: true
        });
        
        // Show confirmation message
        this.showConsentConfirmation(analyticsConsent);
    }
    
    showConsentConfirmation(analyticsConsent) {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            z-index: 10001;
            font-family: 'Lato', Arial, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 350px;
            animation: slideIn 0.3s ease-out;
        `;
        
        message.innerHTML = `
            <div>
                <strong>✓ Preferences saved</strong><br>
                <small>${analyticsConsent ? 'Analytics enabled' : 'Only essential cookies active'}</small>
            </div>
        `;
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(message);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            message.remove();
            style.remove();
        }, 3000);
    }
    
    initializeAnalytics() {
        // Enable Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
        
        // Enable Microsoft Clarity
        if (typeof clarity !== 'undefined') {
            // Clarity is already loaded, it will track automatically
        }
        
        // Initialize GTM push functions
        if (window.gtmPush) {
            // GTM is already available
        }
        
        console.log('Analytics initialized with user consent');
    }
    
    disableAnalytics() {
        // Disable Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
        
        // Disable Microsoft Clarity (if possible)
        if (typeof clarity !== 'undefined') {
            try {
                clarity('consent', false);
            } catch (e) {
                // Clarity may not support consent API
            }
        }
        
        console.log('Analytics disabled per user preference');
    }
    
    getStoredConsent() {
        try {
            const stored = localStorage.getItem(this.consentKey);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    }
    
    isConsentExpired() {
        if (!this.consentData || !this.consentData.timestamp) {
            return true;
        }
        
        const consentDate = new Date(this.consentData.timestamp);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        return consentDate < oneYearAgo;
    }
    
    clearConsent() {
        localStorage.removeItem(this.consentKey);
        this.consentData = null;
    }
    
    hasConsent(type = 'analytics') {
        return this.consentData && this.consentData[type] === true;
    }
    
    trackEvent(eventName, data = {}) {
        // Only track if analytics consent given
        if (this.hasConsent('analytics')) {
            if (window.gtmPush) {
                window.gtmPush.pushToGTM(eventName, {
                    category: 'consent',
                    ...data
                });
            }
        }
    }
    
    // Public API for managing consent
    showPreferences() {
        const modal = document.createElement('div');
        modal.id = 'consent-preferences-modal';
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                z-index: 10002;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            ">
                <div style="
                    background: white;
                    border-radius: 8px;
                    padding: 2rem;
                    max-width: 500px;
                    width: 100%;
                    max-height: 80vh;
                    overflow-y: auto;
                    font-family: 'Lato', Arial, sans-serif;
                ">
                    <h3 style="margin: 0 0 1.5rem 0; color: #1e3a8a;">Cookie Preferences</h3>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: #f8f9fa; border-radius: 6px; margin-bottom: 1rem;">
                            <input type="checkbox" checked disabled style="pointer-events: none;">
                            <div>
                                <strong>Essential Cookies</strong><br>
                                <small style="color: #666;">Required for the website to function. Always active.</small>
                            </div>
                        </label>
                        
                        <label style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: #f8f9fa; border-radius: 6px; cursor: pointer;">
                            <input type="checkbox" id="analytics-consent" ${this.hasConsent('analytics') ? 'checked' : ''}>
                            <div>
                                <strong>Analytics Cookies</strong><br>
                                <small style="color: #666;">Help us understand how visitors use our website.</small>
                            </div>
                        </label>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button id="cancel-preferences" style="
                            background: transparent;
                            border: 1px solid #ccc;
                            padding: 0.75rem 1.5rem;
                            border-radius: 4px;
                            cursor: pointer;
                        ">Cancel</button>
                        <button id="save-preferences" style="
                            background: #1e3a8a;
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: 600;
                        ">Save Preferences</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('cancel-preferences').addEventListener('click', () => {
            modal.remove();
        });
        
        document.getElementById('save-preferences').addEventListener('click', () => {
            const analyticsCheckbox = document.getElementById('analytics-consent');
            this.setConsent(analyticsCheckbox.checked);
            modal.remove();
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// Initialize consent manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.consentManager = new ConsentManager();
});

// Global function to show preferences
window.showCookiePreferences = function() {
    if (window.consentManager) {
        window.consentManager.showPreferences();
    }
};

// Export for use in other scripts
window.ConsentManager = ConsentManager;