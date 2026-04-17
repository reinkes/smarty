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
        // Crown achievement system (managed by CrownManager)
        this.answered = false;
        this.letterBoxes = [];
        this.dom = {};
    }

    async init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        CrownManager.showCounter(this.dom.crownCounter, this.dom.crownCount);
        await this.loadWords();
        this.buildQueue();
        this.nextWord();
    }

    cacheDOMElements() {
        this.dom.emoji = document.getElementById('wordEmoji');
        this.dom.articleBtns = document.querySelectorAll('.btn-article');
        this.dom.letterBoxes = document.getElementById('letterBoxes');
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
                this.tryAutoCheck();
            });
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
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        this.queue = [];
        while (this.queue.length < WoerterApp.TOTAL_TASKS) {
            this.queue.push(...pool);
        }
        this.queue = this.queue.slice(0, WoerterApp.TOTAL_TASKS);
    }

    buildLetterBoxes(word) {
        this.dom.letterBoxes.innerHTML = '';
        this.letterBoxes = [];

        for (let i = 0; i < word.length; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.className = 'letter-box';
            input.autocomplete = 'off';
            input.autocorrect = 'off';
            input.autocapitalize = 'characters';
            input.spellcheck = false;
            input.dataset.index = i;

            input.addEventListener('input', e => this.onLetterInput(e, i));
            input.addEventListener('keydown', e => this.onLetterKeydown(e, i));

            this.dom.letterBoxes.appendChild(input);
            this.letterBoxes.push(input);
        }
    }

    onLetterInput(e, index) {
        if (this.answered) return;
        const val = e.target.value;
        if (val.length > 0) {
            // Keep only the last typed character
            e.target.value = val.slice(-1);
            if (index < this.letterBoxes.length - 1) {
                this.letterBoxes[index + 1].focus();
            }
        }
        this.tryAutoCheck();
    }

    onLetterKeydown(e, index) {
        if (this.answered) return;
        if (e.key === 'Backspace') {
            if (e.target.value === '' && index > 0) {
                this.letterBoxes[index - 1].focus();
                this.letterBoxes[index - 1].value = '';
            }
        } else if (e.key === 'Enter') {
            this.checkAnswer();
        }
    }

    tryAutoCheck() {
        if (this.answered) return;
        const allFilled = this.letterBoxes.every(b => b.value.trim() !== '');
        if (allFilled && this.selectedArticle) {
            this.checkAnswer();
        }
    }

    nextWord() {
        this.answered = false;
        this.selectedArticle = null;
        this.currentWord = this.queue[this.tasksCompleted];

        this.dom.emoji.textContent = this.currentWord.emoji;
        this.dom.feedback.textContent = '';
        this.dom.feedback.className = 'feedback';
        this.dom.articleBtns.forEach(b => {
            b.classList.remove('selected', 'correct', 'incorrect');
            b.disabled = false;
        });

        this.buildLetterBoxes(this.currentWord.word);
        this.letterBoxes[0].focus();
    }

    checkAnswer() {
        if (this.answered) return;

        if (!this.selectedArticle) {
            this.dom.feedback.textContent = 'Bitte zuerst einen Artikel wählen!';
            this.dom.feedback.className = 'feedback hint';
            return;
        }

        const typed = this.letterBoxes.map(b => b.value).join('');
        if (typed.length < this.currentWord.word.length) {
            this.dom.feedback.textContent = 'Bitte alle Buchstaben eingeben!';
            this.dom.feedback.className = 'feedback hint';
            return;
        }

        this.answered = true;
        this.letterBoxes.forEach(b => b.disabled = true);
        this.dom.articleBtns.forEach(b => b.disabled = true);

        const { word, article } = this.currentWord;
        const articleOk = this.selectedArticle === article;
        const wordOk = typed.toLowerCase() === word.toLowerCase();
        const allOk = articleOk && wordOk;

        // Color article buttons
        this.dom.articleBtns.forEach(b => {
            if (b.dataset.article === article) b.classList.add('correct');
            else if (b.dataset.article === this.selectedArticle && !articleOk) b.classList.add('incorrect');
        });

        // Color letter boxes
        this.letterBoxes.forEach((box, i) => {
            const letterOk = typed[i].toLowerCase() === word[i].toLowerCase();
            box.classList.add(letterOk ? 'correct' : 'incorrect');
            if (!letterOk) box.value = word[i];
        });

        if (allOk) {
            this.correctCount++;
            this.dom.feedback.textContent = `✓ ${article} ${word}`;
            this.dom.feedback.className = 'feedback correct';
        } else {
            this.dom.feedback.textContent = `✗ Es heißt: ${article} ${word}`;
            this.dom.feedback.className = 'feedback incorrect';
        }

        this.tasksCompleted++;
        this.updateProgress();

        if (this.tasksCompleted % WoerterApp.MILESTONE_INTERVAL === 0 && this.tasksCompleted < WoerterApp.TOTAL_TASKS) {
            showMilestoneCelebration(`🎉 ${this.tasksCompleted} Wörter geschafft! 🎉`);
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
        const { reward, total } = CrownManager.earnAndDisplay(5, this.dom.crownCount, this.dom.crownCounter);
        this.dom.taskArea.style.display = 'none';
        this.dom.completionScreen.style.display = 'block';
        this.dom.completionCrowns.textContent = `👑 +${reward} = ${total} Kronen`;
        this.dom.completionCorrect.textContent = `${this.correctCount} von ${WoerterApp.TOTAL_TASKS} richtig`;
        launchFireworks();
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
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new WoerterApp();
    app.init();
});
