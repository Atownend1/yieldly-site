/**
 * Yieldly Demo Wizard
 * Multi-step form wizard for collecting detailed firm information
 */

class DemoWizard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentStep = 0;
        this.steps = [
            {
                title: "Basic Information",
                fields: [
                    { name: "name", label: "Full Name", type: "text", required: true },
                    { name: "email", label: "Work Email", type: "email", required: true }
                ]
            },
            {
                title: "Firm Details",
                fields: [
                    { name: "firm", label: "Law Firm Name", type: "text", required: true },
                    { name: "size", label: "Firm Size", type: "select", required: true, options: [
                        { value: "solo", label: "Solo Practitioner" },
                        { value: "small", label: "2-10 Solicitors" },
                        { value: "medium", label: "11-50 Solicitors" },
                        { value: "large", label: "50+ Solicitors" }
                    ]}
                ]
            },
            {
                title: "Current Challenges",
                fields: [
                    { name: "lockup_days", label: "Average Lock-up Period (days)", type: "select", required: true, options: [
                        { value: "30-60", label: "30-60 days" },
                        { value: "60-90", label: "60-90 days" },
                        { value: "90-120", label: "90-120 days" },
                        { value: "120+", label: "120+ days" }
                    ]},
                    { name: "biggest_challenge", label: "Biggest Cashflow Challenge", type: "select", required: true, options: [
                        { value: "slow_billing", label: "Slow billing process" },
                        { value: "aged_wip", label: "Aged WIP" },
                        { value: "client_payments", label: "Slow client payments" },
                        { value: "time_recording", label: "Poor time recording" },
                        { value: "write_offs", label: "High write-offs" }
                    ]}
                ]
            },
            {
                title: "Goals & Timeline",
                fields: [
                    { name: "target_improvement", label: "Target Improvement", type: "select", required: true, options: [
                        { value: "10-20", label: "10-20% reduction in lock-up" },
                        { value: "20-30", label: "20-30% reduction in lock-up" },
                        { value: "30-40", label: "30-40% reduction in lock-up" },
                        { value: "40+", label: "40%+ reduction in lock-up" }
                    ]},
                    { name: "timeline", label: "Implementation Timeline", type: "select", required: true, options: [
                        { value: "immediate", label: "Immediate (within 30 days)" },
                        { value: "quarter", label: "This quarter (3 months)" },
                        { value: "half_year", label: "Within 6 months" },
                        { value: "exploring", label: "Just exploring options" }
                    ]}
                ]
            }
        ];
        this.formData = {};
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        const step = this.steps[this.currentStep];
        const totalSteps = this.steps.length;
        
        this.container.innerHTML = `
            <div class="wizard-container">
                <div class="wizard-header">
                    <div class="wizard-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${((this.currentStep + 1) / totalSteps) * 100}%"></div>
                        </div>
                        <div class="progress-text">Step ${this.currentStep + 1} of ${totalSteps}</div>
                    </div>
                    <h3 class="wizard-title">${step.title}</h3>
                </div>
                
                <div class="wizard-content">
                    <form class="wizard-form" id="wizardForm">
                        ${step.fields.map(field => this.renderField(field)).join('')}
                        
                        <div class="wizard-actions">
                            ${this.currentStep > 0 ? '<button type="button" class="btn btn-secondary wizard-prev">Previous</button>' : ''}
                            ${this.currentStep < totalSteps - 1 
                                ? '<button type="button" class="btn btn-primary wizard-next">Next</button>'
                                : '<button type="submit" class="btn btn-primary wizard-submit">Get My Analysis</button>'
                            }
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    renderField(field) {
        const value = this.formData[field.name] || '';
        
        if (field.type === 'select') {
            return `
                <div class="form-group">
                    <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
                    <select id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>
                        <option value="">Select an option</option>
                        ${field.options.map(opt => 
                            `<option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>`
                        ).join('')}
                    </select>
                </div>
            `;
        } else {
            return `
                <div class="form-group">
                    <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
                    <input type="${field.type}" id="${field.name}" name="${field.name}" 
                           value="${value}" ${field.required ? 'required' : ''}>
                </div>
            `;
        }
    }

    attachEventListeners() {
        const form = document.getElementById('wizardForm');
        const nextBtn = document.querySelector('.wizard-next');
        const prevBtn = document.querySelector('.wizard-prev');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }
        
        if (form) {
            form.addEventListener('submit', (e) => this.submitForm(e));
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            if (this.currentStep < this.steps.length - 1) {
                this.currentStep++;
                this.render();
                this.attachEventListeners();
            }
        }
    }

    prevStep() {
        this.saveCurrentStepData();
        if (this.currentStep > 0) {
            this.currentStep--;
            this.render();
            this.attachEventListeners();
        }
    }

    validateCurrentStep() {
        const form = document.getElementById('wizardForm');
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#e74c3c';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });

        return isValid;
    }

    saveCurrentStepData() {
        const form = document.getElementById('wizardForm');
        const formData = new FormData(form);
        
        for (let [key, value] of formData.entries()) {
            this.formData[key] = value;
        }
    }

    async submitForm(e) {
        e.preventDefault();
        
        if (!this.validateCurrentStep()) {
            return;
        }
        
        this.saveCurrentStepData();
        
        // Show loading state
        const submitBtn = document.querySelector('.wizard-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Analyzing...';
        submitBtn.disabled = true;
        
        try {
            // Submit to Formspree
            const response = await fetch('https://formspree.io/f/mqalgldy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...this.formData,
                    form_type: 'demo_wizard',
                    submission_date: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                this.showSuccessMessage();
                
                // Track conversion
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'generate_lead', {
                        'event_category': 'engagement',
                        'event_label': 'demo_wizard_complete'
                    });
                }
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            submitBtn.textContent = 'Error - Try Again';
            submitBtn.disabled = false;
            setTimeout(() => {
                submitBtn.textContent = originalText;
            }, 3000);
        }
    }

    showSuccessMessage() {
        this.container.innerHTML = `
            <div class="wizard-success">
                <div class="success-icon">✅</div>
                <h3>Analysis Request Submitted!</h3>
                <p>Thank you for providing detailed information about your firm. Our team will prepare a personalized cashflow analysis and contact you within 24 hours.</p>
                <div class="success-next-steps">
                    <h4>What happens next:</h4>
                    <ul>
                        <li>We'll analyze your current cashflow challenges</li>
                        <li>Prepare a customized improvement plan</li>
                        <li>Schedule a brief call to discuss your results</li>
                        <li>Show you exactly how much working capital you could recover</li>
                    </ul>
                </div>
                <button class="btn btn-primary" onclick="location.reload()">Start Another Analysis</button>
            </div>
        `;
    }
}

// Initialize wizard when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if wizard container exists
    if (document.getElementById('demoWizard')) {
        window.demoWizard = new DemoWizard('demoWizard');
    }
});