/**
 * Mathe-Aufgaben Generator Application
 * Class-based architecture for math task generation and adaptive learning
 */
class MatheApp {
    // Constants
    static MILESTONE_INTERVAL = 10;
    static INITIAL_ADAPTIVE_TASKS = 3;
    static DEFAULT_TASK_COUNT = 20;
    static VALIDATION_DELAY = 400; // ms before validating answer
    static LEVEL_UP_THRESHOLD = 3;
    static LEVEL_DOWN_THRESHOLD = 2;
    static MIN_ADAPTIVE_LEVEL = 5;
    static SLIDE_OUT_DELAY = 1200; // Slower animation
    static MAX_FIREWORKS = 15;
    static FIREWORK_INTERVAL = 200;

    constructor() {
        // State
        this.currentTasks = [];
        this.currentType = '';
        this.completedTasks = 0;
        this.currentOperator = 'add'; // 'add' or 'sub'

        // Adaptive mode variables
        this.adaptiveMode = false;
        this.adaptiveLevel = 5;
        this.adaptiveMaxResult = 15;
        this.adaptiveCorrectStreak = 0;
        this.adaptiveIncorrectCount = 0;
        this.adaptiveTasksShown = 0;

        // Progressive unlock system
        this.maxUnlockedNumber = 10; // Start with calculations up to 10
        this.numberUsageCount = {}; // Track how many times each result number was used
        this.tasksNeededPerNumber = 10; // How many tasks with a number before unlocking next
        this.correctAnswersAtStartLevel = 0; // At level 10, count ALL correct answers

        // Crown achievement system
        this.crownsEarned = 0;
        this.loadCrowns();

        // Timeout references
        this.opacityUpdateTimeout = null;

        // DOM cache
        this.dom = {
            difficultySlider: null,
            difficultyValue: null,
            taskType: null,
            adaptiveMode: null,
            taskCount: null,
            generateBtn: null,
            pdfBtn: null,
            tasksContainer: null,
            previewTitle: null,
            taskCountDisplay: null,
            preview: null,
            milestoneCelebration: null,
            fireworksContainer: null,
            progressBarContainer: null,
            progressBarFill: null,
            progressBarText: null,
            unlockMessage: null,
            crownCounter: null,
            crownCount: null
        };
    }

