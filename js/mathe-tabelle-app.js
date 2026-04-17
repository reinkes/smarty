'use strict';

class TabelleApp {
    constructor() {
        this.level = 1;
        this.config = null;
        this.crownsEarned = 0;
        this.crownEarnedThisRound = false;
        this.loadCrowns();
        this.setupEventListeners();
        this.updateDifficultyDisplay();
    }

    // ── Config ────────────────────────────────────────────────────────────────
    // blankCount = number of result cells the kid must fill in
    // hideHeaders = whether first row AND first column are also empty inputs
    // Pre-filled result cells show their answer as a static reference.

    getConfig(level) {
        const configs = [
            { maxNum:  5, blankCount:   4, hideHeaders: false }, // 1
            { maxNum:  5, blankCount:   8, hideHeaders: false }, // 2
            { maxNum:  5, blankCount:  12, hideHeaders: false }, // 3
            { maxNum:  5, blankCount:  16, hideHeaders: false }, // 4
            { maxNum:  5, blankCount:  20, hideHeaders: false }, // 5
            { maxNum:  5, blankCount:  25, hideHeaders: false }, // 6 – all cells, headers visible
            { maxNum:  5, blankCount:  25, hideHeaders: true  }, // 7 – headers empty
            { maxNum: 10, blankCount:  30, hideHeaders: false }, // 8 – bigger table
            { maxNum: 10, blankCount:  60, hideHeaders: false }, // 9
            { maxNum: 10, blankCount: 100, hideHeaders: true  }, // 10 – ultimate
        ];
        return configs[level - 1];
    }

    // ── Setup ─────────────────────────────────────────────────────────────────

    setupEventListeners() {
        document.getElementById('difficultySlider').addEventListener('input', () => this.updateDifficultyDisplay());
        document.getElementById('startButton').addEventListener('click',   () => this.startGame());
        document.getElementById('checkButton').addEventListener('click',   () => this.checkAnswers());
        document.getElementById('newGameButton').addEventListener('click', () => this.startGame());
    }

    updateDifficultyDisplay() {
        const level = parseInt(document.getElementById('difficultySlider').value);
        const cfg = this.getConfig(level);
        const total = cfg.maxNum * cfg.maxNum;
        let label;
        if (level <= 2)      label = `Level ${level} – ${cfg.blankCount} Felder ausfüllen 😊`;
        else if (level <= 6) label = `Level ${level} – ${cfg.blankCount} von ${total} Feldern 🤔`;
        else if (level <= 7) label = `Level ${level} – Kopfzeile leer 🔥`;
        else if (level <= 9) label = `Level ${level} – Zahlen bis 10 🔥`;
        else                 label = `Level ${level} – Alles leer! 🌋`;
        document.getElementById('difficultyValue').textContent = label;
    }

    // ── Game start ────────────────────────────────────────────────────────────

