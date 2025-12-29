/**
 * Buchstaben-Trainer App
 * Teaches letter recognition by identifying words containing specific letters
 */

class BuchstabenApp {
    constructor() {
        this.wordDatabase = [];
        this.currentLetter = '';
        this.currentTask = null;
        this.tasksSolved = 0;
        this.totalTasksRequired = 10;
        this.difficulty = 5;
        this.selectedImages = new Set();
        this.crownsEarned = 0;
        this.dom = {};
    }

    /**
     * Initialize the app
     */
    async init() {
        this.cacheDOMElements();
        await this.loadWordDatabase();
        this.attachEventListeners();
        this.updateTaskInfo();
    }

    /**
     * Cache DOM elements for performance
     */
    cacheDOMElements() {
        this.dom = {
            // Screens
            startScreen: document.getElementById('startScreen'),
            gameScreen: document.getElementById('gameScreen'),

            // Start screen elements
            difficultySlider: document.getElementById('difficultySlider'),
            difficultyValue: document.getElementById('difficultyValue'),
            tasksInfo: document.getElementById('tasksInfo'),
            startButton: document.getElementById('startButton'),

            // Game screen elements
            letterDisplay: document.getElementById('letterDisplay'),
            taskCounter: document.getElementById('taskCounter'),
            imageGrid: document.getElementById('imageGrid'),
            submitButton: document.getElementById('submitButton'),

            // Celebration elements
            fireworksContainer: document.getElementById('fireworksContainer'),
            milestoneCelebration: document.getElementById('milestoneCelebration'),
            crownCounter: document.getElementById('crownCounter'),
            crownCount: document.getElementById('crownCount')
        };
    }

