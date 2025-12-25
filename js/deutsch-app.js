/**
 * Deutsch Silben-Trainer Application
 * Class-based architecture for German syllable training
 */
class DeutschApp {
    // Constants
    static MILESTONE_INTERVAL = 10;
    static INITIAL_TASK_COUNT = 3;
    static FIXED_TASK_COUNT = 20;
    static DIFFICULTY_LEVELS = {
        EASY: 'easy',
        MEDIUM: 'medium',
        HARD: 'hard'
    };
    static LEVEL_UP_THRESHOLD = 3;
    static LEVEL_DOWN_THRESHOLD = 2;

    constructor() {
        // Word database - loaded from JSON file
        this.wordDatabase = [];
        this.wordDatabaseLoaded = false;

        // State
        this.currentMode = '';
        this.tasksSolved = 0;
        this.currentTasks = [];
        this.adaptiveLevel = DeutschApp.DIFFICULTY_LEVELS.EASY;
        this.correctStreak = 0;
        this.incorrectCount = 0;
        this.taskIdCounter = 0;
        this.totalTasksToSolve = 0;

        // Crown achievement system
        this.crownsEarned = 0;
        this.loadCrowns();

        // DOM cache
        this.dom = {
            difficultySlider: null,
            difficultyValue: null,
            adaptiveMode: null,
            taskContainer: null,
            previewTitle: null,
            taskCountDisplay: null,
            preview: null,
            milestoneCelebration: null,
            fireworksContainer: null,
            crownCounter: null,
            crownCount: null
        };
    }

