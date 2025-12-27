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

        // Crown achievement system
        this.crownsEarned = 0;
        this.loadCrowns();

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

    /**
     * Create puzzle by removing numbers
     */
    createPuzzle(solution, clues) {
        const puzzle = solution.map(row => [...row]);
        const totalCells = SudokuApp.GRID_SIZE * SudokuApp.GRID_SIZE;
        const cellsToRemove = totalCells - clues;

        // Get all cell positions
        const positions = [];
        for (let row = 0; row < SudokuApp.GRID_SIZE; row++) {
            for (let col = 0; col < SudokuApp.GRID_SIZE; col++) {
                positions.push({ row, col });
            }
        }

        // Shuffle positions
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        // Remove numbers
        for (let i = 0; i < cellsToRemove; i++) {
            const { row, col } = positions[i];
            puzzle[row][col] = 0;
        }

        return puzzle;
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

        // If all filled, check solution automatically
        if (allFilled) {
            console.log('All cells filled, auto-checking solution...');
            setTimeout(() => {
                this.checkSolution();
            }, 300);
        }
    }

    /**
     * Puzzle successfully solved
     */
    puzzleSolved() {
        console.log('🎉 Sudoku solved!');
        this.puzzlesSolved++;

        // Earn crowns based on difficulty
        const crowns = this.earnCrown();
        console.log(`Earned ${crowns} crowns, total: ${this.crownsEarned}`);

        // Play success sound
        audioManager.playSuccessSound();

        // Show celebration message like Math and German apps
        const crownEmojis = '👑'.repeat(crowns);
        const message = `🎉 Geschafft! Super gelöst! +${crowns} = ${this.crownsEarned} Kronen! ${crownEmojis}`;
        console.log('Celebration message:', message);

        if (this.dom.milestoneCelebration) {
            console.log('Showing milestone celebration');
            this.dom.milestoneCelebration.textContent = message;
            this.dom.milestoneCelebration.style.display = 'block';
            this.dom.milestoneCelebration.classList.add('show');

            setTimeout(() => {
                this.dom.milestoneCelebration.classList.remove('show');
                setTimeout(() => {
                    this.dom.milestoneCelebration.style.display = '';
                }, 1500);
            }, 4000); // Increased from 3000 to 4000ms
        } else {
            console.error('milestoneCelebration element not found!');
        }

        // Launch fireworks using shared function
        setTimeout(() => {
            if (typeof launchFireworks === 'function') {
                console.log('Launching fireworks');
                launchFireworks();
            } else {
                console.error('launchFireworks function not found!');
            }
        }, 500);
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

    /**
     * Calculate crown reward based on difficulty
     */
    calculateCrownReward() {
        // Sudoku: 1 crown for easy, 2 for medium, 3 for hard
        return this.difficulty;
    }

    /**
     * Earn crowns
     */
    earnCrown() {
        const reward = this.calculateCrownReward();
        this.crownsEarned += reward;
        this.saveCrowns();
        this.updateCrownDisplay();

        // Animate crown counter
        if (this.dom.crownCounter) {
            this.dom.crownCounter.classList.add('earn');
            setTimeout(() => {
                this.dom.crownCounter.classList.remove('earn');
            }, 600);
        }

        return reward;
    }

    /**
     * Load crowns from localStorage
     */
    loadCrowns() {
        const saved = localStorage.getItem('smarty-crowns');
        this.crownsEarned = saved ? parseInt(saved) : 0;
    }

    /**
     * Save crowns to localStorage
     */
    saveCrowns() {
        localStorage.setItem('smarty-crowns', this.crownsEarned.toString());
    }

    /**
     * Update crown display
     */
    updateCrownDisplay() {
        if (this.dom.crownCount) {
            this.dom.crownCount.textContent = this.crownsEarned;
        }
    }

    /**
     * Show crown counter
     */
    showCrownCounter() {
        if (this.dom.crownCounter) {
            this.dom.crownCounter.style.display = 'flex';
            this.updateCrownDisplay();
        }
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
