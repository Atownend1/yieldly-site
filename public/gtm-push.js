/**
 * GTM DataLayer Helper Functions
 * Centralized GTM event tracking for Yieldly website
 */

// Ensure dataLayer exists
window.dataLayer = window.dataLayer || [];

/**
 * Generic GTM event push function
 */
function pushToGTM(eventName, eventData = {}) {
    const gtmEvent = {
        event: 'yieldly_event',
        event_name: eventName,
        event_category: eventData.category || 'general',
        event_label: eventData.label || '',
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        page_title: document.title,
        ...eventData
    };
    
    window.dataLayer.push(gtmEvent);
    
    // Also send to our tracking API if available
    if (window.fetch) {
        sendToTrackingAPI(eventName, gtmEvent);
    }
    
    console.log('GTM Event:', eventName, gtmEvent);
}

/**
 * Send event to our tracking API
 */
async function sendToTrackingAPI(eventName, eventData) {
    try {
        const userEmail = getUserEmail(); // Try to get user email from forms/localStorage
        
        await fetch('/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_name: eventName,
                event_data: eventData,
                email: userEmail,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.log('Tracking API not available:', error.message);
    }
}

/**
 * Try to get user email from various sources
 */
function getUserEmail() {
    // Check form inputs
    const emailInputs = document.querySelectorAll('input[type="email"]');
    for (let input of emailInputs) {
        if (input.value && input.value.includes('@')) {
            return input.value;
        }
    }
    
    // Check localStorage
    try {
        const storedData = localStorage.getItem('demo_user_data');
        if (storedData) {
            const userData = JSON.parse(storedData);
            return userData.email;
        }
    } catch (e) {
        // Ignore
    }
    
    return null;
}

/**
 * Form submission tracking
 */
function pushFormSubmit(formType = 'contact', formData = {}) {
    pushToGTM('form_submit', {
        category: 'engagement',
        label: formType,
        form_type: formType,
        form_data: formData
    });
}

/**
 * Wizard step tracking
 */
function pushStepEvent(stepNumber, stepName, action = 'view') {
    pushToGTM('wizard_step', {
        category: 'wizard',
        label: `step_${stepNumber}_${action}`,
        step_number: stepNumber,
        step_name: stepName,
        action: action
    });
}

/**
 * Trial start tracking
 */
function pushTrialStart(source = 'website') {
    pushToGTM('trial_start', {
        category: 'conversion',
        label: source,
        source: source,
        value: 500 // Monthly subscription value
    });
}

/**
 * Demo completion tracking
 */
function pushDemoComplete(demoType = 'wizard', results = {}) {
    pushToGTM('demo_complete', {
        category: 'engagement',
        label: demoType,
        demo_type: demoType,
        demo_results: results
    });
}

/**
 * Page view tracking with enhanced data
 */
function pushPageView(pageData = {}) {
    pushToGTM('page_view', {
        category: 'navigation',
        label: window.location.pathname,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        ...pageData
    });
}

/**
 * Button/link click tracking
 */
function pushClickEvent(elementType, elementText, destination = '') {
    pushToGTM('click', {
        category: 'engagement',
        label: elementText,
        element_type: elementType,
        element_text: elementText,
        destination: destination
    });
}

/**
 * Scroll depth tracking
 */
function pushScrollDepth(percentage) {
    pushToGTM('scroll', {
        category: 'engagement',
        label: `${percentage}%`,
        scroll_percentage: percentage
    });
}

/**
 * Lead generation tracking
 */
function pushLeadGenerated(leadData = {}) {
    pushToGTM('generate_lead', {
        category: 'conversion',
        label: leadData.source || 'website',
        lead_data: leadData,
        value: 6000 // Annual contract value
    });
}

/**
 * Error tracking
 */
function pushError(errorType, errorMessage, errorContext = {}) {
    pushToGTM('error', {
        category: 'error',
        label: errorType,
        error_type: errorType,
        error_message: errorMessage,
        error_context: errorContext
    });
}

/**
 * File download tracking
 */
function pushDownload(filename, fileType = '') {
    pushToGTM('file_download', {
        category: 'engagement',
        label: filename,
        file_name: filename,
        file_type: fileType
    });
}

/**
 * Video interaction tracking
 */
function pushVideoEvent(action, videoTitle, currentTime = 0) {
    pushToGTM('video', {
        category: 'engagement',
        label: `${action}_${videoTitle}`,
        video_title: videoTitle,
        video_action: action,
        video_current_time: currentTime
    });
}

/**
 * Search tracking
 */
function pushSearch(searchTerm, searchResults = 0) {
    pushToGTM('search', {
        category: 'engagement',
        label: searchTerm,
        search_term: searchTerm,
        search_results: searchResults
    });
}

/**
 * Auto-setup: Track common events automatically
 */
document.addEventListener('DOMContentLoaded', function() {
    // Track initial page view
    pushPageView();
    
    // Track form submissions
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form.tagName === 'FORM') {
            const formType = form.id || form.className || 'unknown';
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                if (!key.includes('password') && !key.includes('token')) {
                    data[key] = value;
                }
            }
            pushFormSubmit(formType, data);
        }
    });
    
    // Track CTA clicks
    document.addEventListener('click', function(e) {
        const element = e.target;
        
        // Track buttons and links with specific classes
        if (element.matches('.btn, .cta, .nav-cta, .launch-wizard')) {
            const text = element.textContent.trim();
            const href = element.href || element.onclick?.toString() || '';
            pushClickEvent('button', text, href);
        }
        
        // Track navigation links
        if (element.matches('nav a, .nav-links a')) {
            const text = element.textContent.trim();
            const href = element.href;
            pushClickEvent('nav_link', text, href);
        }
        
        // Track download links
        if (element.href && element.href.match(/\.(pdf|doc|docx|xls|xlsx|csv|zip)$/i)) {
            const filename = element.href.split('/').pop();
            const fileType = filename.split('.').pop();
            pushDownload(filename, fileType);
        }
    });
    
    // Track scroll depth
    let scrollDepths = [25, 50, 75, 100];
    let scrolled = [];
    
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round(
            (window.scrollY + window.innerHeight) / document.body.offsetHeight * 100
        );
        
        scrollDepths.forEach(depth => {
            if (scrollPercent >= depth && !scrolled.includes(depth)) {
                scrolled.push(depth);
                pushScrollDepth(depth);
            }
        });
    });
    
    // Track JavaScript errors
    window.addEventListener('error', function(e) {
        pushError('javascript_error', e.message, {
            filename: e.filename,
            line: e.lineno,
            column: e.colno
        });
    });
    
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', function(e) {
        pushError('promise_rejection', e.reason?.message || 'Unknown promise rejection', {
            reason: e.reason
        });
    });
});

// Make functions globally available
window.gtmPush = {
    pushToGTM,
    pushFormSubmit,
    pushStepEvent,
    pushTrialStart,
    pushDemoComplete,
    pushPageView,
    pushClickEvent,
    pushScrollDepth,
    pushLeadGenerated,
    pushError,
    pushDownload,
    pushVideoEvent,
    pushSearch
};