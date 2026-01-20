// profile.js

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (localStorage.getItem('linguaflow_logged_in') !== 'true') {
        window.location.href = 'login_code.html';
        return;
    }

    // Dark mode
    const savedTheme = localStorage.getItem('linguaflow_theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
    }

    // Setup navigation
    setupNavigation();

    // Setup profile functionality
    setupProfileFunctionality();

    // Load user data
    loadUserData();

    // Animate progress bars
    animateProgressBars();

    // Mobile responsiveness
    setupMobileView();
});

function setupNavigation() {
    // Setup sidebar navigation with active state
    const navLinks = document.querySelectorAll('[id^="nav"]');
    const currentPage = window.location.pathname.split('/').pop();
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('bg-[#283339]');
        }
    });

    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('linguaflow_user');
            localStorage.removeItem('linguaflow_logged_in');
            window.location.href = 'login_code.html';
        });
    }
}

function setupProfileFunctionality() {
    // Edit Profile button - find by looking for common selectors
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        if (btn.textContent.includes('Edit Profile')) {
            btn.addEventListener('click', showEditProfileModal);
        }
        if (btn.textContent.includes('View All Activity')) {
            btn.addEventListener('click', function() {
                window.location.href = 'progress_code.html';
            });
        }
    });
}

function loadUserData() {
    const linguafloUser = JSON.parse(localStorage.getItem('linguaflow_user'));
    const currentUser = linguafloUser || {
        name: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        nativeLanguage: 'English (US)',
        location: 'San Francisco, CA',
        subscription: 'Pro Member',
        streak: 12,
        totalXP: 4500,
        wordsMastered: 850,
        goals: {
            dailyPractice: 75,
            weeklyVocab: 90,
            speakingExercises: 40
        }
    };

    // Update profile info in header
    const headers = document.querySelectorAll('h2');
    let profileHeader = null;
    headers.forEach(h => {
        if (h.textContent.includes('Profile') || h.textContent.includes('Morgan')) {
            profileHeader = h;
        }
    });
    
    if (profileHeader) {
        profileHeader.textContent = currentUser.name + "'s Profile";
    }

    // Update user name display
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = currentUser.name;
    }

    // Update stats
    const statElements = document.querySelectorAll('.text-3xl.font-bold');
    if (statElements.length >= 3) {
        statElements[0].textContent = currentUser.streak;
        statElements[1].textContent = currentUser.totalXP.toLocaleString();
        statElements[2].textContent = currentUser.wordsMastered.toLocaleString();
    }
}

function showEditProfileModal() {
    const linguafloUser = JSON.parse(localStorage.getItem('linguaflow_user'));
    const currentUser = linguafloUser || {
        name: 'Alex Morgan',
        email: 'alex.morgan@example.com'
    };
    
    const modalHTML = `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-[#1a2630] rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-bold">Edit Profile</h3>
                        <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    <form id="editProfileForm" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium mb-2">Full Name</label>
                            <input type="text" name="name" value="${currentUser.name || 'Alex Morgan'}" 
                                   class="w-full p-3 border rounded-lg dark:bg-[#283339]" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Email</label>
                            <input type="email" name="email" value="${currentUser.email || 'alex@example.com'}" 
                                   class="w-full p-3 border rounded-lg dark:bg-[#283339]" required>
                        </div>
                        
                        <div class="flex justify-end gap-3 pt-6 border-t">
                            <button type="button" class="px-6 py-2 border rounded-lg" 
                                    onclick="this.closest('.fixed').remove()">Cancel</button>
                            <button type="submit" class="px-6 py-2 bg-primary text-white rounded-lg">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const form = document.getElementById('editProfileForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const updatedUser = {
                ...currentUser,
                name: formData.get('name'),
                email: formData.get('email')
            };
            
            localStorage.setItem('linguaflow_user', JSON.stringify(updatedUser));
            alert('Profile updated successfully!');
            
            this.closest('.fixed').remove();
            loadUserData();
        });
    }
}

function changeProfilePicture() {
    alert('In a real application, this would open a file picker to upload a new profile picture.');
}

function animateProgressBars() {
    const progressBars = document.querySelectorAll('[class*="bg-primary"]');
    
    progressBars.forEach(bar => {
        const currentWidth = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.width = currentWidth;
        }, 300);
    });
}

function setupMobileView() {
    // Handle responsive behavior
    const updateLayout = () => {
        const isMobile = window.innerWidth < 1024;
        // Mobile responsive logic here
    };
    
    updateLayout();
    window.addEventListener('resize', updateLayout);
}
