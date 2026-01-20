// learningVideo.js - YouTube Video Learning dengan API Key Anda

let youtubeAPI = null;
let currentVideoId = null;
let playerInstance = null;
let isPlaying = false;
let transcriptData = [];
let currentProgress = 0;

// Tunggu YouTube IFrame API siap
function waitForYouTubeAPI() {
    return new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
            resolve();
        } else {
            window.onYouTubeIframeAPIReady = resolve;
        }
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎬 LinguaFlow Video Learning Initializing...');
    
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
    
    // Tunggu YouTube IFrame API siap
    try {
        console.log('⏳ Menunggu YouTube IFrame API...');
        await waitForYouTubeAPI();
        console.log('✅ YouTube IFrame API siap');
    } catch (error) {
        console.warn('⚠️ YouTube IFrame API timeout:', error);
    }
    
    // Tunggu YouTubeAPI wrapper (dari youtubeApi.js)
    let retries = 0;
    while (!window.YouTubeAPI && retries < 10) {
        console.log('⏳ Menunggu YouTubeAPI wrapper...');
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
    }
    
    if (window.YouTubeAPI) {
        youtubeAPI = window.YouTubeAPI;
        console.log('✅ YouTubeAPI wrapper berhasil dimuat');
        
        // Test koneksi ke YouTube API
        try {
            const testResults = await youtubeAPI.testConnection();
            testResults.forEach(result => {
                console.log(`${result.status} ${result.service}: ${result.details}`);
            });
        } catch (error) {
            console.warn('⚠️ Error testing connection:', error);
        }
    } else {
        console.warn('⚠️ YouTubeAPI wrapper tidak tersedia, menggunakan fallback');
        youtubeAPI = createFallbackAPI();
    }
    
    // Navigation
    setupNavigation();
    
    // Initialize video player container
    initializeVideoPlayerContainer();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial video
    await loadInitialVideo();
    
    console.log('✅ LinguaFlow Video Learning Ready');
});

// 🎯 Setup navigation
function setupNavigation() {
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

// 🎯 Initialize video player container
function initializeVideoPlayerContainer() {
    const videoContainer = document.querySelector('.aspect-video');
    if (!videoContainer) return;
    
    // Replace with enhanced player container
    videoContainer.innerHTML = `
        <div id="youtube-player-container" class="w-full h-full relative rounded-xl overflow-hidden bg-black flex items-center justify-center">
            <!-- YouTube Player -->
            <div id="youtube-player" class="w-full h-full"></div>
            
            <!-- Loading Overlay -->
            <div id="loading-overlay" class="absolute inset-0 bg-black/80 flex items-center justify-center z-20 transition-opacity duration-300">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p class="text-white font-medium">Loading video...</p>
                </div>
            </div>
            
            <!-- Play Button Overlay -->
            <div id="play-overlay" class="absolute inset-0 flex items-center justify-center z-10 cursor-pointer">
                <div class="flex items-center justify-center rounded-full size-20 bg-primary/90 text-white shadow-[0_0_30px_rgba(19,164,236,0.5)] hover:scale-110 transition-transform duration-200">
                    <span class="material-symbols-outlined text-[40px]">play_arrow</span>
                </div>
            </div>
        </div>
    `;
}

// 🎯 Setup event listeners
function setupEventListeners() {
    // Load button
    const loadBtn = document.querySelector('button:contains("Load")');
    const urlInput = document.querySelector('input[placeholder*="YouTube URL"]');
    
    // Fallback: cari by text content
    const buttons = document.querySelectorAll('button');
    let realLoadBtn = null;
    buttons.forEach(btn => {
        if (btn.textContent.trim() === 'Load') {
            realLoadBtn = btn;
        }
    });
    
    if (realLoadBtn && urlInput) {
        realLoadBtn.addEventListener('click', async function() {
            await loadVideoFromInput();
        });
        
        // Load on Enter key
        urlInput.addEventListener('keypress', async function(e) {
            if (e.key === 'Enter') {
                await loadVideoFromInput();
            }
        });
    }
    
    // Save to Flashcards button
    const saveBtn = document.querySelector('button:contains("Save to Flashcards")');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveCurrentWordToFlashcards();
        });
    }
    
    // Psycholinguistic Mode toggle
    const modeToggle = document.querySelector('input[type="checkbox"]');
    if (modeToggle) {
        modeToggle.addEventListener('change', function() {
            localStorage.setItem('linguaflow_psycho_mode', this.checked);
            showNotification(`Psycholinguistic Mode ${this.checked ? 'enabled' : 'disabled'}`);
        });
        
        // Load saved setting
        modeToggle.checked = localStorage.getItem('linguaflow_psycho_mode') === 'true';
    }
    
    // Transcript controls
    setupTranscriptControls();
    
    // User profile
    const userAvatar = document.querySelector('div[data-alt*="User profile avatar"]');
    if (userAvatar) {
        userAvatar.addEventListener('click', function() {
            window.location.href = 'profile_code.html';
        });
    }
    
    // Mobile menu
    const menuBtn = document.querySelector('button .material-symbols-outlined:contains("menu")');
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            const sidebar = document.querySelector('aside');
            sidebar.classList.toggle('hidden');
        });
    }
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
}

