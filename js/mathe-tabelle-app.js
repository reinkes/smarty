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

    // gridSize     = result-grid dimension (2, 3, 4)
    // maxAddend    = max header value (max sum = 2 × maxAddend)
    // emptyHeaders = how many row/col headers to blank out (deduce mode)
    // headerHint   = how strongly to highlight prefilled cells when a blank header is focused
    getConfig(level) {
        const configs = [
            { gridSize: 2, maxAddend:  5, emptyHeaders: 0, headerHint: null     }, //  1
            { gridSize: 2, maxAddend:  7, emptyHeaders: 0, headerHint: null     }, //  2
            { gridSize: 2, maxAddend: 10, emptyHeaders: 0, headerHint: null     }, //  3
            { gridSize: 3, maxAddend:  5, emptyHeaders: 0, headerHint: null     }, //  4
            { gridSize: 3, maxAddend:  8, emptyHeaders: 0, headerHint: null     }, //  5
            { gridSize: 3, maxAddend: 10, emptyHeaders: 0, headerHint: null     }, //  6
            { gridSize: 3, maxAddend: 10, emptyHeaders: 1, headerHint: 'full'   }, //  7 – deduce, 1 blank, full hint
            { gridSize: 4, maxAddend:  7, emptyHeaders: 1, headerHint: 'medium' }, //  8 – deduce, 1 blank, medium hint
            { gridSize: 4, maxAddend: 10, emptyHeaders: 2, headerHint: 'faint'  }, //  9 – deduce, 2 blanks, faint hint
            { gridSize: 4, maxAddend: 10, emptyHeaders: 3, headerHint: null     }, // 10 – deduce, 3 blanks, no hint
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
        const emoji = level <= 3 ? '😊' : level <= 6 ? '🤔' : '🔥';
        const mode = cfg.emptyHeaders > 0 ? ' · Kopfzeile ergänzen' : '';
        this.dom.difficultyValue.textContent =
            `Level ${level} – ${cfg.gridSize}×${cfg.gridSize}, Summe bis ${cfg.maxAddend * 2}${mode} ${emoji}`;
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

    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = (Math.random() * (i + 1)) | 0;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    pickUniqueNumbers(count, max) {
        const pool = [];
        for (let i = 1; i <= max; i++) pool.push(i);
        return this.shuffle(pool).slice(0, count);
    }

    pickEmptyIndices(gridSize, count) {
        const set = new Set();
        if (count <= 0) return set;
        const all = [];
        for (let i = 1; i <= gridSize; i++) all.push(i);
        this.shuffle(all).slice(0, count).forEach(i => set.add(i));
        return set;
    }

    // For each empty header, pre-fill exactly one result cell in its row/column
    // whose other axis is NOT empty — so the kid can deduce the missing value.
    pickPrefilled(gridSize, emptyRows, emptyCols) {
        const prefilled = new Set();

        const addFor = (fixedIsRow, fixedIdx) => {
            const candidates = [];
            for (let i = 1; i <= gridSize; i++) {
                const otherIsEmpty = fixedIsRow ? emptyCols.has(i) : emptyRows.has(i);
                if (!otherIsEmpty) candidates.push(i);
            }
            if (candidates.length === 0) return;
            const pick = candidates[(Math.random() * candidates.length) | 0];
            const key = fixedIsRow ? `${fixedIdx},${pick}` : `${pick},${fixedIdx}`;
            prefilled.add(key);
        };

        emptyRows.forEach(er => addFor(true,  er));
        emptyCols.forEach(ec => addFor(false, ec));
        return prefilled;
    }

    buildTable() {
        const { gridSize, emptyHeaders } = this.config;
        this.dom.wrapper.innerHTML = '';
        this.colHeaders = Object.create(null);
        this.rowHeaders = Object.create(null);
        this.prefilledByRow = Object.create(null);
        this.prefilledByCol = Object.create(null);
        this.inputs = [];

        const emptyRows = this.pickEmptyIndices(gridSize, emptyHeaders);
        const emptyCols = this.pickEmptyIndices(gridSize, emptyHeaders);
        const prefilled = this.pickPrefilled(gridSize, emptyRows, emptyCols);

        const size = gridSize + 1;
        const grid = document.createElement('div');
        grid.className = 'addition-grid';
        grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

        for (let row = 0; row <= gridSize; row++) {
            for (let col = 0; col <= gridSize; col++) {
                grid.appendChild(this.buildCell(row, col, emptyRows, emptyCols, prefilled));
            }
        }

        this.dom.wrapper.appendChild(grid);
        this.totalInputs = this.inputs.length;
        if (this.inputs.length > 0) this.inputs[0].focus();
    }

    buildCell(row, col, emptyRows, emptyCols, prefilled) {
        const cell = document.createElement('div');

        if (row === 0 && col === 0) {
            cell.className = 'grid-cell corner-cell';
            cell.textContent = '+';
            return cell;
        }

        if (row === 0 || col === 0) {
            return this.buildHeaderCell(cell, row, col, emptyRows, emptyCols);
        }

        const answer = this.rowValues[row - 1] + this.colValues[col - 1];
        cell.className = 'grid-cell result-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;

        if (prefilled.has(`${row},${col}`)) {
            cell.classList.add('prefilled');
            cell.textContent = answer;
            (this.prefilledByRow[row] = this.prefilledByRow[row] || []).push(cell);
            (this.prefilledByCol[col] = this.prefilledByCol[col] || []).push(cell);
        } else {
            const input = this.makeInput(answer, row, col);
            input.addEventListener('focus',   () => this.highlightHeaders(row, col, true));
            input.addEventListener('blur',    () => this.highlightHeaders(row, col, false));
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.advanceFocus(input); });
            cell.appendChild(input);
            this.inputs.push(input);
        }
        return cell;
    }

    buildHeaderCell(cell, row, col, emptyRows, emptyCols) {
        const isCol = row === 0;
        const index = isCol ? col : row;
        const value = isCol ? this.colValues[col - 1] : this.rowValues[row - 1];
        const isEmpty = isCol ? emptyCols.has(col) : emptyRows.has(row);

        cell.className = `grid-cell header-cell ${isCol ? 'col-header' : 'row-header'}`;
        cell.dataset.index = index;
        (isCol ? this.colHeaders : this.rowHeaders)[index] = cell;

        if (isEmpty) {
            cell.classList.add('hidden-header');
            const input = this.makeInput(value);
            input.addEventListener('focus',   () => this.highlightPrefilled(isCol, index, true));
            input.addEventListener('blur',    () => this.highlightPrefilled(isCol, index, false));
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.advanceFocus(input); });
            cell.appendChild(input);
            this.inputs.push(input);
        } else {
            cell.textContent = value;
        }
        return cell;
    }

    makeInput(answer, row, col) {
        const input = document.createElement('input');
        input.type = 'number';
        input.autocomplete = 'off';
        input.dataset.answer = String(answer);
        if (row === undefined) {
            input.min = '1';
            input.max = String(this.config.maxAddend);
        } else {
            input.min = '2';
            input.max = String(this.config.maxAddend * 2);
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

    highlightPrefilled(isCol, index, on) {
        const hint = this.config.headerHint;
        if (!hint) return;
        const cells = (isCol ? this.prefilledByCol[index] : this.prefilledByRow[index]) || [];
        cells.forEach(cell => {
            cell.classList.toggle(`hint-${hint}`, on);
            const otherIdx = isCol ? parseInt(cell.dataset.row) : parseInt(cell.dataset.col);
            const otherHeader = isCol ? this.rowHeaders[otherIdx] : this.colHeaders[otherIdx];
            if (otherHeader) otherHeader.classList.toggle('highlighted', on);
        });
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

    advanceFocus(currentInput) {
        const idx = this.inputs.indexOf(currentInput);
        if (idx >= 0 && idx < this.inputs.length - 1) {
            this.inputs[idx + 1].focus();
        }
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
