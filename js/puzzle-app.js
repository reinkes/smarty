class PuzzleApp {
    static TOTAL_TASKS = 15;
    static FEEDBACK_DELAY = 1400;

    constructor() {
        this.words = [];
        this.currentWord = null;
        this.chips = [];          // [{id, letter, slotIndex}]
        this.slots = [];          // [chipId | null]
        this.tasksCompleted = 0;
        this.correctCount = 0;
        // Crown achievement system (managed by CrownManager)
        this.answered = false;
        this.difficulty = 3;
        this.draggedChipId = null;
        this.draggedFromSlot = null;
        this.usedWords = new Set();
        this.dom = {};
    }

    async init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        CrownManager.showCounter(this.dom.crownCounter, this.dom.crownCount);
        await this.loadWords();
        this.nextWord();
    }

    cacheDOMElements() {
        this.dom.difficultySlider  = document.getElementById('difficultySlider');
        this.dom.diffLabel         = document.getElementById('diffLabel');
        this.dom.progressFill      = document.getElementById('progressFill');
        this.dom.progressText      = document.getElementById('progressText');
        this.dom.wordEmoji         = document.getElementById('wordEmoji');
        this.dom.hintBtn           = document.getElementById('hintBtn');
        this.dom.wordSlots         = document.getElementById('wordSlots');
        this.dom.letterChips       = document.getElementById('letterChips');
        this.dom.feedback          = document.getElementById('feedback');
        this.dom.crownCounter      = document.getElementById('crownCounter');
        this.dom.crownCount        = document.getElementById('crownCount');
        this.dom.milestoneCelebration = document.getElementById('milestoneCelebration');
        this.dom.fireworksContainer   = document.getElementById('fireworksContainer');
        this.dom.taskArea          = document.getElementById('taskArea');
        this.dom.completionScreen  = document.getElementById('completionScreen');
        this.dom.completionCrowns  = document.getElementById('completionCrowns');
        this.dom.completionCorrect = document.getElementById('completionCorrect');
        this.dom.restartBtn        = document.getElementById('restartBtn');
    }

    attachEventListeners() {
        this.dom.difficultySlider.addEventListener('input', () => {
            this.difficulty = parseInt(this.dom.difficultySlider.value);
            this.updateDifficultyLabel();
        });
        this.dom.hintBtn.addEventListener('click', () => this.showHint());
        this.dom.restartBtn.addEventListener('click', () => this.restart());
    }

    async loadWords() {
        try {
            const resp = await fetch('data/woerter-words.json');
            const data = await resp.json();
            this.words = data.words;
        } catch (e) {
            console.error('Failed to load words:', e);
            this.words = [];
        }
    }

    // ── Difficulty / word filtering ────────────────────────────────────────

    getMaxWordLength() {
        const d = this.difficulty;
        if (d <= 2) return 4;
        if (d <= 4) return 5;
        if (d <= 6) return 6;
        if (d <= 8) return 7;
        return 30;
    }

    getWordPool() {
        const max = this.getMaxWordLength();
        return this.words.filter(w => w.word.length >= 3 && w.word.length <= max);
    }

    pickNextWord() {
        let pool = this.getWordPool();
        if (pool.length === 0) pool = this.words; // fallback: use all words
        let candidates = pool.filter(w => !this.usedWords.has(w.word));
        if (candidates.length === 0) {
            this.usedWords.clear();
            candidates = pool;
        }
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    updateDifficultyLabel() {
        const d = this.difficulty;
        let label;
        if (d <= 3)      label = 'Einfach 😊';
        else if (d <= 6) label = 'Mittel 🤔';
        else if (d <= 9) label = 'Schwer 🔥';
        else             label = 'Experte 🏆';
        this.dom.diffLabel.textContent = label;
    }

    showHint() {
        this.dom.wordEmoji.classList.remove('hidden');
        this.dom.hintBtn.style.display = 'none';
    }

    // ── Task lifecycle ─────────────────────────────────────────────────────

    nextWord() {
        this.answered = false;
        this.currentWord = this.pickNextWord();
        this.usedWords.add(this.currentWord.word);
        this.buildPuzzle();
        this.updateProgress();
    }

    buildPuzzle() {
        const word = this.currentWord.word;
        const letters = word.toUpperCase().split('');

        // Shuffle, ensuring the result differs from the original order
        let shuffled;
        let tries = 0;
        do {
            shuffled = [...letters].sort(() => Math.random() - 0.5);
            tries++;
        } while (shuffled.join('') === letters.join('') && tries < 20 && letters.length > 1);

        this.chips = shuffled.map((letter, i) => ({ id: i, letter, slotIndex: null }));
        this.slots = new Array(word.length).fill(null);

        this.dom.wordEmoji.textContent = this.currentWord.emoji;
        this.dom.wordEmoji.classList.add('hidden');
        this.dom.hintBtn.style.display = 'inline-flex';
        this.dom.feedback.textContent = '';
        this.dom.feedback.className = 'feedback';

        this.renderSlots();
        this.renderChips();
    }

    // ── Rendering ──────────────────────────────────────────────────────────

    renderSlots() {
        this.dom.wordSlots.innerHTML = '';
        this.slots.forEach((chipId, i) => {
            const slot = document.createElement('div');
            slot.className = 'letter-slot';
            slot.dataset.index = i;

            if (chipId !== null) {
                const chip = this.chips.find(c => c.id === chipId);
                slot.textContent = chip.letter;
                slot.classList.add('filled');

                // Allow dragging from a filled slot (slot-to-slot move)
                slot.draggable = true;
                slot.addEventListener('dragstart', e => {
                    this.draggedChipId = chipId;
                    this.draggedFromSlot = i;
                    e.dataTransfer.effectAllowed = 'move';
                    setTimeout(() => slot.classList.add('dragging'), 0);
                });
                slot.addEventListener('dragend', () => {
                    slot.classList.remove('dragging');
                    this.draggedChipId = null;
                    this.draggedFromSlot = null;
                });
            }

            slot.addEventListener('click', () => this.handleSlotClick(i));
            slot.addEventListener('dragover', e => {
                e.preventDefault();
                slot.classList.add('drag-over');
            });
            slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
            slot.addEventListener('drop', e => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                this.handleDrop(i);
            });

            this.dom.wordSlots.appendChild(slot);
        });
    }

    renderChips() {
        this.dom.letterChips.innerHTML = '';
        this.chips.forEach(chip => {
            const el = document.createElement('div');
            el.className = 'letter-chip';
            if (chip.slotIndex !== null) el.classList.add('placed');
            el.textContent = chip.letter;
            el.dataset.chipId = chip.id;
            el.draggable = true;

            el.addEventListener('dragstart', e => {
                if (chip.slotIndex !== null) { e.preventDefault(); return; }
                this.draggedChipId = chip.id;
                this.draggedFromSlot = null;
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => el.classList.add('dragging'), 0);
            });
            el.addEventListener('dragend', () => {
                el.classList.remove('dragging');
                this.draggedChipId = null;
                this.draggedFromSlot = null;
            });
            el.addEventListener('click', () => this.handleChipClick(chip.id));

            this.dom.letterChips.appendChild(el);
        });
    }

    // ── Interaction handlers ───────────────────────────────────────────────

    /** Click a chip in the chips area → place in next empty slot */
    handleChipClick(chipId) {
        if (this.answered) return;
        const chip = this.chips.find(c => c.id === chipId);
        if (chip.slotIndex !== null) return; // already placed

        const emptyIndex = this.slots.findIndex(s => s === null);
        if (emptyIndex === -1) return;

        this.placeChip(chipId, emptyIndex);
    }

    /** Click a filled slot → return chip to chips area */
    handleSlotClick(slotIndex) {
        if (this.answered) return;
        const chipId = this.slots[slotIndex];
        if (chipId === null) return; // empty slot

        this.removeChip(slotIndex);
    }

    /** Drop a chip (from chips area or another slot) onto a target slot */
    handleDrop(targetSlot) {
        if (this.answered || this.draggedChipId === null) return;
        if (this.draggedFromSlot === targetSlot) return; // same slot, no-op

        const draggedChip = this.chips.find(c => c.id === this.draggedChipId);
        const occupantId  = this.slots[targetSlot];

        if (this.draggedFromSlot !== null) {
            // Slot-to-slot: swap occupants
            this.slots[this.draggedFromSlot] = occupantId;
            if (occupantId !== null) {
                this.chips.find(c => c.id === occupantId).slotIndex = this.draggedFromSlot;
            } else {
                draggedChip.slotIndex = null; // vacate source first
            }
        } else {
            // From chips area: evict existing occupant if any
            if (occupantId !== null) {
                this.chips.find(c => c.id === occupantId).slotIndex = null;
                this.slots[targetSlot] = null;
            }
        }

        draggedChip.slotIndex = targetSlot;
        this.slots[targetSlot] = this.draggedChipId;

        this.renderSlots();
        this.renderChips();
        this.tryAutoCheck();
    }

    placeChip(chipId, slotIndex) {
        const chip = this.chips.find(c => c.id === chipId);
        chip.slotIndex = slotIndex;
        this.slots[slotIndex] = chipId;
        this.renderSlots();
        this.renderChips();
        this.tryAutoCheck();
    }

    removeChip(slotIndex) {
        const chipId = this.slots[slotIndex];
        if (chipId === null) return;
        this.chips.find(c => c.id === chipId).slotIndex = null;
        this.slots[slotIndex] = null;
        this.renderSlots();
        this.renderChips();
    }

    tryAutoCheck() {
        if (this.answered) return;
        if (this.slots.every(s => s !== null)) {
            // Short delay so the last chip visually settles before check
            setTimeout(() => this.checkAnswer(), 300);
        }
    }

    // ── Answer checking ────────────────────────────────────────────────────

    checkAnswer() {
        if (this.answered) return;
        this.answered = true;

        const word    = this.currentWord.word.toUpperCase();
        const slotEls = this.dom.wordSlots.querySelectorAll('.letter-slot');
        let allCorrect = true;

        this.slots.forEach((chipId, i) => {
            const chip    = this.chips.find(c => c.id === chipId);
            const correct = chip.letter === word[i];
            if (!correct) allCorrect = false;
            slotEls[i].classList.remove('filled');
            slotEls[i].classList.add(correct ? 'correct' : 'incorrect');
            // For wrong slots, reveal the correct letter
            if (!correct) slotEls[i].textContent = word[i];
        });

        this.tasksCompleted++;

        if (allCorrect) {
            this.correctCount++;
            this.dom.feedback.textContent = `✓ ${this.currentWord.word}`;
            this.dom.feedback.className   = 'feedback correct';
        } else {
            this.dom.feedback.innerHTML = `✗ Es heißt: <strong>${this.currentWord.word}</strong>`;
            this.dom.feedback.className = 'feedback incorrect';
        }

        this.updateProgress();

        if (this.tasksCompleted >= PuzzleApp.TOTAL_TASKS) {
            setTimeout(() => this.showCompletion(), PuzzleApp.FEEDBACK_DELAY);
        } else {
            setTimeout(() => this.nextWord(), PuzzleApp.FEEDBACK_DELAY);
        }
    }

    earnCrown() {
        const { reward, total } = CrownManager.earnAndDisplay(this.difficulty, this.dom.crownCount, this.dom.crownCounter);
        return reward;
    }

    // ── Progress & UI ──────────────────────────────────────────────────────

    updateProgress() {
        const pct = (this.tasksCompleted / PuzzleApp.TOTAL_TASKS) * 100;
        this.dom.progressFill.style.width = `${pct}%`;
        this.dom.progressText.textContent = `${this.tasksCompleted} / ${PuzzleApp.TOTAL_TASKS}`;
    }

    showCompletion() {
        const reward = this.earnCrown();
        const total = CrownManager.load();
        this.dom.taskArea.style.display         = 'none';
        this.dom.completionScreen.style.display = 'block';
        this.dom.completionCrowns.textContent   = `+${reward} = ${total} 👑 Kronen`;
        this.dom.completionCorrect.textContent  = `${this.correctCount} von ${PuzzleApp.TOTAL_TASKS} richtig`;
        launchFireworks();
    }

    restart() {
        this.tasksCompleted = 0;
        this.correctCount   = 0;
        this.answered       = false;
        this.usedWords.clear();
        this.dom.taskArea.style.display         = 'block';
        this.dom.completionScreen.style.display = 'none';
        this.updateProgress();
        this.nextWord();
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const app = new PuzzleApp();
    app.init();
});
