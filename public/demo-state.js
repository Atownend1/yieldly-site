/**
 * Demo State Management
 * LocalStorage helper functions for Yieldly legal finance demo
 */

const STORAGE_KEYS = {
    INVOICES: 'yieldly_demo_invoices',
    USER_DATA: 'yieldly_demo_user_data',
    WIZARD_STATE: 'yieldly_wizard_state',
    SETTINGS: 'yieldly_demo_settings',
    SESSION: 'yieldly_demo_session'
};

// Storage expiry (24 hours for demo data)
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000;

/**
 * Generic storage functions with expiry
 */
function setWithExpiry(key, value, ttl = STORAGE_EXPIRY) {
    const now = new Date();
    const item = {
        value: value,
        expiry: now.getTime() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
        return null;
    }
    
    try {
        const item = JSON.parse(itemStr);
        const now = new Date();
        
        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        
        return item.value;
    } catch (e) {
        localStorage.removeItem(key);
        return null;
    }
}

/**
 * Invoice management functions
 */
function saveInvoices(invoices) {
    if (!Array.isArray(invoices)) {
        throw new Error('Invoices must be an array');
    }
    
    const processedInvoices = invoices.map(invoice => ({
        ...invoice,
        id: invoice.id || generateId(),
        timestamp: invoice.timestamp || new Date().toISOString(),
        isOverdue: isInvoiceOverdue(invoice.due_date, invoice.status)
    }));
    
    setWithExpiry(STORAGE_KEYS.INVOICES, processedInvoices);
    
    // Update session stats
    updateSessionStats();
    
    return processedInvoices;
}

function getInvoices() {
    const invoices = getWithExpiry(STORAGE_KEYS.INVOICES) || [];
    
    // Recalculate overdue status in case dates have changed
    return invoices.map(invoice => ({
        ...invoice,
        isOverdue: isInvoiceOverdue(invoice.due_date, invoice.status)
    }));
}

function addInvoice(invoice) {
    const invoices = getInvoices();
    const newInvoice = {
        ...invoice,
        id: generateId(),
        timestamp: new Date().toISOString(),
        isOverdue: isInvoiceOverdue(invoice.due_date, invoice.status)
    };
    
    invoices.push(newInvoice);
    saveInvoices(invoices);
    
    return newInvoice;
}

function updateInvoice(invoiceId, updates) {
    const invoices = getInvoices();
    const index = invoices.findIndex(inv => inv.id === invoiceId);
    
    if (index === -1) {
        throw new Error('Invoice not found');
    }
    
    invoices[index] = {
        ...invoices[index],
        ...updates,
        isOverdue: isInvoiceOverdue(
            updates.due_date || invoices[index].due_date,
            updates.status || invoices[index].status
        )
    };
    
    saveInvoices(invoices);
    return invoices[index];
}

function deleteInvoice(invoiceId) {
    const invoices = getInvoices();
    const filtered = invoices.filter(inv => inv.id !== invoiceId);
    saveInvoices(filtered);
}

/**
 * Calculate overdue total
 */
function getOverdueTotal() {
    const invoices = getInvoices();
    return invoices
        .filter(inv => inv.isOverdue)
        .reduce((total, inv) => total + (parseFloat(inv.amount) || 0), 0);
}

/**
 * Get invoice statistics
 */
function getInvoiceStats() {
    const invoices = getInvoices();
    const overdue = invoices.filter(inv => inv.isOverdue);
    const paid = invoices.filter(inv => inv.status === 'paid');
    const pending = invoices.filter(inv => inv.status === 'pending' && !inv.isOverdue);
    
    return {
        total: invoices.length,
        overdue: overdue.length,
        paid: paid.length,
        pending: pending.length,
        overdueAmount: overdue.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0),
        totalAmount: invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0),
        paidAmount: paid.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0)
    };
}

/**
 * User data management
 */
function saveUserData(userData) {
    setWithExpiry(STORAGE_KEYS.USER_DATA, userData);
    updateSessionStats();
}

function getUserData() {
    return getWithExpiry(STORAGE_KEYS.USER_DATA) || {};
}

function updateUserData(updates) {
    const current = getUserData();
    const updated = { ...current, ...updates };
    saveUserData(updated);
    return updated;
}

/**
 * Wizard state management
 */
function saveWizardState(step, data) {
    const wizardState = {
        currentStep: step,
        stepData: data,
        timestamp: new Date().toISOString(),
        completed: step >= 4 // Assuming 5 steps (0-4)
    };
    
    setWithExpiry(STORAGE_KEYS.WIZARD_STATE, wizardState);
}

