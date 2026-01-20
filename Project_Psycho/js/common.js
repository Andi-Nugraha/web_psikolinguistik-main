// common.js - Common functions for LinguaFlow

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set dark mode
    initializeDarkMode();
    
    // Check authentication
    checkAuthState();
    
    // Setup common UI
    setupCommonUI();
});

// Dark Mode
function initializeDarkMode() {
    const savedTheme = localStorage.getItem('linguaflow_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    }
}

// Authentication
function checkAuthState() {
    const isLoggedIn = localStorage.getItem('linguaflow_logged_in') === 'true';
    const currentPage = window.location.pathname.split('/').pop();
    
    // Allow login page and index.html to load without authentication
    const publicPages = ['login_code.html', '', 'index.html'];
    
    if (!isLoggedIn && !publicPages.includes(currentPage)) {
        // Redirect to login if not logged in (except on login page)
        // window.location.href = 'login_code.html';
    }
}

// Common UI Setup
function setupCommonUI() {
    // Setup tooltips
    setupTooltips();
    
    // Setup modals
    setupModals();
}

// Tooltips
function setupTooltips() {
    // Add tooltip functionality to elements with data-tooltip
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'absolute z-50 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg';
            tooltip.textContent = this.dataset.tooltip;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.top = `${rect.top - 30}px`;
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.transform = 'translateX(-50%)';
            
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                delete this._tooltip;
            }
        });
    });
}

// Modals
function setupModals() {
    // Close modals on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.open');
            if (openModal) {
                openModal.classList.remove('open');
            }
        }
    });
}

// Format numbers
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Format time
function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions to window
window.Common = {
    formatNumber,
    formatTime,
    debounce,
    throttle
};