    /**
     * Initialize the application
     */
    init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        this.loadProgress();
        this.currentOperator = this.dom.taskType.value;
    }

    /**
     * Cache all DOM elements
     */
    cacheDOMElements() {
        this.dom.difficultySlider = document.getElementById('difficultySlider');
        this.dom.difficultyValue = document.getElementById('difficultyValue');
        this.dom.taskType = document.getElementById('taskType');
        this.dom.adaptiveMode = document.getElementById('adaptiveMode');
        this.dom.taskCount = document.getElementById('taskCount');
        this.dom.generateBtn = document.querySelector('.btn-generate');
        this.dom.pdfBtn = document.getElementById('pdfBtn');
        this.dom.tasksContainer = document.getElementById('tasksContainer');
        this.dom.previewTitle = document.getElementById('previewTitle');
        this.dom.taskCountDisplay = document.getElementById('taskCountDisplay');
        this.dom.preview = document.getElementById('preview');
        this.dom.milestoneCelebration = document.getElementById('milestoneCelebration');
        this.dom.fireworksContainer = document.getElementById('fireworksContainer');
        this.dom.progressBarContainer = document.getElementById('progressBarContainer');
        this.dom.progressBarFill = document.getElementById('progressBarFill');
        this.dom.progressBarText = document.getElementById('progressBarText');
        this.dom.unlockMessage = document.getElementById('unlockMessage');
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

        // Task type dropdown
        if (this.dom.taskType) {
            this.dom.taskType.addEventListener('change', () => this.updateTaskTypeDisplay());
        }

        // Generate button
        if (this.dom.generateBtn) {
            this.dom.generateBtn.addEventListener('click', () => this.generateTasks());
        }

        // PDF button
        if (this.dom.pdfBtn) {
            this.dom.pdfBtn.addEventListener('click', () => this.generatePDF());
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
     * Update task type display
     */
    updateTaskTypeDisplay() {
        const taskType = this.dom.taskType.value;
        this.currentOperator = taskType;

        // Update preview if tasks are already generated
        if (this.dom.preview.classList.contains('active')) {
            this.generateTasks();
        }
    }

    /**
     * Map level (1-10) to math range
     */
    getMathRangeFromLevel(level) {
        if (level <= 3) return { max: 10, type: 'add10', label: 'Zahlenraum 10' };
        if (level <= 6) return { max: 20, type: 'add20', label: 'Zahlenraum 20' };
        return { max: 50, type: 'add50', label: 'Zahlenraum 50' };
    }

    /**
     * Generate tasks based on mode
     */
    generateTasks() {
        try {
            const level = parseInt(this.dom.difficultySlider.value);
            const isAdaptive = this.dom.adaptiveMode.checked;
            const taskCount = InputValidator.validateTaskCount(this.dom.taskCount.value);

            // Update current operator from dropdown
            this.currentOperator = this.dom.taskType.value;

            // Save level to progress tracker
            ProgressTracker.updateLevel('math', level);

            if (isAdaptive) {
                this.startAdaptiveMode();
                return;
            }

            // Fixed mode - use level to determine range
            const range = this.getMathRangeFromLevel(level);
            this.adaptiveMode = false;
            this.currentType = range.type;
            this.currentTasks = [];
            this.completedTasks = 0;

            let lastTask = null;
            for (let i = 0; i < taskCount; i++) {
                let task;
                let attempts = 0;
                do {
                    task = this.generateSingleTask(this.currentType, range.max);
                    attempts++;
                    if (attempts > 50) break;
                } while (lastTask && task.key === lastTask.key);

                lastTask = task;
                this.currentTasks.push(task);
            }

            this.displayTasks();
            this.dom.preview.classList.add('active');
            this.dom.pdfBtn.disabled = false;
        } catch (error) {
            alert(error.message);
        }
    }

    /**
     * Start adaptive mode
     */
    startAdaptiveMode() {
        try {
            const level = parseInt(this.dom.difficultySlider.value);
            const range = this.getMathRangeFromLevel(level);

            this.adaptiveMode = true;
            this.adaptiveMaxResult = range.max;
            this.adaptiveLevel = Math.min(Math.floor(range.max / 2), range.max);
            this.adaptiveCorrectStreak = 0;
            this.adaptiveIncorrectCount = 0;
            this.adaptiveTasksShown = 0;
            this.completedTasks = 0;
            this.currentType = 'adaptive';

            // Initialize unlock system
            this.maxUnlockedNumber = 10;
            this.numberUsageCount = {}; // Reset usage tracking
            this.updateProgressBar();

            // Save level
            ProgressTracker.updateLevel('math', level);

            this.currentTasks = [];
            // Generate initial tasks
            for (let i = 0; i < MatheApp.INITIAL_ADAPTIVE_TASKS; i++) {
                this.currentTasks.push(this.generateAdaptiveTask());
            }

            this.displayAdaptiveTasks();
            this.dom.pdfBtn.disabled = true; // No PDF in adaptive mode
            this.hideCrownCounter(); // Hide crowns in adaptive mode
        } catch (error) {
            alert(error.message);
        }
    }

    /**
     * Generate a single adaptive task
     */
    generateAdaptiveTask() {
        let num1, num2, result, key, operator;
        let attempts = 0;
        const maxAttempts = 100;

        // Calculate current effective max
        const maxPossible = Math.min(
            this.adaptiveLevel,
            Math.floor(this.adaptiveMaxResult * 0.5) +
            Math.floor((this.adaptiveMaxResult * 0.5) * (this.adaptiveTasksShown / 50))
        );

        // Apply unlock limit - never exceed maxUnlockedNumber
        const effectiveMax = Math.min(
            Math.max(this.adaptiveLevel, maxPossible),
            this.maxUnlockedNumber
        );

        // Only use weighted generation when beyond starting level (10)
        // At level 10, allow all results 1-10 equally
        const useWeightedGeneration = this.maxUnlockedNumber > 10;
        let targetResult;
        let shouldFocusOnMax = false;

        if (useWeightedGeneration) {
            // Check if current max number needs more practice
            const currentMaxUsage = this.numberUsageCount[this.maxUnlockedNumber] || 0;
            const needsMorePractice = currentMaxUsage < this.tasksNeededPerNumber;

            // Weighted generation: 40% current max, 60% previous numbers
            shouldFocusOnMax = needsMorePractice && Math.random() < 0.4;

            if (shouldFocusOnMax) {
                // Generate task with result = maxUnlockedNumber
                targetResult = this.maxUnlockedNumber;
            } else {
                // Generate task with result from 1 to maxUnlockedNumber
                targetResult = Math.floor(Math.random() * this.maxUnlockedNumber) + 1;
            }
        } else {
            // At starting level (10), generate any result from 1-10
            targetResult = Math.floor(Math.random() * this.maxUnlockedNumber) + 1;
        }

        // Get existing task keys to avoid duplicates
        const existingKeys = this.currentTasks.map(t => t.key);

        // Check if recent tasks had +0/-0 (last 3 tasks)
        const recentTasks = this.currentTasks.slice(-3);
        const hasRecentZero = recentTasks.some(t => t.num2 === 0);

        do {
            if (this.currentOperator === 'add') {
                // Generate numbers that add up to targetResult
                if (shouldFocusOnMax && targetResult <= this.maxUnlockedNumber) {
                    num1 = Math.floor(Math.random() * (targetResult + 1));
                    num2 = targetResult - num1;
                } else {
                    num1 = Math.floor(Math.random() * (effectiveMax + 1));
                    num2 = Math.floor(Math.random() * (effectiveMax - num1 + 1));
                }
                result = num1 + num2;
                operator = '+';
                key = `${num1}+${num2}`;
            } else {
                // Subtraction
                if (shouldFocusOnMax && targetResult <= this.maxUnlockedNumber) {
                    result = targetResult;
                    num2 = Math.floor(Math.random() * (this.maxUnlockedNumber - targetResult + 1));
                    num1 = result + num2;
                } else {
                    num1 = Math.floor(Math.random() * (effectiveMax + 1));
                    num2 = Math.floor(Math.random() * (num1 + 1));
                }
                result = num1 - num2;
                operator = '−';
                key = `${num1}-${num2}`;
            }
            attempts++;

            // Avoid +0/-0 and duplicates
            // If recent tasks had +0, reject ALL +0 attempts
            // Otherwise reject 98% of +0 attempts
        } while (
            attempts < maxAttempts &&
            (
                existingKeys.includes(key) ||
                (num2 === 0 && (hasRecentZero || Math.random() < 0.98))
            )
        );

        return {
            num1,
            num2,
            operator,
            result,
            key,
            level: effectiveMax
        };
    }

    /**
     * Generate adaptive task from full range
     */
    generateAdaptiveTaskFromFullRange() {
        let num1, num2, result, key, operator;
        let attempts = 0;
        const maxAttempts = 100;

        // Can generate from easier levels too (random between 5 and current level)
        const minLevel = MatheApp.MIN_ADAPTIVE_LEVEL;
        const maxLevel = this.adaptiveLevel;
        const taskLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;

        // Calculate current effective max
        const maxPossible = Math.min(
            taskLevel,
            Math.floor(this.adaptiveMaxResult * 0.5) +
            Math.floor((this.adaptiveMaxResult * 0.5) * (this.adaptiveTasksShown / 50))
        );

        // Apply unlock limit - never exceed maxUnlockedNumber
        const effectiveMax = Math.min(
            Math.max(taskLevel, maxPossible),
            this.maxUnlockedNumber
        );

        // Only use weighted generation when beyond starting level (10)
        // At level 10, allow all results 1-10 equally
        const useWeightedGeneration = this.maxUnlockedNumber > 10;
        let targetResult;
        let shouldFocusOnMax = false;

        if (useWeightedGeneration) {
            // Check if current max number needs more practice
            const currentMaxUsage = this.numberUsageCount[this.maxUnlockedNumber] || 0;
            const needsMorePractice = currentMaxUsage < this.tasksNeededPerNumber;

            // Weighted generation: 40% current max, 60% previous numbers
            shouldFocusOnMax = needsMorePractice && Math.random() < 0.4;

            if (shouldFocusOnMax) {
                // Generate task with result = maxUnlockedNumber
                targetResult = this.maxUnlockedNumber;
            } else {
                // Generate task with result from 1 to maxUnlockedNumber
                targetResult = Math.floor(Math.random() * this.maxUnlockedNumber) + 1;
            }
        } else {
            // At starting level (10), generate any result from 1-10
            targetResult = Math.floor(Math.random() * this.maxUnlockedNumber) + 1;
        }

        // Get existing task keys to avoid duplicates
        const existingKeys = this.currentTasks.map(t => t.key);

        // Check if recent tasks had +0/-0 (last 3 tasks)
        const recentTasks = this.currentTasks.slice(-3);
        const hasRecentZero = recentTasks.some(t => t.num2 === 0);

        do {
            if (this.currentOperator === 'add') {
                // Generate numbers that add up to targetResult
                if (shouldFocusOnMax && targetResult <= this.maxUnlockedNumber) {
                    num1 = Math.floor(Math.random() * (targetResult + 1));
                    num2 = targetResult - num1;
                } else {
                    num1 = Math.floor(Math.random() * (effectiveMax + 1));
                    num2 = Math.floor(Math.random() * (effectiveMax - num1 + 1));
                }
                result = num1 + num2;
                operator = '+';
                key = `${num1}+${num2}`;
            } else {
                // Subtraction
                if (shouldFocusOnMax && targetResult <= this.maxUnlockedNumber) {
                    result = targetResult;
                    num2 = Math.floor(Math.random() * (this.maxUnlockedNumber - targetResult + 1));
                    num1 = result + num2;
                } else {
                    num1 = Math.floor(Math.random() * (effectiveMax + 1));
                    num2 = Math.floor(Math.random() * (num1 + 1));
                }
                result = num1 - num2;
                operator = '−';
                key = `${num1}-${num2}`;
            }
            attempts++;

            // Avoid +0/-0 and duplicates
            // If recent tasks had +0, reject ALL +0 attempts
            // Otherwise reject 98% of +0 attempts
        } while (
            attempts < maxAttempts &&
            (
                existingKeys.includes(key) ||
                (num2 === 0 && (hasRecentZero || Math.random() < 0.98))
            )
        );

        return {
            num1,
            num2,
            operator,
            result,
            key,
            level: effectiveMax
        };
    }

    /**
     * Adjust adaptive level based on correctness
     */
    adjustAdaptiveLevel(correct) {
        if (correct) {
            this.adaptiveCorrectStreak++;
            this.adaptiveIncorrectCount = 0;

            // Increase level after 3 correct in a row, but not too fast
            if (this.adaptiveCorrectStreak >= MatheApp.LEVEL_UP_THRESHOLD && this.adaptiveLevel < this.adaptiveMaxResult) {
                this.adaptiveLevel = Math.min(this.adaptiveLevel + 1, this.adaptiveMaxResult);
                this.adaptiveCorrectStreak = 0;
                this.showLevelUp();
            }
        } else {
            this.adaptiveIncorrectCount++;
            this.adaptiveCorrectStreak = 0;

            // Decrease level after 2 incorrect, but not below 5
            if (this.adaptiveIncorrectCount >= MatheApp.LEVEL_DOWN_THRESHOLD && this.adaptiveLevel > MatheApp.MIN_ADAPTIVE_LEVEL) {
                this.adaptiveLevel = Math.max(this.adaptiveLevel - 2, MatheApp.MIN_ADAPTIVE_LEVEL);
                this.adaptiveIncorrectCount = 0;
            }
        }
    }

    /**
     * Show level up celebration
     */
    showLevelUp() {
        this.dom.milestoneCelebration.textContent = `🚀 Level ${this.adaptiveLevel}! 🚀`;
        this.dom.milestoneCelebration.classList.add('show');

        setTimeout(() => {
            this.dom.milestoneCelebration.classList.remove('show');
        }, 1500);
    }

    /**
     * Display adaptive tasks
     */
    displayAdaptiveTasks() {
        this.dom.previewTitle.textContent = `Adaptives Training (Level ${this.adaptiveLevel})`;
        this.dom.taskCountDisplay.textContent = `${this.adaptiveTasksShown} gelöst`;

        this.dom.tasksContainer.innerHTML = '';

        this.currentTasks.forEach((task, index) => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task-item';
            taskDiv.style.animationDelay = `${index * 0.1}s`;

            const equation = document.createElement('span');
            equation.className = 'equation';
            equation.textContent = `${task.num1} ${task.operator} ${task.num2} =`;

            const input = document.createElement('input');
            input.type = 'number';
            input.placeholder = '?';
            input.dataset.result = task.result;
            input.dataset.taskIndex = index;
            input.setAttribute('aria-label', `Lösung für ${task.num1} ${task.operator} ${task.num2}`);

            input.addEventListener('input', (e) => this.handleAdaptiveInput(e.target, taskDiv));
            input.addEventListener('focus', this.handleInputFocus.bind(this));
            input.addEventListener('keydown', (e) => this.handleKeyDown(e, this.dom.tasksContainer));

            taskDiv.appendChild(equation);
            taskDiv.appendChild(input);
            this.dom.tasksContainer.appendChild(taskDiv);
        });

        this.dom.preview.classList.add('active');
        this.dom.preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        setTimeout(() => {
            const firstInput = this.dom.tasksContainer.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 500);
    }

    /**
     * Handle adaptive input
     */
    handleAdaptiveInput(inputElement, taskDiv) {
        const userAnswer = parseInt(inputElement.value);
        const correctAnswer = parseInt(inputElement.dataset.result);
        const taskIndex = parseInt(inputElement.dataset.taskIndex);

        taskDiv.classList.remove('correct', 'incorrect');

        if (inputElement.value === '') {
            return;
        }

        // Prevent double-processing
        if (inputElement.disabled) {
            return;
        }

        clearTimeout(inputElement.validationTimeout);

        inputElement.validationTimeout = setTimeout(() => {
            if (userAnswer === correctAnswer) {
                taskDiv.classList.add('correct');
                audioManager.playSuccessSound();
                inputElement.disabled = true;

                this.adjustAdaptiveLevel(true);
                this.adaptiveTasksShown++;

                // Progressive unlock system
                if (this.maxUnlockedNumber === 10) {
                    // At starting level: count ALL correct answers
                    this.correctAnswersAtStartLevel++;

                    this.updateProgressBar();

                    // Check if enough tasks completed to unlock 11
                    if (this.correctAnswersAtStartLevel >= this.tasksNeededPerNumber) {
                        this.unlockNextNumber();
                    }
                } else {
                    // At higher levels: track specific result numbers
                    const resultNumber = correctAnswer;
                    if (!this.numberUsageCount[resultNumber]) {
                        this.numberUsageCount[resultNumber] = 0;
                    }
                    this.numberUsageCount[resultNumber]++;

                    this.updateProgressBar();

                    // Check if current max number has been used enough times to unlock next
                    const currentMaxUsage = this.numberUsageCount[this.maxUnlockedNumber] || 0;
                    if (currentMaxUsage >= this.tasksNeededPerNumber) {
                        this.unlockNextNumber();
                    }
                }

                // Update counter
                this.dom.taskCountDisplay.textContent = `${this.adaptiveTasksShown} gelöst`;
                this.dom.previewTitle.textContent = `Adaptives Training (Level ${this.adaptiveLevel})`;

                // CRITICAL: Focus next input SYNCHRONOUSLY to keep keyboard open on mobile
                // Add new task first
                this.addNewAdaptiveTask();

                // Focus next input IMMEDIATELY (no setTimeout - iOS keyboard requirement)
                const nextInput = this.dom.tasksContainer.querySelector('input:not([disabled])');
                if (nextInput) {
                    nextInput.focus();

                    // Scroll to next input (can be async)
                    if (window.innerWidth <= 768) {
                        requestAnimationFrame(() => {
                            nextInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        });
                    }
                }

                // Update visuals asynchronously (doesn't affect keyboard)
                requestAnimationFrame(() => {
                    this.updateCompletedTasksVisuals();
                });

                // Check for milestones
                if (this.adaptiveTasksShown % MatheApp.MILESTONE_INTERVAL === 0) {
                    this.showMilestoneCelebration(this.adaptiveTasksShown);
                }
            } else {
                taskDiv.classList.add('incorrect');
                this.adjustAdaptiveLevel(false);
                this.dom.previewTitle.textContent = `Adaptives Training (Level ${this.adaptiveLevel})`;
            }
        }, MatheApp.VALIDATION_DELAY);
    }

    /**
     * Add new adaptive task to the end
     */
    addNewAdaptiveTask() {
        // Generate new task from full range (can include easier tasks)
        const newTask = this.generateAdaptiveTaskFromFullRange();
        this.currentTasks.push(newTask);

        // Create new task element
        const newTaskDiv = document.createElement('div');
        newTaskDiv.className = 'task-item';
        newTaskDiv.style.opacity = '0';
        newTaskDiv.style.transform = 'translateY(20px)';

        const equation = document.createElement('span');
        equation.className = 'equation';
        equation.textContent = `${newTask.num1} ${newTask.operator} ${newTask.num2} =`;

        const input = document.createElement('input');
        input.type = 'number';
        input.placeholder = '?';
        input.dataset.result = newTask.result;
        input.dataset.taskIndex = this.currentTasks.length - 1;
        input.inputMode = 'numeric';
        input.pattern = '[0-9]*';
        input.setAttribute('aria-label', `Lösung für ${newTask.num1} ${newTask.operator} ${newTask.num2}`);

        input.addEventListener('input', (e) => this.handleAdaptiveInput(e.target, newTaskDiv));
        input.addEventListener('focus', this.handleInputFocus.bind(this));
        input.addEventListener('keydown', (e) => this.handleKeyDown(e, this.dom.tasksContainer));

        newTaskDiv.appendChild(equation);
        newTaskDiv.appendChild(input);

        // Add to bottom
        this.dom.tasksContainer.appendChild(newTaskDiv);

        // Slide in animation
        requestAnimationFrame(() => {
            newTaskDiv.style.transition = 'all 0.4s ease-out';
            newTaskDiv.style.opacity = '1';
            newTaskDiv.style.transform = 'translateY(0)';
        });
    }

    /**
     * Update visuals for completed tasks (fade old ones, remove very old ones)
     */
    updateCompletedTasksVisuals() {
        const allTaskDivs = Array.from(this.dom.tasksContainer.querySelectorAll('.task-item'));
        const completedTasks = allTaskDivs.filter(div => div.classList.contains('correct'));

        // Keep last 10 completed tasks, remove older ones
        const MAX_COMPLETED_VISIBLE = 10;

        if (completedTasks.length > MAX_COMPLETED_VISIBLE) {
            const tasksToRemove = completedTasks.slice(0, completedTasks.length - MAX_COMPLETED_VISIBLE);
            tasksToRemove.forEach(taskDiv => {
                taskDiv.style.transition = 'all 0.8s ease-out';
                taskDiv.style.opacity = '0';
                taskDiv.style.transform = 'scale(0.8)';
                taskDiv.style.height = '0';
                taskDiv.style.margin = '0';
                taskDiv.style.padding = '0';

                setTimeout(() => {
                    taskDiv.remove();
                }, 800);
            });
        }

        // Fade completed tasks gradually (last 10)
        const visibleCompleted = completedTasks.slice(-MAX_COMPLETED_VISIBLE);
        visibleCompleted.forEach((taskDiv, index) => {
            // Gradually fade from 0.3 (oldest) to 0.6 (newest completed)
            const opacity = 0.3 + (index / MAX_COMPLETED_VISIBLE) * 0.3;
            const grayscale = 100 - (index / MAX_COMPLETED_VISIBLE) * 30;

            taskDiv.style.transition = 'opacity 0.8s ease-out, filter 0.8s ease-out';
            taskDiv.style.opacity = opacity;
            taskDiv.style.filter = `grayscale(${grayscale}%)`;
        });

        // Keep active tasks fully visible
        const activeTasks = allTaskDivs.filter(div => !div.classList.contains('correct') && !div.classList.contains('incorrect'));
        activeTasks.forEach(taskDiv => {
            taskDiv.style.transition = 'opacity 0.3s ease-out, filter 0.3s ease-out';
            taskDiv.style.opacity = '1';
            taskDiv.style.filter = 'grayscale(0%)';
        });
    }

    /**
     * Generate a single task for fixed mode
     */
    generateSingleTask(type, maxValue = null) {
        let num1, num2, operator, result, key;
        const max = maxValue || (type === 'add10' || type === 'sub10' ? 10 : type === 'add20' ? 20 : 50);

        if (this.currentOperator === 'add') {
            // Addition with dynamic max
            do {
                num1 = Math.floor(Math.random() * (max + 1));
                num2 = Math.floor(Math.random() * (max + 1 - num1));
            } while ((num1 === 0 || num2 === 0) && Math.random() < 0.9);

            operator = '+';
            result = num1 + num2;
            key = `${num1}+${num2}`;
        } else {
            // Subtraction
            do {
                num1 = Math.floor(Math.random() * (max + 1));
                num2 = Math.floor(Math.random() * (num1 + 1));
                result = num1 - num2;
            } while (result === 0 && Math.random() < 0.9);

            operator = '−';
            key = `${num1}-${num2}`;
        }

        return { num1, num2, operator, result, key };
    }

    /**
     * Display tasks in fixed mode
     */
    displayTasks() {
        if (this.adaptiveMode) {
            this.displayAdaptiveTasks();
            return;
        }

        // Hide progress bar in non-adaptive mode
        if (this.dom.progressBarContainer) {
            this.dom.progressBarContainer.style.display = 'none';
        }

        const typeNames = {
            'add10': 'Addition Zahlenraum 10',
            'add20': 'Addition Zahlenraum 20',
            'sub10': 'Subtraktion Zahlenraum 10'
        };

        this.dom.previewTitle.textContent = typeNames[this.currentType];
        this.dom.taskCountDisplay.textContent = `${this.currentTasks.length} Aufgaben`;

        this.dom.tasksContainer.innerHTML = '';
        this.currentTasks.forEach((task, index) => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task-item';
            taskDiv.style.animationDelay = `${index * 0.03}s`;

            const equation = document.createElement('span');
            equation.className = 'equation';
            equation.textContent = `${task.num1} ${task.operator} ${task.num2} =`;

            const input = document.createElement('input');
            input.type = 'number';
            input.placeholder = '?';
            input.dataset.result = task.result;
            input.setAttribute('aria-label', `Lösung für ${task.num1} ${task.operator} ${task.num2}`);

            input.addEventListener('input', (e) => this.handleFixedInput(e.target, taskDiv));
            input.addEventListener('keydown', (e) => this.handleKeyDown(e, this.dom.tasksContainer));

            taskDiv.appendChild(equation);
            taskDiv.appendChild(input);
            this.dom.tasksContainer.appendChild(taskDiv);
        });

        this.dom.preview.classList.add('active');
        this.dom.preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Show crown counter in non-adaptive mode
        this.showCrownCounter();

        // Focus on first input after a short delay
        setTimeout(() => {
            const firstInput = this.dom.tasksContainer.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 500);
    }

    /**
     * Handle fixed mode input
     */
    handleFixedInput(inputElement, taskDiv) {
        const userAnswer = parseInt(inputElement.value);
        const correctAnswer = parseInt(inputElement.dataset.result);

        taskDiv.classList.remove('correct', 'incorrect');

        if (inputElement.value === '') {
            return;
        }

        // Don't validate immediately if user is potentially typing a two-digit number
        clearTimeout(inputElement.validationTimeout);

        inputElement.validationTimeout = setTimeout(() => {
            if (userAnswer === correctAnswer) {
                taskDiv.classList.add('correct');
                audioManager.playSuccessSound();

                // Track completed tasks
                if (!inputElement.dataset.completed) {
                    inputElement.dataset.completed = 'true';
                    this.completedTasks++;

                    // Check for milestone (every 10 tasks)
                    if (this.completedTasks % MatheApp.MILESTONE_INTERVAL === 0 && this.completedTasks < this.currentTasks.length) {
                        this.showMilestoneCelebration(this.completedTasks);
                    }

                    // Check if all tasks completed
                    if (this.completedTasks === this.currentTasks.length) {
                        setTimeout(() => {
                            this.launchFireworks();
                            this.earnCrown(); // Award crown for completing all tasks
                        }, 300);
                    }

                    // Auto-focus next input on correct answer
                    setTimeout(() => {
                        const allInputs = this.dom.tasksContainer.querySelectorAll('input');
                        const currentIndex = Array.from(allInputs).indexOf(inputElement);
                        if (currentIndex < allInputs.length - 1) {
                            allInputs[currentIndex + 1].focus();
                        }
                    }, 300);
                }
            } else {
                taskDiv.classList.add('incorrect');
                // Reset completion status if answer changed to wrong
                if (inputElement.dataset.completed) {
                    inputElement.dataset.completed = '';
                    this.completedTasks = Math.max(0, this.completedTasks - 1);
                }
            }
        }, MatheApp.VALIDATION_DELAY);
    }

    /**
     * Handle input focus (mobile scrolling)
     */
    handleInputFocus(e) {
        // Mobile: Scroll to input when keyboard appears
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }

    /**
     * Handle keydown events
     */
    handleKeyDown(e, container) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const allInputs = container.querySelectorAll('input:not([disabled])');
            const currentIndex = Array.from(allInputs).indexOf(e.target);
            if (currentIndex < allInputs.length - 1) {
                allInputs[currentIndex + 1].focus();
            }
        }
    }

    /**
     * Show milestone celebration
     */
    showMilestoneCelebration(count) {
        this.dom.milestoneCelebration.textContent = `🎉 ${count} Aufgaben geschafft! 🎉`;
        this.dom.milestoneCelebration.classList.add('show');

        // Add celebration effect to task counter
        this.dom.taskCountDisplay.classList.add('celebrating');

        setTimeout(() => {
            this.dom.milestoneCelebration.classList.remove('show');
            this.dom.taskCountDisplay.classList.remove('celebrating');
        }, 1500);
    }

    /**
     * Launch fireworks animation
     */
    launchFireworks(count = MatheApp.MAX_FIREWORKS) {
        if (!this.dom.milestoneCelebration || !this.dom.fireworksContainer) {
            console.warn('Fireworks elements not found');
            return;
        }

        this.dom.milestoneCelebration.textContent = `🎊 Alle Aufgaben richtig! Super! 🎊`;
        this.dom.milestoneCelebration.classList.add('show');

        this.dom.fireworksContainer.classList.add('active');

        // Launch multiple fireworks
        const colors = ['#FF6B9D', '#FEC260', '#5DADE2', '#82E0AA', '#BB8FCE', '#F1948A'];
        let fireworkCount = 0;

        const fireworkInterval = setInterval(() => {
            if (fireworkCount >= count) {
                clearInterval(fireworkInterval);
                setTimeout(() => {
                    this.dom.fireworksContainer.classList.remove('active');
                    this.dom.fireworksContainer.innerHTML = '';
                    this.dom.milestoneCelebration.classList.remove('show');
                }, 2000);
                return;
            }

            this.createFirework(colors[Math.floor(Math.random() * colors.length)]);
            fireworkCount++;
        }, MatheApp.FIREWORK_INTERVAL);
    }

    /**
     * Create a single firework
     */
    createFirework(color) {
        const x = Math.random() * window.innerWidth;
        const y = window.innerHeight;

        // Create initial firework
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = x + 'px';
        firework.style.top = y + 'px';
        firework.style.backgroundColor = color;
        this.dom.fireworksContainer.appendChild(firework);

        // Create explosion after delay
        setTimeout(() => {
            this.createExplosion(x, y - 300, color);
            firework.remove();
        }, 1000);
    }

    /**
     * Create firework explosion
     */
    createExplosion(x, y, color) {
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
            particle.style.transform = `translate(var(--tx), var(--ty)) scale(0)`;

            this.dom.fireworksContainer.appendChild(particle);

            setTimeout(() => particle.remove(), 1000);
        }
    }

    /**
     * Generate PDF
     */
    generatePDF() {
        // jsPDF can be at window.jspdf.jsPDF or window.jsPDF
        const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
        if (!jsPDF) {
            alert('PDF-Bibliothek konnte nicht geladen werden. Bitte Seite neu laden.');
            return;
        }
        const doc = new jsPDF();

        const typeNames = {
            'add10': 'Addition Zahlenraum 10',
            'add20': 'Addition Zahlenraum 20',
            'sub10': 'Subtraktion Zahlenraum 10'
        };

        // Title
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Mathe-Aufgaben', 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(typeNames[this.currentType], 105, 30, { align: 'center' });
        doc.text('Datum: ' + new Date().toLocaleDateString('de-DE'), 105, 37, { align: 'center' });

        // Add name field
        doc.setFontSize(11);
        doc.text('Name: _________________________', 20, 45);

        // Tasks
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');

        let x = 20;
        let y = 60;
        const columnWidth = 63;
        const rowHeight = 15;
        const tasksPerRow = 3;

        this.currentTasks.forEach((task, index) => {
            // Use standard ASCII characters for operators
            let operator = task.operator === '−' ? '-' : task.operator;

            const equation = task.num1 + ' ' + operator + ' ' + task.num2 + ' =';
            const answer = '__________';

            // Draw equation
            doc.text(equation, x, y);
            // Draw answer line
            doc.text(answer, x + 28, y);

            x += columnWidth;
            if ((index + 1) % tasksPerRow === 0) {
                x = 20;
                y += rowHeight;

                // New page if needed
                if (y > 270) {
                    doc.addPage();
                    y = 20;

                    // Add name field on new page
                    doc.setFontSize(11);
                    doc.setFont(undefined, 'normal');
                    doc.text('Name: _________________________', 20, 15);
                    y = 30;
                    doc.setFontSize(14);
                    doc.setFont(undefined, 'bold');
                }
            }
        });

        // Save PDF
        const fileName = 'Mathe_' + typeNames[this.currentType].replace(/ /g, '_') + '_' + new Date().toISOString().split('T')[0] + '.pdf';
        doc.save(fileName);
    }

    /**
     * Load saved progress
     */
    loadProgress() {
        const progress = ProgressTracker.getProgress('math');
        this.dom.difficultySlider.value = progress.level || 5;
        this.updateDifficultyLabel();
    }

    /**
     * Update progress bar for unlock system
     */
    updateProgressBar() {
        if (!this.dom.progressBarContainer) return;

        let progress, remaining, progressText;

        if (this.maxUnlockedNumber === 10) {
            // At starting level: count ALL correct answers
            progress = (this.correctAnswersAtStartLevel / this.tasksNeededPerNumber) * 100;
            remaining = this.tasksNeededPerNumber - this.correctAnswersAtStartLevel;
            progressText = `Noch ${remaining} Aufgaben bis ${this.maxUnlockedNumber + 1} freigeschaltet wird 🎯`;
        } else {
            // At higher levels: track specific result number
            const currentMaxUsage = this.numberUsageCount[this.maxUnlockedNumber] || 0;
            progress = (currentMaxUsage / this.tasksNeededPerNumber) * 100;
            remaining = this.tasksNeededPerNumber - currentMaxUsage;
            progressText = `Noch ${remaining} Aufgaben mit ${this.maxUnlockedNumber} bis ${this.maxUnlockedNumber + 1} freigeschaltet wird 🎯`;
        }

        if (this.dom.progressBarFill) {
            this.dom.progressBarFill.style.width = `${Math.min(progress, 100)}%`;
        }

        if (this.dom.progressBarText) {
            this.dom.progressBarText.textContent = progressText;
        }

        // Show progress bar in adaptive mode
        if (this.dom.progressBarContainer && this.adaptiveMode) {
            this.dom.progressBarContainer.style.display = 'block';
        }
    }

    /**
     * Unlock next number with celebration
     */
    unlockNextNumber() {
        this.maxUnlockedNumber++;
        // No need to reset counter - we track each number individually in numberUsageCount

        // Show unlock message
        if (this.dom.unlockMessage) {
            this.dom.unlockMessage.textContent = `🎉 Super! Rechnungen bis ${this.maxUnlockedNumber} freigeschaltet! 🎉`;
            this.dom.unlockMessage.style.display = 'block';
            this.dom.unlockMessage.style.animation = 'bounceIn 0.6s ease-out';

            // Hide after 3 seconds
            setTimeout(() => {
                if (this.dom.unlockMessage) {
                    this.dom.unlockMessage.style.animation = 'fadeOut 0.5s ease-out';
                    setTimeout(() => {
                        if (this.dom.unlockMessage) {
                            this.dom.unlockMessage.style.display = 'none';
                        }
                    }, 500);
                }
            }, 3000);
        }

        // Launch fireworks
        this.launchFireworks(8);

        // Update progress bar for next unlock
        this.updateProgressBar();
    }

    /**
     * Load crowns from localStorage
     */
    loadCrowns() {
        const saved = localStorage.getItem('smarty-crowns');
        this.crownsEarned = saved ? parseInt(saved) : 0;
    }

    /**
     * Save crowns to localStorage
     */
    saveCrowns() {
        localStorage.setItem('smarty-crowns', this.crownsEarned.toString());
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
        if (this.dom.crownCounter && !this.adaptiveMode) {
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
        if (!this.adaptiveMode) {
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
    const app = new MatheApp();
    app.init();
});
