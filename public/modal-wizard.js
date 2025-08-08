/**
 * Legal Finance Demo Wizard
 * 5-step modal wizard for Yieldly legal finance demo
 * Integrates with Netlify Functions and localStorage
 */

class LegalFinanceWizard {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 5;
        this.wizardData = {};
        this.modal = null;
        this.contentContainer = null;
        this.nextBtn = null;
        this.backBtn = null;
        
        this.steps = [
            {
                id: 'disclaimer',
                title: 'Demo Disclaimer & Privacy',
                validate: () => this.validateConsent()
            },
            {
                id: 'upload',
                title: 'Upload Invoice Data',
                validate: () => this.validateUpload()
            },
            {
                id: 'analysis',
                title: 'Overdue Analysis',
                validate: () => true
            },
            {
                id: 'reminder',
                title: 'Send Reminder Demo',
                validate: () => this.validateReminder()
            },
            {
                id: 'roi',
                title: 'ROI Results',
                validate: () => true
            }
        ];
        
        this.init();
    }
    
    init() {
        this.modal = document.getElementById('wizard-root');
        this.contentContainer = document.getElementById('wizard-content');
        this.nextBtn = document.getElementById('wizard-next');
        this.backBtn = document.getElementById('wizard-back');
        
        if (!this.modal || !this.contentContainer) {
            console.warn('Wizard elements not found');
            return;
        }
        
        this.attachEventListeners();
        this.setupAccessibility();
    }
    
    attachEventListeners() {
        // Close button
        const closeBtn = this.modal.querySelector('.wizard-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // Overlay click to close
        const overlay = this.modal.querySelector('.wizard-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.close());
        }
        
        // Navigation buttons
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }
        
        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => this.back());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.modal.style.display === 'flex') {
                if (e.key === 'Escape') {
                    this.close();
                } else if (e.key === 'Enter' && e.target.type !== 'textarea') {
                    e.preventDefault();
                    this.next();
                }
            }
        });
    }
    
    setupAccessibility() {
        // Trap focus within modal when open
        this.modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.modal.style.display === 'flex') {
                const focusableElements = this.modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        });
    }
    
    open() {
        this.currentStep = 0;
        this.wizardData = {};
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.renderStep();
        
        // Focus first interactive element
        setTimeout(() => {
            const firstInput = this.modal.querySelector('input, button, select');
            if (firstInput) firstInput.focus();
        }, 100);
        
        // Track opening
        this.trackEvent('wizard_opened', { step: this.currentStep });
    }
    
    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        this.trackEvent('wizard_closed', { step: this.currentStep });
    }
    
    next() {
        const currentStepData = this.steps[this.currentStep];
        
        if (!currentStepData.validate()) {
            return; // Validation failed
        }
        
        this.trackEvent('step_completed', { 
            step: this.currentStep, 
            step_name: currentStepData.id 
        });
        
        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            this.renderStep();
        } else {
            this.complete();
        }
    }
    
    back() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
            this.trackEvent('step_back', { 
                step: this.currentStep,
                step_name: this.steps[this.currentStep].id 
            });
        }
    }
    
    renderStep() {
        const step = this.steps[this.currentStep];
        const stepNumber = this.currentStep + 1;
        
        // Update title
        const title = this.modal.querySelector('#wizard-title');
        if (title) {
            title.textContent = `${step.title} (${stepNumber}/${this.totalSteps})`;
        }
        
        // Render step content
        this.contentContainer.innerHTML = this.getStepContent(step.id);
        
        // Update navigation buttons
        this.updateNavigation();
        
        // Run step-specific initialization
        this.initializeStep(step.id);
    }
    
    updateNavigation() {
        // Back button visibility
        if (this.currentStep === 0) {
            this.backBtn.style.display = 'none';
        } else {
            this.backBtn.style.display = 'block';
        }
        
        // Next button text
        if (this.currentStep === this.totalSteps - 1) {
            this.nextBtn.textContent = 'Start Trial';
        } else {
            this.nextBtn.textContent = 'Next';
        }
    }
    
    getStepContent(stepId) {
        switch (stepId) {
            case 'disclaimer':
                return this.getDisclaimerContent();
            case 'upload':
                return this.getUploadContent();
            case 'analysis':
                return this.getAnalysisContent();
            case 'reminder':
                return this.getReminderContent();
            case 'roi':
                return this.getROIContent();
            default:
                return '<p>Step not found</p>';
        }
    }
    
    getDisclaimerContent() {
        return `
            <div class="wizard-step active">
                <h3>Welcome to the Legal Finance Demo</h3>
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 6px; margin: 1.5rem 0;">
                    <h4>⚠️ Demo Disclaimer</h4>
                    <p><strong>This is a demonstration only.</strong> No real invoices will be processed, and no actual reminders will be sent unless you explicitly opt-in during the trial.</p>
                </div>
                
                <div style="background: #e3f2fd; padding: 1.5rem; border-radius: 6px; margin: 1.5rem 0;">
                    <h4>🔒 Privacy Notice</h4>
                    <p>Your demo data will be:</p>
                    <ul>
                        <li>Stored locally in your browser only</li>
                        <li>Used to calculate realistic ROI projections</li>
                        <li>Automatically deleted after the demo</li>
                        <li>Never shared with third parties</li>
                    </ul>
                    <p><small>For full privacy details, see our <a href="/trust" target="_blank">Trust & Privacy page</a>.</small></p>
                </div>
                
                <label style="display: flex; align-items: flex-start; gap: 0.75rem; margin: 1.5rem 0; cursor: pointer;">
                    <input type="checkbox" id="consent-checkbox" style="margin-top: 0.25rem;">
                    <span>I understand this is a demo and consent to processing my data for demonstration purposes only.</span>
                </label>
            </div>
        `;
    }
    
    getUploadContent() {
        return `
            <div class="wizard-step active">
                <h3>Upload Your Invoice Data</h3>
                <p>Upload a CSV file with your invoice data to see realistic ROI projections.</p>
                
                <div style="border: 2px dashed #ccc; padding: 2rem; text-align: center; border-radius: 8px; margin: 1.5rem 0;">
                    <input type="file" id="csv-upload" accept=".csv" style="display: none;">
                    <button type="button" onclick="document.getElementById('csv-upload').click()" style="background: var(--navy); color: white; padding: 1rem 2rem; border: none; border-radius: 4px; cursor: pointer;">
                        📄 Choose CSV File
                    </button>
                    <p style="margin-top: 1rem; color: #666;">Expected format: invoice_number, client_name, amount, due_date, status</p>
                </div>
                
                <div id="upload-status" style="margin: 1rem 0;"></div>
                
                <details style="margin: 1.5rem 0;">
                    <summary style="cursor: pointer; font-weight: bold;">Don't have a CSV? Use sample data</summary>
                    <div style="margin-top: 1rem;">
                        <button type="button" id="use-sample-data" style="background: var(--success); color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer;">
                            Use Sample Invoice Data
                        </button>
                        <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #666;">This will load realistic sample data for demonstration.</p>
                    </div>
                </details>
            </div>
        `;
    }
    
    getAnalysisContent() {
        const invoices = this.getStoredInvoices();
        const overdueTotal = this.calculateOverdueTotal(invoices);
        const overdueCount = invoices.filter(inv => inv.isOverdue).length;
        
        return `
            <div class="wizard-step active">
                <h3>Overdue Invoice Analysis</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">
                    <div style="background: #fee; padding: 1.5rem; border-radius: 6px; text-align: center;">
                        <h4 style="color: #d32f2f; margin: 0;">Overdue Amount</h4>
                        <p style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0;">£${overdueTotal.toLocaleString()}</p>
                    </div>
                    <div style="background: #fff3e0; padding: 1.5rem; border-radius: 6px; text-align: center;">
                        <h4 style="color: #f57c00; margin: 0;">Overdue Invoices</h4>
                        <p style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0;">${overdueCount}</p>
                    </div>
                </div>
                
                <div style="margin: 1.5rem 0;">
                    <h4>Overdue Invoices:</h4>
                    <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px;">
                        ${this.renderInvoiceList(invoices.filter(inv => inv.isOverdue))}
                    </div>
                </div>
                
                <div style="background: #e8f5e8; padding: 1.5rem; border-radius: 6px; margin: 1.5rem 0;">
                    <h4>💡 Recovery Opportunity</h4>
                    <p>With automated reminders, you could typically recover <strong>60-80%</strong> of overdue amounts within 30 days.</p>
                </div>
            </div>
        `;
    }
    
    getReminderContent() {
        const invoices = this.getStoredInvoices().filter(inv => inv.isOverdue);
        
        return `
            <div class="wizard-step active">
                <h3>Send Payment Reminder (Demo)</h3>
                <p>Select an overdue invoice to preview the reminder process:</p>
                
                <div style="margin: 1.5rem 0;">
                    <select id="invoice-select" style="width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px;">
                        <option value="">Choose an overdue invoice...</option>
                        ${invoices.map((inv, idx) => 
                            `<option value="${idx}">${inv.invoice_number} - ${inv.client_name} - £${inv.amount}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div id="reminder-preview" style="display: none; background: #f8f9fa; padding: 1.5rem; border-radius: 6px; margin: 1.5rem 0;">
                    <!-- Preview will be populated by JavaScript -->
                </div>
                
                <div id="reminder-actions" style="display: none; margin: 1.5rem 0;">
                    <button type="button" id="send-reminder-btn" style="background: var(--success); color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer;">
                        📧 Send Reminder (Demo)
                    </button>
                </div>
                
                <div id="reminder-result" style="margin: 1rem 0;"></div>
            </div>
        `;
    }
    
    getROIContent() {
        const invoices = this.getStoredInvoices();
        const overdueTotal = this.calculateOverdueTotal(invoices);
        const projectedRecovery = Math.round(overdueTotal * 0.7); // 70% recovery rate
        const monthlySavings = Math.round(projectedRecovery * 0.15); // 15% time savings
        
        return `
            <div class="wizard-step active">
                <h3>🎉 Your ROI Projection</h3>
                
                <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 2rem; border-radius: 8px; margin: 1.5rem 0; text-align: center;">
                    <h4 style="margin: 0; color: white;">Projected 12-Month ROI</h4>
                    <p style="font-size: 2.5rem; font-weight: bold; margin: 1rem 0;">£${(projectedRecovery * 12 - 6000).toLocaleString()}</p>
                    <p style="margin: 0; opacity: 0.9;">Net benefit after £500/month subscription</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0;">
                    <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 6px; text-align: center;">
                        <h5 style="color: #059669; margin: 0;">Monthly Recovery</h5>
                        <p style="font-size: 1.5rem; font-weight: bold; margin: 0.5rem 0;">£${projectedRecovery.toLocaleString()}</p>
                    </div>
                    <div style="background: #eff6ff; padding: 1.5rem; border-radius: 6px; text-align: center;">
                        <h5 style="color: #2563eb; margin: 0;">Time Saved</h5>
                        <p style="font-size: 1.5rem; font-weight: bold; margin: 0.5rem 0;">8-12 hrs/week</p>
                    </div>
                </div>
                
                <div style="background: #fef3c7; padding: 1.5rem; border-radius: 6px; margin: 1.5rem 0;">
                    <h4>✨ What happens next?</h4>
                    <ul style="margin: 0.5rem 0;">
                        <li>14-day free trial with your real data</li>
                        <li>Personal onboarding call within 24 hours</li>
                        <li>Full integration with your existing systems</li>
                        <li>No setup fees or long-term contracts</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    initializeStep(stepId) {
        switch (stepId) {
            case 'upload':
                this.initializeUploadStep();
                break;
            case 'reminder':
                this.initializeReminderStep();
                break;
            default:
                break;
        }
    }
    
    initializeUploadStep() {
        const fileInput = document.getElementById('csv-upload');
        const sampleDataBtn = document.getElementById('use-sample-data');
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
        
        if (sampleDataBtn) {
            sampleDataBtn.addEventListener('click', () => this.loadSampleData());
        }
    }
    
    initializeReminderStep() {
        const invoiceSelect = document.getElementById('invoice-select');
        const sendBtn = document.getElementById('send-reminder-btn');
        
        if (invoiceSelect) {
            invoiceSelect.addEventListener('change', (e) => this.previewReminder(e.target.value));
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendReminder());
        }
    }
    
    validateConsent() {
        const checkbox = document.getElementById('consent-checkbox');
        if (!checkbox || !checkbox.checked) {
            alert('Please accept the demo disclaimer and privacy notice to continue.');
            return false;
        }
        return true;
    }
    
    validateUpload() {
        const invoices = this.getStoredInvoices();
        if (!invoices || invoices.length === 0) {
            alert('Please upload invoice data or use sample data to continue.');
            return false;
        }
        return true;
    }
    
    validateReminder() {
        // Always valid - reminder step is demonstration only
        return true;
    }
    
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const statusDiv = document.getElementById('upload-status');
        statusDiv.innerHTML = '<p>🔄 Processing CSV file...</p>';
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                const invoices = this.parseCSV(csvText);
                this.storeInvoices(invoices);
                statusDiv.innerHTML = `<p style="color: green;">✅ Successfully loaded ${invoices.length} invoices</p>`;
            } catch (error) {
                statusDiv.innerHTML = `<p style="color: red;">❌ Error parsing CSV: ${error.message}</p>`;
            }
        };
        reader.readAsText(file);
    }
    
    loadSampleData() {
        const sampleInvoices = this.generateSampleData();
        
        this.storeInvoices(sampleInvoices);
        const statusDiv = document.getElementById('upload-status');
        statusDiv.innerHTML = '<p style="color: green;">✅ Sample data loaded successfully</p>';
    }
    
    generateSampleData() {
        const today = new Date();
        const clients = ['ABC Corp', 'XYZ Ltd', 'Tech Solutions', 'Global Services', 'Prime Industries', 'Smith & Partners Ltd', 'Global Corp', 'Local Business', 'Tech Startup', 'Family Law Client'];
        
        const sampleInvoices = [];
        
        // Generate 20 invoices ensuring some are overdue
        for (let i = 1; i <= 20; i++) {
            const amount = Math.floor(Math.random() * 9000) + 1000;
            let dueDate = new Date(today);
            let status;
            
            if (i <= 5) {
                // First 5 invoices: guaranteed overdue for demo
                dueDate.setDate(today.getDate() - (10 + i * 5)); // 15-35 days overdue
                status = 'overdue';
            } else if (i <= 10) {
                // Next 5: pending
                dueDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
                status = 'pending';
            } else {
                // Rest: mix of paid and pending
                dueDate.setDate(today.getDate() - Math.floor(Math.random() * 60) + 30);
                status = Math.random() < 0.5 ? 'paid' : 'pending';
            }
            
            sampleInvoices.push({
                invoice_number: `INV-${String(i).padStart(4, '0')}`,
                client_name: clients[Math.floor(Math.random() * clients.length)],
                amount: amount,
                due_date: dueDate.toISOString().split('T')[0],
                status: status,
                isOverdue: this.isOverdue(dueDate.toISOString().split('T')[0], status)
            });
        }
        
        return sampleInvoices;
    }
    
    parseCSV(csvText) {
        // Simple CSV parser - in production, use a library like PapaParse
        const lines = csvText.trim().split('\n');
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const invoices = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const invoice = {};
            
            headers.forEach((header, index) => {
                invoice[header] = values[index] || '';
            });
            
            // Standardize and validate
            if (invoice.invoice_number && invoice.amount) {
                invoices.push({
                    invoice_number: invoice.invoice_number,
                    client_name: invoice.client_name || 'Unknown Client',
                    amount: parseFloat(invoice.amount.replace(/[£,]/g, '')) || 0,
                    due_date: invoice.due_date,
                    status: invoice.status || 'pending',
                    isOverdue: this.isOverdue(invoice.due_date, invoice.status)
                });
            }
        }
        
        return invoices;
    }
    
    isOverdue(dueDate, status) {
        if (status === 'paid') return false;
        const due = new Date(dueDate);
        const today = new Date();
        return due < today;
    }
    
    storeInvoices(invoices) {
        localStorage.setItem('demo_invoices', JSON.stringify(invoices));
    }
    
    getStoredInvoices() {
        const stored = localStorage.getItem('demo_invoices');
        return stored ? JSON.parse(stored) : [];
    }
    
    calculateOverdueTotal(invoices) {
        return invoices
            .filter(inv => inv.isOverdue)
            .reduce((total, inv) => total + inv.amount, 0);
    }
    
    renderInvoiceList(invoices) {
        if (!invoices.length) {
            return '<p style="padding: 1rem; text-align: center; color: #666;">No overdue invoices found.</p>';
        }
        
        return `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f5f5f5;">
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #ddd;">Invoice</th>
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #ddd;">Client</th>
                        <th style="padding: 0.75rem; text-align: right; border-bottom: 1px solid #ddd;">Amount</th>
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #ddd;">Due Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoices.map(inv => `
                        <tr>
                            <td style="padding: 0.75rem; border-bottom: 1px solid #eee;">${inv.invoice_number}</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid #eee;">${inv.client_name}</td>
                            <td style="padding: 0.75rem; text-align: right; border-bottom: 1px solid #eee;">£${inv.amount.toLocaleString()}</td>
                            <td style="padding: 0.75rem; border-bottom: 1px solid #eee;">${inv.due_date}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    previewReminder(invoiceIndex) {
        if (!invoiceIndex) {
            document.getElementById('reminder-preview').style.display = 'none';
            document.getElementById('reminder-actions').style.display = 'none';
            return;
        }
        
        const invoices = this.getStoredInvoices().filter(inv => inv.isOverdue);
        const invoice = invoices[parseInt(invoiceIndex)];
        
        if (!invoice) return;
        
        const previewDiv = document.getElementById('reminder-preview');
        const actionsDiv = document.getElementById('reminder-actions');
        
        previewDiv.innerHTML = `
            <h4>Email Preview</h4>
            <div style="border: 1px solid #ddd; padding: 1rem; background: white; border-radius: 4px;">
                <p><strong>To:</strong> billing@${invoice.client_name.toLowerCase().replace(/\s+/g, '')}.com</p>
                <p><strong>Subject:</strong> Payment Reminder - Invoice ${invoice.invoice_number}</p>
                <hr style="margin: 1rem 0;">
                <p>Dear ${invoice.client_name},</p>
                <p>This is a friendly reminder that invoice ${invoice.invoice_number} for £${invoice.amount.toLocaleString()} was due on ${invoice.due_date}.</p>
                <p>Please arrange payment at your earliest convenience. If you have any questions, please don't hesitate to contact us.</p>
                <p>Best regards,<br>Your Legal Team</p>
            </div>
        `;
        
        previewDiv.style.display = 'block';
        actionsDiv.style.display = 'block';
    }
    
    async sendReminder() {
        const resultDiv = document.getElementById('reminder-result');
        const sendBtn = document.getElementById('send-reminder-btn');
        
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            resultDiv.innerHTML = `
                <div style="background: #e8f5e8; padding: 1rem; border-radius: 4px; border-left: 4px solid #4caf50;">
                    <h5 style="margin: 0; color: #2e7d32;">✅ Reminder Sent Successfully (Demo)</h5>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">In a real scenario, this would send via your email system and log the activity.</p>
                </div>
            `;
            
            this.trackEvent('demo_reminder_sent', {
                step: this.currentStep,
                demo_only: true
            });
            
        } catch (error) {
            resultDiv.innerHTML = `
                <div style="background: #ffebee; padding: 1rem; border-radius: 4px; border-left: 4px solid #f44336;">
                    <h5 style="margin: 0; color: #c62828;">❌ Demo Error</h5>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">This is a simulated error for demonstration.</p>
                </div>
            `;
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = '📧 Send Another Reminder';
        }
    }
    
    async complete() {
        try {
            // Track completion
            this.trackEvent('wizard_completed', {
                total_steps: this.totalSteps,
                completion_time: Date.now()
            });
            
            // Submit lead data
            await this.submitLead();
            
            // Show thank you
            this.showThankYou();
            
        } catch (error) {
            console.error('Error completing wizard:', error);
            alert('There was an error processing your request. Please try again.');
        }
    }
    
    async submitLead() {
        // In a real implementation, this would call /api/lead-export
        const leadData = {
            timestamp: new Date().toISOString(),
            source: 'demo_wizard',
            demo_data: this.wizardData,
            user_agent: navigator.userAgent
        };
        
        // Simulate API call
        console.log('Lead data:', leadData);
    }
    
    showThankYou() {
        this.contentContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem 0;">
                <h3>🎉 Thank You!</h3>
                <p style="font-size: 1.2rem; margin: 1.5rem 0;">Your demo is complete. Our team will contact you within 24 hours to discuss your personalized ROI projections.</p>
                
                <div style="background: #e3f2fd; padding: 1.5rem; border-radius: 6px; margin: 2rem 0;">
                    <h4>What's Next?</h4>
                    <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
                        <li>Personal onboarding call scheduled</li>
                        <li>14-day free trial activated</li>
                        <li>Custom integration assessment</li>
                        <li>ROI tracking and reporting setup</li>
                    </ul>
                </div>
                
                <button type="button" onclick="window.yieldlyWizard.close()" style="background: var(--navy); color: white; padding: 1rem 2rem; border: none; border-radius: 4px; cursor: pointer; font-size: 1.1rem;">
                    Close Demo
                </button>
            </div>
        `;
        
        // Hide navigation buttons
        this.nextBtn.style.display = 'none';
        this.backBtn.style.display = 'none';
    }
    
    trackEvent(eventName, eventData = {}) {
        // Push to GTM dataLayer if available
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'yieldly_wizard',
                event_name: eventName,
                event_category: 'wizard',
                ...eventData
            });
        }
        
        // Console log for debugging
        console.log('Wizard Event:', eventName, eventData);
    }
}

// Global function to open wizard (called from button clicks)
function openYieldlyWizard() {
    if (!window.yieldlyWizard) {
        window.yieldlyWizard = new LegalFinanceWizard();
    }
    window.yieldlyWizard.open();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create global instance
    window.yieldlyWizard = new LegalFinanceWizard();
    
    // Make sure openYieldlyWizard is globally available
    window.openYieldlyWizard = openYieldlyWizard;
});