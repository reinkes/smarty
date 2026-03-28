class UhrLesenApp {
    static MILESTONE_INTERVAL = 10;
    static FIXED_TASK_COUNT = 20;
    static LEVEL_UP_THRESHOLD = 3;
    static LEVEL_DOWN_THRESHOLD = 2;

    // Precomputed SVG tick marks and numbers (static, never change)
    static CLOCK_TICKS = UhrLesenApp._buildTicks();
    static CLOCK_NUMBERS = UhrLesenApp._buildNumbers();

    static _buildTicks() {
        let ticks = '';
        for (let i = 0; i < 60; i++) {
            const rad = (i * 6) * Math.PI / 180;
            const sin = Math.sin(rad);
            const cos = Math.cos(rad);
            if (i % 5 === 0) {
                const x1 = +(100 + 75 * sin).toFixed(2);
                const y1 = +(100 - 75 * cos).toFixed(2);
                const x2 = +(100 + 86 * sin).toFixed(2);
                const y2 = +(100 - 86 * cos).toFixed(2);
                ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2C3E50" stroke-width="3" stroke-linecap="round"/>`;
            } else {
                const x1 = +(100 + 81 * sin).toFixed(2);
                const y1 = +(100 - 81 * cos).toFixed(2);
                const x2 = +(100 + 86 * sin).toFixed(2);
                const y2 = +(100 - 86 * cos).toFixed(2);
                ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#aaa" stroke-width="1.5" stroke-linecap="round"/>`;
            }
        }
        return ticks;
    }

    static _buildNumbers() {
        let nums = '';
        for (let i = 1; i <= 12; i++) {
            const rad = (i * 30) * Math.PI / 180;
            const x = +(100 + 65 * Math.sin(rad)).toFixed(2);
            const y = +(100 - 65 * Math.cos(rad)).toFixed(2);
            nums += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="700" font-family="Fredoka,sans-serif" fill="#2C3E50">${i}</text>`;
        }
        return nums;
    }

    constructor() {
        this.level = 1;
        this.isAdaptive = false;
        this.tasksSolved = 0;
        this.correctStreak = 0;
        this.incorrectCount = 0;
        this.crownsEarned = 0;
        this.taskIdCounter = 0;
        this.currentTaskData = null;
        this.isAnswered = false;

        this.dom = {
            difficultySlider: null,
            difficultyValue: null,
            adaptiveMode: null,
            startButton: null,
            taskContainer: null,
            previewTitle: null,
            taskCountDisplay: null,
            preview: null,
            fireworksContainer: null,
            milestoneCelebration: null,
            crownCounter: null,
            crownCount: null
        };

        this.loadCrowns();
    }

    init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        this.loadProgress();
    }

    cacheDOMElements() {
        this.dom.difficultySlider = document.getElementById('difficultySlider');
        this.dom.difficultyValue = document.getElementById('difficultyValue');
        this.dom.adaptiveMode = document.getElementById('adaptiveMode');
        this.dom.startButton = document.getElementById('startButton');
        this.dom.taskContainer = document.getElementById('taskContainer');
        this.dom.previewTitle = document.getElementById('previewTitle');
        this.dom.taskCountDisplay = document.getElementById('taskCountDisplay');
        this.dom.preview = document.getElementById('preview');
        this.dom.fireworksContainer = document.getElementById('fireworksContainer');
        this.dom.milestoneCelebration = document.getElementById('milestoneCelebration');
        this.dom.crownCounter = document.getElementById('crownCounter');
        this.dom.crownCount = document.getElementById('crownCount');
    }

    attachEventListeners() {
        if (this.dom.difficultySlider) {
            this.dom.difficultySlider.addEventListener('input', () => this.updateDifficultyLabel());
        }
        if (this.dom.startButton) {
            this.dom.startButton.addEventListener('click', () => this.startTraining());
        }
        const checkboxContainer = document.querySelector('.checkbox-container');
        if (checkboxContainer) {
            checkboxContainer.addEventListener('click', (e) => {
                if (e.target !== this.dom.adaptiveMode) {
                    this.dom.adaptiveMode.click();
                }
            });
        }
        if (this.dom.adaptiveMode) {
            this.dom.adaptiveMode.addEventListener('click', (e) => e.stopPropagation());
        }
        if (this.dom.taskContainer) {
            this.dom.taskContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.clock-answer-btn');
                if (btn && !this.isAnswered) {
                    this.handleAnswer(btn);
                }
            });
        }
    }

    updateDifficultyLabel() {
        const level = parseInt(this.dom.difficultySlider.value);
        const label = this.getDifficultyDescription(level);
        const emoji = getDifficultyEmoji(level);
        this.dom.difficultyValue.textContent = `Level ${level} (${label}) ${emoji}`;
    }

    getDifficultyDescription(level) {
        if (level <= 2) return 'Ganze Stunden';
        if (level <= 4) return 'Halbe Stunden';
        if (level <= 6) return 'Viertelstunden';
        if (level <= 8) return '5-Minuten-Schritte';
        return 'Jede Minute';
    }

    getMinuteStep(level) {
        if (level <= 2) return 60;
        if (level <= 4) return 30;
        if (level <= 6) return 15;
        if (level <= 8) return 5;
        return 1;
    }

    loadProgress() {
        const progress = ProgressTracker.getProgress('uhr');
        this.dom.difficultySlider.value = progress.level || 1;
        this.updateDifficultyLabel();
    }

    startTraining() {
        this.level = parseInt(this.dom.difficultySlider.value);
        this.isAdaptive = this.dom.adaptiveMode.checked;
        this.tasksSolved = 0;
        this.correctStreak = 0;
        this.incorrectCount = 0;
        this.isAnswered = false;

        ProgressTracker.updateLevel('uhr', this.level);

        this.dom.preview.classList.add('active');
        this.dom.preview.scrollIntoView({ behavior: 'smooth' });

        if (this.isAdaptive) {
            this.hideCrownCounter();
        } else {
            this.showCrownCounter();
        }

        this.showNextTask();
    }

    // ---- Time generation ----

    slotToTime(slot, step) {
        const totalMins = slot * step;
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        return { hours: h === 0 ? 12 : h, minutes: m };
    }

    timeToSlot(time, step) {
        const totalMins = (time.hours % 12) * 60 + time.minutes;
        return totalMins / step;
    }

    generateRandomTime(step) {
        const slots = 720 / step;
        const slot = Math.floor(Math.random() * slots);
        return this.slotToTime(slot, step);
    }

    generateWrongOptions(correct, step, count = 3) {
        const slots = 720 / step;
        const correctSlot = this.timeToSlot(correct, step);
        const seen = new Set([correctSlot]);
        const wrong = [];

        // Prefer nearby slots for good distractors
        const deltas = this.shuffle([1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, 7, -6, -7]);
        for (const delta of deltas) {
            if (wrong.length >= count) break;
            const slot = ((correctSlot + delta) % slots + slots) % slots;
            if (!seen.has(slot)) {
                seen.add(slot);
                wrong.push(this.slotToTime(slot, step));
            }
        }

        // Fallback: random fill
        let safety = 0;
        while (wrong.length < count && safety < 200) {
            safety++;
            const slot = Math.floor(Math.random() * slots);
            if (!seen.has(slot)) {
                seen.add(slot);
                wrong.push(this.slotToTime(slot, step));
            }
        }

        return wrong;
    }

    formatTime(time) {
        if (time.minutes === 0) {
            return `${time.hours} Uhr`;
        }
        const m = time.minutes.toString().padStart(2, '0');
        return `${time.hours}:${m} Uhr`;
    }

    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    generateTask() {
        const step = this.getMinuteStep(this.level);
        const correct = this.generateRandomTime(step);
        const wrong = this.generateWrongOptions(correct, step, 3);
        const options = this.shuffle([correct, ...wrong]);
        const id = this.taskIdCounter++;
        return { id, correct, options, step };
    }

    // ---- SVG clock ----

    buildClockSVG(hours, minutes) {
        const hourAngle = (hours % 12) * 30 + minutes * 0.5;
        const minuteAngle = minutes * 6;

        const hRad = hourAngle * Math.PI / 180;
        const mRad = minuteAngle * Math.PI / 180;

        const hx = +(100 + 52 * Math.sin(hRad)).toFixed(2);
        const hy = +(100 - 52 * Math.cos(hRad)).toFixed(2);
        const mx = +(100 + 72 * Math.sin(mRad)).toFixed(2);
        const my = +(100 - 72 * Math.cos(mRad)).toFixed(2);

        // Hour hand base (slightly behind center for realism)
        const hbx = +(100 - 12 * Math.sin(hRad)).toFixed(2);
        const hby = +(100 + 12 * Math.cos(hRad)).toFixed(2);
        const mbx = +(100 - 14 * Math.sin(mRad)).toFixed(2);
        const mby = +(100 + 14 * Math.cos(mRad)).toFixed(2);

        return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-label="Uhr zeigt ${this.formatTime({hours, minutes})}">
  <circle cx="100" cy="100" r="92" fill="#F8FAFB" stroke="#2980B9" stroke-width="5"/>
  <circle cx="100" cy="100" r="86" fill="none" stroke="#BDC3C7" stroke-width="0.8"/>
  ${UhrLesenApp.CLOCK_TICKS}
  ${UhrLesenApp.CLOCK_NUMBERS}
  <line x1="${mbx}" y1="${mby}" x2="${mx}" y2="${my}" stroke="#2980B9" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="${hbx}" y1="${hby}" x2="${hx}" y2="${hy}" stroke="#1A5276" stroke-width="6" stroke-linecap="round"/>
  <circle cx="100" cy="100" r="5.5" fill="#1A5276"/>
  <circle cx="100" cy="100" r="2.5" fill="#E67E22"/>
</svg>`;
    }

    // ---- Rendering ----

    showNextTask() {
        this.isAnswered = false;
        this.currentTaskData = this.generateTask();

        const desc = this.getDifficultyDescription(this.level);
        const levelLabel = getDifficultyLabel(this.level);

        if (this.isAdaptive) {
            this.dom.previewTitle.textContent = `Adaptiv – ${desc} (${levelLabel})`;
        } else {
            this.dom.previewTitle.textContent = `Uhr lesen – ${desc}`;
        }

        const displayText = this.isAdaptive
            ? `${this.tasksSolved} gelöst`
            : `${this.tasksSolved} / ${UhrLesenApp.FIXED_TASK_COUNT}`;
        this.dom.taskCountDisplay.textContent = displayText;

        this.dom.taskContainer.textContent = '';
        this.renderTask(this.currentTaskData);
    }

    renderTask(task) {
        const wrapper = document.createElement('div');
        wrapper.className = 'clock-task';
        wrapper.dataset.taskId = task.id;

        const question = document.createElement('div');
        question.className = 'clock-question';
        question.textContent = 'Wie spät ist es?';
        wrapper.appendChild(question);

        const clockEl = document.createElement('div');
        clockEl.className = 'clock-face';
        clockEl.innerHTML = this.buildClockSVG(task.correct.hours, task.correct.minutes);
        wrapper.appendChild(clockEl);

        const optionsEl = document.createElement('div');
        optionsEl.className = 'clock-options';

        task.options.forEach(time => {
            const btn = document.createElement('button');
            btn.className = 'clock-answer-btn';
            btn.dataset.value = JSON.stringify(time);
            btn.textContent = this.formatTime(time);
            optionsEl.appendChild(btn);
        });

        wrapper.appendChild(optionsEl);
        this.dom.taskContainer.appendChild(wrapper);
    }

    handleAnswer(btn) {
        this.isAnswered = true;
        const selected = JSON.parse(btn.dataset.value);
        const correct = this.currentTaskData.correct;
        const taskDiv = this.dom.taskContainer.querySelector('.clock-task');
        const allButtons = taskDiv.querySelectorAll('.clock-answer-btn');

        allButtons.forEach(b => { b.style.pointerEvents = 'none'; });

        const isCorrect = selected.hours === correct.hours && selected.minutes === correct.minutes;

        if (isCorrect) {
            btn.classList.add('correct');
            audioManager.playSuccessSound();
            this.tasksSolved++;
            this.correctStreak++;
            this.incorrectCount = 0;
            ProgressTracker.recordAttempt('uhr', true);

            if (this.isAdaptive && this.correctStreak >= UhrLesenApp.LEVEL_UP_THRESHOLD) {
                this.correctStreak = 0;
                if (this.level < 10) {
                    this.level++;
                    showMilestoneCelebration(`🚀 Level ${this.level}! 🚀`);
                }
            }

            if (this.tasksSolved % UhrLesenApp.MILESTONE_INTERVAL === 0) {
                launchFireworks();
                showMilestoneCelebration(`🎉 ${this.tasksSolved} Aufgaben geschafft! 🎉`);
            }

            const isFinished = !this.isAdaptive && this.tasksSolved >= UhrLesenApp.FIXED_TASK_COUNT;

            setTimeout(() => {
                if (isFinished) {
                    const crowns = this.earnCrown();
                    this.showCompletionCelebration(crowns);
                } else {
                    this.showNextTask();
                }
            }, 700);
        } else {
            btn.classList.add('incorrect');
            this.correctStreak = 0;
            this.incorrectCount++;
            ProgressTracker.recordAttempt('uhr', false);

            allButtons.forEach(b => {
                const t = JSON.parse(b.dataset.value);
                if (t.hours === correct.hours && t.minutes === correct.minutes) {
                    b.classList.add('correct');
                }
            });

            if (this.isAdaptive && this.incorrectCount >= UhrLesenApp.LEVEL_DOWN_THRESHOLD) {
                this.incorrectCount = 0;
                if (this.level > 1) {
                    this.level = Math.max(1, this.level - 2);
                    showMilestoneCelebration(`Level ${this.level} 💪`);
                }
            }

            setTimeout(() => {
                this.isAnswered = false;
                allButtons.forEach(b => {
                    b.classList.remove('correct', 'incorrect');
                    b.style.pointerEvents = 'auto';
                });
            }, 1800);
        }
    }

    showCompletionCelebration(crownsEarned) {
        this.dom.taskContainer.textContent = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'clock-completion';

        const emojiEl = document.createElement('div');
        emojiEl.className = 'clock-completion-emoji';
        emojiEl.textContent = '🎉';

        const heading = document.createElement('h2');
        heading.textContent = 'Geschafft!';

        const message = document.createElement('p');
        message.textContent = `Du hast alle ${UhrLesenApp.FIXED_TASK_COUNT} Aufgaben gelöst! 🌟`;

        wrapper.appendChild(emojiEl);
        wrapper.appendChild(heading);
        wrapper.appendChild(message);

        if (crownsEarned > 0) {
            const crownDiv = document.createElement('div');
            crownDiv.className = 'clock-crown-reward';
            const crownIcon = document.createElement('span');
            crownIcon.textContent = '👑';
            const crownText = document.createElement('span');
            crownText.textContent = `+${crownsEarned} = ${this.crownsEarned} Kronen!`;
            crownDiv.appendChild(crownIcon);
            crownDiv.appendChild(crownText);
            wrapper.appendChild(crownDiv);
        }

        const restartBtn = document.createElement('button');
        restartBtn.className = 'clock-restart-btn';
        restartBtn.textContent = 'Nochmal üben! 🔄';
        restartBtn.addEventListener('click', () => this.startTraining());
        wrapper.appendChild(restartBtn);

        this.dom.taskContainer.appendChild(wrapper);
        this.dom.taskCountDisplay.textContent = `${UhrLesenApp.FIXED_TASK_COUNT} / ${UhrLesenApp.FIXED_TASK_COUNT} ✅`;

        launchFireworks();
        showMilestoneCelebration(crownsEarned > 0
            ? `🎊 Super! +${crownsEarned} 👑 Kronen! 🎊`
            : '🎊 Alle Uhrzeiten richtig! 🎊');
    }

    // ---- Crown system ----

    loadCrowns() {
        const saved = localStorage.getItem('smarty-crowns');
        this.crownsEarned = saved ? parseInt(saved) : 0;
    }

    saveCrowns() {
        localStorage.setItem('smarty-crowns', this.crownsEarned.toString());
    }

    updateCrownDisplay() {
        if (this.dom.crownCount) {
            this.dom.crownCount.textContent = this.crownsEarned;
        }
    }

    showCrownCounter() {
        if (this.dom.crownCounter) {
            this.dom.crownCounter.style.display = 'flex';
            this.updateCrownDisplay();
        }
    }

    hideCrownCounter() {
        if (this.dom.crownCounter) {
            this.dom.crownCounter.style.display = 'none';
        }
    }

    calculateCrownReward() {
        if (this.level <= 2) return 1;
        if (this.level <= 4) return 2;
        if (this.level <= 6) return 3;
        if (this.level <= 8) return 4;
        return 5;
    }

    earnCrown() {
        const reward = this.calculateCrownReward();
        this.crownsEarned += reward;
        this.saveCrowns();
        this.updateCrownDisplay();
        if (this.dom.crownCounter) {
            this.dom.crownCounter.classList.add('earn');
            setTimeout(() => this.dom.crownCounter.classList.remove('earn'), 600);
        }
        return reward;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const app = new UhrLesenApp();
    app.init();
});
