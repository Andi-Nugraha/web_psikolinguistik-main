// progress.js

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
            const page = this.querySelector('span')?.textContent || this.textContent;
            navigateToPage(page.trim().toLowerCase().replace(/\s+/g, ''));
        });
    });

    // Time period buttons
    const periodButtons = document.querySelectorAll('.bg-gray-100 button');
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            periodButtons.forEach(btn => {
                btn.classList.remove('bg-white', 'dark:bg-[#283339]', 'shadow-sm');
                btn.classList.add('text-gray-500', 'dark:text-[#9db0b9]');
            });
            
            // Add active class to clicked button
            this.classList.add('bg-white', 'dark:bg-[#283339]', 'shadow-sm');
            this.classList.remove('text-gray-500', 'dark:text-[#9db0b9]');
            
            // Update chart based on selected period
            updateChartData(this.textContent.trim());
        });
    });

    // Start Practice button
    const startPracticeBtn = document.querySelector('button:contains("Start Practice")');
    if (startPracticeBtn) {
        startPracticeBtn.addEventListener('click', function() {
            window.location.href = 'exercises_code.html';
        });
    }

    // View Detailed Report button
    const detailedReportBtn = document.querySelector('button:contains("View Detailed Report")');
    if (detailedReportBtn) {
        detailedReportBtn.addEventListener('click', function() {
            showDetailedReport();
        });
    }

    // Video thumbnails click
    const videoThumbnails = document.querySelectorAll('.cursor-pointer');
    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            window.location.href = 'learningVideo_code.html';
        });
    });

    // User profile click
    const userProfile = document.querySelector('div[data-alt*="User avatar"]');
    if (userProfile) {
        userProfile.addEventListener('click', function() {
            window.location.href = 'profile_code.html';
        });
    }

    // Initialize chart
    initializeChart();

    // Load progress data
    loadProgressData();

    // Update stats cards with animation
    animateStatsCards();
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

function updateChartData(period) {
    // Data for different time periods
    const chartData = {
        'Last 7 Days': [45, 35, 25, 20, 15, 10, 5],
        'This Month': [30, 45, 35, 40, 25, 30, 35, 40, 45, 35, 30, 25, 20, 15, 10, 5, 10, 15, 20, 25, 30, 35, 40, 35, 30, 25, 20, 15, 10, 5],
        'This Year': [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65]
    };

    const data = chartData[period] || chartData['Last 7 Days'];
    updateChart(data);
}

function updateChart(data) {
    const svg = document.querySelector('svg');
    if (!svg) return;

    // Create new path based on data
    const maxValue = Math.max(...data);
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 50 - (value / maxValue) * 50;
        return `${x} ${y}`;
    }).join(' ');

    const pathData = `M ${points}`;
    
    // Update the line
    const line = svg.querySelector('path[stroke="#13a4ec"]');
    if (line) line.setAttribute('d', pathData);

    // Update the fill
    const fill = svg.querySelector('path[fill="url(#chartGradient)"]');
    if (fill) {
        const fillData = `M ${points} V 50 H 0 Z`;
        fill.setAttribute('d', fillData);
    }

    // Update circles
    const circles = svg.querySelectorAll('circle[stroke="#13a4ec"]');
    circles.forEach((circle, index) => {
        if (index < data.length) {
            const x = (index / (data.length - 1)) * 100;
            const y = 50 - (data[index] / maxValue) * 50;
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.style.opacity = '1';
        } else {
            circle.style.opacity = '0';
        }
    });

    // Update the highlight (82 value)
    const highlight = svg.querySelector('g[transform*="66.6"]');
    if (highlight && data.length >= 4) {
        const highlightValue = data[4] || data[data.length - 1];
        highlight.querySelector('text').textContent = highlightValue;
    }

    // Update x-axis labels
    updateXAxisLabels(data.length);
}

function updateXAxisLabels(dataLength) {
    const labelsContainer = document.querySelector('.ml-8.mt-4');
    if (!labelsContainer) return;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let labels = [];
    
    if (dataLength <= 7) {
        labels = days.slice(0, dataLength);
    } else if (dataLength <= 30) {
        // For month view, show every 5 days
        labels = Array.from({length: 6}, (_, i) => `Day ${i * 5 + 1}`);
    } else {
        // For year view, show months
        labels = months.slice(0, Math.min(dataLength, 12));
    }

    labelsContainer.innerHTML = labels
        .map(label => `<span>${label}</span>`)
        .join('');
}

function initializeChart() {
    // Initial chart data for 7 days
    const initialData = [45, 35, 25, 20, 15, 10, 5];
    updateChart(initialData);
}