    /**
     * Initialize the application
     */
    async init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        await this.loadWordDatabase();
        this.loadProgress();
    }

    /**
     * Load word database from JSON file
     */
    async loadWordDatabase() {
        try {
            const response = await fetch('data/deutsch-words.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.wordDatabase = data.words;
            this.wordDatabaseLoaded = true;
            console.log(`✅ Loaded ${this.wordDatabase.length} words from database (v${data.version})`);
        } catch (error) {
            console.error('❌ Failed to load word database:', error);
            // Fallback: disable start button if database failed to load
            if (this.dom.startButton) {
                this.dom.startButton.disabled = true;
                this.dom.startButton.textContent = 'Fehler beim Laden der Wörter';
            }
        }
    }

    /**
     * Cache all DOM elements
     */
    cacheDOMElements() {
        this.dom.difficultySlider = document.getElementById('difficultySlider');
        this.dom.difficultyValue = document.getElementById('difficultyValue');
        this.dom.adaptiveMode = document.getElementById('adaptiveMode');
        this.dom.startButton = document.getElementById('startButton');
        this.dom.taskContainer = document.getElementById('taskContainer');
        this.dom.previewTitle = document.getElementById('previewTitle');
        this.dom.taskCountDisplay = document.getElementById('taskCountDisplay');
        this.dom.preview = document.getElementById('preview');
        this.dom.milestoneCelebration = document.getElementById('milestoneCelebration');
        this.dom.fireworksContainer = document.getElementById('fireworksContainer');
        this.dom.crownCounter = document.getElementById('crownCounter');
        this.dom.crownCount = document.getElementById('crownCount');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Difficulty slider
        if (this.dom.difficultySlider) {
            this.dom.difficultySlider.addEventListener('input', () => this.updateDifficultyLabel());
        }

        // Start button
        if (this.dom.startButton) {
            this.dom.startButton.addEventListener('click', () => this.startTraining());
        }

        // Adaptive mode checkbox container
        const checkboxContainer = document.querySelector('.checkbox-container');
        if (checkboxContainer) {
            checkboxContainer.addEventListener('click', (e) => {
                if (e.target !== this.dom.adaptiveMode) {
                    this.dom.adaptiveMode.click();
                }
            });
        }

        // Adaptive mode checkbox itself
        if (this.dom.adaptiveMode) {
            this.dom.adaptiveMode.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    /**
     * Update difficulty label based on slider value
     */
    updateDifficultyLabel() {
        const level = parseInt(this.dom.difficultySlider.value);
        const label = getDifficultyLabel(level);
        const emoji = getDifficultyEmoji(level);
        this.dom.difficultyValue.textContent = `Level ${level} (${label}) ${emoji}`;
    }

    /**
     * Start training session
     */
    startTraining() {
        const level = parseInt(this.dom.difficultySlider.value);
        const isAdaptive = this.dom.adaptiveMode.checked;

        // Initialize mode
        this.currentMode = isAdaptive ? 'adaptive' : this.getDifficultyFromLevel(level);
        this.adaptiveLevel = isAdaptive ? this.getDifficultyFromLevel(level) : this.getDifficultyFromLevel(level);
        this.tasksSolved = 0;
        this.correctStreak = 0;
        this.incorrectCount = 0;

        if (isAdaptive) {
            this.totalTasksToSolve = 0; // Infinite for adaptive
        } else {
            this.totalTasksToSolve = DeutschApp.FIXED_TASK_COUNT;
        }

        // Save level to progress tracker
        ProgressTracker.updateLevel('german', level);

        this.generateTasks();
        this.dom.preview.classList.add('active');
        this.dom.preview.scrollIntoView({ behavior: 'smooth' });

        // Show/hide crown counter based on mode
        if (isAdaptive) {
            this.hideCrownCounter();
        } else {
            this.showCrownCounter();
        }
    }

    /**
     * Map level (1-10) to difficulty (easy/medium/hard)
     */
    getDifficultyFromLevel(level) {
        if (level <= 3) return DeutschApp.DIFFICULTY_LEVELS.EASY;
        if (level <= 6) return DeutschApp.DIFFICULTY_LEVELS.MEDIUM;
        return DeutschApp.DIFFICULTY_LEVELS.HARD;
    }

    /**
     * Generate tasks based on current mode
     */
    generateTasks() {
        this.currentTasks = [];

        for (let i = 0; i < DeutschApp.INITIAL_TASK_COUNT; i++) {
            this.currentTasks.push(this.generateTask());
        }

        this.displayTasks();
    }

    /**
     * Generate a single task
     */
    generateTask() {
        let availableWords;

        if (this.currentMode === 'adaptive') {
            availableWords = this.wordDatabase.filter(w => w.difficulty === this.adaptiveLevel);
        } else {
            availableWords = this.wordDatabase.filter(w => {
                if (this.currentMode === DeutschApp.DIFFICULTY_LEVELS.EASY) {
                    // Easy: Only 2-letter syllables
                    return w.difficulty === 'easy' && w.syllable.length === 2;
                }
                if (this.currentMode === DeutschApp.DIFFICULTY_LEVELS.MEDIUM) {
                    return w.difficulty === 'easy' || w.difficulty === 'medium';
                }
                return true; // hard mode
            });
        }

        const correctWord = availableWords[Math.floor(Math.random() * availableWords.length)];

        // Generate wrong options
        const wrongOptions = this.generateWrongOptions(correctWord);

        // Shuffle options
        const options = [correctWord.syllable, ...wrongOptions].sort(() => Math.random() - 0.5);

        return {
            id: this.taskIdCounter++,
            word: correctWord.word,
            emoji: correctWord.emoji,
            correctSyllable: correctWord.syllable,
            options: options
        };
    }

    /**
     * Generate wrong options for a task
     */
    generateWrongOptions(correctWord) {
        const wrongOptions = [];

        if (this.currentMode === 'adaptive') {
            // Adaptive: Completely random syllables (difficult)
            const allSyllables = [...new Set(this.wordDatabase.map(w => w.syllable))];

            while (wrongOptions.length < 2) {
                const randomSyllable = allSyllables[Math.floor(Math.random() * allSyllables.length)];
                if (randomSyllable !== correctWord.syllable && !wrongOptions.includes(randomSyllable)) {
                    wrongOptions.push(randomSyllable);
                }
            }
        } else {
            // Easy/Medium/Hard: Different logic per mode
            if (this.currentMode === DeutschApp.DIFFICULTY_LEVELS.EASY) {
                // Easy: Same consonant, different vowels (e.g., Vo, Va, Vi)
                const consonant = correctWord.syllable[0];
                const vowels = ['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü'];
                const currentVowel = correctWord.syllable[1];

                // Generate wrong syllables with same consonant but different vowels
                for (const vowel of vowels) {
                    if (vowel !== currentVowel && wrongOptions.length < 2) {
                        wrongOptions.push(consonant + vowel);
                    }
                }

                // Shuffle wrong options
                wrongOptions.sort(() => Math.random() - 0.5);
            } else {
                // Medium/Hard: Same first letter
                const firstLetter = correctWord.syllable[0];
                const sameLetter = this.wordDatabase.filter(w =>
                    w.syllable[0] === firstLetter &&
                    w.syllable !== correctWord.syllable
                ).map(w => w.syllable);

                // Deduplicate
                const uniqueSameLetter = [...new Set(sameLetter)];

                if (uniqueSameLetter.length >= 2) {
                    // Enough syllables with same first letter
                    const shuffled = uniqueSameLetter.sort(() => Math.random() - 0.5);
                    wrongOptions.push(shuffled[0], shuffled[1]);
                } else {
                    // Fallback: Fill with all available syllables
                    const allSyllables = [...new Set(this.wordDatabase.map(w => w.syllable))];

                    // Take those with same letter first
                    wrongOptions.push(...uniqueSameLetter);

                    // Then fill with random ones
                    while (wrongOptions.length < 2) {
                        const randomSyllable = allSyllables[Math.floor(Math.random() * allSyllables.length)];
                        if (randomSyllable !== correctWord.syllable && !wrongOptions.includes(randomSyllable)) {
                            wrongOptions.push(randomSyllable);
                        }
                    }
                }
            }
        }

        return wrongOptions;
    }

    /**
     * Display tasks in the UI
     */
    displayTasks() {
        const title = this.currentMode === 'adaptive'
            ? `Adaptives Training (${this.adaptiveLevel === 'easy' ? 'Einfach' : this.adaptiveLevel === 'medium' ? 'Mittel' : 'Schwer'})`
            : 'Silben-Training';

        this.dom.previewTitle.textContent = title;

        const displayText = this.currentMode === 'adaptive'
            ? `${this.tasksSolved} gelöst`
            : `${this.tasksSolved} / ${this.totalTasksToSolve}`;
        this.dom.taskCountDisplay.textContent = displayText;

        this.dom.taskContainer.innerHTML = '';

        this.currentTasks.forEach((task, index) => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task-item';
            taskDiv.style.animationDelay = `${index * 0.2}s`;
            taskDiv.dataset.taskId = task.id;

            // Display image if available, otherwise emoji
            const visual = document.createElement('div');
            visual.className = 'emoji-display';

            if (task.image && task.image !== null) {
                // Use AI-generated image
                const img = document.createElement('img');
                img.src = task.image;
                img.alt = task.word;
                img.className = 'word-image';
                visual.appendChild(img);
            } else {
                // Fallback to emoji
                visual.textContent = task.emoji;
            }

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'syllable-options';

            task.options.forEach(option => {
                const btn = document.createElement('button');
                btn.className = 'syllable-btn';
                btn.textContent = option;
                btn.addEventListener('click', () => this.checkAnswer(option, task.correctSyllable, btn, taskDiv, task.id));
                optionsDiv.appendChild(btn);
            });

            taskDiv.appendChild(visual);
            taskDiv.appendChild(optionsDiv);
            this.dom.taskContainer.appendChild(taskDiv);
        });
    }

    /**
     * Check if answer is correct
     */
    checkAnswer(selected, correct, button, taskDiv, taskId) {
        // Disable all buttons in this task
        const buttons = taskDiv.querySelectorAll('.syllable-btn');
        buttons.forEach(btn => btn.style.pointerEvents = 'none');

        if (selected === correct) {
            button.classList.add('correct');
            audioManager.playSuccessSound();
            this.tasksSolved++;

            if (this.currentMode === 'adaptive') {
                this.correctStreak++;
                this.incorrectCount = 0;

                if (this.correctStreak >= DeutschApp.LEVEL_UP_THRESHOLD) {
                    if (this.adaptiveLevel === DeutschApp.DIFFICULTY_LEVELS.EASY) {
                        this.adaptiveLevel = DeutschApp.DIFFICULTY_LEVELS.MEDIUM;
                    } else if (this.adaptiveLevel === DeutschApp.DIFFICULTY_LEVELS.MEDIUM) {
                        this.adaptiveLevel = DeutschApp.DIFFICULTY_LEVELS.HARD;
                    }

                    this.correctStreak = 0;
                    if (this.adaptiveLevel !== DeutschApp.DIFFICULTY_LEVELS.HARD) {
                        this.showLevelUp();
                    }
                }
            } else {
                this.correctStreak++;
                this.incorrectCount = 0;
            }

            setTimeout(() => {
                this.slideOutAndReplace(taskId);

                if (this.tasksSolved % DeutschApp.MILESTONE_INTERVAL === 0) {
                    this.showMilestoneCelebration(this.tasksSolved);
                }
            }, 800);
        } else {
            button.classList.add('incorrect');

            if (this.currentMode === 'adaptive') {
                this.incorrectCount++;
                this.correctStreak = 0;

                if (this.incorrectCount >= DeutschApp.LEVEL_DOWN_THRESHOLD) {
                    if (this.adaptiveLevel === DeutschApp.DIFFICULTY_LEVELS.HARD) {
                        this.adaptiveLevel = DeutschApp.DIFFICULTY_LEVELS.MEDIUM;
                    } else if (this.adaptiveLevel === DeutschApp.DIFFICULTY_LEVELS.MEDIUM) {
                        this.adaptiveLevel = DeutschApp.DIFFICULTY_LEVELS.EASY;
                    }

                    this.incorrectCount = 0;
                }
            }

            // Show correct answer
            setTimeout(() => {
                buttons.forEach(btn => {
                    if (btn.textContent === correct) {
                        btn.classList.add('correct');
                    }
                });
            }, 500);

            setTimeout(() => {
                buttons.forEach(btn => btn.style.pointerEvents = 'auto');
                button.classList.remove('incorrect');
            }, 2000);
        }
    }

    /**
     * Slide out completed task and replace with new one
     */
    slideOutAndReplace(taskId) {
        const completedTask = this.dom.taskContainer.querySelector(`[data-task-id="${taskId}"]`);

        if (!completedTask) return; // Safety check

        completedTask.style.transition = 'all 0.5s ease-out';
        completedTask.style.transform = 'translateY(-100px)';
        completedTask.style.opacity = '0';

        setTimeout(() => {
            // Find and remove task by ID
            const taskIndex = this.currentTasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                this.currentTasks.splice(taskIndex, 1);
            }
            completedTask.remove();

            // Check if we should add new task or finish
            const shouldContinue = this.currentMode === 'adaptive' || this.tasksSolved < this.totalTasksToSolve;

            if (shouldContinue && this.currentTasks.length > 0) {
                // Replace with new task
                const newTask = this.generateTask();
                this.currentTasks.push(newTask);

                const newTaskDiv = document.createElement('div');
                newTaskDiv.className = 'task-item';
                newTaskDiv.dataset.taskId = newTask.id;
                newTaskDiv.style.opacity = '0';
                newTaskDiv.style.transform = 'translateY(50px)';

                const emoji = document.createElement('div');
                emoji.className = 'emoji-display';
                emoji.textContent = newTask.emoji;

                const optionsDiv = document.createElement('div');
                optionsDiv.className = 'syllable-options';

                newTask.options.forEach(option => {
                    const btn = document.createElement('button');
                    btn.className = 'syllable-btn';
                    btn.textContent = option;
                    btn.addEventListener('click', () => this.checkAnswer(option, newTask.correctSyllable, btn, newTaskDiv, newTask.id));
                    optionsDiv.appendChild(btn);
                });

                newTaskDiv.appendChild(emoji);
                newTaskDiv.appendChild(optionsDiv);
                this.dom.taskContainer.appendChild(newTaskDiv);

                setTimeout(() => {
                    newTaskDiv.style.transition = 'all 0.5s ease-out';
                    newTaskDiv.style.opacity = '1';
                    newTaskDiv.style.transform = 'translateY(0)';
                }, 50);
            } else if (this.currentTasks.length === 0) {
                // All tasks completed!
                this.showCompletionCelebration();
            }

            // Update display
            const displayText = this.currentMode === 'adaptive'
                ? `${this.tasksSolved} gelöst`
                : `${this.tasksSolved} / ${this.totalTasksToSolve}`;
            this.dom.taskCountDisplay.textContent = displayText;

            if (this.currentMode === 'adaptive') {
                const title = `Adaptives Training (${this.adaptiveLevel === 'easy' ? 'Einfach' : this.adaptiveLevel === 'medium' ? 'Mittel' : 'Schwer'})`;
                this.dom.previewTitle.textContent = title;
            }
        }, 500);
    }

    /**
     * Show milestone celebration
     */
    showMilestoneCelebration(count) {
        this.dom.milestoneCelebration.textContent = `🎉 ${count} Wörter geschafft! 🎉`;
        this.dom.milestoneCelebration.classList.add('show');

        setTimeout(() => {
            this.dom.milestoneCelebration.classList.remove('show');
        }, 1500);
    }

    /**
     * Show level up celebration
     */
    showLevelUp() {
        const levelText = this.adaptiveLevel === DeutschApp.DIFFICULTY_LEVELS.MEDIUM ? 'Mittel' : 'Schwer';
        this.dom.milestoneCelebration.textContent = `🚀 Level ${levelText}! 🚀`;
        this.dom.milestoneCelebration.classList.add('show');

        setTimeout(() => {
            this.dom.milestoneCelebration.classList.remove('show');
        }, 1500);
    }

    /**
     * Show completion celebration
     */
    showCompletionCelebration() {
        // Clear container safely
        this.dom.taskContainer.textContent = '';

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'text-align: center; padding: 4rem 2rem; animation: fadeIn 1s ease-out;';

        // Create emoji
        const emoji = document.createElement('div');
        emoji.textContent = '🎉';
        emoji.style.cssText = 'font-size: 8rem; margin-bottom: 2rem; animation: bounce 1s ease-in-out infinite;';

        // Create heading
        const heading = document.createElement('h2');
        heading.textContent = 'Geschafft!';
        heading.style.cssText = 'font-size: 2.5rem; color: var(--primary); margin-bottom: 1rem; font-family: "Fredoka", sans-serif;';

        // Create message
        const message = document.createElement('p');
        message.textContent = `Du hast alle ${this.totalTasksToSolve} Aufgaben gelöst! 🌟`;
        message.style.cssText = 'font-size: 1.3rem; color: var(--text-dark); margin-bottom: 2rem;';

        // Create restart button
        const restartButton = document.createElement('button');
        restartButton.id = 'restartButton';
        restartButton.textContent = 'Nochmal üben! 🔄';
        restartButton.style.cssText = `
            background: linear-gradient(135deg, var(--primary), #C39BD3);
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 25px;
            font-size: 1.2rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(155, 89, 182, 0.4);
            transition: all 0.3s ease;
        `;

        // Add event listeners
        restartButton.addEventListener('click', () => this.startTraining());
        restartButton.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.05)';
        });
        restartButton.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
        });

        // Assemble DOM
        wrapper.appendChild(emoji);
        wrapper.appendChild(heading);
        wrapper.appendChild(message);
        wrapper.appendChild(restartButton);
        this.dom.taskContainer.appendChild(wrapper);

        // Update display
        this.dom.taskCountDisplay.textContent = `${this.totalTasksToSolve} / ${this.totalTasksToSolve} ✅`;

        // Launch fireworks celebration and earn crown
        this.launchFireworks();
        this.earnCrown();
    }

    /**
     * Launch fireworks animation
     */
    launchFireworks() {
        if (!this.dom.milestoneCelebration || !this.dom.fireworksContainer) {
            console.warn('Fireworks elements not found');
            return;
        }

        this.dom.milestoneCelebration.textContent = `🎊 Alle Aufgaben richtig! Super! 🎊`;
        this.dom.milestoneCelebration.classList.add('show');

        this.dom.fireworksContainer.classList.add('active');

        // Launch multiple fireworks
        const colors = ['#9B59B6', '#E91E63', '#FEC260', '#5DADE2', '#82E0AA', '#BB8FCE'];
        let fireworkCount = 0;
        const maxFireworks = 15;

        const fireworkInterval = setInterval(() => {
            if (fireworkCount >= maxFireworks) {
                clearInterval(fireworkInterval);
                setTimeout(() => {
                    this.dom.fireworksContainer.classList.remove('active');
                    this.dom.fireworksContainer.innerHTML = '';
                    this.dom.milestoneCelebration.classList.remove('show');
                }, 2000);
                return;
            }

            this.createFirework(colors[fireworkCount % colors.length]);
            fireworkCount++;
        }, 200);
    }

    /**
     * Create a single firework
     */
    createFirework(color) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (window.innerHeight * 0.5);

        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = x + 'px';
        firework.style.top = y + 'px';
        firework.style.backgroundColor = color;
        this.dom.fireworksContainer.appendChild(firework);

        // Create explosion after delay
        setTimeout(() => {
            firework.remove();
            this.createExplosion(x, y, color);
        }, 800);
    }

    /**
     * Create explosion effect
     */
    createExplosion(x, y, color) {
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 100 + Math.random() * 100;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.backgroundColor = color;
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            particle.style.transform = `translate(var(--tx), var(--ty)) scale(0)`;

            this.dom.fireworksContainer.appendChild(particle);

            setTimeout(() => particle.remove(), 1000);
        }
    }

    /**
     * Load saved progress
     */
    loadProgress() {
        const progress = ProgressTracker.getProgress('german');
        this.dom.difficultySlider.value = progress.level || 5;
        this.updateDifficultyLabel();
    }

    /**
     * Load crowns from localStorage
     */
    loadCrowns() {
        const saved = localStorage.getItem('smarty-german-crowns');
        this.crownsEarned = saved ? parseInt(saved) : 0;
    }

    /**
     * Save crowns to localStorage
     */
    saveCrowns() {
        localStorage.setItem('smarty-german-crowns', this.crownsEarned.toString());
    }

    /**
     * Update crown counter display
     */
    updateCrownDisplay() {
        if (this.dom.crownCount) {
            this.dom.crownCount.textContent = this.crownsEarned;
        }
    }

    /**
     * Show crown counter (non-adaptive mode only)
     */
    showCrownCounter() {
        if (this.dom.crownCounter && this.currentMode !== 'adaptive') {
            this.dom.crownCounter.style.display = 'flex';
            this.updateCrownDisplay();
        }
    }

    /**
     * Hide crown counter
     */
    hideCrownCounter() {
        if (this.dom.crownCounter) {
            this.dom.crownCounter.style.display = 'none';
        }
    }

    /**
     * Earn a crown (called when all tasks completed)
     */
    earnCrown() {
        if (this.currentMode !== 'adaptive') {
            this.crownsEarned++;
            this.saveCrowns();
            this.updateCrownDisplay();

            // Animate crown counter
            if (this.dom.crownCounter) {
                this.dom.crownCounter.classList.add('earn');
                setTimeout(() => {
                    this.dom.crownCounter.classList.remove('earn');
                }, 600);
            }

            // Show celebration message
            if (this.dom.milestoneCelebration) {
                this.dom.milestoneCelebration.textContent = `👑 Krone verdient! Du hast jetzt ${this.crownsEarned} Kronen! 👑`;
                this.dom.milestoneCelebration.classList.add('show');
                setTimeout(() => {
                    this.dom.milestoneCelebration.classList.remove('show');
                }, 2000);
            }
        }
    }
}

// Initialize app on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    const app = new DeutschApp();
    app.init();
});
