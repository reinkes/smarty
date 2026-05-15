'use strict';

class MinecraftApp {
    constructor() {
        this.LIVES = 5;
        this.CROWN_REWARD = 10;

        this.lives = this.LIVES;
        this.layers = [];
        this.rows = [];      // flat list of row objects: { layerId, rowIndex, blocks[] }
        this.totalBlocks = 0;
        this.solvedBlocks = 0;
        this.activeBlock = null;

        this._pickaxeEl = null;
        this._swingTimeout = null;

        this._init();
    }

    async _init() {
        const resp = await fetch('data/minecraft-layers.json');
        this.layers = await resp.json();
        this._buildGrid();
        this._setupCursor();
        this._setupOverlays();
        this._updateHUD();
    }

    // ── Grid Construction ──────────────────────────────────────

    _buildGrid() {
        const grid = document.getElementById('mine-grid');
        grid.innerHTML = '';
        this.rows = [];
        this.totalBlocks = 0;

        this.layers.forEach((layer, layerIdx) => {
            // Layer divider label
            const divider = document.createElement('div');
            divider.className = 'layer-divider';
            divider.textContent = `── ${layer.emoji} ${layer.name} ──`;
            grid.appendChild(divider);

            if (layer.id === 'chest') {
                // Special chest row: [gate-block] [chest] [gate-block]
                const chestRow = { layerId: layer.id, rowIndex: 0, blocks: [], isChestRow: true };

                const leftGate = this._createCalcBlock(layer, layerIdx, 0, 'left');
                const chestBlock = this._createChestBlock();
                const rightGate = this._createCalcBlock(layer, layerIdx, 1, 'right');

                chestRow.blocks = [leftGate.data, chestBlock.data, rightGate.data];

                grid.appendChild(leftGate.el);
                grid.appendChild(chestBlock.el);
                grid.appendChild(rightGate.el);

                leftGate.data.rowRef = chestRow;
                rightGate.data.rowRef = chestRow;

                this.rows.push(chestRow);
                this.totalBlocks += 2; // only the two gate blocks
            } else {
                for (let r = 0; r < layer.rows; r++) {
                    const row = { layerId: layer.id, rowIndex: r, blocks: [] };

                    for (let c = 0; c < 3; c++) {
                        const { el, data } = this._createCalcBlock(layer, layerIdx, r * 3 + c, null);
                        data.rowRef = row;
                        row.blocks.push(data);
                        grid.appendChild(el);
                        this.totalBlocks++;
                    }

                    this.rows.push(row);
                }
            }
        });

        // Lock all rows except first
        this.rows.forEach((row, i) => {
            if (i === 0) {
                this._unlockRow(row);
            } else {
                this._lockRow(row);
            }
        });
    }

    _generateCalc(math) {
        const op = math.operators[Math.floor(Math.random() * math.operators.length)];
        let a = this._rand(math.min, math.max);
        let b = this._rand(math.min, math.max);
        if (op === '-' && b > a) [a, b] = [b, a];
        if (op === '-' && a - b < 0) b = a; // prevent negatives
        const answer = op === '+' ? a + b : a - b;
        return { text: `${a} ${op} ${b} = ?`, answer };
    }

