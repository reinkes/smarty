/**
 * Kinder-Sudoku Application
 * 4x4 Sudoku for children with numbers 1-4
 */
class SudokuApp {
    // Constants
    static GRID_SIZE = 4;
    static BOX_SIZE = 2;
    static DIFFICULTY_PRESETS = {
        1: { name: 'Sehr Einfach', clues: 10 }, // 10 von 16 vorgegeben
        2: { name: 'Einfach', clues: 8 },        // 8 vorgegeben
        3: { name: 'Mittel', clues: 6 }          // 6 vorgegeben
    };

    constructor() {
        // State
        this.solution = [];      // Die vollständige Lösung
        this.puzzle = [];        // Das Rätsel (mit Nullen für leere Felder)
        this.userGrid = [];      // Die Eingaben des Users
        this.difficulty = 1;
        this.hintsUsed = 0;
        this.puzzlesSolved = 0;

        // Crown achievement system (managed by CrownManager)

        // DOM cache
        this.dom = {
            difficultySlider: null,
            difficultyValue: null,
            startButton: null,
            preview: null,
            sudokuGrid: null,
            checkButton: null,
            hintButton: null,
            newGameButton: null,
            milestoneCelebration: null,
            fireworksContainer: null,
            crownCounter: null,
            crownCount: null
        };

        this.selectedCell = null;
    }

