// login.js

document.addEventListener('DOMContentLoaded', function() {
    // Dark mode toggle based on system preference or saved setting
    const savedTheme = localStorage.getItem('linguaflow_theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        // Use system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
    }

    // Toggle password visibility
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const passwordInput = document.getElementById('passwordInput');
    
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.querySelector('.material-symbols-outlined').textContent = 'visibility';
            } else {
                passwordInput.type = 'password';
                this.querySelector('.material-symbols-outlined').textContent = 'visibility_off';
            }
        });
    }

    // Login form submission
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginBtn');
    const emailInput = document.getElementById('emailInput');
    
    if (loginForm && loginButton && emailInput) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const email = emailInput.value;
            const password = passwordInput.value;
            
            // Basic validation
            if (!email || !password) {
                showError('Please fill in all fields');
                return;
            }
            
            if (!isValidEmail(email)) {
                showError('Please enter a valid email address');
                return;
            }
            
            // Simulate login process
            const originalText = this.textContent;
            this.innerHTML = 'Logging in...';
            this.disabled = true;
            
            setTimeout(() => {
                // Simulate successful login
                const userData = {
                    email: email,
                    name: email.split('@')[0],
                    plan: 'Free Plan',
                    streak: 5,
                    joinedDate: new Date().toISOString()
                };
                
                localStorage.setItem('linguaflow_user', JSON.stringify(userData));
                localStorage.setItem('linguaflow_logged_in', 'true');
                
                // Redirect to dashboard
                window.location.href = 'dashboard_code.html';
            }, 1500);
        });
    }

    // Handle Enter key to submit
    if (loginForm) {
        loginForm.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && loginButton) {
                e.preventDefault();
                loginButton.click();
            }
        });
    }

    // Check if user is already logged in
    if (localStorage.getItem('linguaflow_logged_in') === 'true') {
        // Redirect to dashboard if already logged in
        window.location.href = 'dashboard_code.html';
    }
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(message) {
    // Remove existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
    errorDiv.textContent = message;
    
    // Insert before form
    const form = document.getElementById('loginForm');
    if (form) {
        form.insertBefore(errorDiv, form.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

function showSignupForm() {
    const modalHTML = `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-[#1a2630] rounded-xl shadow-xl max-w-md w-full">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold">Create Account</h3>
                        <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <form id="signupForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Full Name</label>
                            <input type="text" class="w-full p-2 border rounded dark:bg-[#141e26]" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Email</label>
                            <input type="email" class="w-full p-2 border rounded dark:bg-[#141e26]" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Password</label>
                            <input type="password" class="w-full p-2 border rounded dark:bg-[#141e26]" required>
                        </div>
                        <div>
                            <label class="flex items-center">
                                <input type="checkbox" class="mr-2" required>
                                <span class="text-sm">I agree to the Terms and Conditions</span>
                            </label>
                        </div>
                        <button type="submit" class="w-full bg-primary text-white py-2 rounded">Sign Up</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Handle signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Account created successfully! Please check your email to verify.');
            this.closest('.fixed').remove();
        });
    }
}

function showForgotPasswordForm() {
    const modalHTML = `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-[#1a2630] rounded-xl shadow-xl max-w-md w-full">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold">Reset Password</h3>
                        <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <p class="text-gray-600 dark:text-gray-300 mb-4">Enter your email address and we'll send you a link to reset your password.</p>
                    <form id="forgotPasswordForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Email</label>
                            <input type="email" class="w-full p-2 border rounded dark:bg-[#141e26]" required>
                        </div>
                        <button type="submit" class="w-full bg-primary text-white py-2 rounded">Send Reset Link</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Handle forgot password form submission
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Password reset link sent to your email!');
            this.closest('.fixed').remove();
        });
    }
}