'use strict';

const CROWN_STORAGE_KEY = 'smarty-crowns';

class TabelleApp {
    constructor() {
        this.config = null;
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

    // blankCount = result cells the kid must fill; rest are shown as reference.
    // hideHeaders = first row AND first column are inputs too.
    getConfig(level) {
        const configs = [
            { maxNum:  5, blankCount:   4, hideHeaders: false },
            { maxNum:  5, blankCount:   8, hideHeaders: false },
            { maxNum:  5, blankCount:  12, hideHeaders: false },
            { maxNum:  5, blankCount:  16, hideHeaders: false },
            { maxNum:  5, blankCount:  20, hideHeaders: false },
            { maxNum:  5, blankCount:  25, hideHeaders: false },
            { maxNum:  5, blankCount:  25, hideHeaders: true  },
            { maxNum: 10, blankCount:  30, hideHeaders: false },
            { maxNum: 10, blankCount:  60, hideHeaders: false },
            { maxNum: 10, blankCount: 100, hideHeaders: true  },
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
        const cfg = this.getConfig(level);
        const total = cfg.maxNum * cfg.maxNum;
        let label;
        if (level <= 2)      label = `Level ${level} – ${cfg.blankCount} Felder ausfüllen 😊`;
        else if (level <= 6) label = `Level ${level} – ${cfg.blankCount} von ${total} Feldern 🤔`;
        else if (level === 7) label = `Level ${level} – Kopfzeile leer 🔥`;
        else if (level <= 9) label = `Level ${level} – Zahlen bis 10 🔥`;
        else                 label = `Level ${level} – Alles leer! 🌋`;
        this.dom.difficultyValue.textContent = label;
    }

    startGame() {
        this.config = this.getConfig(this.currentLevel());
        this.roundLocked = false;
        this.correctCount = 0;

        this.buildTable();
        this.dom.preview.classList.add('active');
        this.dom.previewTitle.textContent = `Additions-Tabelle (1–${this.config.maxNum})`;
        this.dom.crownCounter.style.display = 'flex';
        this.updateCrownDisplay();
        this.dom.preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    buildTable() {
        const { maxNum } = this.config;
        this.dom.wrapper.innerHTML = '';
        this.colHeaders = Object.create(null);
        this.rowHeaders = Object.create(null);
        this.inputs = [];

        const blankCells = this.pickBlankCells();
        const size = maxNum + 1;

        const grid = document.createElement('div');
        grid.className = 'addition-grid';
        grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

        for (let row = 0; row <= maxNum; row++) {
            for (let col = 0; col <= maxNum; col++) {
                grid.appendChild(this.buildCell(row, col, blankCells));
            }
        }

        this.dom.wrapper.appendChild(grid);
        this.totalInputs = this.inputs.length;

        if (this.inputs.length > 0) this.inputs[0].focus();
    }

    pickBlankCells() {
        const { maxNum, blankCount } = this.config;
        const all = [];
        for (let r = 1; r <= maxNum; r++)
            for (let c = 1; c <= maxNum; c++)
                all.push(`${r},${c}`);

        // Fisher-Yates
        for (let i = all.length - 1; i > 0; i--) {
            const j = (Math.random() * (i + 1)) | 0;
            [all[i], all[j]] = [all[j], all[i]];
        }
        return new Set(all.slice(0, Math.min(blankCount, all.length)));
    }

    buildCell(row, col, blankCells) {
        const cell = document.createElement('div');

        if (row === 0 && col === 0) {
            cell.className = 'grid-cell corner-cell';
            cell.textContent = '+';
            return cell;
        }

        if (row === 0 || col === 0) {
            return this.buildHeaderCell(cell, row, col);
        }

        cell.className = 'grid-cell result-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;

        if (blankCells.has(`${row},${col}`)) {
            const input = this.makeInput(row + col, row, col);
            input.addEventListener('focus',   () => this.highlightHeaders(row, col, true));
            input.addEventListener('blur',    () => this.highlightHeaders(row, col, false));
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.advanceFocus(row, col); });
            cell.appendChild(input);
            this.inputs.push(input);
        } else {
            cell.classList.add('prefilled');
            cell.textContent = row + col;
            cell.addEventListener('mouseenter', () => this.highlightHeaders(row, col, true));
            cell.addEventListener('mouseleave', () => this.highlightHeaders(row, col, false));
        }
        return cell;
    }

    buildHeaderCell(cell, row, col) {
        const isCol = row === 0;
        const index = isCol ? col : row;
        cell.className = `grid-cell header-cell ${isCol ? 'col-header' : 'row-header'}`;
        cell.dataset.index = index;
        (isCol ? this.colHeaders : this.rowHeaders)[index] = cell;

        if (this.config.hideHeaders) {
            cell.classList.add('hidden-header');
            const input = this.makeInput(index);
            cell.appendChild(input);
            this.inputs.push(input);
        } else {
            cell.textContent = index;
        }
        return cell;
    }

    makeInput(answer, row, col) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = row === undefined ? '1' : '2';
        input.max = row === undefined ? String(this.config.maxNum) : String(this.config.maxNum * 2);
        input.autocomplete = 'off';
        input.dataset.answer = String(answer);
        if (row !== undefined) {
            input.dataset.row = row;
            input.dataset.col = col;
        }
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
        const { maxNum } = this.config;
        let nextRow = row, nextCol = col + 1;
        if (nextCol > maxNum) { nextCol = 1; nextRow++; }
        if (nextRow > maxNum) return;
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
