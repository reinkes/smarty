class SnakeApp {
    static GRID_SIZE = 15;
    static FOOD_EMOJIS = ['🍎', '🍐', '🍊', '🍋', '🍇', '🍓', '🍒', '🍑'];
    static SPEED_PRESETS = {
        1: { name: 'Langsam', interval: 200, cost: 1 },
        2: { name: 'Normal', interval: 140, cost: 2 },
        3: { name: 'Schnell', interval: 90, cost: 3 }
    };

    constructor() {
        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = null;
        this.foodEmoji = '';
        this.score = 0;
        this.speed = 2;
        this.gameInterval = null;
        this.running = false;
        this.cellSize = 0;

        this.dom = {};
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        this.updateSpeedLabel();
        CrownManager.showCounter(this.dom.crownCounter, this.dom.crownCount);
    }

    cacheDOMElements() {
        this.dom.speedSlider = document.getElementById('speedSlider');
        this.dom.speedValue = document.getElementById('speedValue');
        this.dom.crownCost = document.getElementById('crownCost');
        this.dom.startButton = document.getElementById('startButton');
        this.dom.gameArea = document.getElementById('gameArea');
        this.dom.canvas = document.getElementById('snakeCanvas');
        this.dom.ctx = this.dom.canvas.getContext('2d');
        this.dom.scoreValue = document.getElementById('scoreValue');
        this.dom.gameOverOverlay = document.getElementById('gameOverOverlay');
        this.dom.gameOverTitle = document.getElementById('gameOverTitle');
        this.dom.gameOverScore = document.getElementById('gameOverScore');
        this.dom.gameOverCost = document.getElementById('gameOverCost');
        this.dom.restartButton = document.getElementById('restartButton');
        this.dom.crownCounter = document.getElementById('crownCounter');
        this.dom.crownCount = document.getElementById('crownCount');
        this.dom.milestoneCelebration = document.getElementById('milestoneCelebration');
    }

    attachEventListeners() {
        this.dom.speedSlider.addEventListener('input', () => this.updateSpeedLabel());
        this.dom.startButton.addEventListener('click', () => this.startGame());
        this.dom.restartButton.addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        this.dom.canvas.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        this.dom.canvas.addEventListener('touchend', (e) => {
            if (!this.running) return;
            const dx = e.changedTouches[0].clientX - this.touchStartX;
            const dy = e.changedTouches[0].clientY - this.touchStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (Math.max(absDx, absDy) < 30) return;

            if (absDx > absDy) {
                if (dx > 0 && this.direction.x !== -1) {
                    this.nextDirection = { x: 1, y: 0 };
                } else if (dx < 0 && this.direction.x !== 1) {
                    this.nextDirection = { x: -1, y: 0 };
                }
            } else {
                if (dy > 0 && this.direction.y !== -1) {
                    this.nextDirection = { x: 0, y: 1 };
                } else if (dy < 0 && this.direction.y !== 1) {
                    this.nextDirection = { x: 0, y: -1 };
                }
            }
        }, { passive: true });
    }

    updateSpeedLabel() {
        this.speed = parseInt(this.dom.speedSlider.value);
        const preset = SnakeApp.SPEED_PRESETS[this.speed];
        this.dom.speedValue.textContent = preset.name;
        this.dom.crownCost.textContent = 'Kostet ' + preset.cost + ' 👑';
        this.dom.gameOverCost.textContent = 'Kostet ' + preset.cost + ' 👑';
    }

    getCost() {
        return SnakeApp.SPEED_PRESETS[this.speed].cost;
    }

    startGame() {
        const cost = this.getCost();
        const crowns = CrownManager.load();

        if (crowns < cost) {
            showMilestoneCelebration('Nicht genug Kronen! Du brauchst ' + cost + ' 👑');
            return;
        }

        CrownManager.earn(-cost);
        CrownManager.updateDisplay(this.dom.crownCount);

        this.stopGame();
        this.resetState();
        this.resizeCanvas();
        this.dom.gameArea.classList.add('active');
        this.dom.gameOverOverlay.classList.remove('active');
        this.dom.gameArea.scrollIntoView({ behavior: 'smooth' });
        this.running = true;

        const preset = SnakeApp.SPEED_PRESETS[this.speed];
        this.gameInterval = setInterval(() => this.tick(), preset.interval);
        this.draw();
    }

    resetState() {
        const mid = Math.floor(SnakeApp.GRID_SIZE / 2);
        this.snake = [
            { x: mid, y: mid },
            { x: mid - 1, y: mid },
            { x: mid - 2, y: mid }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.dom.scoreValue.textContent = '0';
        this.placeFood();
    }

    resizeCanvas() {
        const container = this.dom.canvas.parentElement;
        const maxWidth = container.clientWidth - 6;
        const size = Math.min(450, maxWidth);
        this.dom.canvas.width = size;
        this.dom.canvas.height = size;
        this.cellSize = size / SnakeApp.GRID_SIZE;
    }

    placeFood() {
        const occupied = new Set(this.snake.map(s => s.x + ',' + s.y));
        const free = [];
        for (let x = 0; x < SnakeApp.GRID_SIZE; x++) {
            for (let y = 0; y < SnakeApp.GRID_SIZE; y++) {
                if (!occupied.has(x + ',' + y)) {
                    free.push({ x, y });
                }
            }
        }
        if (free.length === 0) return;
        this.food = free[Math.floor(Math.random() * free.length)];
        this.foodEmoji = SnakeApp.FOOD_EMOJIS[Math.floor(Math.random() * SnakeApp.FOOD_EMOJIS.length)];
    }

    tick() {
        this.direction = { ...this.nextDirection };

        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };

        if (newHead.x < 0 || newHead.x >= SnakeApp.GRID_SIZE ||
            newHead.y < 0 || newHead.y >= SnakeApp.GRID_SIZE) {
            this.gameOver();
            return;
        }

        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === newHead.x && this.snake[i].y === newHead.y) {
                this.gameOver();
                return;
            }
        }

        this.snake.unshift(newHead);

        if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score++;
            this.dom.scoreValue.textContent = this.score;
            audioManager.playSuccessSound();
            this.placeFood();
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    draw() {
        const ctx = this.dom.ctx;
        const cs = this.cellSize;

        ctx.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);

        ctx.fillStyle = '#F1F8E9';
        ctx.fillRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);

        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= SnakeApp.GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cs, 0);
            ctx.lineTo(i * cs, this.dom.canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * cs);
            ctx.lineTo(this.dom.canvas.width, i * cs);
            ctx.stroke();
        }

        for (let i = this.snake.length - 1; i >= 0; i--) {
            const seg = this.snake[i];
            const x = seg.x * cs;
            const y = seg.y * cs;
            const padding = 1;

            if (i === 0) {
                ctx.fillStyle = '#2E7D32';
                ctx.beginPath();
                ctx.roundRect(x + padding, y + padding, cs - padding * 2, cs - padding * 2, 4);
                ctx.fill();

                ctx.fillStyle = '#1B5E20';
                const eyeSize = cs * 0.15;
                const eyeOffset = cs * 0.25;

                if (this.direction.x === 1) {
                    ctx.beginPath();
                    ctx.arc(x + cs - eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x + cs - eyeOffset, y + cs - eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                } else if (this.direction.x === -1) {
                    ctx.beginPath();
                    ctx.arc(x + eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x + eyeOffset, y + cs - eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                } else if (this.direction.y === -1) {
                    ctx.beginPath();
                    ctx.arc(x + eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x + cs - eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.arc(x + eyeOffset, y + cs - eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x + cs - eyeOffset, y + cs - eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                const brightness = 0.6 + 0.4 * (1 - i / this.snake.length);
                const g = Math.round(160 * brightness);
                ctx.fillStyle = 'rgb(50,' + g + ',50)';
                ctx.beginPath();
                ctx.roundRect(x + padding, y + padding, cs - padding * 2, cs - padding * 2, 3);
                ctx.fill();
            }
        }

        if (this.food) {
            const fontSize = cs * 0.7;
            ctx.font = fontSize + 'px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                this.foodEmoji,
                this.food.x * cs + cs / 2,
                this.food.y * cs + cs / 2
            );
        }
    }

    handleKeydown(e) {
        if (!this.running) return;

        switch (e.key) {
            case 'ArrowUp':
                if (this.direction.y !== 1) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                e.preventDefault();
                break;
            case 'ArrowDown':
                if (this.direction.y !== -1) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                e.preventDefault();
                break;
            case 'ArrowLeft':
                if (this.direction.x !== 1) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                e.preventDefault();
                break;
            case 'ArrowRight':
                if (this.direction.x !== -1) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                e.preventDefault();
                break;
        }
    }

    gameOver() {
        this.stopGame();
        this.running = false;

        this.dom.gameOverScore.textContent = 'Punkte: ' + this.score;

        if (this.score >= 10) {
            this.dom.gameOverTitle.textContent = '🎉 Super gemacht!';
            setTimeout(() => launchFireworks(), 300);
        } else {
            this.dom.gameOverTitle.textContent = '💀 Spiel vorbei!';
        }

        this.dom.gameOverOverlay.classList.add('active');
    }

    stopGame() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const app = new SnakeApp();
    app.init();
});
