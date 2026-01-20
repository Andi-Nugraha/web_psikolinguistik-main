// profile.js

document.addEventListener('DOMContentLoaded', function() {
    // Dark mode
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
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

    // Edit Profile button
    const editProfileBtn = document.querySelector('button:contains("Edit Profile")');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            showEditProfileModal();
        });
    }

    // Logout button
    const logoutBtn = document.querySelector('button:contains("Log Out")');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('isLoggedIn');
                window.location.href = 'login_code.html';
            }
        });
    }

    // View All Activity button
    const viewAllActivityBtn = document.querySelector('button:contains("View All Activity")');
    if (viewAllActivityBtn) {
        viewAllActivityBtn.addEventListener('click', function() {
            window.location.href = 'progress_code.html';
        });
    }

    // User profile image click
    const profileImage = document.querySelector('div[data-alt*="Portrait of"]');
    if (profileImage) {
        profileImage.addEventListener('click', function() {
            changeProfilePicture();
        });
    }

    // Load user data
    loadUserData();

    // Animate progress bars
    animateProgressBars();

    // Mobile responsiveness
    setupMobileView();

    // Initialize from localStorage
    initializeProfileData();
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

function loadUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
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

    // Update profile info
    document.querySelector('h2.text-3xl').textContent = currentUser.name;
    document.querySelector('p.text-slate-600').textContent = currentUser.email;
    
    // Update stats
    document.querySelectorAll('.text-2xl.font-bold')[0].textContent = currentUser.streak;
    document.querySelectorAll('.text-2xl.font-bold')[1].textContent = currentUser.totalXP.toLocaleString();
    document.querySelectorAll('.text-2xl.font-bold')[2].textContent = currentUser.wordsMastered.toLocaleString();
    
    // Update personal info
    const infoSections = document.querySelectorAll('.p-5.flex');
    if (infoSections.length >= 4) {
        infoSections[0].querySelector('span:last-child').textContent = currentUser.email;
        infoSections[1].querySelector('span:last-child').textContent = currentUser.nativeLanguage;
        infoSections[2].querySelector('span:last-child').textContent = currentUser.location;
        infoSections[3].querySelector('span:last-child').innerHTML = `
            <span class="material-symbols-outlined !text-[18px]">check_circle</span> ${currentUser.subscription}
        `;
    }
    
    // Update goals
    if (currentUser.goals) {
        const dailyGoal = document.querySelector('.bg-primary');
        const vocabGoal = document.querySelector('.bg-purple-500');
        const speakingGoal = document.querySelector('.bg-pink-500');
        
        if (dailyGoal) dailyGoal.style.width = `${currentUser.goals.dailyPractice}%`;
        if (vocabGoal) vocabGoal.style.width = `${currentUser.goals.weeklyVocab}%`;
        if (speakingGoal) speakingGoal.style.width = `${currentUser.goals.speakingExercises}%`;
        
        // Update goal numbers
        const goalNumbers = document.querySelectorAll('.text-sm.font-bold.text-slate-500');
        if (goalNumbers.length >= 3) {
            const dailyMins = Math.round((20 * currentUser.goals.dailyPractice) / 100);
            const weeklyWords = Math.round((50 * currentUser.goals.weeklyVocab) / 100);
            const speakingCompleted = Math.round((5 * currentUser.goals.speakingExercises) / 100);
            
            goalNumbers[0].textContent = `${dailyMins} / 20 mins`;
            goalNumbers[1].textContent = `${weeklyWords} / 50 words`;
            goalNumbers[2].textContent = `${speakingCompleted} / 5 completed`;
        }
    }
}

