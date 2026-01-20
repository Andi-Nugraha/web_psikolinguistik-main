// youtubeApi.js - YouTube API Integration dengan API Key Anda

class YouTubePlayer {
    constructor() {
        this.player = null;
        this.isReady = false;
        this.videoId = null;
        this.listeners = new Map();
        this.apiLoaded = false;
        this.queue = [];
    }

    // 🎯 Inisialisasi YouTube IFrame API
    init() {
        return new Promise((resolve, reject) => {
            if (this.apiLoaded) {
                resolve();
                return;
            }

            // Cek jika YT sudah dimuat
            if (window.YT && window.YT.Player) {
                this.apiLoaded = true;
                resolve();
                return;
            }

            // Load YouTube IFrame API dengan API Key
            const tag = document.createElement('script');
            tag.src = `https://www.youtube.com/iframe_api?key=${YouTubeConfig.PLAYER_API_KEY}`;
            tag.async = true;
            tag.defer = true;
            
            tag.onload = () => {
                // Setup global callback
                window.onYouTubeIframeAPIReady = () => {
                    this.apiLoaded = true;
                    console.log('✅ YouTube IFrame API loaded dengan API Key');
                    resolve();
                };
                
                // Fallback jika callback tidak terpanggil
                setTimeout(() => {
                    if (window.YT && window.YT.Player && !this.apiLoaded) {
                        this.apiLoaded = true;
                        resolve();
                    }
                }, 1000);
            };
            
            tag.onerror = (error) => {
                console.error('❌ Gagal memuat YouTube API:', error);
                reject(new Error('Failed to load YouTube IFrame API'));
            };
            
            // Tambahkan script ke dokumen
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        });
    }

    // 🎯 Buat player
    createPlayer(containerId, videoId, options = {}) {
        return new Promise((resolve, reject) => {
            this.videoId = videoId;
            
            this.init().then(() => {
                const playerOptions = {
                    videoId: videoId,
                    width: '100%',
                    height: '100%',
                    playerVars: {
                        autoplay: options.autoplay || 0,
                        controls: options.controls || 1,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0,
                        iv_load_policy: 3,
                        fs: 1,
                        enablejsapi: 1,
                        origin: window.location.origin
                    },
                    events: {
                        onReady: (event) => {
                            this.player = event.target;
                            this.isReady = true;
                            console.log(`✅ YouTube Player ready untuk video: ${videoId}`);
                            resolve(this.player);
                            this.processQueue();
                        },
                        onStateChange: (event) => {
                            this.handleStateChange(event.data);
                        },
                        onError: (event) => {
                            this.handleError(event.data);
                        }
                    }
                };

                // Buat player instance
                new YT.Player(containerId, playerOptions);

            }).catch(reject);
        });
    }

    // 🎯 Handler state changes
    handleStateChange(state) {
        const states = {
            '-1': 'unstarted',
            '0': 'ended',
            '1': 'playing',
            '2': 'paused',
            '3': 'buffering',
            '5': 'video cued'
        };

        const stateName = states[state] || 'unknown';
        
        // Trigger listeners
        this.triggerEvent('stateChange', { state, stateName });

        // Trigger specific events
        switch(state) {
            case 1: // Playing
                this.triggerEvent('playing');
                break;
            case 2: // Paused
                this.triggerEvent('paused');
                break;
            case 0: // Ended
                this.triggerEvent('ended');
                break;
        }
    }

    // 🎯 Handler errors
    handleError(errorCode) {
        const errors = {
            '2': 'Invalid parameter',
            '5': 'HTML5 player error',
            '100': 'Video not found',
            '101': 'Embedding not allowed',
            '150': 'Embedding not allowed'
        };

        const errorMessage = errors[errorCode] || `Unknown error (${errorCode})`;
        console.error(`YouTube Player Error: ${errorMessage}`);
        this.triggerEvent('error', { code: errorCode, message: errorMessage });
    }