    /**
     * Initialize the application
     */
    init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        this.loadProgress();
    }

    /**
     * Cache all DOM elements
     */
    cacheDOMElements() {
        this.dom.difficultySlider = document.getElementById('difficultySlider');
        this.dom.difficultyValue = document.getElementById('difficultyValue');
        this.dom.startButton = document.getElementById('startButton');
        this.dom.preview = document.getElementById('preview');
        this.dom.sudokuGrid = document.getElementById('sudokuGrid');
        this.dom.checkButton = document.getElementById('checkButton');
        this.dom.hintButton = document.getElementById('hintButton');
        this.dom.newGameButton = document.getElementById('newGameButton');
        this.dom.milestoneCelebration = document.getElementById('milestoneCelebration');
        this.dom.fireworksContainer = document.getElementById('fireworksContainer');
        this.dom.crownCounter = document.getElementById('crownCounter');
        this.dom.crownCount = document.getElementById('crownCount');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Difficulty slider
        if (this.dom.difficultySlider) {
            this.dom.difficultySlider.addEventListener('input', () => this.updateDifficultyLabel());
        }

        // Buttons
        if (this.dom.startButton) {
            this.dom.startButton.addEventListener('click', () => this.startNewGame());
        }

        // Check button removed - auto-check is used instead

        if (this.dom.hintButton) {
            this.dom.hintButton.addEventListener('click', () => this.giveHint());
        }

        if (this.dom.newGameButton) {
            this.dom.newGameButton.addEventListener('click', () => this.startNewGame());
        }

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    /**
     * Update difficulty label
     */
    updateDifficultyLabel() {
        const level = parseInt(this.dom.difficultySlider.value);
        const preset = SudokuApp.DIFFICULTY_PRESETS[level];
        const emoji = level === 1 ? '😊' : level === 2 ? '🤔' : '😎';
        this.dom.difficultyValue.textContent = `Level ${level} (${preset.name}) ${emoji}`;
    }

    /**
     * Start a new game
     */
    startNewGame() {
        this.difficulty = parseInt(this.dom.difficultySlider.value);
        this.hintsUsed = 0;

        // Generate puzzle
        this.generateSudoku();

        // Show preview
        this.dom.preview.classList.add('active');
        this.dom.preview.scrollIntoView({ behavior: 'smooth' });

        // Show crown counter
        this.showCrownCounter();

        // Render grid
        this.renderGrid();
    }

    /**
     * Generate a valid 4x4 Sudoku puzzle
     */
    generateSudoku() {
        // Start with a valid completed grid
        this.solution = this.generateCompletedGrid();

        // Create puzzle by removing numbers based on difficulty
        const preset = SudokuApp.DIFFICULTY_PRESETS[this.difficulty];
        this.puzzle = this.createPuzzle(this.solution, preset.clues);

        // Initialize user grid with puzzle values
        this.userGrid = this.puzzle.map(row => [...row]);
    }

    /**
     * Generate a completed valid 4x4 Sudoku grid
     */
    generateCompletedGrid() {
        // Start with a base valid solution
        const base = [
            [1, 2, 3, 4],
            [3, 4, 1, 2],
            [2, 3, 4, 1],
            [4, 1, 2, 3]
        ];

        // Shuffle to create variation
        return this.shuffleGrid(base);
    }

    /**
     * Shuffle grid while maintaining Sudoku rules
     */
    shuffleGrid(grid) {
        let shuffled = grid.map(row => [...row]);

        // Randomly swap rows within boxes
        if (Math.random() > 0.5) {
            [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
        }
        if (Math.random() > 0.5) {
            [shuffled[2], shuffled[3]] = [shuffled[3], shuffled[2]];
        }

        // Randomly swap columns within boxes
        if (Math.random() > 0.5) {
            shuffled = this.swapColumns(shuffled, 0, 1);
        }
        if (Math.random() > 0.5) {
            shuffled = this.swapColumns(shuffled, 2, 3);
        }

        // Randomly swap box rows
        if (Math.random() > 0.5) {
            const temp1 = [...shuffled[0]];
            const temp2 = [...shuffled[1]];
            shuffled[0] = shuffled[2];
            shuffled[1] = shuffled[3];
            shuffled[2] = temp1;
            shuffled[3] = temp2;
        }

        // Randomly swap box columns
        if (Math.random() > 0.5) {
            shuffled = this.swapColumns(shuffled, 0, 2);
            shuffled = this.swapColumns(shuffled, 1, 3);
        }

        return shuffled;
    }

    /**
     * Swap two columns
     */
    swapColumns(grid, col1, col2) {
        const result = grid.map(row => [...row]);
        for (let row = 0; row < SudokuApp.GRID_SIZE; row++) {
            [result[row][col1], result[row][col2]] = [result[row][col2], result[row][col1]];
        }
        return result;
    }

    createPuzzle(solution, clues) {
        const puzzle = solution.map(row => [...row]);
        const totalCells = SudokuApp.GRID_SIZE * SudokuApp.GRID_SIZE;
        const cellsToRemove = totalCells - clues;

        const positions = [];
        for (let row = 0; row < SudokuApp.GRID_SIZE; row++) {
            for (let col = 0; col < SudokuApp.GRID_SIZE; col++) {
                positions.push({ row, col });
            }
        }

        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        let removed = 0;
        for (const { row, col } of positions) {
            if (removed >= cellsToRemove) break;
            const backup = puzzle[row][col];
            puzzle[row][col] = 0;

            if (this.countSolutions(puzzle) !== 1) {
                puzzle[row][col] = backup;
            } else {
                removed++;
            }
        }

        return puzzle;
    }

    countSolutions(grid) {
        const SIZE = SudokuApp.GRID_SIZE;
        const BOX = SudokuApp.BOX_SIZE;
        const board = grid.map(row => [...row]);
        let count = 0;

        const isValid = (r, c, num) => {
            for (let i = 0; i < SIZE; i++) {
                if (board[r][i] === num || board[i][c] === num) return false;
            }
            const br = Math.floor(r / BOX) * BOX;
            const bc = Math.floor(c / BOX) * BOX;
            for (let dr = 0; dr < BOX; dr++) {
                for (let dc = 0; dc < BOX; dc++) {
                    if (board[br + dr][bc + dc] === num) return false;
                }
            }
            return true;
        };

        const solve = () => {
            if (count > 1) return;
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (board[r][c] === 0) {
                        for (let num = 1; num <= SIZE; num++) {
                            if (isValid(r, c, num)) {
                                board[r][c] = num;
                                solve();
                                board[r][c] = 0;
                            }
                        }
                        return;
                    }
                }
            }
            count++;
        };

        solve();
        return count;
    }

    /**
     * Render the Sudoku grid
     */
    renderGrid() {
        this.dom.sudokuGrid.innerHTML = '';

        for (let row = 0; row < SudokuApp.GRID_SIZE; row++) {
            for (let col = 0; col < SudokuApp.GRID_SIZE; col++) {
                const cell = document.createElement('input');
                cell.type = 'text';
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.maxLength = 1;
                cell.inputMode = 'numeric';

                const value = this.userGrid[row][col];
                const isPrefilled = this.puzzle[row][col] !== 0;

                if (value !== 0) {
                    cell.value = value;
                }

                if (isPrefilled) {
                    cell.classList.add('prefilled');
                    cell.readOnly = true;
                    cell.tabIndex = -1;
                } else {
                    cell.tabIndex = 0;
                    cell.addEventListener('input', (e) => this.handleInput(e, row, col));
                    cell.addEventListener('keydown', (e) => this.handleCellKeydown(e, row, col));
                    cell.addEventListener('click', () => this.selectCell(cell));
                    cell.addEventListener('focus', () => this.selectCell(cell));
                }

                this.dom.sudokuGrid.appendChild(cell);
            }
        }
    }

    /**
     * Select a cell
     */
    selectCell(cell) {
        // Remove previous selection
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }

        this.selectedCell = cell;
        cell.classList.add('selected');

        if (!cell.readOnly) {
            cell.focus();
            cell.select();
        }
    }

    /**
     * Handle input in a cell
     */
    handleInput(e, row, col) {
        const input = e.target;
        let value = input.value;

        // Only allow numbers 1-4
        value = value.replace(/[^1-4]/g, '');

        if (value.length > 1) {
            value = value.slice(-1); // Keep only last digit
        }

        input.value = value;

        // Update user grid
        if (value === '') {
            this.userGrid[row][col] = 0;
        } else {
            this.userGrid[row][col] = parseInt(value);
        }

        // Clear validation states
        input.classList.remove('correct', 'incorrect');

        // Auto-check when all cells are filled
        this.autoCheckIfComplete();
    }

    /**
     * Handle keydown in a cell
     */
    handleCellKeydown(e, row, col) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            this.navigateGrid(e.key, row, col);
        }
    }

    /**
     * Handle keyboard input (global handler, now mostly for navigation)
     */
    handleKeyboard(e) {
        // Input is now handled by handleInput and handleCellKeydown
        // This is kept for backward compatibility
    }

    /**
     * Navigate grid with arrow keys
     */
    navigateGrid(key, currentRow, currentCol) {
        let newRow = currentRow;
        let newCol = currentCol;

        switch (key) {
            case 'ArrowUp':
                newRow = Math.max(0, currentRow - 1);
                break;
            case 'ArrowDown':
                newRow = Math.min(SudokuApp.GRID_SIZE - 1, currentRow + 1);
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, currentCol - 1);
                break;
            case 'ArrowRight':
                newCol = Math.min(SudokuApp.GRID_SIZE - 1, currentCol + 1);
                break;
        }

        const cells = this.dom.sudokuGrid.querySelectorAll('.sudoku-cell');
        const index = newRow * SudokuApp.GRID_SIZE + newCol;
        const targetCell = cells[index];

        if (targetCell) {
            // Skip prefilled cells
            if (targetCell.readOnly) {
                // Try to continue in the same direction
                if (key === 'ArrowUp' && newRow > 0) {
                    this.navigateGrid(key, newRow, newCol);
                } else if (key === 'ArrowDown' && newRow < SudokuApp.GRID_SIZE - 1) {
                    this.navigateGrid(key, newRow, newCol);
                } else if (key === 'ArrowLeft' && newCol > 0) {
                    this.navigateGrid(key, newRow, newCol);
                } else if (key === 'ArrowRight' && newCol < SudokuApp.GRID_SIZE - 1) {
                    this.navigateGrid(key, newRow, newCol);
                }
            } else {
                this.selectCell(targetCell);
            }
        }
    }

    /**
     * Check the solution
     */
    checkSolution() {
        let allCorrect = true;
        let allFilled = true;

        const cells = this.dom.sudokuGrid.querySelectorAll('.sudoku-cell:not(.prefilled)');

        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const userValue = this.userGrid[row][col];
            const correctValue = this.solution[row][col];

            if (userValue === 0) {
                allFilled = false;
                cell.classList.remove('correct', 'incorrect');
            } else if (userValue !== correctValue) {
                cell.classList.add('incorrect');
                cell.classList.remove('correct');
                allCorrect = false;
            } else {
                cell.classList.add('correct');
                cell.classList.remove('incorrect');
            }
        });

        if (!allFilled) {
            this.showMessage('⚠️ Noch nicht alle Felder ausgefüllt!');
        } else if (allCorrect) {
            this.puzzleSolved();
        } else {
            audioManager.playSuccessSound(false);
            this.showMessage('❌ Noch nicht ganz richtig! Versuche es nochmal!');
        }
    }

    /**
     * Auto-check if puzzle is complete
     */
    autoCheckIfComplete() {
        // Check if all cells are filled
        let allFilled = true;
        for (let row = 0; row < SudokuApp.GRID_SIZE; row++) {
            for (let col = 0; col < SudokuApp.GRID_SIZE; col++) {
                if (this.puzzle[row][col] === 0 && this.userGrid[row][col] === 0) {
                    allFilled = false;
                    break;
                }
            }
            if (!allFilled) break;
        }

        if (allFilled) {
            setTimeout(() => {
                this.checkSolution();
            }, 300);
        }
    }

    puzzleSolved() {
        this.puzzlesSolved++;

        const crowns = this.earnCrown();
        audioManager.playSuccessSound();

        const total = CrownManager.load();
        const message = `🎉 Geschafft! +${crowns} = ${total} Kronen! 👑`;
        showMilestoneCelebration(message);

        setTimeout(() => launchFireworks(), 500);
    }

    /**
     * Give a hint
     */
    giveHint() {
        // Find an empty cell
        const emptyCells = [];

        for (let row = 0; row < SudokuApp.GRID_SIZE; row++) {
            for (let col = 0; col < SudokuApp.GRID_SIZE; col++) {
                if (this.puzzle[row][col] === 0 && this.userGrid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }

        if (emptyCells.length === 0) {
            this.showMessage('💡 Keine Hinweise mehr verfügbar!');
            return;
        }

        // Pick random empty cell
        const hint = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const cells = this.dom.sudokuGrid.querySelectorAll('.sudoku-cell');
        const index = hint.row * SudokuApp.GRID_SIZE + hint.col;
        const hintCell = cells[index];

        // Fill in the correct number
        this.userGrid[hint.row][hint.col] = this.solution[hint.row][hint.col];
        hintCell.value = this.solution[hint.row][hint.col];
        hintCell.classList.add('hint');

        this.hintsUsed++;

        // Remove hint class after animation
        setTimeout(() => {
            hintCell.classList.remove('hint');
        }, 1500);
    }

    /**
     * Show message
     */
    showMessage(message) {
        this.dom.milestoneCelebration.textContent = message;
        this.dom.milestoneCelebration.classList.add('show');

        setTimeout(() => {
            this.dom.milestoneCelebration.classList.remove('show');
        }, 2000);
    }

    /**
     * Launch fireworks
     */
    // Fireworks now handled by shared.js launchFireworks() function

    earnCrown() {
        const reward = this.difficulty;
        CrownManager.earn(reward);
        CrownManager.updateDisplay(this.dom.crownCount);
        CrownManager.animateEarn(this.dom.crownCounter);
        return reward;
    }

    showCrownCounter() {
        CrownManager.showCounter(this.dom.crownCounter, this.dom.crownCount);
    }

    /**
     * Load progress
     */
    loadProgress() {
        const progress = ProgressTracker.getProgress('sudoku');
        if (progress.level) {
            this.dom.difficultySlider.value = progress.level;
        }
        this.updateDifficultyLabel();
    }

    /**
     * Save progress
     */
    saveProgress() {
        ProgressTracker.updateLevel('sudoku', this.difficulty);
    }
}

// Initialize app on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    const app = new SudokuApp();
    app.init();
});
