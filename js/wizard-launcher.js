/**
 * Wizard Launcher Utility
 * Allows opening the demo wizard as a modal from anywhere on the site
 */

class WizardLauncher {
    constructor() {
        this.modalId = 'wizardModal';
        this.isInitialized = false;
    }

    // Launch wizard as a modal
    launchModal() {
        if (!this.isInitialized) {
            this.createModal();
            this.loadWizardScript();
        } else {
            this.showModal();
        }
    }

    // Create modal structure
    createModal() {
        const modal = document.createElement('div');
        modal.id = this.modalId;
        modal.className = 'wizard-modal';
        modal.innerHTML = `
            <div style="position: relative; width: 100%; max-width: 700px;">
                <button class="wizard-close" aria-label="Close">&times;</button>
                <div id="demoWizardModal">
                    <div style="text-align: center; padding: 3rem;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
                        <p>Loading detailed analysis wizard...</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add close functionality
        const closeBtn = modal.querySelector('.wizard-close');
        closeBtn.addEventListener('click', () => this.closeModal());
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    // Load wizard script dynamically
    async loadWizardScript() {
        try {
            // Load wizard CSS if not already loaded
            if (!document.querySelector('link[href*="demo-wizard.css"]')) {
                const cssLink = document.createElement('link');
                cssLink.rel = 'stylesheet';
                cssLink.href = 'css/demo-wizard.css';
                document.head.appendChild(cssLink);
            }

            // Load wizard JavaScript if not already loaded
            if (!window.DemoWizard) {
                await this.loadScript('js/demo-wizard.js');
            }

            // Initialize wizard in modal
            if (window.DemoWizard) {
                window.demoWizardModal = new DemoWizard('demoWizardModal');
                this.isInitialized = true;
                this.showModal();
            }
        } catch (error) {
            console.error('Failed to load wizard:', error);
            this.showError();
        }
    }

    // Load script dynamically
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Show modal
    showModal() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Track modal open
            if (typeof gtag !== 'undefined') {
                gtag('event', 'modal_open', {
                    'event_category': 'engagement',
                    'event_label': 'demo_wizard_modal'
                });
            }
        }
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Track modal close
            if (typeof gtag !== 'undefined') {
                gtag('event', 'modal_close', {
                    'event_category': 'engagement',
                    'event_label': 'demo_wizard_modal'
                });
            }
        }
    }

    // Show error message
    showError() {
        const container = document.getElementById('demoWizardModal');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <div style="font-size: 2rem; margin-bottom: 1rem; color: #e74c3c;">⚠️</div>
                    <h3>Unable to Load Wizard</h3>
                    <p>Please try refreshing the page or <a href="/wizard.html">visit our dedicated analysis page</a>.</p>
                </div>
            `;
        }
    }
}

// Global wizard launcher instance
window.wizardLauncher = new WizardLauncher();

// Convenient global function
window.launchDemoWizard = function() {
    window.wizardLauncher.launchModal();
};

// Auto-attach to elements with wizard launch attributes
document.addEventListener('DOMContentLoaded', function() {
    // Find all elements with data-launch-wizard attribute
    const wizardTriggers = document.querySelectorAll('[data-launch-wizard]');
    
    wizardTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            window.launchDemoWizard();
        });
    });
    
    // Also attach to elements with specific classes
    const specificTriggers = document.querySelectorAll('.launch-wizard, .demo-wizard-trigger');
    
    specificTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            window.launchDemoWizard();
        });
    });
});