    // 🎯 Event management
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    triggerEvent(event, data = null) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                callback(data);
            });
        }
    }

    // 🎯 Queue system
    processQueue() {
        while (this.queue.length > 0) {
            const { method, args, resolve } = this.queue.shift();
            try {
                const result = this.player[method](...args);
                if (resolve) resolve(result);
            } catch (error) {
                console.error(`Error executing queued method ${method}:`, error);
            }
        }
    }

    // 🎯 Method calls dengan queue support
    callPlayerMethod(method, ...args) {
        return new Promise((resolve, reject) => {
            if (!this.isReady || !this.player) {
                this.queue.push({ method, args, resolve });
            } else {
                try {
                    const result = this.player[method](...args);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }
        });
    }

    // 🎯 Public API methods
    playVideo() { return this.callPlayerMethod('playVideo'); }
    pauseVideo() { return this.callPlayerMethod('pauseVideo'); }
    stopVideo() { return this.callPlayerMethod('stopVideo'); }
    seekTo(seconds, allowSeekAhead = true) { return this.callPlayerMethod('seekTo', seconds, allowSeekAhead); }
    getCurrentTime() { return this.callPlayerMethod('getCurrentTime'); }
    getDuration() { return this.callPlayerMethod('getDuration'); }
    getPlayerState() { return this.callPlayerMethod('getPlayerState'); }
    mute() { return this.callPlayerMethod('mute'); }
    unMute() { return this.callPlayerMethod('unMute'); }
    isMuted() { return this.callPlayerMethod('isMuted'); }
    setVolume(volume) { return this.callPlayerMethod('setVolume', Math.max(0, Math.min(100, volume))); }
    getVolume() { return this.callPlayerMethod('getVolume'); }
    loadVideoById(videoId, startSeconds = 0) { 
        this.videoId = videoId;
        return this.callPlayerMethod('loadVideoById', videoId, startSeconds);
    }
    cueVideoById(videoId, startSeconds = 0) {
        this.videoId = videoId;
        return this.callPlayerMethod('cueVideoById', videoId, startSeconds);
    }
    destroy() {
        if (this.player) {
            this.player.destroy();
            this.player = null;
            this.isReady = false;
            this.listeners.clear();
            this.queue = [];
        }
    }
}

class YouTubeDataAPI {
    constructor() {
        this.apiKey = YouTubeConfig.DATA_API_KEY;
        this.baseUrl = 'https://www.googleapis.com/youtube/v3';
        this.cache = new Map();
        this.cacheDuration = 10 * 60 * 1000; // 10 minutes
    }