function getWizardState() {
    return getWithExpiry(STORAGE_KEYS.WIZARD_STATE) || {
        currentStep: 0,
        stepData: {},
        completed: false
    };
}

function clearWizardState() {
    localStorage.removeItem(STORAGE_KEYS.WIZARD_STATE);
}

/**
 * Demo settings
 */
function saveSettings(settings) {
    const currentSettings = getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    setWithExpiry(STORAGE_KEYS.SETTINGS, updatedSettings, 7 * 24 * 60 * 60 * 1000); // 7 days
}

function getSettings() {
    return getWithExpiry(STORAGE_KEYS.SETTINGS) || {
        roiMultiplier: 0.7, // 70% recovery rate
        reminderEnabled: true,
        emailSimulation: true,
        analyticsEnabled: true
    };
}

/**
 * Session management
 */
function initSession() {
    const sessionId = generateSessionId();
    const session = {
        id: sessionId,
        startTime: new Date().toISOString(),
        pageViews: 1,
        events: [],
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    setWithExpiry(STORAGE_KEYS.SESSION, session, 4 * 60 * 60 * 1000); // 4 hours
    return session;
}

function getSession() {
    let session = getWithExpiry(STORAGE_KEYS.SESSION);
    if (!session) {
        session = initSession();
    }
    return session;
}

function updateSessionStats() {
    const session = getSession();
    const invoiceStats = getInvoiceStats();
    const userData = getUserData();
    
    session.lastActivity = new Date().toISOString();
    session.invoiceCount = invoiceStats.total;
    session.overdueAmount = invoiceStats.overdueAmount;
    session.userEmail = userData.email;
    
    setWithExpiry(STORAGE_KEYS.SESSION, session, 4 * 60 * 60 * 1000);
}

function logEvent(eventName, eventData = {}) {
    const session = getSession();
    const event = {
        name: eventName,
        data: eventData,
        timestamp: new Date().toISOString()
    };
    
    session.events = session.events || [];
    session.events.push(event);
    
    // Keep only last 50 events
    if (session.events.length > 50) {
        session.events = session.events.slice(-50);
    }
    
    setWithExpiry(STORAGE_KEYS.SESSION, session, 4 * 60 * 60 * 1000);
}

/**
 * Purge all demo data
 */
function purgeDemo() {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    
    // Also clear any other yieldly-related items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('yieldly')) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('Demo data purged');
}

/**
 * Export demo data
 */
function exportDemoData() {
    const exportData = {
        invoices: getInvoices(),
        userData: getUserData(),
        wizardState: getWizardState(),
        settings: getSettings(),
        session: getSession(),
        stats: getInvoiceStats(),
        exportedAt: new Date().toISOString()
    };
    
    return exportData;
}

/**
 * Import demo data
 */
function importDemoData(data) {
    try {
        if (data.invoices) saveInvoices(data.invoices);
        if (data.userData) saveUserData(data.userData);
        if (data.wizardState) setWithExpiry(STORAGE_KEYS.WIZARD_STATE, data.wizardState);
        if (data.settings) saveSettings(data.settings);
        
        return true;
    } catch (error) {
        console.error('Failed to import demo data:', error);
        return false;
    }
}

/**
 * Helper functions
 */
function isInvoiceOverdue(dueDate, status) {
    if (status === 'paid') return false;
    
    try {
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        return due < today;
    } catch (e) {
        return false;
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateSessionId() {
    return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 8);
}

/**
 * Sample data generator
 */
function generateSampleInvoices() {
    const today = new Date();
    const clients = ['ABC Corp', 'XYZ Ltd', 'Tech Solutions', 'Global Services', 'Prime Industries', 'Smith & Partners Ltd', 'Global Corp', 'Local Business', 'Tech Startup', 'Family Law Client'];
    
    const invoices = [];
    
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
        
        invoices.push({
            invoice_number: `INV-${String(i).padStart(4, '0')}`,
            client_name: clients[Math.floor(Math.random() * clients.length)],
            amount: amount,
            due_date: dueDate.toISOString().split('T')[0],
            status: status,
            created_date: new Date(today.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
    }
    
    return saveInvoices(invoices);
}

// Initialize session on load
document.addEventListener('DOMContentLoaded', function() {
    getSession(); // This will create a session if none exists
});

// Make functions globally available
window.demoState = {
    saveInvoices,
    getInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getOverdueTotal,
    getInvoiceStats,
    saveUserData,
    getUserData,
    updateUserData,
    saveWizardState,
    getWizardState,
    clearWizardState,
    saveSettings,
    getSettings,
    getSession,
    logEvent,
    purgeDemo,
    exportDemoData,
    importDemoData,
    generateSampleInvoices
};