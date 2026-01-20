// dashboard.js - Update untuk integrasi YouTube

document.addEventListener('DOMContentLoaded', async function() {
    console.log('📊 LinguaFlow Dashboard Initializing...');
    
    // Check if user is logged in
    if (localStorage.getItem('linguaflow_logged_in') !== 'true') {
        // Redirect to login if not logged in
        window.location.href = 'login_code.html';
        return;
    }
    
    // Load user data
    const userData = JSON.parse(localStorage.getItem('linguaflow_user'));
    if (userData) {
        console.log('👤 User:', userData.email);
    }
    
    // Load YouTube thumbnails
    await loadYouTubeContent();
    
    // Existing dashboard code...
    setupDashboard();
});

async function loadYouTubeContent() {
    try {
        // Update video cards with YouTube thumbnails
        const videoCards = document.querySelectorAll('.group.relative.flex.cursor-pointer');
        
        const videoData = [
            { element: videoCards[0], id: YouTubeConfig.getVideoId('ai_development') },
            { element: videoCards[1], id: YouTubeConfig.getVideoId('business_etiquette') },
            { element: videoCards[2], id: YouTubeConfig.getVideoId('storytelling') },
            { element: videoCards[3], id: YouTubeConfig.getVideoId('cooking_terms') }
        ];
        
        for (const { element, id } of videoData) {
            if (element && id) {
                // Update thumbnail
                const thumbnail = element.querySelector('.absolute.inset-0.bg-cover');
                if (thumbnail) {
                    thumbnail.style.backgroundImage = `url('${YouTubeConfig.getThumbnailUrl(id, 'hqdefault')}')`;
                    thumbnail.setAttribute('data-video-id', id);
                }
                
                // Update click handler
                element.addEventListener('click', function(e) {
                    e.preventDefault();
                    const videoId = this.querySelector('.absolute.inset-0.bg-cover')?.getAttribute('data-video-id');
                    if (videoId) {
                        window.location.href = `learningVideo_code.html?video=${videoId}`;
                    }
                });
            }
        }
        
        console.log('✅ YouTube content loaded');
    } catch (error) {
        console.error('Error loading YouTube content:', error);
    }
}

// Setup dashboard functions
function setupDashboard() {
    // Existing dashboard setup code...
    
    // Setup user profile and logout button
    setupUserProfile();
    
    // Setup navigation
    setupNavigation();
    
    // Update "Start Learning" button
    setupStartLearningButton();
    
    // Update video recommendations
    updateVideoRecommendations();
}

function setupNavigation() {
    // Setup sidebar navigation with active state
    const navLinks = document.querySelectorAll('[id^="nav"]');
    const currentPage = window.location.pathname.split('/').pop();
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('bg-[#283339]', 'text-primary');
        }
    });
}

function setupStartLearningButton() {
    const startLearningBtn = document.getElementById('startLearningBtn');
    if (startLearningBtn) {
        startLearningBtn.addEventListener('click', function() {
            const defaultVideoId = (typeof YouTubeConfig !== 'undefined') 
                ? YouTubeConfig.getVideoId('english_conversation') 
                : 'zQe9J-7CbC4';
            window.location.href = `learningVideo_code.html?video=${defaultVideoId}`;
        });
    }
}

function setupUserProfile() {
    // Display user name in dashboard
    const userData = JSON.parse(localStorage.getItem('linguaflow_user'));
    if (userData) {
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = userData.name.charAt(0).toUpperCase() + userData.name.slice(1);
        }
        
        // Update welcome message
        const welcomeH2 = document.querySelector('h2');
        if (welcomeH2 && welcomeH2.textContent.includes('Welcome')) {
            welcomeH2.textContent = `Welcome back, ${userData.name.charAt(0).toUpperCase() + userData.name.slice(1)}! 👋`;
        }
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear user session
            localStorage.removeItem('linguaflow_user');
            localStorage.removeItem('linguaflow_logged_in');
            
            // Redirect to login
            window.location.href = 'login_code.html';
        });
    }
}

async function updateVideoRecommendations() {
    try {
        const youtubeAPI = window.YouTubeAPI;
        const level = 'B2'; // Default level for dashboard
        
        // Get recommended videos
        const recommendations = await youtubeAPI.dataApi.getRecommendedVideos(level, 4);
        
        // Update recommendation section
        const recommendationContainer = document.querySelector('.grid.grid-cols-1.gap-4.sm\\:grid-cols-2');
        if (recommendationContainer && recommendations.length > 0) {
            // You can update the recommendation cards here
            console.log('Video recommendations:', recommendations);
        }
    } catch (error) {
        console.error('Error updating recommendations:', error);
    }
}