    /**
     * Load word database from JSON
     */
    async loadWordDatabase() {
        try {
            const response = await fetch('data/buchstaben-words.json');
            const data = await response.json();
            this.wordDatabase = data.words;
            console.log(`Loaded ${this.wordDatabase.length} words from database`);
        } catch (error) {
            console.error('Failed to load word database:', error);
            alert('Fehler beim Laden der Wort-Datenbank. Bitte Seite neu laden.');
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Difficulty slider
        this.dom.difficultySlider.addEventListener('input', (e) => {
            this.difficulty = parseInt(e.target.value);
            this.updateDifficultyDisplay();
            this.updateTaskInfo();
        });

        // Start button
        this.dom.startButton.addEventListener('click', () => this.startTraining());
    }

    /**
     * Update difficulty display with emoji
     */
    updateDifficultyDisplay() {
        const emoji = this.getDifficultyEmoji(this.difficulty);
        this.dom.difficultyValue.textContent = `Level ${this.difficulty} ${emoji}`;
    }

    /**
     * Get emoji for difficulty level
     */
    getDifficultyEmoji(level) {
        if (level <= 3) return '😊';
        if (level <= 6) return '🤔';
        if (level <= 9) return '😅';
        return '🔥';
    }

    /**
     * Update task info text
     */
    updateTaskInfo() {
        this.totalTasksRequired = this.difficulty;
        this.dom.tasksInfo.textContent = `${this.totalTasksRequired} Aufgaben`;
    }

    /**
     * Start the training
     */
    startTraining() {
        this.tasksSolved = 0;
        this.selectedImages.clear();

        // Hide start screen, show game screen
        this.dom.startScreen.style.display = 'none';
        this.dom.gameScreen.style.display = 'block';

        // Generate first task
        this.generateTask();
    }

    /**
     * Generate a new task
     */
    generateTask() {
        // Select random letter
        this.currentLetter = this.selectRandomLetter();

        // Get words with and without the letter
        const wordsWithLetter = this.getWordsWithLetter(this.currentLetter);
        const wordsWithoutLetter = this.getWordsWithoutLetter(this.currentLetter);

        // Validate we have enough words
        if (wordsWithLetter.length < 3 || wordsWithoutLetter.length < 3) {
            console.warn(`Not enough words for letter ${this.currentLetter}, trying another...`);
            return this.generateTask(); // Recursive retry
        }

        // Select 3 words with letter and 3 without (50/50 split)
        const selectedWithLetter = this.selectRandomWords(wordsWithLetter, 3);
        const selectedWithoutLetter = this.selectRandomWords(wordsWithoutLetter, 3);

        // Combine and shuffle
        const allWords = [...selectedWithLetter, ...selectedWithoutLetter];
        this.shuffleArray(allWords);

        // Store current task
        this.currentTask = {
            letter: this.currentLetter,
            words: allWords,
            correctWords: new Set(selectedWithLetter.map(w => w.word))
        };

        // Clear selections
        this.selectedImages.clear();

        // Render the task
        this.renderTask();
    }

    /**
     * Select random letter (A-Z)
     */
    selectRandomLetter() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    /**
     * Get words containing the letter
     */
    getWordsWithLetter(letter) {
        return this.wordDatabase.filter(item =>
            item.letters.includes(letter.toUpperCase())
        );
    }

    /**
     * Get words NOT containing the letter
     */
    getWordsWithoutLetter(letter) {
        return this.wordDatabase.filter(item =>
            !item.letters.includes(letter.toUpperCase())
        );
    }

    /**
     * Select N random words from array
     */
    selectRandomWords(words, count) {
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * Shuffle array in place (Fisher-Yates)
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Render the task UI
     */
    renderTask() {
        // Update letter display
        const letterLarge = this.dom.letterDisplay.querySelector('.letter-large');
        const letterSmall = this.dom.letterDisplay.querySelector('.letter-small');
        letterLarge.textContent = this.currentLetter.toUpperCase();
        letterSmall.textContent = this.currentLetter.toLowerCase();

        // Update task counter
        this.dom.taskCounter.textContent = `Aufgabe ${this.tasksSolved + 1} / ${this.totalTasksRequired}`;

        // Clear image grid
        this.dom.imageGrid.innerHTML = '';

        // Render image items
        this.currentTask.words.forEach((wordItem, index) => {
            const imageDiv = this.createImageItem(wordItem, index);
            this.dom.imageGrid.appendChild(imageDiv);
        });
    }

    /**
     * Create image item element
     */
    createImageItem(wordItem, index) {
        const div = document.createElement('div');
        div.className = 'image-item';
        div.dataset.word = wordItem.word;
        div.dataset.index = index;

        // Emoji
        const emoji = document.createElement('span');
        emoji.className = 'image-emoji';
        emoji.textContent = wordItem.emoji;

        // Checkbox indicator
        const checkbox = document.createElement('div');
        checkbox.className = 'image-checkbox';

        // Append children
        div.appendChild(emoji);
        div.appendChild(checkbox);

        // Click handler
        div.addEventListener('click', () => this.toggleImageSelection(div, wordItem.word));

        return div;
    }

    /**
     * Toggle image selection
     */
    toggleImageSelection(element, word) {
        // Don't allow toggling after submission
        if (element.classList.contains('correct') || element.classList.contains('incorrect')) {
            return;
        }

        // Check if this is correct
        const isCorrect = this.currentTask.correctWords.has(word);

        if (isCorrect) {
            // Correct selection
            element.classList.add('correct');
            AudioManager.getInstance().playSuccessSound();

            // Check if all correct images have been selected (after a brief delay for DOM update)
            setTimeout(() => {
                const allCorrectSelected = Array.from(this.currentTask.correctWords).every(correctWord => {
                    const item = this.dom.imageGrid.querySelector(`[data-word="${correctWord}"]`);
                    return item && item.classList.contains('correct');
                });

                console.log('Checking completion:', allCorrectSelected); // Debug

                if (allCorrectSelected) {
                    // Show success message
                    this.showSuccessMessage();

                    // All correct images selected, wait then move to next task
                    setTimeout(() => {
                        this.tasksSolved++;

                        if (this.tasksSolved >= this.totalTasksRequired) {
                            this.showCompletion();
                        } else {
                            this.generateTask();
                        }
                    }, 2000);
                }
            }, 50);
        } else {
            // Incorrect selection
            element.classList.add('incorrect');
        }
    }

    /**
     * Show success message
     */
    showSuccessMessage() {
        // Create success overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #4CAF50, #66BB6A);
            color: white;
            padding: 2rem 3rem;
            border-radius: 20px;
            font-size: 2rem;
            font-weight: 700;
            font-family: 'Fredoka', sans-serif;
            z-index: 10000;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            animation: bounceIn 0.6s ease-out;
            text-align: center;
        `;
        overlay.innerHTML = '🎉 Super! Alle gefunden! 🎉';
        document.body.appendChild(overlay);

        // Remove after animation
        setTimeout(() => {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        }, 1500);
    }


    /**
     * Calculate crown reward based on difficulty
     */
    calculateCrownReward() {
        if (this.difficulty <= 3) return 1;
        if (this.difficulty <= 6) return 2;
        if (this.difficulty <= 9) return 3;
        return 5; // Level 10
    }

    /**
     * Earn crowns
     */
    earnCrown() {
        const earned = this.calculateCrownReward();
        this.crownsEarned = earned;

        // Update shared crown counter
        try {
            const currentCrowns = parseInt(localStorage.getItem('smarty-crowns') || '0');
            const newTotal = currentCrowns + earned;
            localStorage.setItem('smarty-crowns', newTotal.toString());

            // Update crown counter display
            if (this.dom.crownCounter && this.dom.crownCount) {
                this.dom.crownCount.textContent = newTotal;
                this.dom.crownCounter.style.display = 'flex';
            }
        } catch (error) {
            console.error('Failed to save crowns:', error);
        }
    }

    /**
     * Show completion screen
     */
    showCompletion() {
        // Earn crowns BEFORE showing completion
        this.earnCrown();

        // Clear game screen
        this.dom.gameScreen.innerHTML = '';

        // Create completion message
        const completionDiv = document.createElement('div');
        completionDiv.style.textAlign = 'center';
        completionDiv.style.padding = '2rem';

        const title = document.createElement('h2');
        title.textContent = '🎉 Glückwunsch!';
        title.style.color = 'var(--german-primary)';
        title.style.fontSize = '2.5rem';
        title.style.marginBottom = '1.5rem';

        const message = document.createElement('p');
        message.textContent = `Du hast alle ${this.totalTasksRequired} Aufgaben gemeistert!`;
        message.style.fontSize = '1.3rem';
        message.style.marginBottom = '2rem';

        const crownInfo = document.createElement('p');
        crownInfo.innerHTML = `+${this.crownsEarned} = ${localStorage.getItem('smarty-crowns')} 👑 Kronen!`;
        crownInfo.style.fontSize = '1.8rem';
        crownInfo.style.fontWeight = '700';
        crownInfo.style.color = 'var(--german-primary)';
        crownInfo.style.marginBottom = '2rem';

        const restartButton = document.createElement('button');
        restartButton.textContent = '🔄 Nochmal üben!';
        restartButton.className = 'btn-submit';
        restartButton.addEventListener('click', () => {
            location.reload();
        });

        // Append elements
        completionDiv.appendChild(title);
        completionDiv.appendChild(message);
        completionDiv.appendChild(crownInfo);
        completionDiv.appendChild(restartButton);
        this.dom.gameScreen.appendChild(completionDiv);

        // Launch fireworks
        if (typeof launchFireworks === 'function') {
            launchFireworks(this.crownsEarned);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new BuchstabenApp();
    app.init();
});