// 🎯 Setup transcript controls
function setupTranscriptControls() {
    // Auto-scroll toggle
    const autoScrollBtn = document.querySelector('button[title*="Auto-scroll"]');
    if (autoScrollBtn) {
        autoScrollBtn.addEventListener('click', function() {
            const isEnabled = this.classList.contains('text-primary');
            if (isEnabled) {
                this.classList.remove('text-primary');
                this.classList.add('text-slate-400');
                stopAutoScroll();
            } else {
                this.classList.add('text-primary');
                this.classList.remove('text-slate-400');
                startAutoScroll();
            }
        });
    }
    
    // Search transcript
    const searchBtn = document.querySelector('button[title*="Search in transcript"]');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = prompt('Search in transcript:');
            if (searchTerm) {
                highlightTranscript(searchTerm);
            }
        });
    }
}

// 🎯 Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ignore if user is typing in input
        if (e.target.matches('input, textarea, [contenteditable]')) return;
        
        switch(e.key) {
            case ' ':
            case 'Spacebar':
                e.preventDefault();
                togglePlayPause();
                break;
                
            case 'f':
            case 'F':
                e.preventDefault();
                toggleFullscreen();
                break;
                
            case 'm':
            case 'M':
                e.preventDefault();
                toggleMute();
                break;
                
            case 'ArrowLeft':
                e.preventDefault();
                skipBackward(5);
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                skipForward(5);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                increaseVolume();
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                decreaseVolume();
                break;
        }
    });
}

// 🎯 Load initial video
async function loadInitialVideo() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoParam = urlParams.get('video');
    
    const urlInput = document.querySelector('input[placeholder*="YouTube URL"]');
    
    if (videoParam && YouTubeConfig.isValidVideoId(videoParam)) {
        // Load from URL parameter
        if (urlInput) {
            urlInput.value = YouTubeConfig.buildWatchUrl(videoParam);
        }
        await loadYouTubeVideo(videoParam);
    } else {
        // Load default video
        const defaultVideoId = YouTubeConfig.getVideoId('spanish_lesson_4') || 'dMH0bHeiRNg';
        if (urlInput) {
            urlInput.value = YouTubeConfig.buildWatchUrl(defaultVideoId);
        }
        await loadYouTubeVideo(defaultVideoId);
    }
}

