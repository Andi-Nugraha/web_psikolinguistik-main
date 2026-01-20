// settings.js

document.addEventListener('DOMContentLoaded', function() {
    // Dark mode
    const darkModeToggle = document.querySelector('input[type="checkbox"]');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('darkMode', 'false');
            }
        });
        
        // Set initial state
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        darkModeToggle.checked = isDarkMode;
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        }
    }

    // Navigation
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.querySelector('span.text-sm')?.textContent || this.textContent;
            navigateToPage(page.trim().toLowerCase().replace(/\s+/g, ''));
        });
    });

    // CEFR Level Slider
    const cefrSlider = document.getElementById('cefr-slider');
    if (cefrSlider) {
        // Load saved level
        const savedLevel = localStorage.getItem('targetCEFR') || '3'; // B2 is position 3
        cefrSlider.value = savedLevel;
        updateCEFRLabel(savedLevel);
        
        cefrSlider.addEventListener('input', function() {
            updateCEFRLabel(this.value);
        });
        
        cefrSlider.addEventListener('change', function() {
            localStorage.setItem('targetCEFR', this.value);
        });
    }

    // Learning Methodology Toggles
    const methodologyToggles = document.querySelectorAll('input[type="checkbox"][class*="peer"]');
    methodologyToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            // Uncheck other methodology toggles (radio button behavior)
            if (this.checked) {
                methodologyToggles.forEach(otherToggle => {
                    if (otherToggle !== this) {
                        otherToggle.checked = false;
                    }
                });
                
                // Save selected methodology
                const label = this.closest('.group').querySelector('h4').textContent;
                localStorage.setItem('learningMethodology', label);
            }
        });
        
        // Set initial state
        const savedMethod = localStorage.getItem('learningMethodology');
        const label = toggle.closest('.group')?.querySelector('h4')?.textContent;
        if (label === savedMethod) {
            toggle.checked = true;
        }
    });

    // Tooltip Complexity Select
    const tooltipSelect = document.getElementById('tooltip-pref');
    if (tooltipSelect) {
        // Load saved preference
        const savedTooltip = localStorage.getItem('tooltipComplexity') || 'advanced';
        tooltipSelect.value = savedTooltip;
        
        tooltipSelect.addEventListener('change', function() {
            localStorage.setItem('tooltipComplexity', this.value);
        });
    }

    // Notification Checkboxes
    const notificationCheckboxes = document.querySelectorAll('input[type="checkbox"][class*="peer"]:not([class*="sr-only"])');
    notificationCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const label = this.nextElementSibling?.textContent || 'unknown';
            saveNotificationPreference(label, this.checked);
        });
        
        // Set initial state from localStorage
        const label = checkbox.nextElementSibling?.textContent;
        if (label) {
            const savedState = localStorage.getItem(`notification_${label}`) === 'true';
            checkbox.checked = savedState;
        }
    });

    // Save Settings button
    const saveSettingsBtn = document.querySelector('button:contains("Save Settings")');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            saveAllSettings();
        });
    }

    // Discard Changes button
    const discardBtn = document.querySelector('button:contains("Discard Changes")');
    if (discardBtn) {
        discardBtn.addEventListener('click', function() {
            if (confirm('Discard all unsaved changes?')) {
                resetToSavedSettings();
            }
        });
    }

    // User profile click
    const userProfile = document.querySelector('div[class*="rounded-full"]');
    if (userProfile) {
        userProfile.addEventListener('click', function() {
            window.location.href = 'profile_code.html';
        });
    }

    // Initialize all settings from localStorage
    initializeSettings();
});

function navigateToPage(page) {
    const pageMap = {
        'home': 'dashboard_code.html',
        'videolearning': 'learningVideo_code.html',
        'flashcards': 'flashcards_code.html',
        'exercises': 'exercises_code.html',
        'progress': 'progress_code.html',
        'settings': 'settings_code.html'
    };

    if (pageMap[page]) {
        window.location.href = pageMap[page];
    }
}

