// exercises.js

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
            const page = this.textContent.trim().toLowerCase().replace(/\s+/g, '');
            navigateToPage(page);
        });
    });

    // Video play button
    const videoPlayBtn = document.querySelector('.group.cursor-pointer button');
    if (videoPlayBtn) {
        videoPlayBtn.addEventListener('click', function() {
            const videoThumbnail = this.closest('.group');
            videoThumbnail.innerHTML = `
                <video controls autoplay class="w-full h-full">
                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4">
                </video>
            `;
        });
    }

    // Next Exercise button
    const nextExerciseBtn = document.querySelector('button:contains("Next Exercise")');
    if (nextExerciseBtn) {
        nextExerciseBtn.addEventListener('click', function() {
            // Simulate loading next exercise
            this.innerHTML = '<span>Loading...</span>';
            setTimeout(() => {
                alert('Moving to next exercise!');
                // In a real app, this would load new exercise content
                window.location.reload();
            }, 1000);
        });
    }

    // View Progress Report button
    const progressBtn = document.querySelector('button:contains("View Progress Report")');
    if (progressBtn) {
        progressBtn.addEventListener('click', function() {
            window.location.href = 'progress_code.html';
        });
    }

    // User dropdown (simulated)
    const userBtn = document.querySelector('button.group');
    if (userBtn) {
        userBtn.addEventListener('click', function() {
            window.location.href = 'profile_code.html';
        });
    }

    // Keyboard shortcut for Enter key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const nextBtn = document.querySelector('button:contains("Next Exercise")');
            if (nextBtn) nextBtn.click();
        }
    });

    // Initialize progress bar
    const progressBar = document.querySelector('.bg-primary.rounded-full');
    if (progressBar) {
        // Animate progress bar
        setTimeout(() => {
            progressBar.style.width = '85%';
        }, 500);
    }

    // Mobile menu toggle
    const menuBtn = document.querySelector('button .material-symbols-outlined:contains("menu")');
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            const sidebar = document.querySelector('aside');
            sidebar.classList.toggle('hidden');
        });
    }
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