// 🎯 Load video from input
async function loadVideoFromInput() {
    const urlInput = document.querySelector('input[placeholder*="YouTube URL"]');
    if (!urlInput) {
        showNotification('Input field not found', 'error');
        return;
    }
    
    const url = urlInput.value.trim();
    if (!url) {
        showNotification('Please enter a YouTube URL', 'error');
        return;
    }
    
    // Extract video ID from URL
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
        showNotification('Invalid YouTube URL. Please check the format.', 'error');
        return;
    }
    
    console.log('🎬 Loading video:', videoId);
    await loadYouTubeVideo(videoId);
}

// 🎯 Extract YouTube Video ID from URL
function extractYouTubeVideoId(url) {
    // Handle different YouTube URL formats
    const patterns = [
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,           // youtube.com/watch?v=...
        /youtu\.be\/([a-zA-Z0-9_-]+)/,                         // youtu.be/...
        /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,              // youtube.com/embed/...
        /youtube\.com\/v\/([a-zA-Z0-9_-]+)/,                  // youtube.com/v/...
        /^([a-zA-Z0-9_-]{11})$/                                // Direct video ID
    ];
    
    for (let pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
}

// 🎯 Load YouTube video
async function loadYouTubeVideo(videoId) {
    showLoading();
    
    try {
        console.log('🎥 Loading video with ID:', videoId);
        
        // Check if youtubeAPI is available
        if (!youtubeAPI) {
            throw new Error('YouTube API not initialized');
        }
        
        let videoDetails = null;
        
        // Try to get video details from Data API
        try {
            if (youtubeAPI.dataApi && youtubeAPI.dataApi.getVideoDetails) {
                videoDetails = await youtubeAPI.dataApi.getVideoDetails(videoId);
                console.log('✅ Video details loaded:', videoDetails.title);
            }
        } catch (detailsError) {
            console.warn('Could not fetch video details:', detailsError);
            videoDetails = {
                videoId: videoId,
                title: 'Video - ' + videoId,
                channelTitle: 'Unknown Channel'
            };
        }
        
        // Update video info
        if (videoDetails) {
            updateVideoInfo(videoDetails);
        }
        
        // Initialize player using YouTubeAPI.initPlayer()
        console.log('📺 Initializing YouTube player...');
        const playerContainer = document.getElementById('youtube-player');
        
        if (!playerContainer) {
            throw new Error('Player container not found in DOM');
        }
        
        // Use youtubeAPI.initPlayer() to create the actual YouTube player
        try {
            playerInstance = await youtubeAPI.initPlayer('youtube-player', videoId);
            console.log('✅ YouTube Player initialized successfully');
            currentVideoId = videoId;
        } catch (playerError) {
            console.error('❌ Error initializing player:', playerError);
            // Fallback to simple iframe
            console.warn('⚠️ Using iframe fallback for player');
            playerContainer.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            playerInstance = { videoId };
            currentVideoId = videoId;
        }
        
        // Try to load transcript
        try {
            transcriptData = generateTranscript(videoId);
            renderTranscript(transcriptData);
        } catch (transcriptError) {
            console.warn('Could not load transcript:', transcriptError);
        }
        
        // Update URL parameter
        try {
            updateUrlParameter(videoId);
        } catch (urlError) {
            console.warn('Could not update URL:', urlError);
        }
        
        // Hide loading
        hideLoading();
        
        // Show success message
        showNotification(`Loaded: "${videoDetails?.title || videoId}"`, 'success');
        
    } catch (error) {
        console.error('❌ Error loading video:', error);
        hideLoading();
        showNotification('Failed to load video. ' + error.message, 'error');
    }
}

// 🎯 Initialize YouTube player (simplified - now handled in loadYouTubeVideo)
async function initializeYouTubePlayer(videoId) {
    // This function is kept for backward compatibility
    // The actual player initialization is now handled in loadYouTubeVideo()
    console.log('Player initialization handled by loadYouTubeVideo()');
}

// 🎯 Setup player events
function setupPlayerEvents() {
    if (!playerInstance) return;
    
    // Player state changes
    youtubeAPI.player.on('stateChange', ({ state, stateName }) => {
        console.log('Player state:', stateName);
        
        const playBtn = document.getElementById('play-pause-btn');
        const overlay = document.getElementById('play-overlay');
        
        switch(state) {
            case 1: // Playing
                isPlaying = true;
                if (playBtn) {
                    playBtn.innerHTML = '<span class="material-symbols-outlined text-2xl">pause</span>';
                }
                if (overlay) {
                    overlay.style.opacity = '0';
                }
                startProgressUpdate();
                break;
                
            case 2: // Paused
                isPlaying = false;
                if (playBtn) {
                    playBtn.innerHTML = '<span class="material-symbols-outlined text-2xl">play_arrow</span>';
                }
                if (overlay) {
                    overlay.style.opacity = '1';
                }
                stopProgressUpdate();
                break;
                
            case 0: // Ended
                isPlaying = false;
                if (playBtn) {
                    playBtn.innerHTML = '<span class="material-symbols-outlined text-2xl">replay</span>';
                }
                if (overlay) {
                    overlay.style.opacity = '1';
                    overlay.innerHTML = `
                        <div class="flex items-center justify-center rounded-full size-20 bg-primary/90 text-white shadow-[0_0_30px_rgba(19,164,236,0.5)] hover:scale-110 transition-transform duration-200">
                            <span class="material-symbols-outlined text-[40px]">replay</span>
                        </div>
                    `;
                }
                stopProgressUpdate();
                showNotification('Video completed! Great job learning!', 'success');
                break;
        }
    });
    
    // Player errors
    youtubeAPI.player.on('error', ({ code, message }) => {
        console.error('Player error:', message);
        showNotification(`Player error: ${message}`, 'error');
    });
    
    // Player ready
    youtubeAPI.player.on('playing', () => {
        console.log('Video started playing');
    });
    
    youtubeAPI.player.on('paused', () => {
        console.log('Video paused');
    });
    
    youtubeAPI.player.on('ended', () => {
        console.log('Video ended');
    });
}

// 🎯 Setup custom controls
function setupCustomControls() {
    // Play/Pause button
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }
    
    // Volume button
    const volumeBtn = document.getElementById('volume-btn');
    if (volumeBtn) {
        volumeBtn.addEventListener('click', toggleMute);
    }
    
    // Progress bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.addEventListener('click', handleProgressClick);
    }
    
    // Fullscreen button
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showPlayerSettings);
    }
}