function updateCEFRLabel(value) {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const levelIndex = parseInt(value);
    
    // Update the active label in the slider
    const labels = document.querySelectorAll('.text-xs.font-medium span');
    labels.forEach((label, index) => {
        if (index === levelIndex) {
            label.classList.add('text-primary');
        } else {
            label.classList.remove('text-primary');
        }
    });
    
    // Update the level badge
    const levelBadge = document.querySelector('span.text-primary');
    if (levelBadge) {
        levelBadge.textContent = `${levels[levelIndex]} ${getLevelDescription(levelIndex)}`;
    }
}

function getLevelDescription(levelIndex) {
    const descriptions = [
        'Beginner',
        'Elementary',
        'Intermediate',
        'Upper Intermediate',
        'Advanced',
        'Proficient'
    ];
    return descriptions[levelIndex] || '';
}

function saveNotificationPreference(label, enabled) {
    localStorage.setItem(`notification_${label}`, enabled.toString());
}

function saveAllSettings() {
    // Collect all settings
    const settings = {
        darkMode: localStorage.getItem('darkMode') === 'true',
        targetCEFR: localStorage.getItem('targetCEFR') || '3',
        learningMethodology: localStorage.getItem('learningMethodology') || 'Psycholinguistic Mode',
        tooltipComplexity: localStorage.getItem('tooltipComplexity') || 'advanced',
        notifications: {
            dailyPractice: localStorage.getItem('notification_Daily Practice Reminders') === 'true',
            weeklyReport: localStorage.getItem('notification_Weekly Progress Report') === 'true'
        }
    };
    
    // Save to a master settings object
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Show success message
    showSaveSuccess();
}

function showSaveSuccess() {
    // Update the saved badge
    const savedBadge = document.querySelector('span.bg-green-100');
    if (savedBadge) {
        savedBadge.textContent = 'Settings saved!';
        savedBadge.classList.remove('bg-green-100', 'text-green-800');
        savedBadge.classList.add('bg-primary', 'text-white');
        
        // Reset after 3 seconds
        setTimeout(() => {
            savedBadge.textContent = 'Changes saved';
            savedBadge.classList.remove('bg-primary', 'text-white');
            savedBadge.classList.add('bg-green-100', 'text-green-800');
        }, 3000);
    }
    
    // Show toast notification
    showToast('Settings saved successfully!');
}

function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'toast-notification fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function resetToSavedSettings() {
    // Load saved settings from master object
    const savedSettings = JSON.parse(localStorage.getItem('appSettings')) || {};
    
    // Reset dark mode
    const darkModeToggle = document.querySelector('input[type="checkbox"]');
    if (darkModeToggle) {
        darkModeToggle.checked = savedSettings.darkMode || false;
        if (savedSettings.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
    
    // Reset CEFR slider
    const cefrSlider = document.getElementById('cefr-slider');
    if (cefrSlider && savedSettings.targetCEFR) {
        cefrSlider.value = savedSettings.targetCEFR;
        updateCEFRLabel(savedSettings.targetCEFR);
    }
    
    // Reset methodology toggles
    const methodologyToggles = document.querySelectorAll('input[type="checkbox"][class*="peer"]');
    methodologyToggles.forEach(toggle => {
        const label = toggle.closest('.group')?.querySelector('h4')?.textContent;
        toggle.checked = label === savedSettings.learningMethodology;
    });
    
    // Reset tooltip select
    const tooltipSelect = document.getElementById('tooltip-pref');
    if (tooltipSelect && savedSettings.tooltipComplexity) {
        tooltipSelect.value = savedSettings.tooltipComplexity;
    }
    
    // Reset notification checkboxes
    const notificationCheckboxes = document.querySelectorAll('input[type="checkbox"][class*="peer"]:not([class*="sr-only"])');
    notificationCheckboxes.forEach(checkbox => {
        const label = checkbox.nextElementSibling?.textContent;
        if (label && savedSettings.notifications) {
            const key = label.replace(/\s+/g, '');
            checkbox.checked = savedSettings.notifications[key] || false;
        }
    });
    
    showToast('Settings reset to last saved state');
}

function initializeSettings() {
    // If no settings exist, set defaults
    if (!localStorage.getItem('appSettings')) {
        const defaultSettings = {
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
            targetCEFR: '3',
            learningMethodology: 'Psycholinguistic Mode',
            tooltipComplexity: 'advanced',
            notifications: {
                dailyPractice: true,
                weeklyReport: false
            }
        };
        
        localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
    }
    
    // Apply settings
    resetToSavedSettings();
}