    _createCalcBlock(layer, layerIdx, blockIdx, gateRole) {
        const calc = this._generateCalc(layer.math);
        const el = document.createElement('div');
        const cssClass = gateRole ? 'block-chest-gate' : layer.blockClass;
        el.className = `mc-block ${cssClass} locked`;

        el.innerHTML = `
            <div class="block-content">
                <span class="block-label">${layer.emoji} ${layer.name}</span>
                <div class="block-calc">${calc.text}</div>
                <div class="block-input-wrap">
                    <input class="block-input" type="number" inputmode="numeric" autocomplete="off" />
                    <button class="block-submit-btn">✓</button>
                </div>
            </div>`;

        const input = el.querySelector('.block-input');
        const submitBtn = el.querySelector('.block-submit-btn');
        const data = { el, calc, input, solved: false, rowRef: null, gateRole };

        el.addEventListener('click', () => this._onBlockClick(data));
        el.addEventListener('touchend', (e) => { e.preventDefault(); this._onBlockClick(data); }, { passive: false });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this._onSubmit(data);
        });
        input.addEventListener('touchend', (e) => e.stopPropagation());
        submitBtn.addEventListener('click', (e) => { e.stopPropagation(); this._onSubmit(data); });
        submitBtn.addEventListener('touchend', (e) => { e.preventDefault(); e.stopPropagation(); this._onSubmit(data); }, { passive: false });

        return { el, data };
    }

    _createChestBlock() {
        const el = document.createElement('div');
        el.className = 'mc-block block-chest chest-locked';
        el.innerHTML = `
            <div class="block-content">
                <div class="chest-lock-icon">🔒</div>
                <div class="block-label">Schatztruhe</div>
            </div>`;

        const data = { el, solved: true, isChest: true, gateRole: null }; // chest itself never needs solving
        return { el, data };
    }

    // ── Row Lock / Unlock ──────────────────────────────────────

    _lockRow(row) {
        row.blocks.forEach(b => {
            if (!b.isChest) b.el.classList.add('locked');
        });
    }

    _unlockRow(row) {
        row.blocks.forEach(b => {
            if (!b.isChest) b.el.classList.remove('locked');
        });
    }

    // ── Block Interaction ──────────────────────────────────────

    _onBlockClick(data) {
        if (data.solved || data.isChest || data.el.classList.contains('locked')) return;

        this._swingPickaxe();

        if (this.activeBlock && this.activeBlock !== data) {
            this._deactivateBlock(this.activeBlock);
        }

        this.activeBlock = data;
        data.el.querySelector('.block-input-wrap').classList.add('active');
        setTimeout(() => data.input.focus(), 50);
    }

    _deactivateBlock(data) {
        data.el.querySelector('.block-input-wrap').classList.remove('active');
        data.input.value = '';
        if (this.activeBlock === data) this.activeBlock = null;
    }

    _onSubmit(data) {
        const val = parseInt(data.input.value.trim(), 10);
        if (isNaN(val)) return;

        if (val === data.calc.answer) {
            this._solveBlock(data);
        } else {
            this._wrongAnswer(data);
        }
    }

    _solveBlock(data) {
        data.solved = true;
        data.input.blur();
        data.el.classList.add('breaking');

        setTimeout(() => {
            data.el.classList.add('solved');
            data.el.classList.remove('breaking');
            this.solvedBlocks++;
            this._updateDepthBar();
            this._updatePickaxeForDepth();

            const row = data.rowRef;
            const rowSolvedNow = row.blocks.every(b => b.solved || b.isChest);

            if (rowSolvedNow) {
                this._onRowComplete(row);
            }
        }, 420);

        if (this.activeBlock === data) this.activeBlock = null;
    }

    _wrongAnswer(data) {
        this.lives--;
        data.input.value = '';
        data.el.classList.add('shake');
        setTimeout(() => data.el.classList.remove('shake'), 360);
        this._updateHUD();

        if (this.lives <= 0) {
            setTimeout(() => this._gameOver(), 400);
        }
    }

    _onRowComplete(row) {
        const rowIdx = this.rows.indexOf(row);
        const nextRow = this.rows[rowIdx + 1];

        if (nextRow) {
            setTimeout(() => this._unlockRow(nextRow), 300);
        }

        // Check if it's the last non-chest row (rows before chest row)
        if (row.isChestRow) {
            // Chest row gate blocks solved → open chest
            this._openChest(row);
        } else if (nextRow && nextRow.isChestRow) {
            // Next row is chest row: unlock its gate blocks
            setTimeout(() => {
                this._unlockChestGates(nextRow);
            }, 300);
        }
    }

    _unlockChestGates(chestRow) {
        chestRow.blocks.forEach(b => {
            if (!b.isChest) b.el.classList.remove('locked');
        });
        // Update chest icon
        const chestBlock = chestRow.blocks.find(b => b.isChest);
        if (chestBlock) {
            chestBlock.el.classList.remove('chest-locked');
            chestBlock.el.classList.add('chest-unlocked');
            chestBlock.el.querySelector('.chest-lock-icon').textContent = '🔓';
        }
    }

    _openChest(chestRow) {
        const chestBlock = chestRow.blocks.find(b => b.isChest);
        if (chestBlock) {
            chestBlock.el.classList.remove('chest-unlocked', 'chest-locked');
            chestBlock.el.classList.add('chest-open');
            chestBlock.el.querySelector('.chest-lock-icon').textContent = '💰';
        }
        setTimeout(() => this._win(), 800);
    }

    // ── HUD ──────────────────────────────────────────────────

    _updateHUD() {
        const heartsEl = document.getElementById('hud-hearts');
        const full = '❤️';
        const empty = '🖤';
        heartsEl.textContent = full.repeat(this.lives) + empty.repeat(this.LIVES - this.lives);
    }

    _updateDepthBar() {
        const bar = document.getElementById('depth-bar');
        if (!bar) return;
        const pct = (this.solvedBlocks / this.totalBlocks) * 100;
        bar.style.height = Math.min(pct, 100) + '%';
    }

    // ── Cursor ──────────────────────────────────────────────

    _setupCursor() {
        this._pickaxeEl = document.getElementById('pickaxe-cursor');

        // Only show on first real mouse move (not touch)
        const onFirstMove = (e) => {
            this._pickaxeEl.style.display = 'block';
            document.removeEventListener('mousemove', onFirstMove);
        };
        document.addEventListener('mousemove', onFirstMove);

        document.addEventListener('mousemove', (e) => {
            this._pickaxeEl.style.left = e.clientX + 'px';
            this._pickaxeEl.style.top = e.clientY + 'px';
        });
        document.addEventListener('mousedown', () => this._swingPickaxe());

        // On touch devices: hide custom cursor and restore system cursor
        document.addEventListener('touchstart', () => {
            this._pickaxeEl.style.display = 'none';
            document.body.style.cursor = 'auto';
        }, { once: true });
    }

    _swingPickaxe() {
        if (!this._pickaxeEl) return;
        this._pickaxeEl.classList.remove('swing');
        void this._pickaxeEl.offsetWidth; // reflow to restart animation
        this._pickaxeEl.classList.add('swing');
        clearTimeout(this._swingTimeout);
        this._swingTimeout = setTimeout(() => this._pickaxeEl.classList.remove('swing'), 260);
    }

    _updatePickaxeForDepth() {
        if (!this._pickaxeEl) return;
        const pct = this.solvedBlocks / this.totalBlocks;
        if (pct >= 0.9) {
            this._pickaxeEl.textContent = '👑';
        } else if (pct >= 0.65) {
            this._pickaxeEl.textContent = '💎';
        } else if (pct >= 0.45) {
            this._pickaxeEl.textContent = '⚒️';
        } else {
            this._pickaxeEl.textContent = '⛏️';
        }
    }

    // ── Game Over / Win ───────────────────────────────────────

    _gameOver() {
        document.getElementById('overlay-gameover').classList.remove('hidden');
    }

    _win() {
        const crownCountEl = document.getElementById('win-crowns');
        const crownCounterEl = document.getElementById('crownCounter');
        const crownCountDispEl = document.getElementById('crownCount');

        const { reward, total } = CrownManager.earnAndDisplay(8, crownCountDispEl, crownCounterEl);
        crownCountEl.textContent = `+${reward} Kronen! (Gesamt: ${total} 👑)`;

        launchFireworks();
        document.getElementById('overlay-win').classList.remove('hidden');
    }

    _restart() {
        this.lives = this.LIVES;
        this.solvedBlocks = 0;
        this.activeBlock = null;
        this._updateHUD();
        this._updateDepthBar();
        this._pickaxeEl.textContent = '⛏️';
        document.getElementById('overlay-gameover').classList.add('hidden');
        document.getElementById('overlay-win').classList.add('hidden');
        this._buildGrid();
    }

    // ── Overlays ──────────────────────────────────────────────

    _setupOverlays() {
        document.getElementById('btn-restart-gameover').addEventListener('click', () => this._restart());
        document.getElementById('btn-restart-win').addEventListener('click', () => this._restart());
    }

    // ── Util ──────────────────────────────────────────────────

    _rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window._minecraftApp = new MinecraftApp();
});
