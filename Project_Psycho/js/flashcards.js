// flashcards.js

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

    // Flashcard flip functionality
    const flashcards = document.querySelectorAll('.perspective-1000');
    flashcards.forEach(card => {
        card.addEventListener('click', function() {
            this.querySelector('.transform-style-3d').classList.toggle('rotate-y-180');
        });

        // Touch support for mobile
        let touchStartX = 0;
        card.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
        });

        card.addEventListener('touchend', function(e) {
            const touchEndX = e.changedTouches[0].clientX;
            if (Math.abs(touchEndX - touchStartX) > 50) {
                this.querySelector('.transform-style-3d').classList.toggle('rotate-y-180');
            }
        });
    });

    // Audio pronunciation
    const audioBtns = document.querySelectorAll('button .material-symbols-outlined:contains("volume_up")');
    audioBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const word = this.closest('.backface-hidden').querySelector('h3')?.textContent;
            if (word) {
                speakWord(word);
            }
        });
    });

    // Star/unstar words
    const starBtns = document.querySelectorAll('button .material-symbols-outlined:contains("star")');
    starBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('fill-1');
            this.textContent = this.classList.contains('fill-1') ? 'star' : 'star';
            const word = this.closest('.backface-hidden').querySelector('h3')?.textContent;
            if (word) {
                const action = this.classList.contains('fill-1') ? 'starred' : 'unstarred';
                updateStarredWords(word, action === 'starred');
            }
        });
    });

    // Add New Word card
    const addCard = document.querySelector('.border-dashed');
    if (addCard) {
        addCard.addEventListener('click', function() {
            const word = prompt('Enter new word:');
            if (word) {
                addNewFlashcard(word);
            }
        });
    }

    // Start Session button
    const startSessionBtn = document.querySelector('button:contains("Start Session")');
    if (startSessionBtn) {
        startSessionBtn.addEventListener('click', function() {
            alert('Starting flashcard session!');
            // In a real app, this would start a study session
            startStudySession();
        });
    }

    // Add Word button
    const addWordBtn = document.querySelector('button:contains("Add Word")');
    if (addWordBtn) {
        addWordBtn.addEventListener('click', function() {
            const word = prompt('Enter new word to add to your collection:');
            if (word) {
                addNewFlashcard(word);
            }
        });
    }

    // Filter buttons
    const filterBtns = document.querySelectorAll('button:contains("Level:") , button:contains("Category:") , button:contains("Status:")');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filterType = this.textContent.split(':')[0].trim();
            showFilterOptions(filterType, this);
        });
    });

    // Search functionality
    const searchInput = document.querySelector('input[placeholder="Search vocabulary..."]');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterFlashcards(this.value);
        });
    }

    // Mobile menu toggle
    const menuBtn = document.querySelector('button .material-symbols-outlined:contains("menu")');
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            const sidebar = document.querySelector('aside');
            sidebar.classList.toggle('hidden');
        });
    }

    // User profile click
    const userAvatar = document.querySelector('div[data-alt="User profile avatar"]');
    if (userAvatar) {
        userAvatar.addEventListener('click', function() {
            window.location.href = 'profile_code.html';
        });
    }

    // Initialize daily goal progress
    updateDailyGoalProgress();
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

function speakWord(word) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    } else {
        alert('Text-to-speech not supported in your browser');
    }
}

function updateStarredWords(word, isStarred) {
    let starredWords = JSON.parse(localStorage.getItem('starredWords')) || [];
    
    if (isStarred) {
        if (!starredWords.includes(word)) {
            starredWords.push(word);
        }
    } else {
        starredWords = starredWords.filter(w => w !== word);
    }
    
    localStorage.setItem('starredWords', JSON.stringify(starredWords));
}

function addNewFlashcard(word) {
    alert(`Added "${word}" to your flashcards!`);
    // In a real app, this would add to database and refresh the view
}

function filterFlashcards(searchTerm) {
    const flashcards = document.querySelectorAll('.perspective-1000');
    flashcards.forEach(card => {
        const word = card.querySelector('h3')?.textContent.toLowerCase();
        if (word && word.includes(searchTerm.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function showFilterOptions(filterType, button) {
    // Simple filter implementation
    const options = {
        'Level': ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        'Category': ['All', 'Nouns', 'Verbs', 'Adjectives', 'Adverbs', 'Phrases'],
        'Status': ['All', 'Learning', 'Mastered', 'New']
    };

    if (options[filterType]) {
        const selected = prompt(`Select ${filterType}:\n${options[filterType].join('\n')}`);
        if (selected && options[filterType].includes(selected)) {
            button.querySelector('span:first-child').textContent = selected;
            applyFilter(filterType, selected);
        }
    }
}

function applyFilter(filterType, value) {
    console.log(`Filtering by ${filterType}: ${value}`);
    // In a real app, this would filter the flashcards
}

function startStudySession() {
    // Start a study session with random cards
    const flashcards = document.querySelectorAll('.perspective-1000');
    if (flashcards.length > 0) {
        // Show first card
        flashcards[0].click();
        
        // Add navigation buttons for session
        const sessionNav = document.createElement('div');
        sessionNav.className = 'fixed bottom-4 right-4 flex gap-2';
        sessionNav.innerHTML = `
            <button class="bg-primary text-white px-4 py-2 rounded-lg" id="prevCard">Previous</button>
            <button class="bg-primary text-white px-4 py-2 rounded-lg" id="nextCard">Next</button>
            <button class="bg-gray-500 text-white px-4 py-2 rounded-lg" id="endSession">End Session</button>
        `;
        document.body.appendChild(sessionNav);
        
        let currentCardIndex = 0;
        
        document.getElementById('nextCard').addEventListener('click', () => {
            if (currentCardIndex < flashcards.length - 1) {
                currentCardIndex++;
                flashcards[currentCardIndex].click();
            }
        });
        
        document.getElementById('prevCard').addEventListener('click', () => {
            if (currentCardIndex > 0) {
                currentCardIndex--;
                flashcards[currentCardIndex].click();
            }
        });
        
        document.getElementById('endSession').addEventListener('click', () => {
            sessionNav.remove();
            alert('Session ended!');
        });
    }
}

function updateDailyGoalProgress() {
    const progressBar = document.querySelector('.bg-gradient-to-r.from-primary');
    if (progressBar) {
        // Animate progress
        setTimeout(() => {
            progressBar.style.width = '75%';
        }, 500);
    }
}