function showEditProfileModal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    
    const modalHTML = `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-bold">Edit Profile</h3>
                        <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    <form id="editProfileForm" class="space-y-6">
                        <!-- Profile Picture -->
                        <div class="flex flex-col items-center">
                            <div class="relative">
                                <div class="w-32 h-32 rounded-full bg-cover bg-center mb-4"
                                     style="background-image: url('${currentUser.profileImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX7Crk6NB3IWmytauTRolPSgTTIdbqn3uxpor-JdxYXjOhlO3bXrFCpnCt82kC_b4mvDQLrknIUUqE48BXTWcdbso5dLPk5Wjkc3L9A30wvCKbrDMeGVpRKmJ9Rhrbwazb1Wpz97ScyOQ2tjdOe1vARzhBIZpoIS488Ml27RVihZO3-tAV8XvTLA2rL0BE403Q3RghR50xaTQC3HiOFBe47YJZoxFz6pw6WtxbOWlQOBwKSbzUuWJg244gN2YnSGZNxzX6r0y8_HqQ'}')">
                                </div>
                                <button type="button" onclick="changeProfilePicture()" 
                                        class="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full">
                                    <span class="material-symbols-outlined">edit</span>
                                </button>
                            </div>
                            <p class="text-sm text-gray-500">Click to change profile picture</p>
                        </div>
                        
                        <!-- Name -->
                        <div>
                            <label class="block text-sm font-medium mb-2">Full Name</label>
                            <input type="text" name="name" value="${currentUser.name || ''}" 
                                   class="w-full p-3 border rounded-lg dark:bg-[#283339]" required>
                        </div>
                        
                        <!-- Email -->
                        <div>
                            <label class="block text-sm font-medium mb-2">Email</label>
                            <input type="email" name="email" value="${currentUser.email || ''}" 
                                   class="w-full p-3 border rounded-lg dark:bg-[#283339]" required>
                        </div>
                        
                        <!-- Bio -->
                        <div>
                            <label class="block text-sm font-medium mb-2">Bio</label>
                            <textarea name="bio" rows="3" class="w-full p-3 border rounded-lg dark:bg-[#283339]"
                                      placeholder="Tell us about yourself...">${currentUser.bio || 'Aspiring polyglot traveling to Madrid soon. Love to learn through conversation and music.'}</textarea>
                        </div>
                        
                        <!-- Location -->
                        <div>
                            <label class="block text-sm font-medium mb-2">Location</label>
                            <input type="text" name="location" value="${currentUser.location || 'San Francisco, CA'}" 
                                   class="w-full p-3 border rounded-lg dark:bg-[#283339]">
                        </div>
                        
                        <!-- Native Language -->
                        <div>
                            <label class="block text-sm font-medium mb-2">Native Language</label>
                            <select name="nativeLanguage" class="w-full p-3 border rounded-lg dark:bg-[#283339]">
                                <option ${currentUser.nativeLanguage === 'English (US)' ? 'selected' : ''}>English (US)</option>
                                <option ${currentUser.nativeLanguage === 'Spanish' ? 'selected' : ''}>Spanish</option>
                                <option ${currentUser.nativeLanguage === 'French' ? 'selected' : ''}>French</option>
                                <option ${currentUser.nativeLanguage === 'German' ? 'selected' : ''}>German</option>
                                <option ${currentUser.nativeLanguage === 'Chinese' ? 'selected' : ''}>Chinese</option>
                                <option ${currentUser.nativeLanguage === 'Japanese' ? 'selected' : ''}>Japanese</option>
                            </select>
                        </div>
                        
                        <!-- Learning Goals -->
                        <div>
                            <h4 class="text-lg font-bold mb-4">Learning Goals</h4>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Daily Practice (minutes)</label>
                                    <input type="range" name="dailyGoal" min="5" max="120" value="${currentUser.goals?.dailyPractice || 75}" 
                                           class="w-full" oninput="this.nextElementElement.textContent = this.value + ' mins'">
                                    <div class="flex justify-between text-sm">
                                        <span>5 mins</span>
                                        <span id="dailyGoalValue">${currentUser.goals?.dailyPractice || 75} mins</span>
                                        <span>120 mins</span>
                                    </div>
                                </div>
                            </div>
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
    
    // Handle form submission
    const form = document.getElementById('editProfileForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const updatedUser = {
                ...currentUser,
                name: formData.get('name'),
                email: formData.get('email'),
                bio: formData.get('bio'),
                location: formData.get('location'),
                nativeLanguage: formData.get('nativeLanguage'),
                goals: {
                    ...currentUser.goals,
                    dailyPractice: parseInt(formData.get('dailyGoal'))
                }
            };
            
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            alert('Profile updated successfully!');
            
            // Close modal and refresh data
            this.closest('.fixed').remove();
            loadUserData();
        });
        
        // Update range value display
        const rangeInput = form.querySelector('input[type="range"]');
        if (rangeInput) {
            rangeInput.addEventListener('input', function() {
                const valueDisplay = document.getElementById('dailyGoalValue');
                if (valueDisplay) {
                    valueDisplay.textContent = this.value + ' mins';
                }
            });
        }
    }
}

function changeProfilePicture() {
    // In a real app, this would open file picker
    // For demo, just show an alert
    alert('In a real application, this would open a file picker to upload a new profile picture.');
}

function animateProgressBars() {
    const progressBars = document.querySelectorAll('.h-2\\.5 .rounded-full');
    
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
        const sidebar = document.querySelector('aside');
        
        if (isMobile && sidebar) {
            sidebar.classList.add('lg:hidden');
        }
    };
    
    updateLayout();
    window.addEventListener('resize', updateLayout);
}

function initializeProfileData() {
    // Load additional profile data from localStorage
    const profileData = JSON.parse(localStorage.getItem('profileData')) || {};
    
    // Update any additional profile fields if needed
    if (profileData.bio) {
        const bioElement = document.querySelector('p.text-slate-600.max-w-md');
        if (bioElement) {
            bioElement.textContent = profileData.bio;
        }
    }
}