/**
 * Smarty Learn - Shared Utilities
 * Common functions for animations, feedback, and progress tracking
 */

// ============================================
// AUDIO FEEDBACK
// ============================================

/**
 * Plays a success sound using Web Audio API
 */
function playSuccessSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Silently fail if audio context not supported
    }
}

// ============================================
// CELEBRATION ANIMATIONS
// ============================================

/**
 * Shows a milestone celebration overlay
 * @param {string} message - The message to display
 */
function showMilestoneCelebration(message) {
    const celebration = document.getElementById('milestoneCelebration');
    if (!celebration) return;

    celebration.textContent = message;
    celebration.classList.add('show');

    setTimeout(() => {
        celebration.classList.remove('show');
    }, 1500);
}

/**
 * Shows celebration for solving N tasks
 * @param {number} count - Number of tasks solved
 */
function showTaskCelebration(count) {
    showMilestoneCelebration(`🎉 ${count} Aufgaben geschafft! 🎉`);
}

/**
 * Shows level-up celebration
 * @param {number} level - The new level
 */
function showLevelUpCelebration(level) {
    showMilestoneCelebration(`🚀 Level ${level}! 🚀`);
}

// ============================================
// FIREWORKS
// ============================================

/**
 * Launches fireworks animation
 */
function launchFireworks() {
    const container = document.getElementById('fireworksContainer');
    if (!container) return;

    container.classList.add('active');

    const colors = ['#FF6B9D', '#FEC260', '#5DADE2', '#82E0AA', '#BB8FCE', '#F1948A'];
    let fireworkCount = 0;
    const maxFireworks = 15;

    const fireworkInterval = setInterval(() => {
        if (fireworkCount >= maxFireworks) {
            clearInterval(fireworkInterval);
            setTimeout(() => {
                container.classList.remove('active');
                container.innerHTML = '';
            }, 2000);
            return;
        }

        createFirework(container, colors[Math.floor(Math.random() * colors.length)]);
        fireworkCount++;
    }, 200);
}

/**
 * Creates a single firework
 * @param {HTMLElement} container - The fireworks container
 * @param {string} color - The firework color
 */
function createFirework(container, color) {
    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight;

    const firework = document.createElement('div');
    firework.style.position = 'absolute';
    firework.style.width = '4px';
    firework.style.height = '4px';
    firework.style.borderRadius = '50%';
    firework.style.backgroundColor = color;
    firework.style.left = x + 'px';
    firework.style.top = y + 'px';
    firework.style.animation = 'fireworkFly 1s ease-out forwards';
    container.appendChild(firework);

    setTimeout(() => {
        createExplosion(container, x, y - 300, color);
        firework.remove();
    }, 1000);
}

/**
 * Creates an explosion effect
 * @param {HTMLElement} container - The fireworks container
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} color - The particle color
 */
function createExplosion(container, x, y, color) {
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.backgroundColor = color;

        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 100 + Math.random() * 100;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        particle.style.animation = 'particleExplode 1s ease-out forwards';
        particle.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;

        container.appendChild(particle);

        setTimeout(() => particle.remove(), 1000);
    }
}

