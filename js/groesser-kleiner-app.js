class GroesserKleinerApp {
    static TOTAL_TASKS = 20;
    static MILESTONE_INTERVAL = 10;
    static LEVEL_UP_THRESHOLD = 3;
    static LEVEL_DOWN_THRESHOLD = 2;
    static LEVEL_DOWN_AMOUNT = 2;
    static MIN_LEVEL = 1;
    static MAX_LEVEL = 10;
    static FEEDBACK_DELAY = 600;

    constructor() {
        this.level = 1;
        this.tasksCompleted = 0;
        this.correctStreak = 0;
        this.incorrectCount = 0;
        // Crown achievement system (managed by CrownManager)
        this.currentTask = null;
        this.answered = false;

        this.dom = {
            levelDisplay: null,
            progressFill: null,
            progressText: null,
            num1: null,
            num2: null,
            btnLess: null,
            btnEqual: null,
            btnGreater: null,
            feedback: null,
            crownCounter: null,
            crownCount: null,
            milestoneCelebration: null,
            fireworksContainer: null,
            taskArea: null,
            completionScreen: null,
            completionCrowns: null,
            restartBtn: null
        };
    }

    init() {
        this.cacheDOMElements();
        this.loadProgress();
        this.attachEventListeners();
        this.newTask();
    }

    cacheDOMElements() {
        this.dom.levelDisplay = document.getElementById('levelDisplay');
        this.dom.progressFill = document.getElementById('progressFill');
        this.dom.progressText = document.getElementById('progressText');
        this.dom.num1 = document.getElementById('num1');
        this.dom.num2 = document.getElementById('num2');
        this.dom.btnLess = document.getElementById('btnLess');
        this.dom.btnEqual = document.getElementById('btnEqual');
        this.dom.btnGreater = document.getElementById('btnGreater');
        this.dom.feedback = document.getElementById('feedback');
        this.dom.crownCounter = document.getElementById('crownCounter');
        this.dom.crownCount = document.getElementById('crownCount');
        this.dom.milestoneCelebration = document.getElementById('milestoneCelebration');
        this.dom.fireworksContainer = document.getElementById('fireworksContainer');
        this.dom.taskArea = document.getElementById('taskArea');
        this.dom.completionScreen = document.getElementById('completionScreen');
        this.dom.completionCrowns = document.getElementById('completionCrowns');
        this.dom.restartBtn = document.getElementById('restartBtn');
    }

    attachEventListeners() {
        this.dom.btnLess.addEventListener('click', () => this.handleAnswer('<'));
        this.dom.btnEqual.addEventListener('click', () => this.handleAnswer('='));
        this.dom.btnGreater.addEventListener('click', () => this.handleAnswer('>'));
        this.dom.restartBtn.addEventListener('click', () => this.restart());
    }

    loadProgress() {
        const progress = ProgressTracker.getProgress('groesser-kleiner');
        this.level = progress.level || 1;
        CrownManager.showCounter(this.dom.crownCounter, this.dom.crownCount);
    }

    getMaxNumber() {
        if (this.level <= 3) return 5;
        if (this.level <= 6) return 10;
        return 20;
    }

    generateTask() {
        const max = this.getMaxNumber();
        const a = Math.floor(Math.random() * max) + 1;
        let b;
        const r = Math.random();
        if (r < 0.33) {
            b = a;
        } else {
            b = Math.floor(Math.random() * max) + 1;
        }
        let correct;
        if (a < b) correct = '<';
        else if (a > b) correct = '>';
        else correct = '=';
        return { a, b, correct };
    }

    newTask() {
        this.answered = false;
        this.currentTask = this.generateTask();
        this.dom.num1.textContent = this.currentTask.a;
        this.dom.num2.textContent = this.currentTask.b;
        this.dom.feedback.textContent = '';
        this.dom.feedback.className = 'feedback';
        this.dom.btnLess.disabled = false;
        this.dom.btnEqual.disabled = false;
        this.dom.btnGreater.disabled = false;
        this.dom.btnLess.classList.remove('correct', 'incorrect');
        this.dom.btnEqual.classList.remove('correct', 'incorrect');
        this.dom.btnGreater.classList.remove('correct', 'incorrect');
        this.updateLevelDisplay();
        this.updateProgress();
    }

    handleAnswer(symbol) {
        if (this.answered) return;
        this.answered = true;

        const correct = symbol === this.currentTask.correct;

        this.dom.btnLess.disabled = true;
        this.dom.btnEqual.disabled = true;
        this.dom.btnGreater.disabled = true;

        const btnMap = { '<': this.dom.btnLess, '=': this.dom.btnEqual, '>': this.dom.btnGreater };
        const chosenBtn = btnMap[symbol];
        const correctBtn = btnMap[this.currentTask.correct];

        if (correct) {
            chosenBtn.classList.add('correct');
            this.dom.feedback.textContent = '✓ Richtig!';
            this.dom.feedback.className = 'feedback correct';
            audioManager.playSuccessSound();
            this.correctStreak++;
            this.incorrectCount = 0;
            if (this.correctStreak >= GroesserKleinerApp.LEVEL_UP_THRESHOLD) {
                this.correctStreak = 0;
                this.levelUp();
            }
        } else {
            chosenBtn.classList.add('incorrect');
            correctBtn.classList.add('correct');
            this.dom.feedback.textContent = `✗ ${this.currentTask.a} ${this.currentTask.correct} ${this.currentTask.b}`;
            this.dom.feedback.className = 'feedback incorrect';
            this.correctStreak = 0;
            this.incorrectCount++;
            if (this.incorrectCount >= GroesserKleinerApp.LEVEL_DOWN_THRESHOLD) {
                this.incorrectCount = 0;
                this.levelDown();
            }
        }

        ProgressTracker.recordAttempt('groesser-kleiner', correct);
        this.tasksCompleted++;
        this.updateProgress();

        if (this.tasksCompleted % GroesserKleinerApp.MILESTONE_INTERVAL === 0 && this.tasksCompleted < GroesserKleinerApp.TOTAL_TASKS) {
            launchFireworks();
            showMilestoneCelebration(`🎉 ${this.tasksCompleted} Aufgaben geschafft! 🎉`);
        }

        if (this.tasksCompleted >= GroesserKleinerApp.TOTAL_TASKS) {
            setTimeout(() => this.showCompletion(), GroesserKleinerApp.FEEDBACK_DELAY + 200);
        } else {
            setTimeout(() => this.newTask(), GroesserKleinerApp.FEEDBACK_DELAY);
        }
    }

    levelUp() {
        if (this.level < GroesserKleinerApp.MAX_LEVEL) {
            this.level = Math.min(this.level + 1, GroesserKleinerApp.MAX_LEVEL);
            ProgressTracker.updateLevel('groesser-kleiner', this.level);
            showLevelUpCelebration(this.level);
        }
    }

    levelDown() {
        if (this.level > GroesserKleinerApp.MIN_LEVEL) {
            this.level = Math.max(this.level - GroesserKleinerApp.LEVEL_DOWN_AMOUNT, GroesserKleinerApp.MIN_LEVEL);
            ProgressTracker.updateLevel('groesser-kleiner', this.level);
        }
    }

    updateLevelDisplay() {
        this.dom.levelDisplay.textContent = `Level ${this.level}`;
    }

    updateProgress() {
        const pct = (this.tasksCompleted / GroesserKleinerApp.TOTAL_TASKS) * 100;
        this.dom.progressFill.style.width = `${Math.min(pct, 100)}%`;
        this.dom.progressText.textContent = `${this.tasksCompleted} / ${GroesserKleinerApp.TOTAL_TASKS}`;
    }

    showCompletion() {
        const { reward, total } = CrownManager.earnAndDisplay(this.level, this.dom.crownCount, this.dom.crownCounter);
        this.dom.taskArea.style.display = 'none';
        this.dom.completionScreen.style.display = 'block';
        this.dom.completionCrowns.textContent = `👑 +${reward} = ${total} Kronen`;
        launchFireworks();
    }

    restart() {
        this.tasksCompleted = 0;
        this.correctStreak = 0;
        this.incorrectCount = 0;
        this.answered = false;
        this.dom.taskArea.style.display = 'block';
        this.dom.completionScreen.style.display = 'none';
        this.newTask();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new GroesserKleinerApp();
    app.init();
});