// 🎯 Toggle play/pause
async function togglePlayPause() {
    if (!playerInstance) return;
    
    try {
        if (isPlaying) {
            await youtubeAPI.player.pauseVideo();
        } else {
            await youtubeAPI.player.playVideo();
        }
    } catch (error) {
        console.error('Error toggling play/pause:', error);
    }
}

// 🎯 Toggle mute
async function toggleMute() {
    if (!playerInstance) return;
    
    try {
        const isMuted = await youtubeAPI.player.isMuted();
        const volumeBtn = document.getElementById('volume-btn');
        
        if (isMuted) {
            await youtubeAPI.player.unMute();
            if (volumeBtn) {
                volumeBtn.innerHTML = '<span class="material-symbols-outlined text-xl">volume_up</span>';
            }
        } else {
            await youtubeAPI.player.mute();
            if (volumeBtn) {
                volumeBtn.innerHTML = '<span class="material-symbols-outlined text-xl">volume_off</span>';
            }
        }
    } catch (error) {
        console.error('Error toggling mute:', error);
    }
}

// 🎯 Handle progress bar click
async function handleProgressClick(e) {
    if (!playerInstance) return;
    
    try {
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        
        const duration = await youtubeAPI.player.getDuration();
        const seekTime = duration * percent;
        
        await youtubeAPI.player.seekTo(seekTime, true);
        
        // Update progress display
        updateProgressDisplay(seekTime, duration);
        
    } catch (error) {
        console.error('Error seeking video:', error);
    }
}

