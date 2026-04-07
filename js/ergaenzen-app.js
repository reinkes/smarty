class ErgaenzenApp {
    static TOTAL_TASKS = 20;
    static MILESTONE_INTERVAL = 10;
    static FEEDBACK_DELAY = 700;

    constructor() {
        this.tasksCompleted = 0;
        this.correctCount = 0;
        this.crownsEarned = 0;
        this.currentTask = null;
        this.answered = false;
        this.operator = 'mix'; // 'add', 'sub', 'mix'

        this.dom = {};
    }

    init() {
        this.cacheDOMElements();
        this.loadProgress();
        this.attachEventListeners();
        this.newTask();
    }

    cacheDOMElements() {
        this.dom.progressFill = document.getElementById('progressFill');
        this.dom.progressText = document.getElementById('progressText');
        this.dom.equation = document.getElementById('equation');
        this.dom.feedback = document.getElementById('feedback');
        this.dom.crownCounter = document.getElementById('crownCounter');
        this.dom.crownCount = document.getElementById('crownCount');
        this.dom.milestoneCelebration = document.getElementById('milestoneCelebration');
        this.dom.fireworksContainer = document.getElementById('fireworksContainer');
        this.dom.taskArea = document.getElementById('taskArea');
        this.dom.completionScreen = document.getElementById('completionScreen');
        this.dom.completionCrowns = document.getElementById('completionCrowns');
        this.dom.completionCorrect = document.getElementById('completionCorrect');
        this.dom.restartBtn = document.getElementById('restartBtn');
        this.dom.numPad = document.getElementById('numPad');
        this.dom.operatorBtns = document.querySelectorAll('.btn-operator');
    }

    attachEventListeners() {
        this.dom.numPad.querySelectorAll('.btn-num').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.answered) {
                    this.handleAnswer(parseInt(btn.dataset.value, 10));
                }
            });
        });

        this.dom.operatorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.dom.operatorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.operator = btn.dataset.op;
                this.restart();
            });
        });

        this.dom.restartBtn.addEventListener('click', () => this.restart());
    }

    loadProgress() {
        this.crownsEarned = parseInt(localStorage.getItem('ergaenzen-crowns') || '0', 10);
        this.updateCrownDisplay();
    }

    saveCrowns() {
        localStorage.setItem('ergaenzen-crowns', this.crownsEarned);
    }

    updateCrownDisplay() {
        if (this.crownsEarned > 0) {
            this.dom.crownCounter.style.display = 'flex';
            this.dom.crownCount.textContent = this.crownsEarned;
        }
    }

    generateTask() {
        // Decide operator
        let useAdd;
        if (this.operator === 'add') useAdd = true;
        else if (this.operator === 'sub') useAdd = false;
        else useAdd = Math.random() < 0.6;

        let total, a, missing;
        // total is always 2..10, a is 0..total-1, missing = total - a >= 1
        do {
            total = Math.floor(Math.random() * 9) + 2; // 2..10
            a = Math.floor(Math.random() * total);     // 0..total-1
            missing = total - a;
        } while (missing < 1 || missing > 10);

        if (useAdd) {
            // Display: a + ___ = total
            // missing addend = total - a
            return { left: a, right: total, missing, operator: '+' };
        } else {
            // Display: total − ___ = a
            // missing subtrahend = total - a = missing
            return { left: total, right: a, missing, operator: '−' };
        }
    }

    newTask() {
        this.answered = false;
        this.currentTask = this.generateTask();
        this.renderTask();
        this.dom.feedback.textContent = '';
        this.dom.feedback.className = 'feedback';
        this.enableNumPad();
    }

    renderTask() {
        const { left, right, operator } = this.currentTask;
        this.dom.equation.innerHTML =
            `<span class="eq-num">${left}</span>` +
            `<span class="eq-op">${operator}</span>` +
            `<span class="eq-blank">___</span>` +
            `<span class="eq-op">=</span>` +
            `<span class="eq-num">${right}</span>`;
    }

    enableNumPad() {
        this.dom.numPad.querySelectorAll('.btn-num').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect');
        });
    }

    disableNumPad() {
        this.dom.numPad.querySelectorAll('.btn-num').forEach(btn => {
            btn.disabled = true;
        });
    }

    handleAnswer(value) {
        if (this.answered) return;
        this.answered = true;

        const isCorrect = value === this.currentTask.missing;

        // Highlight the pressed button
        const pressedBtn = this.dom.numPad.querySelector(`[data-value="${value}"]`);
        if (pressedBtn) pressedBtn.classList.add(isCorrect ? 'correct' : 'incorrect');

        if (isCorrect) {
            this.correctCount++;
            this.dom.feedback.textContent = '✓ Super!';
            this.dom.feedback.className = 'feedback correct';
        } else {
            const correctBtn = this.dom.numPad.querySelector(`[data-value="${this.currentTask.missing}"]`);
            if (correctBtn) correctBtn.classList.add('correct');
            this.dom.feedback.textContent = `✗ Es wäre ${this.currentTask.missing} gewesen`;
            this.dom.feedback.className = 'feedback incorrect';
        }

        this.disableNumPad();
        this.tasksCompleted++;
        this.updateProgress();

        if (this.tasksCompleted === ErgaenzenApp.MILESTONE_INTERVAL) {
            this.crownsEarned++;
            this.saveCrowns();
            this.updateCrownDisplay();
            if (typeof showMilestoneCelebration !== 'undefined') showMilestoneCelebration(`🎉 10 Aufgaben geschafft! 🎉`);
        }

        if (this.tasksCompleted >= ErgaenzenApp.TOTAL_TASKS) {
            setTimeout(() => this.showCompletion(), ErgaenzenApp.FEEDBACK_DELAY);
        } else {
            setTimeout(() => this.newTask(), ErgaenzenApp.FEEDBACK_DELAY);
        }
    }

    updateProgress() {
        const pct = (this.tasksCompleted / ErgaenzenApp.TOTAL_TASKS) * 100;
        this.dom.progressFill.style.width = `${pct}%`;
        this.dom.progressText.textContent = `${this.tasksCompleted} / ${ErgaenzenApp.TOTAL_TASKS}`;
    }

    showCompletion() {
        this.dom.taskArea.style.display = 'none';
        this.dom.completionScreen.style.display = 'block';
        this.dom.completionCrowns.textContent = `👑 ${this.crownsEarned} Kronen gesamt`;
        this.dom.completionCorrect.textContent = `${this.correctCount} von ${ErgaenzenApp.TOTAL_TASKS} richtig`;
        if (typeof launchFireworks !== 'undefined') launchFireworks();
    }

    restart() {
        this.tasksCompleted = 0;
        this.correctCount = 0;
        this.answered = false;
        this.dom.taskArea.style.display = 'block';
        this.dom.completionScreen.style.display = 'none';
        this.updateProgress();
        this.newTask();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new ErgaenzenApp();
    app.init();
});
