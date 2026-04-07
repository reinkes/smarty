class ErgaenzenApp {
    static TOTAL_TASKS = 20;
    static MILESTONE_INTERVAL = 10;
    static FEEDBACK_DELAY = 900;

    constructor() {
        this.tasksCompleted = 0;
        this.correctCount = 0;
        this.crownsEarned = 0;
        this.currentTask = null;
        this.answered = false;
        this.operator = 'mix';
        this.dom = {};
    }

    init() {
        this.cacheDOMElements();
        this.loadCrowns();
        this.attachEventListeners();
        this.newTask();
    }

    cacheDOMElements() {
        this.dom.progressFill  = document.getElementById('progressFill');
        this.dom.progressText  = document.getElementById('progressText');
        this.dom.eqLeft        = document.getElementById('eqLeft');
        this.dom.eqOp          = document.getElementById('eqOp');
        this.dom.eqRight       = document.getElementById('eqRight');
        this.dom.answerInput   = document.getElementById('answerInput');
        this.dom.feedback      = document.getElementById('feedback');
        this.dom.crownCounter  = document.getElementById('crownCounter');
        this.dom.crownCount    = document.getElementById('crownCount');
        this.dom.milestoneCelebration = document.getElementById('milestoneCelebration');
        this.dom.fireworksContainer   = document.getElementById('fireworksContainer');
        this.dom.taskArea      = document.getElementById('taskArea');
        this.dom.completionScreen  = document.getElementById('completionScreen');
        this.dom.completionCrowns  = document.getElementById('completionCrowns');
        this.dom.completionCorrect = document.getElementById('completionCorrect');
        this.dom.restartBtn    = document.getElementById('restartBtn');
        this.dom.operatorBtns  = document.querySelectorAll('.btn-operator');
    }

    attachEventListeners() {
        this.dom.operatorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.dom.operatorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.operator = btn.dataset.op;
                this.restart();
            });
        });

        this.dom.answerInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') this.checkAnswer();
        });

        this.dom.answerInput.addEventListener('input', () => {
            const val = this.dom.answerInput.value;
            if (val !== '' && val >= 0 && val <= 10) this.checkAnswer();
        });

        this.dom.restartBtn.addEventListener('click', () => this.restart());
    }

    generateTask() {
        const useAdd = this.operator === 'add' ? true
                     : this.operator === 'sub' ? false
                     : Math.random() < 0.6;

        let total, a, missing;
        do {
            total   = Math.floor(Math.random() * 9) + 2; // 2–10
            a       = Math.floor(Math.random() * total);  // 0..total-1
            missing = total - a;
        } while (missing < 1 || missing > 10);

        // Addition: a + ___ = total  |  Subtraction: total − ___ = a
        return useAdd
            ? { left: a,     right: total, missing, op: '+' }
            : { left: total, right: a,     missing, op: '−' };
    }

    newTask() {
        this.answered = false;
        this.currentTask = this.generateTask();

        this.dom.eqLeft.textContent  = this.currentTask.left;
        this.dom.eqOp.textContent    = this.currentTask.op;
        this.dom.eqRight.textContent = this.currentTask.right;

        this.dom.answerInput.value = '';
        this.dom.answerInput.disabled = false;
        this.dom.answerInput.className = 'answer-input';
        this.dom.answerInput.focus();

        this.dom.feedback.textContent = '';
        this.dom.feedback.className = 'feedback';
    }

    checkAnswer() {
        if (this.answered) return;
        const val = parseInt(this.dom.answerInput.value, 10);
        if (isNaN(val)) return;

        this.answered = true;
        this.dom.answerInput.disabled = true;

        const isCorrect = val === this.currentTask.missing;

        if (isCorrect) {
            this.correctCount++;
            this.dom.answerInput.classList.add('correct');
            this.dom.feedback.textContent = '✓ Super!';
            this.dom.feedback.className = 'feedback correct';
        } else {
            this.dom.answerInput.classList.add('incorrect');
            this.dom.feedback.textContent = `✗ Es wäre ${this.currentTask.missing} gewesen`;
            this.dom.feedback.className = 'feedback incorrect';
        }

        this.tasksCompleted++;
        this.updateProgress();

        if (this.tasksCompleted === ErgaenzenApp.MILESTONE_INTERVAL) {
            this.crownsEarned++;
            this.saveCrowns();
            this.updateCrownDisplay();
            if (typeof showMilestoneCelebration !== 'undefined') {
                showMilestoneCelebration('🎉 10 Aufgaben geschafft! 🎉');
            }
        }

        const next = this.tasksCompleted >= ErgaenzenApp.TOTAL_TASKS
            ? () => this.showCompletion()
            : () => this.newTask();
        setTimeout(next, ErgaenzenApp.FEEDBACK_DELAY);
    }

    updateProgress() {
        const pct = (this.tasksCompleted / ErgaenzenApp.TOTAL_TASKS) * 100;
        this.dom.progressFill.style.width = `${pct}%`;
        this.dom.progressText.textContent = `${this.tasksCompleted} / ${ErgaenzenApp.TOTAL_TASKS}`;
    }

    showCompletion() {
        this.dom.taskArea.style.display = 'none';
        this.dom.completionScreen.style.display = 'block';
        this.dom.completionCrowns.textContent  = `👑 ${this.crownsEarned} Kronen gesamt`;
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

    loadCrowns() {
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
}

document.addEventListener('DOMContentLoaded', () => new ErgaenzenApp().init());
