class WoerterApp {
    static TOTAL_TASKS = 20;
    static MILESTONE_INTERVAL = 10;
    static FEEDBACK_DELAY = 1200;

    constructor() {
        this.words = [];
        this.queue = [];
        this.currentWord = null;
        this.selectedArticle = null;
        this.tasksCompleted = 0;
        this.correctCount = 0;
        this.crownsEarned = 0;
        this.answered = false;
        this.dom = {};
    }

    async init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        this.loadCrowns();
        await this.loadWords();
        this.buildQueue();
        this.nextWord();
    }

    cacheDOMElements() {
        this.dom.emoji = document.getElementById('wordEmoji');
        this.dom.articleBtns = document.querySelectorAll('.btn-article');
        this.dom.wordInput = document.getElementById('wordInput');
        this.dom.checkBtn = document.getElementById('checkBtn');
        this.dom.feedback = document.getElementById('feedback');
        this.dom.progressFill = document.getElementById('progressFill');
        this.dom.progressText = document.getElementById('progressText');
        this.dom.crownCounter = document.getElementById('crownCounter');
        this.dom.crownCount = document.getElementById('crownCount');
        this.dom.milestoneCelebration = document.getElementById('milestoneCelebration');
        this.dom.fireworksContainer = document.getElementById('fireworksContainer');
        this.dom.taskArea = document.getElementById('taskArea');
        this.dom.completionScreen = document.getElementById('completionScreen');
        this.dom.completionCrowns = document.getElementById('completionCrowns');
        this.dom.completionCorrect = document.getElementById('completionCorrect');
        this.dom.restartBtn = document.getElementById('restartBtn');
    }

    attachEventListeners() {
        this.dom.articleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.answered) return;
                this.dom.articleBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedArticle = btn.dataset.article;
            });
        });

        this.dom.checkBtn.addEventListener('click', () => this.checkAnswer());

        this.dom.wordInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') this.checkAnswer();
        });

        this.dom.restartBtn.addEventListener('click', () => this.restart());
    }

    async loadWords() {
        try {
            const response = await fetch('data/woerter-words.json');
            const data = await response.json();
            this.words = data.words;
        } catch (e) {
            console.error('Failed to load words:', e);
            this.words = [];
        }
    }

    buildQueue() {
        const pool = [...this.words];
        // Fisher-Yates shuffle
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        // Cycle through shuffled pool until we have enough tasks
        this.queue = [];
        while (this.queue.length < WoerterApp.TOTAL_TASKS) {
            this.queue.push(...pool);
        }
        this.queue = this.queue.slice(0, WoerterApp.TOTAL_TASKS);
    }

    nextWord() {
        this.answered = false;
        this.selectedArticle = null;
        this.currentWord = this.queue[this.tasksCompleted];

        this.dom.emoji.textContent = this.currentWord.emoji;
        this.dom.wordInput.value = '';
        this.dom.wordInput.disabled = false;
        this.dom.wordInput.focus();
        this.dom.feedback.textContent = '';
        this.dom.feedback.className = 'feedback';
        this.dom.checkBtn.disabled = false;
        this.dom.articleBtns.forEach(b => {
            b.classList.remove('selected', 'correct', 'incorrect');
            b.disabled = false;
        });
    }

    checkAnswer() {
        if (this.answered) return;
        if (!this.selectedArticle) {
            this.dom.feedback.textContent = 'Bitte zuerst einen Artikel wählen!';
            this.dom.feedback.className = 'feedback hint';
            return;
        }

        const typed = this.dom.wordInput.value.trim();
        if (!typed) {
            this.dom.feedback.textContent = 'Bitte das Wort eintippen!';
            this.dom.feedback.className = 'feedback hint';
            return;
        }

        this.answered = true;
        this.dom.checkBtn.disabled = true;
        this.dom.wordInput.disabled = true;
        this.dom.articleBtns.forEach(b => b.disabled = true);

        const { word, article } = this.currentWord;
        const articleOk = this.selectedArticle === article;
        const wordOk = typed.toLowerCase() === word.toLowerCase();
        const allOk = articleOk && wordOk;

        // Highlight article buttons
        this.dom.articleBtns.forEach(b => {
            if (b.dataset.article === article) b.classList.add('correct');
            else if (b.dataset.article === this.selectedArticle && !articleOk) b.classList.add('incorrect');
        });

        if (allOk) {
            this.correctCount++;
            this.dom.feedback.innerHTML = `✓ ${article} ${word}`;
            this.dom.feedback.className = 'feedback correct';
        } else {
            this.dom.feedback.innerHTML = `✗ Es heißt: <strong>${article} ${word}</strong>`;
            this.dom.feedback.className = 'feedback incorrect';
        }

        this.tasksCompleted++;
        this.updateProgress();

        if (this.tasksCompleted === WoerterApp.MILESTONE_INTERVAL) {
            this.crownsEarned++;
            this.saveCrowns();
            this.updateCrownDisplay();
            if (typeof showMilestoneCelebration !== 'undefined') showMilestoneCelebration('🎉 10 Wörter geschafft! 🎉');
        }

        if (this.tasksCompleted >= WoerterApp.TOTAL_TASKS) {
            setTimeout(() => this.showCompletion(), WoerterApp.FEEDBACK_DELAY);
        } else {
            setTimeout(() => this.nextWord(), WoerterApp.FEEDBACK_DELAY);
        }
    }

    updateProgress() {
        const pct = (this.tasksCompleted / WoerterApp.TOTAL_TASKS) * 100;
        this.dom.progressFill.style.width = `${pct}%`;
        this.dom.progressText.textContent = `${this.tasksCompleted} / ${WoerterApp.TOTAL_TASKS}`;
    }

    showCompletion() {
        this.dom.taskArea.style.display = 'none';
        this.dom.completionScreen.style.display = 'block';
        this.dom.completionCrowns.textContent = `👑 ${this.crownsEarned} Kronen gesamt`;
        this.dom.completionCorrect.textContent = `${this.correctCount} von ${WoerterApp.TOTAL_TASKS} richtig`;
        if (typeof launchFireworks !== 'undefined') launchFireworks();
    }

    restart() {
        this.tasksCompleted = 0;
        this.correctCount = 0;
        this.answered = false;
        this.buildQueue();
        this.dom.taskArea.style.display = 'block';
        this.dom.completionScreen.style.display = 'none';
        this.updateProgress();
        this.nextWord();
    }

    loadCrowns() {
        this.crownsEarned = parseInt(localStorage.getItem('smarty-crowns') || '0', 10);
        this.updateCrownDisplay();
    }

    saveCrowns() {
        localStorage.setItem('smarty-crowns', this.crownsEarned);
    }

    updateCrownDisplay() {
        if (this.crownsEarned > 0) {
            this.dom.crownCounter.style.display = 'flex';
            this.dom.crownCount.textContent = this.crownsEarned;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new WoerterApp();
    app.init();
});
