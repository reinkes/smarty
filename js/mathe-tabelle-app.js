'use strict';

const CROWN_STORAGE_KEY = 'smarty-crowns';

class TabelleApp {
    constructor() {
        this.config = null;
        this.rowValues = [];
        this.colValues = [];
        this.crownsEarned = 0;
        this.roundLocked = false;

        this.colHeaders = Object.create(null);
        this.rowHeaders = Object.create(null);
        this.inputs = [];
        this.totalInputs = 0;
        this.correctCount = 0;

        this.dom = {
            slider:          document.getElementById('difficultySlider'),
            difficultyValue: document.getElementById('difficultyValue'),
            startButton:     document.getElementById('startButton'),
            checkButton:     document.getElementById('checkButton'),
            newGameButton:   document.getElementById('newGameButton'),
            wrapper:         document.getElementById('tableWrapper'),
            preview:         document.getElementById('preview'),
            previewTitle:    document.getElementById('previewTitle'),
            crownCounter:    document.getElementById('crownCounter'),
            crownCount:      document.getElementById('crownCount'),
        };

        this.loadCrowns();
        this.setupEventListeners();
        this.updateDifficultyDisplay();
    }

    // gridSize = result grid dimension (2, 3, or 4)
    // maxAddend = max value for header numbers (so max sum = 2 × maxAddend)
    getConfig(level) {
        const configs = [
            { gridSize: 2, maxAddend:  5 }, //  1 – 2×2, sum bis 10
            { gridSize: 2, maxAddend:  7 }, //  2
            { gridSize: 2, maxAddend: 10 }, //  3 – 2×2, sum bis 20
            { gridSize: 3, maxAddend:  5 }, //  4 – 3×3, sum bis 10
            { gridSize: 3, maxAddend:  7 }, //  5
            { gridSize: 3, maxAddend:  8 }, //  6
            { gridSize: 3, maxAddend: 10 }, //  7 – 3×3, sum bis 20
            { gridSize: 4, maxAddend:  7 }, //  8 – 4×4
            { gridSize: 4, maxAddend:  8 }, //  9
            { gridSize: 4, maxAddend: 10 }, // 10 – 4×4, sum bis 20
        ];
        return configs[level - 1];
    }

    setupEventListeners() {
        this.dom.slider.addEventListener('input',        () => this.updateDifficultyDisplay());
        this.dom.startButton.addEventListener('click',   () => this.startGame());
        this.dom.checkButton.addEventListener('click',   () => this.checkAnswers());
        this.dom.newGameButton.addEventListener('click', () => this.startGame());
    }

    currentLevel() {
        return parseInt(this.dom.slider.value, 10);
    }

    updateDifficultyDisplay() {
        const level = this.currentLevel();
        const { gridSize, maxAddend } = this.getConfig(level);
        const emoji = level <= 3 ? '😊' : level <= 7 ? '🤔' : '🔥';
        this.dom.difficultyValue.textContent =
            `Level ${level} – ${gridSize}×${gridSize}, Summe bis ${maxAddend * 2} ${emoji}`;
    }

    startGame() {
        this.config = this.getConfig(this.currentLevel());
        this.roundLocked = false;
        this.correctCount = 0;
        this.rowValues = this.pickUniqueNumbers(this.config.gridSize, this.config.maxAddend);
        this.colValues = this.pickUniqueNumbers(this.config.gridSize, this.config.maxAddend);

        this.buildTable();
        this.dom.preview.classList.add('active');
        this.dom.previewTitle.textContent =
            `Additions-Tabelle ${this.config.gridSize}×${this.config.gridSize}`;
        this.dom.crownCounter.style.display = 'flex';
        this.updateCrownDisplay();
        this.dom.preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    pickUniqueNumbers(count, max) {
        const pool = [];
        for (let i = 1; i <= max; i++) pool.push(i);
        // Fisher-Yates
        for (let i = pool.length - 1; i > 0; i--) {
            const j = (Math.random() * (i + 1)) | 0;
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return pool.slice(0, count).sort((a, b) => a - b);
    }

    buildTable() {
        const { gridSize } = this.config;
        this.dom.wrapper.innerHTML = '';
        this.colHeaders = Object.create(null);
        this.rowHeaders = Object.create(null);
        this.inputs = [];

        const size = gridSize + 1;
        const grid = document.createElement('div');
        grid.className = 'addition-grid';
        grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

        for (let row = 0; row <= gridSize; row++) {
            for (let col = 0; col <= gridSize; col++) {
                grid.appendChild(this.buildCell(row, col));
            }
        }

        this.dom.wrapper.appendChild(grid);
        this.totalInputs = this.inputs.length;
        if (this.inputs.length > 0) this.inputs[0].focus();
    }

    buildCell(row, col) {
        const cell = document.createElement('div');

        if (row === 0 && col === 0) {
            cell.className = 'grid-cell corner-cell';
            cell.textContent = '+';
            return cell;
        }

        if (row === 0 || col === 0) {
            return this.buildHeaderCell(cell, row, col);
        }

        const answer = this.rowValues[row - 1] + this.colValues[col - 1];
        cell.className = 'grid-cell result-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;

        const input = this.makeInput(answer, row, col);
        input.addEventListener('focus',   () => this.highlightHeaders(row, col, true));
        input.addEventListener('blur',    () => this.highlightHeaders(row, col, false));
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.advanceFocus(row, col); });
        cell.appendChild(input);
        this.inputs.push(input);
        return cell;
    }

