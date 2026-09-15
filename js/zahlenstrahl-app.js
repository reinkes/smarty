class ZahlenstrahlApp {
    static TOTAL_TASKS = 20;
    static MILESTONE_INTERVAL = 10;
    static LEVEL_UP_THRESHOLD = 3;
    static LEVEL_DOWN_THRESHOLD = 2;
    static LEVEL_DOWN_AMOUNT = 2;
    static MIN_LEVEL = 1;
    static MAX_LEVEL = 10;
    static FEEDBACK_DELAY = 900;
    static MAX_DIGITS = 3;

    static LEVELS = [
        { max: 20, tickEvery: 1, labelEvery: 5, blankMode: 'multiple' },
        { max: 20, tickEvery: 1, labelEvery: 5, blankMode: 'any' },
        { max: 30, tickEvery: 1, labelEvery: 5, blankMode: 'any' },
        { max: 60, tickEvery: 1, labelEvery: 10, blankMode: 'multiple5' },
        { max: 60, tickEvery: 1, labelEvery: 10, blankMode: 'any' },
        { max: 60, tickEvery: 2, labelEvery: 10, blankMode: 'any' },
        { max: 100, tickEvery: 1, labelEvery: 10, blankMode: 'multiple5' },
        { max: 100, tickEvery: 2, labelEvery: 10, blankMode: 'any' },
        { max: 100, tickEvery: 5, labelEvery: 10, blankMode: 'any' },
        { max: 100, tickEvery: 5, labelEvery: 20, blankMode: 'any' }
    ];

    constructor() {
        this.level = 1;
        this.tasksCompleted = 0;
        this.correctStreak = 0;
        this.incorrectCount = 0;
        this.currentTask = null;
        this.answered = false;
        this.inputValue = '';

        this.dom = {
            levelDisplay: null,
            progressFill: null,
            progressText: null,
            numberLine: null,
            answerDisplay: null,
            keypad: null,
            keyClear: null,
            keySubmit: null,
            feedback: null,
            crownCounter: null,
            crownCount: null,
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
        this.dom.numberLine = document.getElementById('numberLine');
        this.dom.answerDisplay = document.getElementById('answerDisplay');
        this.dom.keypad = document.getElementById('keypad');
        this.dom.keyClear = document.getElementById('keyClear');
        this.dom.keySubmit = document.getElementById('keySubmit');
        this.dom.feedback = document.getElementById('feedback');
        this.dom.crownCounter = document.getElementById('crownCounter');
        this.dom.crownCount = document.getElementById('crownCount');
        this.dom.taskArea = document.getElementById('taskArea');
        this.dom.completionScreen = document.getElementById('completionScreen');
        this.dom.completionCrowns = document.getElementById('completionCrowns');
        this.dom.restartBtn = document.getElementById('restartBtn');
    }

    attachEventListeners() {
        this.dom.keypad.querySelectorAll('[data-digit]').forEach(btn => {
            btn.addEventListener('click', () => this.appendDigit(btn.dataset.digit));
        });
        this.dom.keyClear.addEventListener('click', () => this.clearInput());
        this.dom.keySubmit.addEventListener('click', () => this.submitAnswer());
        this.dom.restartBtn.addEventListener('click', () => this.restart());

        document.addEventListener('keydown', (e) => {
            if (this.answered) return;
            if (e.key >= '0' && e.key <= '9') this.appendDigit(e.key);
            else if (e.key === 'Backspace') this.clearInput();
            else if (e.key === 'Enter') this.submitAnswer();
        });
    }

    loadProgress() {
        const progress = ProgressTracker.getProgress('zahlenstrahl');
        this.level = progress.level || 1;
        CrownManager.showCounter(this.dom.crownCounter, this.dom.crownCount);
    }

    getLevelConfig() {
        const idx = Math.min(Math.max(this.level, ZahlenstrahlApp.MIN_LEVEL), ZahlenstrahlApp.MAX_LEVEL) - 1;
        return ZahlenstrahlApp.LEVELS[idx];
    }

    generateTask() {
        const cfg = this.getLevelConfig();
        const { max, tickEvery, labelEvery, blankMode } = cfg;

        const anchors = new Set();
        for (let v = 0; v <= max; v += labelEvery) anchors.add(v);

        let blankValue;
        if (blankMode === 'multiple') {
            const candidates = [...anchors].filter(v => v !== 0 && v !== max);
            blankValue = candidates[Math.floor(Math.random() * candidates.length)];
        } else if (blankMode === 'multiple5') {
            const candidates = [];
            for (let v = 5; v < max; v += 5) candidates.push(v);
            blankValue = candidates[Math.floor(Math.random() * candidates.length)];
        } else {
            let v;
            do {
                v = Math.floor(Math.random() * (max - 2 * tickEvery)) + tickEvery;
                v = Math.round(v / tickEvery) * tickEvery;
            } while (v <= 0 || v >= max);
            blankValue = v;
        }

        anchors.delete(blankValue);
        const boxes = [...anchors].map(v => ({ value: v, isBlank: false }));
        boxes.push({ value: blankValue, isBlank: true });
        boxes.sort((a, b) => a.value - b.value);

        return { max, tickEvery, labelEvery, boxes, answer: blankValue };
    }

    renderNumberLine(task) {
        const line = this.dom.numberLine;
        line.innerHTML = '';
        const { max, tickEvery, boxes } = task;

        for (let v = 0; v <= max; v += tickEvery) {
            const tick = document.createElement('div');
            const isMajor = v % task.labelEvery === 0;
            tick.className = isMajor ? 'tick major' : 'tick';
            tick.style.left = `${(v / max) * 100}%`;
            line.appendChild(tick);
        }

        boxes.forEach(box => {
            const el = document.createElement('div');
            el.className = box.isBlank ? 'tick-box blank' : 'tick-box';
            el.style.left = `${(box.value / max) * 100}%`;
            el.textContent = box.isBlank ? '?' : String(box.value);
            if (box.isBlank) this.dom.blankBox = el;
            line.appendChild(el);
        });
    }

    newTask() {
        this.answered = false;
        this.inputValue = '';
        this.currentTask = this.generateTask();
        this.renderNumberLine(this.currentTask);
        this.updateAnswerDisplay();
        this.dom.feedback.textContent = '';
        this.dom.feedback.className = 'feedback';
        this.setKeypadEnabled(true);
        this.updateLevelDisplay();
        this.updateProgress();
    }

    appendDigit(digit) {
        if (this.answered) return;
        if (this.inputValue.length >= ZahlenstrahlApp.MAX_DIGITS) return;
        this.inputValue += digit;
        this.updateAnswerDisplay();
    }

    clearInput() {
        if (this.answered) return;
        this.inputValue = '';
        this.updateAnswerDisplay();
    }

    updateAnswerDisplay() {
        this.dom.answerDisplay.textContent = this.inputValue || ' ';
    }

    setKeypadEnabled(enabled) {
        this.dom.keypad.querySelectorAll('button').forEach(btn => {
            btn.disabled = !enabled;
        });
    }

    submitAnswer() {
        if (this.answered) return;
        if (this.inputValue === '') return;
        this.answered = true;

        const given = parseInt(this.inputValue, 10);
        const correct = given === this.currentTask.answer;

        this.setKeypadEnabled(false);

        if (this.dom.blankBox) {
            this.dom.blankBox.classList.add(correct ? 'correct' : 'incorrect');
            if (!correct) this.dom.blankBox.textContent = this.currentTask.answer;
        }

        if (correct) {
            this.dom.feedback.textContent = '✓ Richtig!';
            this.dom.feedback.className = 'feedback correct';
            audioManager.playSuccessSound();
            this.correctStreak++;
            this.incorrectCount = 0;
            if (this.correctStreak >= ZahlenstrahlApp.LEVEL_UP_THRESHOLD) {
                this.correctStreak = 0;
                this.levelUp();
            }
        } else {
            this.dom.feedback.textContent = `✗ Richtig wäre: ${this.currentTask.answer}`;
            this.dom.feedback.className = 'feedback incorrect';
            this.correctStreak = 0;
            this.incorrectCount++;
            if (this.incorrectCount >= ZahlenstrahlApp.LEVEL_DOWN_THRESHOLD) {
                this.incorrectCount = 0;
                this.levelDown();
            }
        }

        ProgressTracker.recordAttempt('zahlenstrahl', correct);
        this.tasksCompleted++;
        this.updateProgress();

        if (this.tasksCompleted % ZahlenstrahlApp.MILESTONE_INTERVAL === 0 && this.tasksCompleted < ZahlenstrahlApp.TOTAL_TASKS) {
            launchFireworks();
            showMilestoneCelebration(`🎉 ${this.tasksCompleted} Aufgaben geschafft! 🎉`);
        }

        if (this.tasksCompleted >= ZahlenstrahlApp.TOTAL_TASKS) {
            setTimeout(() => this.showCompletion(), ZahlenstrahlApp.FEEDBACK_DELAY + 200);
        } else {
            setTimeout(() => this.newTask(), ZahlenstrahlApp.FEEDBACK_DELAY);
        }
    }

    levelUp() {
        if (this.level < ZahlenstrahlApp.MAX_LEVEL) {
            this.level = Math.min(this.level + 1, ZahlenstrahlApp.MAX_LEVEL);
            ProgressTracker.updateLevel('zahlenstrahl', this.level);
            showLevelUpCelebration(this.level);
        }
    }

    levelDown() {
        if (this.level > ZahlenstrahlApp.MIN_LEVEL) {
            this.level = Math.max(this.level - ZahlenstrahlApp.LEVEL_DOWN_AMOUNT, ZahlenstrahlApp.MIN_LEVEL);
            ProgressTracker.updateLevel('zahlenstrahl', this.level);
        }
    }

    updateLevelDisplay() {
        this.dom.levelDisplay.textContent = `Level ${this.level}`;
    }

    updateProgress() {
        const pct = (this.tasksCompleted / ZahlenstrahlApp.TOTAL_TASKS) * 100;
        this.dom.progressFill.style.width = `${Math.min(pct, 100)}%`;
        this.dom.progressText.textContent = `${this.tasksCompleted} / ${ZahlenstrahlApp.TOTAL_TASKS}`;
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
    const app = new ZahlenstrahlApp();
    app.init();
});
