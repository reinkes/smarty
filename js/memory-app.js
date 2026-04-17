class MemoryApp {
    static EMOJIS = ['🐱','🐶','🐸','🐵','🦁','🐘','🦊','🐼','🐨','🦄','🐙','🦋','🐢','🐬','🦜','🐝'];
    static HIGHSCORE_KEY = 'smarty-memory-highscore';

    static DIFFICULTY_PRESETS = {
        1: { name: 'Einfach 3×2', cols: 3, rows: 2, cost: 1 },
        2: { name: 'Mittel 4×3', cols: 4, rows: 3, cost: 2 },
        3: { name: 'Schwer 4×4', cols: 4, rows: 4, cost: 3 }
    };

    constructor() {
        this.difficulty = 1;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.moves = 0;
        this.isLocked = false;

        this.dom = {
            difficultySlider: null,
            difficultyValue: null,
            crownCost: null,
            startButton: null,
            preview: null,
            previewTitle: null,
            memoryGrid: null,
            movesDisplay: null,
            pairsDisplay: null,
            restartButton: null,
            milestoneCelebration: null,
            fireworksContainer: null,
            crownCounter: null,
            crownCount: null
        };
    }

    init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        this.updateHighscoreDisplay();
        this.showCrownCounter();
    }

    cacheDOMElements() {
        this.dom.difficultySlider = document.getElementById('difficultySlider');
        this.dom.difficultyValue = document.getElementById('difficultyValue');
        this.dom.crownCost = document.getElementById('crownCost');
        this.dom.startButton = document.getElementById('startButton');
        this.dom.preview = document.getElementById('preview');
        this.dom.previewTitle = document.getElementById('previewTitle');
        this.dom.memoryGrid = document.getElementById('memoryGrid');
        this.dom.movesDisplay = document.getElementById('movesDisplay');
        this.dom.pairsDisplay = document.getElementById('pairsDisplay');
        this.dom.restartButton = document.getElementById('restartButton');
        this.dom.milestoneCelebration = document.getElementById('milestoneCelebration');
        this.dom.fireworksContainer = document.getElementById('fireworksContainer');
        this.dom.crownCounter = document.getElementById('crownCounter');
        this.dom.crownCount = document.getElementById('crownCount');
        this.dom.highscoreValue = document.getElementById('highscoreValue');
    }

    attachEventListeners() {
        if (this.dom.difficultySlider) {
            this.dom.difficultySlider.addEventListener('input', () => this.updateDifficultyLabel());
        }

        if (this.dom.startButton) {
            this.dom.startButton.addEventListener('click', () => this.startGame());
        }

        if (this.dom.restartButton) {
            this.dom.restartButton.addEventListener('click', () => this.startGame());
        }
    }

    updateDifficultyLabel() {
        const level = parseInt(this.dom.difficultySlider.value);
        this.difficulty = level;
        const preset = MemoryApp.DIFFICULTY_PRESETS[level];
        const emoji = level === 1 ? '😊' : level === 2 ? '🤔' : '😎';
        this.dom.difficultyValue.textContent = `Level ${level} (${preset.name}) ${emoji}`;
        this.dom.crownCost.textContent = `Kostet ${preset.cost} 👑`;
        this.updateHighscoreDisplay();
    }

    startGame() {
        this.difficulty = parseInt(this.dom.difficultySlider.value);
        const preset = MemoryApp.DIFFICULTY_PRESETS[this.difficulty];

        const available = CrownManager.load();
        if (available < preset.cost) {
            showMilestoneCelebration(`Nicht genug Kronen! Du brauchst ${preset.cost} 👑`);
            return;
        }

        CrownManager.earn(-preset.cost);
        CrownManager.updateDisplay(this.dom.crownCount);

        this.matchedPairs = 0;
        this.totalPairs = (preset.cols * preset.rows) / 2;
        this.moves = 0;
        this.flippedCards = [];
        this.isLocked = false;

        this.generateCards(preset);
        this.renderGrid(preset);
        this.updateStats();

        this.dom.previewTitle.textContent = `Memory ${preset.cols}×${preset.rows}`;
        this.dom.preview.classList.add('active');
        this.dom.preview.scrollIntoView({ behavior: 'smooth' });
    }

    generateCards(preset) {
        const pairCount = (preset.cols * preset.rows) / 2;
        const shuffledEmojis = [...MemoryApp.EMOJIS].sort(() => Math.random() - 0.5);
        const selected = shuffledEmojis.slice(0, pairCount);

        this.cards = [...selected, ...selected]
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({
                id: index,
                emoji: emoji,
                isFlipped: false,
                isMatched: false
            }));
    }

    renderGrid(preset) {
        this.dom.memoryGrid.innerHTML = '';
        this.dom.memoryGrid.style.gridTemplateColumns = `repeat(${preset.cols}, 1fr)`;

        this.cards.forEach((card) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'memory-card';
            cardEl.dataset.id = card.id;

            const inner = document.createElement('div');
            inner.className = 'memory-card-inner';

            const back = document.createElement('div');
            back.className = 'memory-card-back';
            back.textContent = '?';

            const front = document.createElement('div');
            front.className = 'memory-card-front';
            front.textContent = card.emoji;

            inner.appendChild(back);
            inner.appendChild(front);
            cardEl.appendChild(inner);

            cardEl.addEventListener('click', () => this.flipCard(card.id, cardEl));

            this.dom.memoryGrid.appendChild(cardEl);
        });
    }

    flipCard(id, cardEl) {
        const card = this.cards[id];

        if (this.isLocked || card.isFlipped || card.isMatched) return;
        if (this.flippedCards.length >= 2) return;

        card.isFlipped = true;
        cardEl.classList.add('flipped');
        this.flippedCards.push({ card, element: cardEl });

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            this.checkMatch();
        }
    }

    checkMatch() {
        const [first, second] = this.flippedCards;

        if (first.card.emoji === second.card.emoji) {
            first.card.isMatched = true;
            second.card.isMatched = true;
            first.element.classList.add('matched');
            second.element.classList.add('matched');
            this.matchedPairs++;
            this.updateStats();

            audioManager.playSuccessSound();
            this.flippedCards = [];

            if (this.matchedPairs === this.totalPairs) {
                setTimeout(() => this.gameWon(), 500);
            }
        } else {
            this.isLocked = true;
            setTimeout(() => {
                first.card.isFlipped = false;
                second.card.isFlipped = false;
                first.element.classList.remove('flipped');
                second.element.classList.remove('flipped');
                this.flippedCards = [];
                this.isLocked = false;
            }, 800);
        }
    }

    updateStats() {
        this.dom.movesDisplay.textContent = `Züge: ${this.moves}`;
        this.dom.pairsDisplay.textContent = `Paare: ${this.matchedPairs}/${this.totalPairs}`;
    }

    loadHighscore() {
        const data = JSON.parse(localStorage.getItem(MemoryApp.HIGHSCORE_KEY) || '{}');
        return data[this.difficulty] || 0;
    }

    saveHighscore(moves) {
        const data = JSON.parse(localStorage.getItem(MemoryApp.HIGHSCORE_KEY) || '{}');
        data[this.difficulty] = moves;
        localStorage.setItem(MemoryApp.HIGHSCORE_KEY, JSON.stringify(data));
    }

    updateHighscoreDisplay() {
        const best = this.loadHighscore();
        if (this.dom.highscoreValue) {
            this.dom.highscoreValue.textContent = best > 0 ? best : '–';
        }
    }

    gameWon() {
        const best = this.loadHighscore();
        const isNew = best === 0 || this.moves < best;
        if (isNew) this.saveHighscore(this.moves);
        this.updateHighscoreDisplay();

        const message = isNew
            ? `🏆 Neuer Rekord! ${this.moves} Züge!`
            : `🎉 Geschafft in ${this.moves} Zügen!`;
        showMilestoneCelebration(message);
        setTimeout(() => launchFireworks(), 500);
    }

    showCrownCounter() {
        CrownManager.showCounter(this.dom.crownCounter, this.dom.crownCount);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const app = new MemoryApp();
    app.init();
});