// 🎯 Start progress update
function startProgressUpdate() {
    if (window.progressInterval) clearInterval(window.progressInterval);
    
    window.progressInterval = setInterval(async () => {
        if (!playerInstance || !isPlaying) return;
        
        try {
            const currentTime = await youtubeAPI.player.getCurrentTime();
            const duration = await youtubeAPI.player.getDuration();
            const percent = (currentTime / duration) * 100;
            
            // Update progress bar
            const progressFill = document.getElementById('progress-fill');
            if (progressFill) {
                progressFill.style.width = `${percent}%`;
            }
            
            // Update time display
            updateProgressDisplay(currentTime, duration);
            
            // Highlight current transcript line
            highlightCurrentTranscriptLine(currentTime);
            
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }, 1000);
}

// 🎯 Stop progress update
function stopProgressUpdate() {
    if (window.progressInterval) {
        clearInterval(window.progressInterval);
        window.progressInterval = null;
    }
}

// 🎯 Update progress display
function updateProgressDisplay(currentTime, duration) {
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    
    if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(currentTime);
    }
    
    if (totalTimeEl) {
        totalTimeEl.textContent = formatTime(duration);
    }
}

// 🎯 Toggle fullscreen
function toggleFullscreen() {
    const playerContainer = document.getElementById('youtube-player-container');
    if (!playerContainer) return;
    
    if (!document.fullscreenElement) {
        playerContainer.requestFullscreen().catch(err => {
            console.error('Error enabling fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// 🎯 Skip backward
async function skipBackward(seconds) {
    if (!playerInstance) return;
    
    try {
        const currentTime = await youtubeAPI.player.getCurrentTime();
        const newTime = Math.max(0, currentTime - seconds);
        await youtubeAPI.player.seekTo(newTime, true);
    } catch (error) {
        console.error('Error skipping backward:', error);
    }
}

// 🎯 Skip forward
async function skipForward(seconds) {
    if (!playerInstance) return;
    
    try {
        const currentTime = await youtubeAPI.player.getCurrentTime();
        const duration = await youtubeAPI.player.getDuration();
        const newTime = Math.min(duration, currentTime + seconds);
        await youtubeAPI.player.seekTo(newTime, true);
    } catch (error) {
        console.error('Error skipping forward:', error);
    }
}

// 🎯 Increase volume
async function increaseVolume() {
    if (!playerInstance) return;
    
    try {
        const currentVolume = await youtubeAPI.player.getVolume();
        const newVolume = Math.min(100, currentVolume + 10);
        await youtubeAPI.player.setVolume(newVolume);
    } catch (error) {
        console.error('Error increasing volume:', error);
    }
}

// 🎯 Decrease volume
async function decreaseVolume() {
    if (!playerInstance) return;
    
    try {
        const currentVolume = await youtubeAPI.player.getVolume();
        const newVolume = Math.max(0, currentVolume - 10);
        await youtubeAPI.player.setVolume(newVolume);
    } catch (error) {
        console.error('Error decreasing volume:', error);
    }
}

// 🎯 Update video info
function updateVideoInfo(videoDetails) {
    // Update title
    const titleElement = document.getElementById('video-title');
    if (titleElement) {
        titleElement.textContent = videoDetails.title;
    }
    
    // Update channel
    const channelElement = document.getElementById('video-channel');
    if (channelElement) {
        channelElement.textContent = videoDetails.channelTitle;
    }
    
    // Update views
    const viewsElement = document.getElementById('video-views');
    if (viewsElement) {
        viewsElement.textContent = `${videoDetails.viewCount} views`;
    }
    
    // Update date
    const dateElement = document.getElementById('video-date');
    if (dateElement) {
        dateElement.textContent = videoDetails.publishedAt;
    }
    
    // Update main page title
    const mainTitle = document.querySelector('h1.text-2xl');
    if (mainTitle) {
        mainTitle.textContent = videoDetails.title;
    }
    
    // Update page description
    const description = document.querySelector('p.text-\\[\\#9db0b9\\]');
    if (description) {
        description.innerHTML = `
            <span class="material-symbols-outlined text-sm">schedule</span> ${videoDetails.duration} 
            <span class="mx-1">•</span>
            <span class="material-symbols-outlined text-sm">visibility</span> ${videoDetails.viewCount} Views
            <span class="mx-1">•</span> 
            ${videoDetails.channelTitle}
        `;
    }
}

// 🎯 Generate transcript
function generateTranscript(videoId) {
    // In a real app, this would come from an API
    // For now, use predefined transcripts or generate based on video ID
    
    const transcripts = {
        'dMH0bHeiRNg': [
            { time: '0:00', text: 'Welcome to this Spanish lesson!' },
            { time: '0:15', text: 'Today we will learn basic conversational Spanish.' },
            { time: '0:30', text: 'Let\'s start with greetings.' },
            { time: '1:45', text: 'Hola means hello in Spanish.' },
            { time: '2:30', text: 'Buenos días means good morning.' },
            { time: '3:15', text: 'Now let\'s practice these phrases.' }
        ],
        'JMUxmLyrhSk': [
            { time: '0:00', text: 'What is artificial intelligence?' },
            { time: '0:25', text: 'AI refers to the simulation of human intelligence.' },
            { time: '1:10', text: 'Machines are programmed to think like humans.' },
            { time: '2:05', text: 'There are different types of AI.' },
            { time: '3:20', text: 'Machine learning is a subset of AI.' }
        ],
        'VmnHfVhQv1E': [
            { time: '0:00', text: 'Business etiquette is important for professionals.' },
            { time: '0:40', text: 'First impressions matter in business meetings.' },
            { time: '1:30', text: 'Always be punctual for appointments.' },
            { time: '2:15', text: 'Dress appropriately for the business culture.' },
            { time: '3:00', text: 'Remember to exchange business cards properly.' }
        ]
    };
    
    return transcripts[videoId] || [
        { time: '0:00', text: 'Welcome to this learning video.' },
        { time: '0:30', text: 'As you watch, key vocabulary will be highlighted.' },
        { time: '1:00', text: 'Click on any word to add it to your flashcards.' },
        { time: '2:00', text: 'Use the transcript to follow along with the video.' },
        { time: '3:00', text: 'Practice repeating phrases to improve pronunciation.' }
    ];
}

// 🎯 Render transcript
function renderTranscript(transcript) {
    const transcriptContainer = document.querySelector('.custom-scrollbar');
    if (!transcriptContainer) return;
    
    transcriptContainer.innerHTML = `
        <div class="space-y-3">
            ${transcript.map((line, index) => `
                <div class="transcript-line p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors" 
                     data-time="${line.time}" data-index="${index}">
                    <div class="flex items-start gap-3">
                        <span class="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0">${line.time}</span>
                        <p class="text-sm text-slate-700 dark:text-slate-300">${highlightVocabulary(line.text)}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Add click events
    document.querySelectorAll('.transcript-line').forEach(line => {
        line.addEventListener('click', async function() {
            const timeStr = this.dataset.time;
            const time = parseTimeString(timeStr);
            
            if (playerInstance) {
                await youtubeAPI.player.seekTo(time, true);
                await youtubeAPI.player.playVideo();
            }
        });
    });
}

// 🎯 Highlight vocabulary in transcript
function highlightVocabulary(text) {
    // List of vocabulary words to highlight
    const vocabulary = [
        'welcome', 'learn', 'practice', 'pronunciation', 'conversation',
        'greetings', 'phrases', 'important', 'professional', 'culture',
        'artificial', 'intelligence', 'machine', 'learning', 'simulation'
    ];
    
    let highlightedText = text;
    
    vocabulary.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        highlightedText = highlightedText.replace(regex, 
            `<span class="vocabulary-word text-primary font-medium cursor-help hover:text-primary/80" data-word="${word.toLowerCase()}">${word}</span>`
        );
    });
    
    return highlightedText;
}

// 🎯 Highlight current transcript line
function highlightCurrentTranscriptLine(currentTime) {
    document.querySelectorAll('.transcript-line').forEach(line => {
        const lineTime = parseTimeString(line.dataset.time);
        const isActive = Math.abs(lineTime - currentTime) < 2;
        
        if (isActive) {
            line.classList.add('bg-primary/10', 'border-l-4', 'border-primary', 'pl-2');
            line.classList.remove('hover:bg-slate-100', 'dark:hover:bg-slate-800/50');
            
            // Auto-scroll if enabled
            const autoScrollBtn = document.querySelector('button[title*="Auto-scroll"]');
            if (autoScrollBtn && autoScrollBtn.classList.contains('text-primary')) {
                line.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            line.classList.remove('bg-primary/10', 'border-l-4', 'border-primary', 'pl-2');
            line.classList.add('hover:bg-slate-100', 'dark:hover:bg-slate-800/50');
        }
    });
}

// 🎯 Start auto-scroll
function startAutoScroll() {
    console.log('Auto-scroll enabled');
}

// 🎯 Stop auto-scroll
function stopAutoScroll() {
    console.log('Auto-scroll disabled');
}

// 🎯 Highlight search terms in transcript
function highlightTranscript(searchTerm) {
    const transcriptLines = document.querySelectorAll('.transcript-line p');
    let found = false;
    
    transcriptLines.forEach(line => {
        const text = line.textContent.toLowerCase();
        if (text.includes(searchTerm.toLowerCase())) {
            const html = line.innerHTML;
            const highlighted = html.replace(
                new RegExp(searchTerm, 'gi'),
                match => `<mark class="bg-yellow-200 dark:bg-yellow-800">${match}</mark>`
            );
            line.innerHTML = highlighted;
            found = true;
            
            // Scroll to first occurrence
            if (!found) {
                line.closest('.transcript-line').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
    
    if (!found) {
        showNotification(`"${searchTerm}" not found in transcript`, 'warning');
    }
}

// 🎯 Save current word to flashcards
function saveCurrentWordToFlashcards() {
    // Get highlighted word from transcript
    const activeWord = document.querySelector('.vocabulary-word:hover')?.dataset.word || 
                      document.querySelector('.text-yellow-400')?.textContent || 
                      'vocabulary';
    
    // Save to localStorage
    const flashcards = JSON.parse(localStorage.getItem('linguaflow_flashcards') || '[]');
    
    if (!flashcards.some(card => card.word === activeWord)) {
        flashcards.push({
            word: activeWord,
            addedAt: new Date().toISOString(),
            videoId: currentVideoId,
            context: getCurrentContext(),
            level: 'B1',
            mastered: false
        });
        
        localStorage.setItem('linguaflow_flashcards', JSON.stringify(flashcards));
        showNotification(`"${activeWord}" added to flashcards!`, 'success');
    } else {
        showNotification(`"${activeWord}" is already in your flashcards`, 'info');
    }
}

// 🎯 Get current context for vocabulary
function getCurrentContext() {
    // Get current transcript line
    const activeLine = document.querySelector('.transcript-line.bg-primary\\/10');
    if (activeLine) {
        return activeLine.querySelector('p')?.textContent || 'From video transcript';
    }
    return 'From video learning session';
}

// 🎯 Show video settings
function showVideoSettings() {
    // Implementation for video settings modal
    alert('Video settings would open here. Features:\n• Playback speed\n• Subtitle language\n• Video quality\n• Autoplay settings');
}

// 🎯 Show player settings
function showPlayerSettings() {
    // Quick settings menu
    const menu = document.createElement('div');
    menu.className = 'absolute bottom-12 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-3 min-w-[200px] z-50';
    menu.innerHTML = `
        <div class="space-y-3">
            <div>
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Playback Speed</label>
                <select class="w-full mt-1 p-2 border rounded dark:bg-slate-700">
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1" selected>Normal</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                </select>
            </div>
            <div>
                <label class="flex items-center">
                    <input type="checkbox" class="mr-2" id="autoplay-toggle">
                    <span class="text-sm">Autoplay next video</span>
                </label>
            </div>
            <div>
                <label class="flex items-center">
                    <input type="checkbox" class="mr-2" id="loop-toggle">
                    <span class="text-sm">Loop this video</span>
                </label>
            </div>
            <button class="w-full mt-2 p-2 bg-primary text-white rounded text-sm font-medium">
                Apply Settings
            </button>
        </div>
    `;
    
    document.getElementById('youtube-player-container').appendChild(menu);
    
    // Close menu when clicking outside
    setTimeout(() => {
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target.id !== 'settings-btn') {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
    }, 100);
}

// 🎯 Update URL parameter
function updateUrlParameter(videoId) {
    const url = new URL(window.location);
    url.searchParams.set('video', videoId);
    window.history.pushState({ videoId }, '', url);
}

// 🎯 Create fallback API when YouTube API unavailable
function createFallbackAPI() {
    console.warn('⚠️ Using fallback API - YouTube API not available');
    
    return {
        player: null,
        playerReady: false,
        
        dataApi: {
            getVideoDetails: async function(videoId) {
                return {
                    videoId: videoId,
                    title: 'Video - ' + videoId,
                    channelTitle: 'Unknown Channel',
                    viewCount: 0,
                    likeCount: 0,
                    duration: 0,
                    description: 'No description available'
                };
            }
        },
        
        initPlayer: function(containerId, videoId) {
            console.log('🎬 Creating fallback player for video:', videoId);
            
            const container = document.getElementById(containerId);
            if (!container) return null;
            
            // Create a simple fallback player using iframe
            const iframe = document.createElement('iframe');
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.src = `https://www.youtube.com/embed/${videoId}`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.style.border = 'none';
            
            container.innerHTML = '';
            container.appendChild(iframe);
            
            this.playerReady = true;
            return { videoData: { videoId } };
        },
        
        getWatchProgress: function(videoId) {
            return null;
        }
    };
}

// 🎯 Helper: Format time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// 🎯 Helper: Parse time string
function parseTimeString(timeStr) {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    return 0;
}

// 🎯 Helper: Show loading
function showLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.style.opacity = '1';
        loading.style.pointerEvents = 'auto';
    }
}

// 🎯 Helper: Hide loading
function hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.style.opacity = '0';
        loading.style.pointerEvents = 'none';
    }
}

// 🎯 Helper: Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.linguaflow-notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `linguaflow-notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full`;
    
    // Style based on type
    const styles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-primary text-white'
    };
    
    notification.className += ` ${styles[type] || styles.info}`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="material-symbols-outlined">
                ${type === 'success' ? 'check_circle' : 
                  type === 'error' ? 'error' :
                  type === 'warning' ? 'warning' : 'info'}
            </span>
            <span class="font-medium">${message}</span>
            <button class="ml-4" onclick="this.parentElement.parentElement.remove()">
                <span class="material-symbols-outlined text-sm">close</span>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// 🎯 Navigation function
function navigateToPage(page) {
    const pageMap = {
        'home': 'dashboard_code.html',
        'videolearning': 'learningVideo_code.html',
        'flashcards': 'flashcards_code.html',
        'exercises': 'exercises_code.html',
        'progress': 'progress_code.html',
        'settings': 'settings_code.html',
        'profile': 'profile_code.html'
    };

    if (pageMap[page]) {
        window.location.href = pageMap[page];
    }
}

// 🎯 Make functions available globally
window.showNotification = showNotification;
window.togglePlayPause = togglePlayPause;
window.toggleFullscreen = toggleFullscreen;
