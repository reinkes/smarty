class WochentageApp {
    static MILESTONE_INTERVAL = 10;
    static FIXED_TASK_COUNT = 20;
    static LEVEL_UP_THRESHOLD = 3;
    static LEVEL_DOWN_THRESHOLD = 2;

    static WOCHENTAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    static MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    static WOCHENTAGE_EMOJIS = ['🌙', '📚', '⭐', '⛈️', '🎉', '🎮', '☀️'];
    static MONATE_EMOJIS = ['❄️', '💝', '🌱', '🌧️', '🌸', '☀️', '🏖️', '🌻', '🍂', '🎃', '🍁', '🎄'];
    static WOCHENTAGE_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    static MONATE_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

    constructor() {
        this.level = 1;
        this.isAdaptive = false;
        this.tasksSolved = 0;
        this.correctStreak = 0;
        this.incorrectCount = 0;
        // Crown achievement system (managed by CrownManager)
        this.taskIdCounter = 0;
        this.currentTaskData = null;
        this.isAnswered = false;

        this.dom = {
            difficultySlider: null,
            difficultyValue: null,
            adaptiveMode: null,
            modeSelect: null,
            startButton: null,
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

    init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        this.loadProgress();
    }

    cacheDOMElements() {
        this.dom.difficultySlider = document.getElementById('difficultySlider');
        this.dom.difficultyValue = document.getElementById('difficultyValue');
        this.dom.adaptiveMode = document.getElementById('adaptiveMode');
        this.dom.modeSelect = document.getElementById('modeSelect');
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
            this.dom.adaptiveMode.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        if (this.dom.taskContainer) {
            this.dom.taskContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.answer-btn');
                if (btn && !this.isAnswered) {
                    this.handleAnswer(btn);
                }
            });
        }
    }

    updateDifficultyLabel() {
        const level = parseInt(this.dom.difficultySlider.value);
        const label = getDifficultyLabel(level);
        const emoji = getDifficultyEmoji(level);
        this.dom.difficultyValue.textContent = `Level ${level} (${label}) ${emoji}`;
    }

    loadProgress() {
        const progress = ProgressTracker.getProgress('wochentage');
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

        ProgressTracker.updateLevel('wochentage', this.level);

        this.dom.preview.classList.add('active');
        this.dom.preview.scrollIntoView({ behavior: 'smooth' });

        if (this.isAdaptive) {
            this.hideCrownCounter();
        } else {
            this.showCrownCounter();
        }

        this.showNextTask();
    }

    getListForLevel(level) {
        if (level <= 4) return 'wochentage';
        if (level <= 7) return 'monate';
        return 'mix';
    }

    getActiveList() {
        const listType = this.getListForLevel(this.level);
        if (listType === 'wochentage') return WochentageApp.WOCHENTAGE;
        if (listType === 'monate') return WochentageApp.MONATE;
        return Math.random() < 0.5 ? WochentageApp.WOCHENTAGE : WochentageApp.MONATE;
    }

    getListName(list) {
        return list === WochentageApp.WOCHENTAGE ? 'Tag' : 'Monat';
    }

    getListNamePlural(list) {
        return list === WochentageApp.WOCHENTAGE ? 'Wochentage' : 'Monate';
    }

    getEmoji(list, idx) {
        const emojis = list === WochentageApp.WOCHENTAGE ? WochentageApp.WOCHENTAGE_EMOJIS : WochentageApp.MONATE_EMOJIS;
        return emojis[idx] ?? '';
    }

    getEmojiForItem(list, item) {
        const idx = list.indexOf(item);
        return idx >= 0 ? this.getEmoji(list, idx) : '';
    }

    getShort(list, idx) {
        const shorts = list === WochentageApp.WOCHENTAGE ? WochentageApp.WOCHENTAGE_SHORT : WochentageApp.MONATE_SHORT;
        return shorts[idx] ?? list[idx];
    }

    generateTask() {
        const list = this.getActiveList();
        const taskTypes = ['nach', 'vor', 'fehlt'];
        const type = taskTypes[Math.floor(Math.random() * taskTypes.length)];
        const name = this.getListName(list);
        const id = this.taskIdCounter++;

        if (type === 'nach') {
            const idx = Math.floor(Math.random() * (list.length - 1));
            const item = list[idx];
            const correct = list[idx + 1];
            const wrong = this.getWrongOptions(list, correct, 2);
            const options = this.shuffle([correct, ...wrong]);
            return { id, type, question: `Was kommt nach ${item}?`, correct, options, list, strip: { contextIdx: idx, answerIdx: idx + 1 } };
        }

        if (type === 'vor') {
            const idx = 1 + Math.floor(Math.random() * (list.length - 1));
            const item = list[idx];
            const correct = list[idx - 1];
            const wrong = this.getWrongOptions(list, correct, 2);
            const options = this.shuffle([correct, ...wrong]);
            return { id, type, question: `Was kommt vor ${item}?`, correct, options, list, strip: { contextIdx: idx, answerIdx: idx - 1 } };
        }

        if (type === 'fehlt') {
            const idx = 1 + Math.floor(Math.random() * (list.length - 2));
            const before = list[idx - 1];
            const correct = list[idx];
            const after = list[idx + 1];
            const wrong = this.getWrongOptions(list, correct, 2);
            const options = this.shuffle([correct, ...wrong]);
            return { id, type, question: `Was fehlt dazwischen?`, correct, options, list, strip: { contextIdx: null, answerIdx: idx, showNeighbors: [idx - 1, idx + 1] } };
        }

    }

    getWrongOptions(list, correct, count) {
        const pool = list.filter(item => item !== correct);
        const shuffled = this.shuffle([...pool]);
        return shuffled.slice(0, count);
    }

    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    showNextTask() {
        this.isAnswered = false;
        this.currentTaskData = this.generateTask();

        const listType = this.getListForLevel(this.level);
        const listLabel = listType === 'wochentage' ? 'Wochentage' : listType === 'monate' ? 'Monate' : 'Mix';
        const levelLabel = getDifficultyLabel(this.level);

        if (this.isAdaptive) {
            this.dom.previewTitle.textContent = `Adaptiv – ${listLabel} (${levelLabel})`;
        } else {
            this.dom.previewTitle.textContent = `${listLabel}-Training`;
        }

        const displayText = this.isAdaptive
            ? `${this.tasksSolved} gelöst`
            : `${this.tasksSolved} / ${WochentageApp.FIXED_TASK_COUNT}`;
        this.dom.taskCountDisplay.textContent = displayText;

        this.dom.taskContainer.textContent = '';
        this.renderTask(this.currentTaskData);
    }

    renderSequenceStrip(task) {
        const { list, strip } = task;
        const stripEl = document.createElement('div');
        stripEl.className = 'wt-strip';

        list.forEach((item, idx) => {
            const cell = document.createElement('div');
            cell.className = 'wt-strip-cell';

            const isAnswer = idx === strip.answerIdx;
            const isContext = idx === strip.contextIdx || idx === strip.compareIdx;
            const isNeighbor = strip.showNeighbors && strip.showNeighbors.includes(idx);

            if (isAnswer) cell.classList.add('wt-strip-answer');
            else if (isContext) cell.classList.add('wt-strip-context');
            else if (isNeighbor) cell.classList.add('wt-strip-neighbor');
            else cell.classList.add('wt-strip-dim');

            const emojiSpan = document.createElement('div');
            emojiSpan.className = 'wt-strip-emoji';
            emojiSpan.textContent = isAnswer ? '❓' : this.getEmoji(list, idx);

            const labelSpan = document.createElement('div');
            labelSpan.className = 'wt-strip-label';
            labelSpan.textContent = this.getShort(list, idx);

            cell.appendChild(emojiSpan);
            cell.appendChild(labelSpan);
            stripEl.appendChild(cell);
        });

        return stripEl;
    }

    renderTask(task) {
        const wrapper = document.createElement('div');
        wrapper.className = 'wt-task';
        wrapper.dataset.taskId = task.id;

        wrapper.appendChild(this.renderSequenceStrip(task));

        const questionEl = document.createElement('div');
        questionEl.className = 'wt-question';
        questionEl.textContent = task.question;

        const optionsEl = document.createElement('div');
        optionsEl.className = 'wt-options';

        task.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.dataset.value = option;

            const emoji = this.getEmojiForItem(task.list, option);
            if (emoji) {
                const emojiEl = document.createElement('span');
                emojiEl.className = 'btn-emoji';
                emojiEl.textContent = emoji;
                btn.appendChild(emojiEl);
                const textEl = document.createElement('span');
                textEl.textContent = option;
                btn.appendChild(textEl);
            } else {
                btn.textContent = option;
            }

            optionsEl.appendChild(btn);
        });

        wrapper.appendChild(questionEl);
        wrapper.appendChild(optionsEl);
        this.dom.taskContainer.appendChild(wrapper);
    }

    handleAnswer(btn) {
        this.isAnswered = true;
        const selected = btn.dataset.value;
        const correct = this.currentTaskData.correct;
        const taskDiv = this.dom.taskContainer.querySelector('.wt-task');
        const allButtons = taskDiv.querySelectorAll('.answer-btn');

        allButtons.forEach(b => {
            b.style.pointerEvents = 'none';
        });

        if (selected === correct) {
            btn.classList.add('correct');
            audioManager.playSuccessSound();
            this.tasksSolved++;
            this.correctStreak++;
            this.incorrectCount = 0;
            ProgressTracker.recordAttempt('wochentage', true);

            if (this.isAdaptive && this.correctStreak >= WochentageApp.LEVEL_UP_THRESHOLD) {
                this.correctStreak = 0;
                if (this.level < 10) {
                    this.level++;
                    showMilestoneCelebration(`🚀 Level ${this.level}! 🚀`);
                }
            }

            if (this.tasksSolved % WochentageApp.MILESTONE_INTERVAL === 0) {
                launchFireworks();
                showMilestoneCelebration(`🎉 ${this.tasksSolved} Aufgaben geschafft! 🎉`);
            }

            const isFinished = !this.isAdaptive && this.tasksSolved >= WochentageApp.FIXED_TASK_COUNT;

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
            ProgressTracker.recordAttempt('wochentage', false);

            allButtons.forEach(b => {
                if (b.dataset.value === correct) {
                    b.classList.add('correct');
                }
            });

            if (this.isAdaptive && this.incorrectCount >= WochentageApp.LEVEL_DOWN_THRESHOLD) {
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
        wrapper.className = 'wt-completion';

        const emojiEl = document.createElement('div');
        emojiEl.className = 'wt-completion-emoji';
        emojiEl.textContent = '🎉';

        const heading = document.createElement('h2');
        heading.textContent = 'Geschafft!';

        const message = document.createElement('p');
        message.textContent = `Du hast alle ${WochentageApp.FIXED_TASK_COUNT} Aufgaben gelöst! 🌟`;

        wrapper.appendChild(emojiEl);
        wrapper.appendChild(heading);
        wrapper.appendChild(message);

        if (crownsEarned > 0) {
            const crownDiv = document.createElement('div');
            crownDiv.className = 'wt-crown-reward';

            const crownIcon = document.createElement('span');
            crownIcon.textContent = '👑';

            const crownText = document.createElement('span');
            crownText.textContent = `+${crownsEarned} = ${CrownManager.load()} Kronen!`;

            crownDiv.appendChild(crownIcon);
            crownDiv.appendChild(crownText);
            wrapper.appendChild(crownDiv);
        }

        const restartBtn = document.createElement('button');
        restartBtn.className = 'wt-restart-btn';
        restartBtn.textContent = 'Nochmal üben! 🔄';
        restartBtn.addEventListener('click', () => this.startTraining());

        wrapper.appendChild(restartBtn);
        this.dom.taskContainer.appendChild(wrapper);

        this.dom.taskCountDisplay.textContent = `${WochentageApp.FIXED_TASK_COUNT} / ${WochentageApp.FIXED_TASK_COUNT} ✅`;

        launchFireworks();
        showMilestoneCelebration(crownsEarned > 0
            ? `🎊 Super! +${crownsEarned} 👑 Kronen! 🎊`
            : '🎊 Alle Aufgaben richtig! Super! 🎊');
    }

    showCrownCounter() {
        CrownManager.showCounter(this.dom.crownCounter, this.dom.crownCount);
    }

    hideCrownCounter() {
        CrownManager.hideCounter(this.dom.crownCounter);
    }

    earnCrown() {
        const { reward } = CrownManager.earnAndDisplay(this.level, this.dom.crownCount, this.dom.crownCounter);
        return reward;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const app = new WochentageApp();
    app.init();
});