// Add firework fly animation dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes fireworkFly {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-300px) scale(0);
            opacity: 0;
        }
    }

    @keyframes particleExplode {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// PROGRESS TRACKING
// ============================================

/**
 * Progress tracking using localStorage
 */
const ProgressTracker = {
    /**
     * Gets progress for a specific app
     * @param {string} appName - 'math' or 'german'
     * @returns {Object} Progress data
     */
    getProgress(appName) {
        const key = `smarty_progress_${appName}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : this.getDefaultProgress();
    },

    /**
     * Returns default progress structure
     * @returns {Object} Default progress
     */
    getDefaultProgress() {
        return {
            level: 1,
            tasksCompleted: 0,
            correctAnswers: 0,
            totalAttempts: 0,
            accuracy: 0,
            lastSession: null,
            currentStreak: 0,
            longestStreak: 0
        };
    },

    /**
     * Saves progress for a specific app
     * @param {string} appName - 'math' or 'german'
     * @param {Object} progress - Progress data to save
     */
    saveProgress(appName, progress) {
        const key = `smarty_progress_${appName}`;
        progress.lastSession = new Date().toISOString();
        progress.accuracy = progress.totalAttempts > 0
            ? Math.round((progress.correctAnswers / progress.totalAttempts) * 100)
            : 0;
        localStorage.setItem(key, JSON.stringify(progress));
    },

    /**
     * Records a task attempt
     * @param {string} appName - 'math' or 'german'
     * @param {boolean} correct - Whether the answer was correct
     */
    recordAttempt(appName, correct) {
        const progress = this.getProgress(appName);
        progress.totalAttempts++;

        if (correct) {
            progress.correctAnswers++;
            progress.tasksCompleted++;
            progress.currentStreak++;
            progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
        } else {
            progress.currentStreak = 0;
        }

        this.saveProgress(appName, progress);
        return progress;
    },

    /**
     * Updates difficulty level
     * @param {string} appName - 'math' or 'german'
     * @param {number} newLevel - New level (1-10)
     */
    updateLevel(appName, newLevel) {
        const progress = this.getProgress(appName);
        progress.level = Math.max(1, Math.min(10, newLevel));
        this.saveProgress(appName, progress);
    },

    /**
     * Resets progress for an app
     * @param {string} appName - 'math' or 'german'
     */
    reset(appName) {
        const key = `smarty_progress_${appName}`;
        localStorage.removeItem(key);
    }
};

// ============================================
// INPUT VALIDATION
// ============================================

/**
 * Input validation utilities
 */
const InputValidator = {
    /**
     * Validates task type
     * @param {string} type - Task type to validate
     * @param {Array<string>} allowedTypes - Allowed task types
     * @returns {string} Validated task type
     * @throws {Error} If task type is invalid
     */
    validateTaskType(type, allowedTypes) {
        if (!allowedTypes.includes(type)) {
            throw new Error('Ungültiger Aufgabentyp');
        }
        return type;
    },

    /**
     * Validates task count
     * @param {string|number} count - Task count to validate
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @returns {number} Validated task count
     * @throws {Error} If task count is invalid
     */
    validateTaskCount(count, min = 1, max = 100) {
        const num = parseInt(count, 10);
        if (!Number.isInteger(num) || isNaN(num)) {
            throw new Error('Aufgabenanzahl muss eine Zahl sein');
        }
        if (num < min || num > max) {
            throw new Error(`Aufgabenanzahl muss zwischen ${min} und ${max} liegen`);
        }
        return num;
    },

    /**
     * Validates difficulty level
     * @param {string|number} level - Difficulty level (1-10)
     * @returns {number} Validated difficulty level
     * @throws {Error} If level is invalid
     */
    validateDifficultyLevel(level) {
        const num = parseInt(level, 10);
        if (!Number.isInteger(num) || isNaN(num)) {
            throw new Error('Schwierigkeitsgrad muss eine Zahl sein');
        }
        if (num < 1 || num > 10) {
            throw new Error('Schwierigkeitsgrad muss zwischen 1 und 10 liegen');
        }
        return num;
    },

    /**
     * Validates numeric input within range
     * @param {string|number} value - Value to validate
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @param {string} fieldName - Name of the field for error messages
     * @returns {number} Validated value
     * @throws {Error} If value is invalid
     */
    validateRange(value, min, max, fieldName = 'Wert') {
        const num = parseInt(value, 10);
        if (!Number.isInteger(num) || isNaN(num)) {
            throw new Error(`${fieldName} muss eine Zahl sein`);
        }
        if (num < min || num > max) {
            throw new Error(`${fieldName} muss zwischen ${min} und ${max} liegen`);
        }
        return num;
    }
};

// ============================================
// DIFFICULTY LABELS
// ============================================

/**
 * Gets a descriptive label for difficulty level
 * @param {number} level - Difficulty level (1-10)
 * @returns {string} Difficulty label
 */
function getDifficultyLabel(level) {
    if (level <= 3) return 'Einfach';
    if (level <= 6) return 'Mittel';
    return 'Schwer';
}

/**
 * Gets an emoji for difficulty level
 * @param {number} level - Difficulty level (1-10)
 * @returns {string} Emoji
 */
function getDifficultyEmoji(level) {
    if (level <= 3) return '😊';
    if (level <= 6) return '🤔';
    return '🔥';
}

// ============================================
// EXPORTS (for module usage)
// ============================================

// If using as module, export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        playSuccessSound,
        showMilestoneCelebration,
        showTaskCelebration,
        showLevelUpCelebration,
        launchFireworks,
        ProgressTracker,
        InputValidator,
        getDifficultyLabel,
        getDifficultyEmoji
    };
}