    buildHeaderCell(cell, row, col) {
        const isCol = row === 0;
        const index = isCol ? col : row;
        const value = isCol ? this.colValues[col - 1] : this.rowValues[row - 1];
        cell.className = `grid-cell header-cell ${isCol ? 'col-header' : 'row-header'}`;
        cell.dataset.index = index;
        cell.textContent = value;
        (isCol ? this.colHeaders : this.rowHeaders)[index] = cell;
        return cell;
    }

    makeInput(answer, row, col) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '2';
        input.max = String(this.config.maxAddend * 2);
        input.autocomplete = 'off';
        input.dataset.answer = String(answer);
        input.dataset.row = row;
        input.dataset.col = col;
        input.addEventListener('input', () => this.onInputChange(input));
        return input;
    }

    highlightHeaders(row, col, on) {
        const colH = this.colHeaders[col];
        const rowH = this.rowHeaders[row];
        if (colH && colH.classList.contains('highlighted') !== on) colH.classList.toggle('highlighted', on);
        if (rowH && rowH.classList.contains('highlighted') !== on) rowH.classList.toggle('highlighted', on);
    }

    isInputCorrect(input) {
        if (input.value === '') return false;
        return parseInt(input.value, 10) === parseInt(input.dataset.answer, 10);
    }

    onInputChange(input) {
        const cell = input.parentElement;
        const wasCorrect = cell.classList.contains('correct');
        const isCorrect = this.isInputCorrect(input);

        if (isCorrect === wasCorrect) {
            if (!isCorrect && input.value === '') cell.classList.remove('incorrect');
            return;
        }

        if (isCorrect) {
            cell.classList.add('correct');
            cell.classList.remove('incorrect');
            this.correctCount++;
            audioManager.playSuccessSound();
            if (this.correctCount === this.totalInputs) this.onSuccess();
        } else {
            cell.classList.remove('correct', 'incorrect');
            this.correctCount--;
        }
    }

    advanceFocus(row, col) {
        const { gridSize } = this.config;
        let nextRow = row, nextCol = col + 1;
        if (nextCol > gridSize) { nextCol = 1; nextRow++; }
        if (nextRow > gridSize) return;
        const next = this.dom.wrapper.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`);
        if (next) next.focus();
    }

    checkAnswers() {
        let anyInput = false;
        this.correctCount = 0;

        this.inputs.forEach(input => {
            const cell = input.parentElement;
            if (input.value !== '') anyInput = true;

            if (this.isInputCorrect(input)) {
                cell.classList.add('correct');
                cell.classList.remove('incorrect');
                this.correctCount++;
            } else {
                cell.classList.add('incorrect');
                cell.classList.remove('correct');
            }
        });

        if (this.correctCount === this.totalInputs && anyInput) {
            this.onSuccess();
        } else {
            showMilestoneCelebration('🤔 Noch Fehler – versuch es nochmal!');
        }
    }

    onSuccess() {
        if (!this.roundLocked) {
            this.roundLocked = true;
            this.earnCrown();
        }
        launchFireworks();
        showMilestoneCelebration('🎉 Fantastisch! Alles richtig! 🎉');
    }

    earnCrown() {
        this.crownsEarned += 1;
        this.saveCrowns();
        this.updateCrownDisplay();
        const counter = this.dom.crownCounter;
        if (counter) {
            counter.classList.add('earn');
            setTimeout(() => counter.classList.remove('earn'), 600);
        }
    }

    loadCrowns() {
        const s = localStorage.getItem(CROWN_STORAGE_KEY);
        this.crownsEarned = s ? parseInt(s, 10) : 0;
    }

    saveCrowns() {
        localStorage.setItem(CROWN_STORAGE_KEY, String(this.crownsEarned));
    }

    updateCrownDisplay() {
        if (this.dom.crownCount) this.dom.crownCount.textContent = this.crownsEarned;
    }
}

document.addEventListener('DOMContentLoaded', () => { new TabelleApp(); });
