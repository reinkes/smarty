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

        if (this.dom.checkButton) {
            this.dom.checkButton.addEventListener('click', () => this.checkSolution());
        }

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
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                const value = this.userGrid[row][col];
                const isPrefilled = this.puzzle[row][col] !== 0;

                if (value !== 0) {
                    cell.textContent = value;
                }

                if (isPrefilled) {
                    cell.classList.add('prefilled');
                } else {
                    cell.tabIndex = 0;
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
        cell.focus();
    }

    /**
     * Handle keyboard input
     */
    handleKeyboard(e) {
        if (!this.selectedCell || this.selectedCell.classList.contains('prefilled')) {
            return;
        }

        const key = e.key;
        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);

        if (key >= '1' && key <= '4') {
            // Input number
            const num = parseInt(key);
            this.userGrid[row][col] = num;
            this.selectedCell.textContent = num;
            this.selectedCell.classList.remove('incorrect', 'correct');
        } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
            // Clear cell
            this.userGrid[row][col] = 0;
            this.selectedCell.textContent = '';
            this.selectedCell.classList.remove('incorrect', 'correct');
        } else if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
            // Navigate
            e.preventDefault();
            this.navigateGrid(key, row, col);
        }
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

        if (targetCell && !targetCell.classList.contains('prefilled')) {
            this.selectCell(targetCell);
        }
    }

    /**
     * Check the solution
     */
    checkSolution() {
        let allCorrect = true;
        let allFilled = true;

        const cells = this.dom.sudokuGrid.querySelectorAll('.sudoku-cell');

        cells.forEach(cell => {
            if (cell.classList.contains('prefilled')) return;

            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const userValue = this.userGrid[row][col];
            const correctValue = this.solution[row][col];

            if (userValue === 0) {
                allFilled = false;
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
     * Puzzle successfully solved
     */
    puzzleSolved() {
        this.puzzlesSolved++;

        // Earn crowns based on difficulty
        const crowns = this.earnCrown();

        // Show celebration
        audioManager.playSuccessSound();
        this.showMessage(`🎉 Geschafft! Super gelöst! +${crowns} 👑`);

        // Launch fireworks
        setTimeout(() => {
            this.launchFireworks(crowns);
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
        hintCell.textContent = this.solution[hint.row][hint.col];
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
    launchFireworks(crownsEarned = 0) {
        if (!this.dom.fireworksContainer) return;

        this.dom.fireworksContainer.classList.add('active');

        const colors = ['#4CAF50', '#26A69A', '#66BB6A', '#FFC107', '#81C784'];
        let fireworkCount = 0;
        const maxFireworks = 15;

        const fireworkInterval = setInterval(() => {
            if (fireworkCount >= maxFireworks) {
                clearInterval(fireworkInterval);
                setTimeout(() => {
                    this.dom.fireworksContainer.classList.remove('active');
                    this.dom.fireworksContainer.innerHTML = '';
                }, 2000);
                return;
            }

            this.createFirework(colors[fireworkCount % colors.length]);
            fireworkCount++;
        }, 200);
    }

    /**
     * Create a single firework
     */
    createFirework(color) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (window.innerHeight * 0.5);

        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = x + 'px';
        firework.style.top = y + 'px';
        firework.style.backgroundColor = color;
        this.dom.fireworksContainer.appendChild(firework);

        setTimeout(() => {
            firework.remove();
            this.createExplosion(x, y, color);
        }, 800);
    }

    /**
     * Create explosion
     */
    createExplosion(x, y, color) {
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 100 + Math.random() * 100;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.backgroundColor = color;
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');

            this.dom.fireworksContainer.appendChild(particle);

            setTimeout(() => particle.remove(), 1000);
        }
    }

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