    startGame() {
        this.level = parseInt(document.getElementById('difficultySlider').value);
        this.config = this.getConfig(this.level);
        this.crownEarnedThisRound = false;

        this.buildTable();

        const preview = document.getElementById('preview');
        preview.classList.add('active');

        document.getElementById('previewTitle').textContent =
            `Additions-Tabelle (1–${this.config.maxNum})`;

        document.getElementById('crownCounter').style.display = 'flex';
        this.updateCrownDisplay();

        preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ── Table building ────────────────────────────────────────────────────────

    buildTable() {
        const { maxNum, blankCount, hideHeaders } = this.config;
        const wrapper = document.getElementById('tableWrapper');
        wrapper.innerHTML = '';

        const blankCells = this.pickBlankCells(maxNum, blankCount);
        const size = maxNum + 1;

        const grid = document.createElement('div');
        grid.className = 'addition-grid';
        grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

        for (let row = 0; row <= maxNum; row++) {
            for (let col = 0; col <= maxNum; col++) {
                grid.appendChild(this.buildCell(row, col, maxNum, blankCells, hideHeaders));
            }
        }

        wrapper.appendChild(grid);

        const first = wrapper.querySelector('input');
        if (first) setTimeout(() => first.focus(), 80);
    }

    pickBlankCells(maxNum, count) {
        const all = [];
        for (let r = 1; r <= maxNum; r++)
            for (let c = 1; c <= maxNum; c++)
                all.push(`${r},${c}`);
        all.sort(() => Math.random() - 0.5);
        return new Set(all.slice(0, Math.min(count, all.length)));
    }

    buildCell(row, col, maxNum, blankCells, hideHeaders) {
        const cell = document.createElement('div');

        // ── Corner ──
        if (row === 0 && col === 0) {
            cell.className = 'grid-cell corner-cell';
            cell.textContent = '+';
            return cell;
        }

        // ── Column header (top row) ──
        if (row === 0) {
            cell.className = 'grid-cell header-cell col-header';
            cell.dataset.index = col;
            if (hideHeaders) {
                cell.classList.add('hidden-header');
                cell.appendChild(this.makeHeaderInput(col, maxNum));
            } else {
                cell.textContent = col;
            }
            return cell;
        }

        // ── Row header (left column) ──
        if (col === 0) {
            cell.className = 'grid-cell header-cell row-header';
            cell.dataset.index = row;
            if (hideHeaders) {
                cell.classList.add('hidden-header');
                cell.appendChild(this.makeHeaderInput(row, maxNum));
            } else {
                cell.textContent = row;
            }
            return cell;
        }

        // ── Result cell ──
        cell.className = 'grid-cell result-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;

        if (blankCells.has(`${row},${col}`)) {
            cell.appendChild(this.makeResultInput(row, col, maxNum));
        } else {
            cell.classList.add('prefilled');
            cell.textContent = row + col;
            // Highlight headers on hover for pre-filled cells too
            cell.addEventListener('mouseenter', () => this.highlightHeaders(row, col, true));
            cell.addEventListener('mouseleave', () => this.highlightHeaders(row, col, false));
        }

        return cell;
    }

    makeResultInput(row, col, maxNum) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '2';
        input.max = maxNum * 2;
        input.autocomplete = 'off';
        input.dataset.answer = row + col;
        input.dataset.row = row;
        input.dataset.col = col;

        input.addEventListener('focus',   () => this.highlightHeaders(row, col, true));
        input.addEventListener('blur',    () => this.highlightHeaders(row, col, false));
        input.addEventListener('input',   () => this.onInputChange(input));
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.advanceFocus(row, col); });
        return input;
    }

    makeHeaderInput(value, maxNum) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.max = maxNum;
        input.autocomplete = 'off';
        input.dataset.answer = value;
        input.addEventListener('input', () => this.onInputChange(input));
        return input;
    }

    // ── Highlighting ──────────────────────────────────────────────────────────

    highlightHeaders(row, col, on) {
        const colH = document.querySelector(`.col-header[data-index="${col}"]`);
        const rowH = document.querySelector(`.row-header[data-index="${row}"]`);
        if (colH) colH.classList.toggle('highlighted', on);
        if (rowH) rowH.classList.toggle('highlighted', on);
    }

    // ── Live validation ───────────────────────────────────────────────────────

    onInputChange(input) {
        const val    = parseInt(input.value, 10);
        const answer = parseInt(input.dataset.answer, 10);
        const cell   = input.parentElement;

        if (!input.value) {
            cell.classList.remove('correct', 'incorrect');
            return;
        }

        if (val === answer) {
            cell.classList.add('correct');
            cell.classList.remove('incorrect');
            audioManager.playSuccessSound();
            this.checkAllComplete();
        } else {
            cell.classList.remove('correct', 'incorrect');
        }
    }

    // ── Auto-advance on Enter ─────────────────────────────────────────────────

    advanceFocus(row, col) {
        const { maxNum } = this.config;
        let nextRow = row, nextCol = col + 1;
        if (nextCol > maxNum) { nextCol = 1; nextRow++; }
        if (nextRow > maxNum) return;
        const next = document.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`);
        if (next) next.focus();
    }

    // ── Check (button) ────────────────────────────────────────────────────────

    checkAnswers() {
        const inputs = document.querySelectorAll('#tableWrapper input');
        let allCorrect = true;
        let anyInput = false;

        inputs.forEach(input => {
            const val    = parseInt(input.value, 10);
            const answer = parseInt(input.dataset.answer, 10);
            const cell   = input.parentElement;

            if (input.value !== '') anyInput = true;

            if (val === answer) {
                cell.classList.add('correct');
                cell.classList.remove('incorrect');
            } else {
                cell.classList.add('incorrect');
                cell.classList.remove('correct');
                allCorrect = false;
            }
        });

        if (allCorrect && anyInput) {
            this.onSuccess();
        } else {
            showMilestoneCelebration('🤔 Noch Fehler – versuch es nochmal!');
        }
    }

    // ── Auto-complete check ───────────────────────────────────────────────────

    checkAllComplete() {
        if (this.crownEarnedThisRound) return;
        const inputs = document.querySelectorAll('#tableWrapper input');
        const allDone = [...inputs].every(inp =>
            parseInt(inp.value, 10) === parseInt(inp.dataset.answer, 10)
        );
        if (allDone) this.onSuccess();
    }

    onSuccess() {
        if (!this.crownEarnedThisRound) {
            this.crownEarnedThisRound = true;
            this.earnCrown();
        }
        launchFireworks();
        showMilestoneCelebration('🎉 Fantastisch! Alles richtig! 🎉');
    }

    // ── Crown system ──────────────────────────────────────────────────────────

    earnCrown() {
        this.crownsEarned += 1;
        this.saveCrowns();
        this.updateCrownDisplay();
        const counter = document.getElementById('crownCounter');
        if (counter) {
            counter.classList.add('earn');
            setTimeout(() => counter.classList.remove('earn'), 600);
        }
    }

    loadCrowns()  { const s = localStorage.getItem('smarty-crowns'); this.crownsEarned = s ? parseInt(s, 10) : 0; }
    saveCrowns()  { localStorage.setItem('smarty-crowns', this.crownsEarned.toString()); }
    updateCrownDisplay() { const el = document.getElementById('crownCount'); if (el) el.textContent = this.crownsEarned; }
}

document.addEventListener('DOMContentLoaded', () => { new TabelleApp(); });
