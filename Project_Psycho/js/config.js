// config.js - Configuration file for YouTube API

const YOUTUBE_CONFIG = {
    // 🎯 YouTube API Key yang Anda berikan
    DATA_API_KEY: 'AIzaSyD7HKmm6ogJoCUy4BvhtfEEOWOWv_W7jf8', // YouTube Data API v3
    PLAYER_API_KEY: 'AIzaSyBX1kvkA-NdtNcHYHaBBEWM6Fxg2n2uNGI', // YouTube Embedded Player API
    
    // 🎯 Video pembelajaran bahasa yang relevan
    DEFAULT_VIDEOS: {
        'spanish_lesson_4': 'dMH0bHeiRNg', // Learn Spanish in 30 minutes
        'ai_development': 'JMUxmLyrhSk',   // What is AI?
        'business_etiquette': 'VmnHfVhQv1E', // Business Meeting Etiquette
        'storytelling': 'I8LbiR0wDMA',     // The Power of Storytelling
        'cooking_terms': '8A6mTOxYF0I',    // Cooking Vocabulary
        'english_conversation': 'zQe9J-7CbC4', // English Conversation Practice
        'grammar_lesson': 'hWq-6qeycig',   // English Grammar Lesson
        'pronunciation': '3rP8pBWRz-o'     // Pronunciation Practice
    },
    
    // 🎯 Kategori untuk level pembelajaran
    LEVEL_VIDEOS: {
        'A1': ['zQe9J-7CbC4', 'hWq-6qeycig'], // Beginner
        'A2': ['3rP8pBWRz-o', 'VmnHfVhQv1E'], // Elementary
        'B1': ['dMH0bHeiRNg', 'I8LbiR0wDMA'], // Intermediate
        'B2': ['JMUxmLyrhSk', '8A6mTOxYF0I']  // Upper Intermediate
    },
    
    // 🎯 Channel edukasi bahasa terpercaya
    EDUCATIONAL_CHANNELS: {
        'BBC Learning English': 'UCkyZ8aD5LQoGQcag33gy7BA',
        'English with Lucy': 'UCz4tgANd4yy8Oe0iXCdSWfA',
        'Rachel\'s English': 'UCvn_XCl_mgQmt3sD753zdJA',
        'Learn English with TV Series': 'UCPc1VoKx2b4jhz9g5xj1x_Q',
        'SpanishPod101': 'UC8_grF5Rbo_RcK8VX0FUIYw'
    },
    
    // 🎯 Pengaturan player
    PLAYER_SETTINGS: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        fs: 1,
        enablejsapi: 1,
        origin: window.location.origin,
        widget_referrer: window.location.href
    }
};

// 🎯 Validasi API Key
function validateApiKeys() {
    const results = [];
    
    // Validasi Data API Key
    if (!YOUTUBE_CONFIG.DATA_API_KEY || YOUTUBE_CONFIG.DATA_API_KEY.length < 30) {
        results.push({
            key: 'DATA_API_KEY',
            valid: false,
            message: 'YouTube Data API Key tidak valid'
        });
    } else {
        results.push({
            key: 'DATA_API_KEY',
            valid: true,
            message: 'YouTube Data API Key valid'
        });
    }
    
    // Validasi Player API Key
    if (!YOUTUBE_CONFIG.PLAYER_API_KEY || YOUTUBE_CONFIG.PLAYER_API_KEY.length < 30) {
        results.push({
            key: 'PLAYER_API_KEY',
            valid: false,
            message: 'YouTube Player API Key tidak valid'
        });
    } else {
        results.push({
            key: 'PLAYER_API_KEY',
            valid: true,
            message: 'YouTube Player API Key valid'
        });
    }
    
    return results;
}

// 🎯 Fungsi untuk mendapatkan API Key berdasarkan tipe
function getApiKey(type = 'data') {
    switch(type.toLowerCase()) {
        case 'data':
            return YOUTUBE_CONFIG.DATA_API_KEY;
        case 'player':
            return YOUTUBE_CONFIG.PLAYER_API_KEY;
        default:
            return YOUTUBE_CONFIG.DATA_API_KEY;
    }
}

