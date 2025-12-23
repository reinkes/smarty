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
        // Word database with emojis
        this.wordDatabase = [
            // Easy - 2 letter syllables
            { word: 'Katze', syllable: 'Ka', emoji: '🐱', difficulty: 'easy' },
            { word: 'Hund', syllable: 'Hun', emoji: '🐕', difficulty: 'easy' },
            { word: 'Baum', syllable: 'Bau', emoji: '🌳', difficulty: 'easy' },
            { word: 'Haus', syllable: 'Hau', emoji: '🏠', difficulty: 'easy' },
            { word: 'Auto', syllable: 'Au', emoji: '🚗', difficulty: 'easy' },
            { word: 'Ball', syllable: 'Ba', emoji: '⚽', difficulty: 'easy' },
            { word: 'Sonne', syllable: 'So', emoji: '☀️', difficulty: 'easy' },
            { word: 'Mond', syllable: 'Mo', emoji: '🌙', difficulty: 'easy' },
            { word: 'Fisch', syllable: 'Fi', emoji: '🐟', difficulty: 'easy' },
            { word: 'Vogel', syllable: 'Vo', emoji: '🐦', difficulty: 'easy' },
            { word: 'Tisch', syllable: 'Ti', emoji: '🪑', difficulty: 'easy' },
            { word: 'Tasse', syllable: 'Ta', emoji: '☕', difficulty: 'easy' },
            { word: 'Buch', syllable: 'Bu', emoji: '📖', difficulty: 'easy' },
            { word: 'Lampe', syllable: 'La', emoji: '💡', difficulty: 'easy' },
            { word: 'Mama', syllable: 'Ma', emoji: '👩', difficulty: 'easy' },
            { word: 'Papa', syllable: 'Pa', emoji: '👨', difficulty: 'easy' },
            { word: 'Baby', syllable: 'Ba', emoji: '👶', difficulty: 'easy' },
            { word: 'Telefon', syllable: 'Te', emoji: '📱', difficulty: 'easy' },
            { word: 'Apfel', syllable: 'Ap', emoji: '🍎', difficulty: 'easy' },
            { word: 'Banane', syllable: 'Ba', emoji: '🍌', difficulty: 'easy' },

            // Medium - 2-3 letter syllables
            { word: 'Schule', syllable: 'Schu', emoji: '🏫', difficulty: 'medium' },
            { word: 'Blume', syllable: 'Blu', emoji: '🌸', difficulty: 'medium' },
            { word: 'Stern', syllable: 'Ste', emoji: '⭐', difficulty: 'medium' },
            { word: 'Pferd', syllable: 'Pfe', emoji: '🐴', difficulty: 'medium' },
            { word: 'Frosch', syllable: 'Fro', emoji: '🐸', difficulty: 'medium' },
            { word: 'Schmetterling', syllable: 'Schme', emoji: '🦋', difficulty: 'medium' },
            { word: 'Strand', syllable: 'Stra', emoji: '🏖️', difficulty: 'medium' },
            { word: 'Traktor', syllable: 'Tra', emoji: '🚜', difficulty: 'medium' },
            { word: 'Flugzeug', syllable: 'Flu', emoji: '✈️', difficulty: 'medium' },
            { word: 'Schiff', syllable: 'Schi', emoji: '🚢', difficulty: 'medium' },
            { word: 'Brot', syllable: 'Bro', emoji: '🍞', difficulty: 'medium' },
            { word: 'Schokolade', syllable: 'Scho', emoji: '🍫', difficulty: 'medium' },
            { word: 'Glas', syllable: 'Gla', emoji: '🥛', difficulty: 'medium' },
            { word: 'Stuhl', syllable: 'Stu', emoji: '🪑', difficulty: 'medium' },
            { word: 'Schwein', syllable: 'Schwe', emoji: '🐷', difficulty: 'medium' },

            // Hard - complex syllables
            { word: 'Schnee', syllable: 'Schne', emoji: '❄️', difficulty: 'hard' },
            { word: 'Pflanze', syllable: 'Pfla', emoji: '🌱', difficulty: 'hard' },
            { word: 'Strumpf', syllable: 'Stru', emoji: '🧦', difficulty: 'hard' },
            { word: 'Sprung', syllable: 'Spru', emoji: '🦘', difficulty: 'hard' },
            { word: 'Krone', syllable: 'Kro', emoji: '👑', difficulty: 'hard' },
            { word: 'Drachen', syllable: 'Dra', emoji: '🐉', difficulty: 'hard' },
            { word: 'Geist', syllable: 'Gei', emoji: '👻', difficulty: 'hard' },
            { word: 'Prinzessin', syllable: 'Pri', emoji: '👸', difficulty: 'hard' },
            { word: 'Kreis', syllable: 'Kre', emoji: '⭕', difficulty: 'hard' },
            { word: 'Zwiebel', syllable: 'Zwie', emoji: '🧅', difficulty: 'hard' }
        ];

        // State
        this.currentMode = '';
        this.tasksSolved = 0;
        this.currentTasks = [];
        this.adaptiveLevel = DeutschApp.DIFFICULTY_LEVELS.EASY;
        this.correctStreak = 0;
        this.incorrectCount = 0;
        this.taskIdCounter = 0;
        this.totalTasksToSolve = 0;

        // DOM cache
        this.dom = {
            difficultySlider: null,
            difficultyValue: null,
            adaptiveMode: null,
            taskContainer: null,
            previewTitle: null,
            taskCountDisplay: null,
            preview: null,
            milestoneCelebration: null
        };
    }

    /**
     * Initialize the application
     */
    init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        this.loadProgress();
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

            const emoji = document.createElement('div');
            emoji.className = 'emoji-display';
            emoji.textContent = task.emoji;

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'syllable-options';

            task.options.forEach(option => {
                const btn = document.createElement('button');
                btn.className = 'syllable-btn';
                btn.textContent = option;
                btn.addEventListener('click', () => this.checkAnswer(option, task.correctSyllable, btn, taskDiv, task.id));
                optionsDiv.appendChild(btn);
            });

            taskDiv.appendChild(emoji);
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

        // Add event listeners in next section
        // (will be picked up by the code below)
        // Assemble DOM
        wrapper.appendChild(emoji);
        wrapper.appendChild(heading);
        wrapper.appendChild(message);
        wrapper.appendChild(restartButton);

        // Add event listener to restart button
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.startTraining());
            restartButton.addEventListener('mouseover', function() {
                this.style.transform = 'scale(1.05)';
            });
            restartButton.addEventListener('mouseout', function() {
                this.style.transform = 'scale(1)';
            });
        }

        // Update display
        this.dom.taskCountDisplay.textContent = `${this.totalTasksToSolve} / ${this.totalTasksToSolve} ✅`;
    }

    /**
     * Load saved progress
     */
    loadProgress() {
        const progress = ProgressTracker.getProgress('german');
        this.dom.difficultySlider.value = progress.level || 5;
        this.updateDifficultyLabel();
    }
}

// Initialize app on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    const app = new DeutschApp();
    app.init();
});