    // 🎯 Ambil detail video
    async getVideoDetails(videoId) {
        const cacheKey = `video_${videoId}`;
        const cached = this.getFromCache(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${this.apiKey}`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.items || data.items.length === 0) {
                throw new Error('Video tidak ditemukan');
            }

            const video = data.items[0];
            const result = this.formatVideoData(video);
            
            this.saveToCache(cacheKey, result);
            return result;

        } catch (error) {
            console.error('Error fetching video details:', error);
            return this.getFallbackVideoData(videoId);
        }
    }

    // 🎯 Format data video
    formatVideoData(video) {
        return {
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            channelId: video.snippet.channelId,
            channelTitle: video.snippet.channelTitle,
            publishedAt: new Date(video.snippet.publishedAt).toLocaleDateString(),
            duration: this.parseDuration(video.contentDetails.duration),
            durationSeconds: this.parseDurationToSeconds(video.contentDetails.duration),
            viewCount: this.formatNumber(video.statistics?.viewCount),
            likeCount: this.formatNumber(video.statistics?.likeCount),
            commentCount: this.formatNumber(video.statistics?.commentCount),
            tags: video.snippet.tags || [],
            thumbnails: video.snippet.thumbnails,
            categoryId: video.snippet.categoryId,
            liveBroadcastContent: video.snippet.liveBroadcastContent
        };
    }

    // 🎯 Parse durasi ke detik
    parseDurationToSeconds(duration) {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        
        let hours = 0, minutes = 0, seconds = 0;
        
        if (match[1]) hours = parseInt(match[1].replace('H', ''));
        if (match[2]) minutes = parseInt(match[2].replace('M', ''));
        if (match[3]) seconds = parseInt(match[3].replace('S', ''));
        
        return hours * 3600 + minutes * 60 + seconds;
    }

    // 🎯 Parse durasi ke format readable
    parseDuration(duration) {
        const totalSeconds = this.parseDurationToSeconds(duration);
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // 🎯 Format angka
    formatNumber(num) {
        if (!num) return '0';
        
        const n = parseInt(num);
        if (n >= 1000000) {
            return (n / 1000000).toFixed(1) + 'M';
        } else if (n >= 1000) {
            return (n / 1000).toFixed(1) + 'K';
        }
        return n.toString();
    }

    // 🎯 Cari video untuk pembelajaran bahasa
    async searchLanguageVideos(query, level = 'B1', maxResults = 10) {
        const cacheKey = `search_${query}_${level}_${maxResults}`;
        const cached = this.getFromCache(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const searchQuery = `${query} ${level} English lesson`;
            const params = new URLSearchParams({
                part: 'snippet',
                q: searchQuery,
                type: 'video',
                maxResults: maxResults,
                key: this.apiKey,
                videoDuration: 'medium',
                relevanceLanguage: 'en',
                videoEmbeddable: 'true',
                videoCategoryId: '27' // Education
            });

            const response = await fetch(`${this.baseUrl}/search?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.items) {
                return [];
            }

            // Ambil detail video
            const videoIds = data.items.map(item => item.id.videoId).filter(id => id);
            const videosDetails = await this.getMultipleVideosDetails(videoIds);

            const results = data.items.map((item, index) => ({
                id: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                channelTitle: item.snippet.channelTitle,
                publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
                thumbnail: item.snippet.thumbnails.medium.url,
                duration: videosDetails[index]?.duration || '0:00',
                level: level
            }));

            this.saveToCache(cacheKey, results);
            return results;

        } catch (error) {
            console.error('Error searching videos:', error);
            return this.getFallbackRecommendations(level);
        }
    }

    // 🎯 Ambil detail multiple videos
    async getMultipleVideosDetails(videoIds) {
        if (!videoIds || videoIds.length === 0) return [];

        try {
            const response = await fetch(
                `${this.baseUrl}/videos?part=contentDetails&id=${videoIds.join(',')}&key=${this.apiKey}`
            );

            if (!response.ok) {
                return [];
            }

            const data = await response.json();

            return data.items.map(video => ({
                id: video.id,
                duration: this.parseDuration(video.contentDetails.duration)
            }));

        } catch (error) {
            console.error('Error fetching multiple videos:', error);
            return [];
        }
    }

    // 🎯 Rekomendasi video berdasarkan level
    async getRecommendedVideos(level = 'B1', limit = 4) {
        // Gunakan video yang sudah ditentukan berdasarkan level
        const videoIds = YouTubeConfig.getVideosByLevel(level);
        
        if (videoIds.length === 0) {
            return this.searchLanguageVideos('learn', level, limit);
        }

        // Ambil detail video
        const videos = [];
        for (const videoId of videoIds.slice(0, limit)) {
            try {
                const details = await this.getVideoDetails(videoId);
                videos.push({
                    id: videoId,
                    title: details.title,
                    description: details.description.substring(0, 100) + '...',
                    channelTitle: details.channelTitle,
                    duration: details.duration,
                    thumbnail: details.thumbnails?.medium?.url || YouTubeConfig.getThumbnailUrl(videoId),
                    level: level,
                    views: details.viewCount
                });
            } catch (error) {
                console.error(`Error fetching video ${videoId}:`, error);
            }
        }

        return videos;
    }

    // 🎯 Ambil video dari channel edukasi
    async getEducationalVideos(limit = 5) {
        const cacheKey = `educational_${limit}`;
        const cached = this.getFromCache(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const channelId = YouTubeConfig.getChannelId('BBC Learning English');
            if (!channelId) return [];

            const params = new URLSearchParams({
                part: 'snippet',
                channelId: channelId,
                type: 'video',
                maxResults: limit,
                key: this.apiKey,
                order: 'date',
                videoEmbeddable: 'true'
            });

            const response = await fetch(`${this.baseUrl}/search?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            const results = data.items.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description.substring(0, 150) + '...',
                channelTitle: item.snippet.channelTitle,
                publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
                thumbnail: item.snippet.thumbnails.medium.url
            }));

            this.saveToCache(cacheKey, results);
            return results;

        } catch (error) {
            console.error('Error fetching educational videos:', error);
            return [];
        }
    }

    // 🎯 Cache management
    saveToCache(key, data) {
        const cacheItem = {
            data,
            timestamp: Date.now()
        };
        this.cache.set(key, cacheItem);
        
        // Simpan ke localStorage
        try {
            const allCache = JSON.parse(localStorage.getItem('youtube_cache') || '{}');
            allCache[key] = cacheItem;
            localStorage.setItem('youtube_cache', JSON.stringify(allCache));
        } catch (e) {
            console.warn('Cannot save to localStorage:', e);
        }
    }

    getFromCache(key) {
        // Cek memory cache
        const memoryCache = this.cache.get(key);
        if (memoryCache && (Date.now() - memoryCache.timestamp) < this.cacheDuration) {
            return memoryCache.data;
        }

        // Cek localStorage
        try {
            const allCache = JSON.parse(localStorage.getItem('youtube_cache') || '{}');
            const cacheItem = allCache[key];
            
            if (cacheItem && (Date.now() - cacheItem.timestamp) < this.cacheDuration) {
                this.cache.set(key, cacheItem);
                return cacheItem.data;
            }
        } catch (e) {
            console.warn('Cannot read from localStorage:', e);
        }

        return null;
    }

    clearCache() {
        this.cache.clear();
        localStorage.removeItem('youtube_cache');
    }

    // 🎯 Fallback data
    getFallbackVideoData(videoId) {
        const fallbackData = {
            'dMH0bHeiRNg': {
                id: 'dMH0bHeiRNg',
                title: 'Learn Spanish in 30 Minutes - ALL the Basics You Need',
                description: 'Learn Spanish twice as fast with your FREE gifts including the 2000 Most Common Spanish Words!',
                channelTitle: 'Learn Spanish with SpanishPod101.com',
                duration: '32:39',
                durationSeconds: 1959,
                viewCount: '1.2M',
                likeCount: '28K',
                commentCount: '1.2K',
                thumbnails: {
                    default: { url: YouTubeConfig.getThumbnailUrl(videoId, 'default') },
                    medium: { url: YouTubeConfig.getThumbnailUrl(videoId, 'mqdefault') },
                    high: { url: YouTubeConfig.getThumbnailUrl(videoId, 'hqdefault') }
                }
            },
            'JMUxmLyrhSk': {
                id: 'JMUxmLyrhSk',
                title: 'What Is Artificial Intelligence? | Artificial Intelligence Explained',
                description: 'In this video, you will learn what artificial intelligence is, how it works, and its different types.',
                channelTitle: 'Simplilearn',
                duration: '8:37',
                durationSeconds: 517,
                viewCount: '850K',
                likeCount: '18K',
                commentCount: '850',
                thumbnails: {
                    default: { url: YouTubeConfig.getThumbnailUrl(videoId, 'default') },
                    medium: { url: YouTubeConfig.getThumbnailUrl(videoId, 'mqdefault') },
                    high: { url: YouTubeConfig.getThumbnailUrl(videoId, 'hqdefault') }
                }
            }
        };

        return fallbackData[videoId] || {
            id: videoId,
            title: 'Video Pembelajaran Bahasa',
            description: 'Video pembelajaran bahasa untuk meningkatkan kemampuan Anda',
            channelTitle: 'LinguaFlow',
            duration: '10:00',
            durationSeconds: 600,
            viewCount: '1K',
            likeCount: '100',
            commentCount: '50',
            thumbnails: {
                default: { url: YouTubeConfig.getThumbnailUrl(videoId, 'default') },
                medium: { url: YouTubeConfig.getThumbnailUrl(videoId, 'mqdefault') },
                high: { url: YouTubeConfig.getThumbnailUrl(videoId, 'hqdefault') }
            }
        };
    }

    // 🎯 Rekomendasi fallback
    getFallbackRecommendations(level) {
        const recommendations = {
            'A1': [
                {
                    id: 'zQe9J-7CbC4',
                    title: 'Everyday English Conversation Practice',
                    channelTitle: 'English Conversation',
                    duration: '41:46',
                    thumbnail: YouTubeConfig.getThumbnailUrl('zQe9J-7CbC4', 'mqdefault')
                }
            ],
            'B1': [
                {
                    id: 'dMH0bHeiRNg',
                    title: 'Learn Spanish in 30 Minutes',
                    channelTitle: 'SpanishPod101',
                    duration: '32:39',
                    thumbnail: YouTubeConfig.getThumbnailUrl('dMH0bHeiRNg', 'mqdefault')
                }
            ],
            'B2': [
                {
                    id: 'JMUxmLyrhSk',
                    title: 'What Is Artificial Intelligence?',
                    channelTitle: 'Simplilearn',
                    duration: '8:37',
                    thumbnail: YouTubeConfig.getThumbnailUrl('JMUxmLyrhSk', 'mqdefault')
                }
            ]
        };

        return recommendations[level] || [];
    }
}

// 🎯 Main YouTube API class
class YouTubeAPI {
    constructor() {
        this.player = new YouTubePlayer();
        this.dataApi = new YouTubeDataAPI();
        this.currentVideoId = null;
        this.videoHistory = JSON.parse(localStorage.getItem('linguaflow_video_history') || '[]');
        this.watchProgress = JSON.parse(localStorage.getItem('linguaflow_watch_progress') || '{}');
    }

    // 🎯 Inisialisasi player
    async initPlayer(containerId, videoId, options = {}) {
        try {
            const player = await this.player.createPlayer(containerId, videoId, options);
            this.currentVideoId = videoId;
            
            // Setup event listeners untuk track progress
            this.setupProgressTracking(videoId);
            
            // Tambah ke history
            this.addToHistory(videoId);
            
            return player;
        } catch (error) {
            console.error('Failed to initialize player:', error);
            throw error;
        }
    }

    // 🎯 Setup progress tracking
    setupProgressTracking(videoId) {
        this.player.on('stateChange', ({ state }) => {
            if (state === 1) { // Playing
                // Update progress setiap 5 detik
                this.progressInterval = setInterval(async () => {
                    try {
                        const currentTime = await this.player.getCurrentTime();
                        const duration = await this.player.getDuration();
                        const progress = (currentTime / duration) * 100;
                        
                        this.saveWatchProgress(videoId, {
                            currentTime,
                            duration,
                            progress,
                            lastWatched: new Date().toISOString()
                        });
                    } catch (error) {
                        console.error('Error tracking progress:', error);
                    }
                }, 5000);
            } else {
                if (this.progressInterval) {
                    clearInterval(this.progressInterval);
                    this.progressInterval = null;
                }
            }
        });

        this.player.on('ended', () => {
            this.saveWatchProgress(videoId, {
                completed: true,
                lastWatched: new Date().toISOString()
            });
        });
    }

    // 🎯 Simpan progress menonton
    saveWatchProgress(videoId, progress) {
        this.watchProgress[videoId] = {
            ...this.watchProgress[videoId],
            ...progress
        };
        localStorage.setItem('linguaflow_watch_progress', JSON.stringify(this.watchProgress));
    }

    // 🎯 Dapatkan progress menonton
    getWatchProgress(videoId) {
        return this.watchProgress[videoId] || null;
    }

    // 🎯 Tambah ke history
    addToHistory(videoId) {
        const history = this.videoHistory;
        
        // Hapus jika sudah ada
        const existingIndex = history.findIndex(item => item.id === videoId);
        if (existingIndex > -1) {
            history.splice(existingIndex, 1);
        }
        
        // Tambah di depan
        history.unshift({
            id: videoId,
            watchedAt: new Date().toISOString(),
            watchedOn: 'LinguaFlow'
        });
        
        // Batasi maksimal 50 item
        if (history.length > 50) {
            history.pop();
        }
        
        this.videoHistory = history;
        localStorage.setItem('linguaflow_video_history', JSON.stringify(history));
    }

    // 🎯 Dapatkan history
    getHistory(limit = 10) {
        return this.videoHistory.slice(0, limit);
    }

    // 🎯 Clear history
    clearHistory() {
        this.videoHistory = [];
        localStorage.removeItem('linguaflow_video_history');
    }

    // 🎯 Test koneksi API
    async testConnection() {
        const results = [];
        
        // Test Data API
        try {
            const testVideo = await this.dataApi.getVideoDetails('dMH0bHeiRNg');
            results.push({
                service: 'YouTube Data API',
                status: '✅ Connected',
                details: `Fetched: "${testVideo.title}"`
            });
        } catch (error) {
            results.push({
                service: 'YouTube Data API',
                status: '❌ Failed',
                details: error.message
            });
        }
        
        // Test Player API
        try {
            await this.player.init();
            results.push({
                service: 'YouTube Player API',
                status: '✅ Ready',
                details: 'IFrame API loaded successfully'
            });
        } catch (error) {
            results.push({
                service: 'YouTube Player API',
                status: '❌ Failed',
                details: error.message
            });
        }
        
        return results;
    }
}

// 🎯 Buat instance global
window.YouTubeAPI = new YouTubeAPI();