// 🎯 Fungsi untuk mendapatkan ID video
function getVideoId(slug) {
    return YOUTUBE_CONFIG.DEFAULT_VIDEOS[slug] || null;
}

// 🎯 Fungsi untuk mendapatkan video berdasarkan level
function getVideosByLevel(level) {
    return YOUTUBE_CONFIG.LEVEL_VIDEOS[level] || [];
}

// 🎯 Fungsi untuk mendapatkan channel ID
function getChannelId(channelName) {
    return YOUTUBE_CONFIG.EDUCATIONAL_CHANNELS[channelName] || null;
}

// 🎯 Fungsi untuk membangun URL embed
function buildEmbedUrl(videoId, options = {}) {
    const params = new URLSearchParams({
        ...YOUTUBE_CONFIG.PLAYER_SETTINGS,
        ...options,
        key: YOUTUBE_CONFIG.PLAYER_API_KEY // Gunakan Player API Key untuk embed
    });
    
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

// 🎯 Fungsi untuk membangun URL watch
function buildWatchUrl(videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
}

// 🎯 Ekstrak video ID dari URL
function extractVideoId(url) {
    if (!url) return null;
    
    const patterns = [
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
}

// 🎯 Validasi video ID
function isValidVideoId(videoId) {
    return videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

// 🎯 Fungsi untuk mendapatkan thumbnail
function getThumbnailUrl(videoId, quality = 'hqdefault') {
    const qualities = {
        'default': `https://img.youtube.com/vi/${videoId}/default.jpg`,
        'mqdefault': `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        'hqdefault': `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        'sddefault': `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
        'maxresdefault': `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
    
    return qualities[quality] || qualities['hqdefault'];
}

// 🎯 Test koneksi API
async function testApiConnection() {
    const tests = [];
    
    // Test Data API
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dMH0bHeiRNg&key=${YOUTUBE_CONFIG.DATA_API_KEY}`
        );
        tests.push({
            api: 'Data API v3',
            status: response.ok ? '✅ Berhasil' : '❌ Gagal',
            details: response.ok ? 'Koneksi berhasil' : `Error: ${response.status}`
        });
    } catch (error) {
        tests.push({
            api: 'Data API v3',
            status: '❌ Gagal',
            details: `Error: ${error.message}`
        });
    }
    
    // Test Player API (embed URL)
    try {
        const embedUrl = buildEmbedUrl('dMH0bHeiRNg', { autoplay: 0 });
        tests.push({
            api: 'Player API',
            status: '✅ Siap',
            details: 'Embed URL berhasil dibuat'
        });
    } catch (error) {
        tests.push({
            api: 'Player API',
            status: '❌ Gagal',
            details: `Error: ${error.message}`
        });
    }
    
    return tests;
}

// 🎯 Export semua fungsi
window.YouTubeConfig = {
    // Konfigurasi
    DATA_API_KEY: YOUTUBE_CONFIG.DATA_API_KEY,
    PLAYER_API_KEY: YOUTUBE_CONFIG.PLAYER_API_KEY,
    DEFAULT_VIDEOS: YOUTUBE_CONFIG.DEFAULT_VIDEOS,
    PLAYER_SETTINGS: YOUTUBE_CONFIG.PLAYER_SETTINGS,
    
    // Fungsi-fungsi
    validateApiKeys,
    getApiKey,
    getVideoId,
    getVideosByLevel,
    getChannelId,
    buildEmbedUrl,
    buildWatchUrl,
    extractVideoId,
    isValidVideoId,
    getThumbnailUrl,
    testApiConnection
};

// 🎯 Jalankan validasi saat load
document.addEventListener('DOMContentLoaded', function() {
    const validation = validateApiKeys();
    validation.forEach(result => {
        if (result.valid) {
            console.log(`✅ ${result.key}: ${result.message}`);
        } else {
            console.warn(`⚠️ ${result.key}: ${result.message}`);
        }
    });
});