function loadProgressData() {
    const progressData = JSON.parse(localStorage.getItem('progressData')) || {
        totalLearningTime: '42h 15m',
        videosWatched: 18,
        wordsMastered: 1240,
        weeklyGrowth: 12,
        monthlyGrowth: 3,
        yearlyGrowth: 8
    };

    // Update stats cards
    const statCards = document.querySelectorAll('.group.flex.flex-col');
    if (statCards.length >= 3) {
        const timeElement = statCards[0].querySelector('p.text-2xl');
        const videosElement = statCards[1].querySelector('p.text-2xl');
        const wordsElement = statCards[2].querySelector('p.text-2xl');
        
        if (timeElement) timeElement.textContent = progressData.totalLearningTime;
        if (videosElement) videosElement.textContent = progressData.videosWatched;
        if (wordsElement) wordsElement.textContent = progressData.wordsMastered.toLocaleString();
    }

    // Update CEFR levels from user data
    const user = JSON.parse(localStorage.getItem('currentUser')) || {};
    if (user.level) {
        // Update level in the page
        const levelElement = document.querySelector('span.text-primary.font-bold');
        if (levelElement) {
            levelElement.textContent = user.level;
        }
    }
}

function animateStatsCards() {
    const statCards = document.querySelectorAll('.group.flex.flex-col');
    
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

function showDetailedReport() {
    const modalHTML = `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-[#111618] rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-2xl font-bold">Detailed Progress Report</h3>
                        <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    <div class="space-y-6">
                        <!-- Summary -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="bg-gray-50 dark:bg-[#1e262b] p-4 rounded-lg">
                                <h4 class="font-bold mb-2">Overall Progress</h4>
                                <div class="flex items-center justify-between">
                                    <span class="text-3xl font-bold">78%</span>
                                    <div class="w-16 h-16 rounded-full border-8 border-primary"></div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-50 dark:bg-[#1e262b] p-4 rounded-lg">
                                <h4 class="font-bold mb-2">Consistency</h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span>Current Streak</span>
                                        <span class="font-bold">12 days</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>Longest Streak</span>
                                        <span class="font-bold">28 days</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-50 dark:bg-[#1e262b] p-4 rounded-lg">
                                <h4 class="font-bold mb-2">Accuracy</h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span>Flashcards</span>
                                        <span class="font-bold text-green-600">92%</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>Exercises</span>
                                        <span class="font-bold text-green-600">85%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Detailed Stats -->
                        <div>
                            <h4 class="text-lg font-bold mb-4">Activity Breakdown</h4>
                            <div class="space-y-3">
                                ${generateActivityBreakdown()}
                            </div>
                        </div>
                        
                        <!-- Recommendations -->
                        <div class="bg-primary/10 p-4 rounded-lg">
                            <h4 class="font-bold mb-2 text-primary">Personalized Recommendations</h4>
                            <ul class="list-disc list-inside space-y-1">
                                <li>Focus on verb conjugation exercises (your accuracy is 65%)</li>
                                <li>Watch more B1-level videos to improve listening comprehension</li>
                                <li>Practice speaking for 10 minutes daily to improve fluency</li>
                            </ul>
                        </div>
                        
                        <!-- Export Options -->
                        <div class="flex justify-end gap-3 pt-6 border-t">
                            <button class="px-4 py-2 border rounded-lg" onclick="exportReport('pdf')">
                                Export as PDF
                            </button>
                            <button class="px-4 py-2 bg-primary text-white rounded-lg" onclick="shareReport()">
                                Share Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function generateActivityBreakdown() {
    const activities = [
        { name: 'Video Lessons', time: '15h 30m', count: 24 },
        { name: 'Flashcard Reviews', time: '8h 45m', count: 156 },
        { name: 'Practice Exercises', time: '12h 20m', count: 48 },
        { name: 'Speaking Practice', time: '5h 40m', count: 12 }
    ];
    
    return activities.map(activity => `
        <div class="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-[#1e262b] rounded">
            <span>${activity.name}</span>
            <div class="flex items-center gap-4">
                <span class="text-sm text-gray-500">${activity.time}</span>
                <span class="text-sm text-gray-500">${activity.count} sessions</span>
            </div>
        </div>
    `).join('');
}

function exportReport(format) {
    alert(`Exporting report as ${format.toUpperCase()}...`);
    // In a real app, this would generate and download the report
}

function shareReport() {
    if (navigator.share) {
        navigator.share({
            title: 'My LinguaFlow Progress Report',
            text: 'Check out my language learning progress on LinguaFlow!',
            url: window.location.href
        });
    } else {
        alert('Report URL copied to clipboard!');
        navigator.clipboard.writeText(window.location.href);
    }
}
