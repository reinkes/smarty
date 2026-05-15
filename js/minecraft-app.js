'use strict';

class MinecraftApp {
    constructor() {
        this.LIVES = 5;

        this.lives = this.LIVES;
        this.layers = [];
        this.rows = [];
        this.totalBlocks = 0;
        this.solvedBlocks = 0;
        this.activeBlock = null;

        this._pickaxeEl = null;
        this._swingTimeout = null;
        this._textures = {};

        this._init();
    }

    async _init() {
        const resp = await fetch('data/minecraft-layers.json');
        this.layers = await resp.json();
        this._generateTextures();
        this._buildGrid();
        this._setupCursor();
        this._setupOverlays();
        this._updateHUD();
    }

    // ── Pixel-Art Block Textures ──────────────────────────────

    _generateTextures() {
        ['gras', 'erde', 'stein', 'kohle', 'eisen', 'gold', 'diamant', 'chest', 'chest-gate']
            .forEach(id => { this._textures[id] = this._drawTexture(id); });
    }

    _drawTexture(type) {
        const c = document.createElement('canvas');
        c.width = 16; c.height = 16;
        const g = c.getContext('2d');
        const f = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };

        // Reusable stone base (used by all ore types)
        const stone = () => {
            f(0, 0, 16, 16, '#808080');
            // Two lighter quadrant patches
            f(0, 0, 8, 8, '#8B8B8B');
            f(8, 8, 8, 8, '#8B8B8B');
            // Crack lines
            f(8, 0, 1, 8, '#6B6B6B');
            f(0, 8, 8, 1, '#6B6B6B');
            f(0, 0, 1, 4, '#6B6B6B');
            f(1, 4, 3, 1, '#6B6B6B');
            f(9, 9, 4, 1, '#6B6B6B');
            f(13, 9, 1, 4, '#6B6B6B');
            f(9, 13, 4, 1, '#6B6B6B');
        };

        // Ore vein pattern (placed on top of stone)
        const ore = (col) => {
            f(2, 1, 3, 3, col); f(1, 2, 1, 1, col); f(4, 3, 1, 1, col);
            f(10, 5, 3, 3, col); f(9, 6, 1, 1, col); f(12, 7, 1, 1, col);
            f(3, 11, 3, 3, col); f(2, 12, 1, 1, col); f(5, 13, 1, 1, col);
            f(11, 10, 2, 2, col);
        };

        switch (type) {
            case 'gras':
                // Dirt body
                f(0, 0, 16, 16, '#8B6040');
                f(1, 5, 2, 2, '#7A5030'); f(5, 7, 3, 2, '#9A7050');
                f(10, 6, 2, 2, '#7A5030'); f(3, 10, 3, 2, '#9A7050');
                f(8, 11, 3, 2, '#7A5030'); f(13, 9, 2, 2, '#9A7050');
                f(6, 13, 2, 2, '#7A5030'); f(1, 14, 3, 1, '#9A7050');
                // Grass top strip
                f(0, 0, 16, 3, '#5D9B3C');
                f(1, 3, 14, 1, '#6AAF45');
                f(3, 0, 1, 2, '#6AAF45'); f(7, 1, 2, 1, '#4D8B2C');
                f(12, 0, 1, 1, '#6AAF45'); f(0, 1, 1, 1, '#4D8B2C');
                break;

            case 'erde':
                f(0, 0, 16, 16, '#8B6040');
                f(0, 0, 2, 2, '#7A5030'); f(3, 1, 3, 2, '#9A7050');
                f(8, 0, 2, 2, '#7A5030'); f(12, 1, 3, 2, '#9A7050');
                f(1, 4, 2, 3, '#9A7050'); f(5, 5, 3, 2, '#7A5030');
                f(10, 4, 2, 3, '#9A7050'); f(14, 5, 2, 2, '#7A5030');
                f(0, 8, 3, 2, '#7A5030'); f(4, 9, 3, 2, '#9A7050');
                f(9, 8, 2, 2, '#7A5030'); f(13, 9, 3, 2, '#9A7050');
                f(1, 12, 2, 3, '#9A7050'); f(6, 13, 3, 2, '#7A5030');
                f(11, 12, 3, 2, '#9A7050'); f(14, 13, 2, 2, '#7A5030');
                break;

            case 'stein': stone(); break;

            case 'kohle': stone(); ore('#1A1A1A'); break;

            case 'eisen': stone(); ore('#D4B483'); break;

            case 'gold': stone(); ore('#F9C81B'); break;

            case 'diamant': stone(); ore('#5CD9D0'); break;

            case 'chest':
                // Wood planks body
                f(0, 0, 16, 16, '#A87040');
                // Horizontal plank line
                f(0, 7, 16, 2, '#7A4E20');
                // Vertical plank lines (left half / right half)
                f(7, 0, 2, 7, '#7A4E20');
                f(7, 9, 2, 7, '#7A4E20');
                // Plank highlights/shadows for wood grain feel
                f(0, 2, 7, 1, '#C09060'); f(9, 3, 7, 1, '#C09060');
                f(0, 11, 7, 1, '#C09060'); f(9, 12, 7, 1, '#C09060');
                // Border highlight (top-left bevel)
                f(0, 0, 16, 1, '#C09060'); f(0, 0, 1, 16, '#C09060');
                f(0, 15, 16, 1, '#5A2E00'); f(15, 0, 1, 16, '#5A2E00');
                // Gold lock (centered)
                f(6, 5, 4, 6, '#D4AA00');
                f(7, 4, 2, 2, '#D4AA00');
                f(6, 7, 1, 2, '#A08000');
                f(9, 7, 1, 2, '#A08000');
                f(7, 10, 2, 1, '#A08000');
                f(7, 8, 2, 1, '#FFD800');
                break;

            case 'chest-gate':
                // Deepslate — dark stone
                f(0, 0, 16, 16, '#5A5A5A');
                f(0, 0, 8, 8, '#636363');
                f(8, 8, 8, 8, '#636363');
                f(8, 0, 1, 8, '#4A4A4A');
                f(0, 8, 8, 1, '#4A4A4A');
                f(0, 0, 1, 4, '#4A4A4A');
                f(1, 4, 3, 1, '#4A4A4A');
                f(9, 9, 4, 1, '#4A4A4A');
                f(13, 9, 1, 4, '#4A4A4A');
                break;
        }

        return c.toDataURL();
    }

    // ── Grid Construction ────────────────────────────────────

    _buildGrid() {
        const grid = document.getElementById('mine-grid');
        grid.innerHTML = '';
        this.rows = [];
        this.totalBlocks = 0;

        this.layers.forEach((layer) => {
            const divider = document.createElement('div');
            divider.className = 'layer-divider';
            divider.textContent = `── ${layer.emoji} ${layer.name.toUpperCase()} ──`;
            grid.appendChild(divider);

            if (layer.id === 'chest') {
                const chestRow = { layerId: 'chest', rowIndex: 0, blocks: [], isChestRow: true };

                const leftGate = this._createCalcBlock(layer, 'left');
                const chestBlock = this._createChestBlock();
                const rightGate = this._createCalcBlock(layer, 'right');

                chestRow.blocks = [leftGate.data, chestBlock.data, rightGate.data];
                grid.appendChild(leftGate.el);
                grid.appendChild(chestBlock.el);
                grid.appendChild(rightGate.el);

                leftGate.data.rowRef = chestRow;
                rightGate.data.rowRef = chestRow;

                this.rows.push(chestRow);
                this.totalBlocks += 2;
            } else {
                for (let r = 0; r < layer.rows; r++) {
                    const row = { layerId: layer.id, rowIndex: r, blocks: [] };
                    for (let c = 0; c < 3; c++) {
                        const { el, data } = this._createCalcBlock(layer, null);
                        data.rowRef = row;
                        row.blocks.push(data);
                        grid.appendChild(el);
                        this.totalBlocks++;
                    }
                    this.rows.push(row);
                }
            }
        });

        this.rows.forEach((row, i) => {
            if (i === 0) this._unlockRow(row); else this._lockRow(row);
        });
    }

    _generateCalc(math) {
        const op = math.operators[Math.floor(Math.random() * math.operators.length)];
        let a = this._rand(math.min, math.max);
        let b = this._rand(math.min, math.max);
        if (op === '-' && b > a) [a, b] = [b, a];
        if (op === '-' && a - b < 0) b = a;
        return { text: `${a} ${op} ${b} = ?`, answer: op === '+' ? a + b : a - b };
    }

    _applyTexture(el, textureKey) {
        const url = this._textures[textureKey];
        if (url) {
            el.style.backgroundImage = `url(${url})`;
            el.style.backgroundSize = '100% 100%';
        }
    }

    _createCalcBlock(layer, gateRole) {
        const calc = this._generateCalc(layer.math);
        const el = document.createElement('div');
        el.className = 'mc-block locked';

        this._applyTexture(el, gateRole ? 'chest-gate' : layer.id);

        el.innerHTML = `
            <div class="block-content">
                <span class="block-label">${layer.emoji} ${layer.name}</span>
                <div class="block-calc">${calc.text}</div>
                <div class="block-input-wrap">
                    <input class="block-input" type="number" inputmode="numeric" autocomplete="off" />
                </div>
            </div>`;

        const input = el.querySelector('.block-input');
        const data = { el, calc, input, solved: false, rowRef: null, gateRole, _autoTimer: null };

        el.addEventListener('click', () => this._onBlockClick(data));
        el.addEventListener('touchend', (e) => { e.preventDefault(); this._onBlockClick(data); }, { passive: false });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { this._clearAutoTimer(data); this._onSubmit(data); }
        });
        input.addEventListener('touchend', (e) => e.stopPropagation());
        // Auto-submit 1.5s after the user stops typing
        input.addEventListener('input', () => this._scheduleAutoSubmit(data));

        return { el, data };
    }

    _createChestBlock() {
        const el = document.createElement('div');
        el.className = 'mc-block block-chest chest-locked';
        this._applyTexture(el, 'chest');

        el.innerHTML = `
            <div class="block-content">
                <div class="chest-lock-icon">🔒</div>
                <div class="block-label">Schatztruhe</div>
            </div>`;

        return { el, data: { el, solved: true, isChest: true, gateRole: null } };
    }

    // ── Row Lock / Unlock ────────────────────────────────────

    _lockRow(row) { row.blocks.forEach(b => { if (!b.isChest) b.el.classList.add('locked'); }); }
    _unlockRow(row) { row.blocks.forEach(b => { if (!b.isChest) b.el.classList.remove('locked'); }); }

    // ── Block Interaction ────────────────────────────────────

    _onBlockClick(data) {
        if (data.solved || data.isChest || data.el.classList.contains('locked')) return;
        this._swingPickaxe();
        if (this.activeBlock && this.activeBlock !== data) this._deactivateBlock(this.activeBlock);
        this.activeBlock = data;
        data.el.querySelector('.block-input-wrap').classList.add('active');
        setTimeout(() => data.input.focus(), 50);
    }

    _scheduleAutoSubmit(data) {
        this._clearAutoTimer(data);
        if (data.input.value.trim() === '') return;
        // Show a subtle "charging" border on the input
        data.input.classList.add('charging');
        data._autoTimer = setTimeout(() => {
            data.input.classList.remove('charging');
            if (data.input.value.trim() !== '' && !data.solved) this._onSubmit(data);
        }, 1500);
    }

    _clearAutoTimer(data) {
        if (data._autoTimer) { clearTimeout(data._autoTimer); data._autoTimer = null; }
        data.input.classList.remove('charging');
    }

    _deactivateBlock(data) {
        this._clearAutoTimer(data);
        data.el.querySelector('.block-input-wrap').classList.remove('active');
        data.input.value = '';
        if (this.activeBlock === data) this.activeBlock = null;
    }

    _onSubmit(data) {
        const val = parseInt(data.input.value.trim(), 10);
        if (isNaN(val)) return;
        if (val === data.calc.answer) this._solveBlock(data);
        else this._wrongAnswer(data);
    }

    _solveBlock(data) {
        this._clearAutoTimer(data);
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
            if (row.blocks.every(b => b.solved || b.isChest)) {
                this._onRowComplete(row);
            }
        }, 400);

        if (this.activeBlock === data) this.activeBlock = null;
    }

    _wrongAnswer(data) {
        this._clearAutoTimer(data);
        this.lives--;
        data.input.value = '';
        data.el.classList.add('shake');
        setTimeout(() => data.el.classList.remove('shake'), 320);
        this._updateHUD();
        if (this.lives <= 0) setTimeout(() => this._gameOver(), 400);
    }

    _onRowComplete(row) {
        const rowIdx = this.rows.indexOf(row);
        const nextRow = this.rows[rowIdx + 1];

        if (row.isChestRow) {
            this._openChest(row);
            return;
        }

        if (nextRow) {
            setTimeout(() => {
                this._unlockRow(nextRow);
                if (nextRow.isChestRow) this._revealChestGates(nextRow);
            }, 300);
        }
    }

    _revealChestGates(chestRow) {
        const chest = chestRow.blocks.find(b => b.isChest);
        if (chest) {
            chest.el.classList.remove('chest-locked');
            chest.el.classList.add('chest-unlocked');
            chest.el.querySelector('.chest-lock-icon').textContent = '🔓';
        }
    }

    _openChest(chestRow) {
        const chest = chestRow.blocks.find(b => b.isChest);
        if (chest) {
            chest.el.classList.remove('chest-unlocked', 'chest-locked');
            chest.el.classList.add('chest-open');
            chest.el.querySelector('.chest-lock-icon').textContent = '💰';
        }
        setTimeout(() => this._win(), 700);
    }

    // ── HUD ─────────────────────────────────────────────────

    _updateHUD() {
        const el = document.getElementById('hud-hearts');
        el.textContent = '❤️'.repeat(this.lives) + '🖤'.repeat(this.LIVES - this.lives);
    }

    _updateDepthBar() {
        const bar = document.getElementById('depth-bar');
        if (bar) bar.style.height = Math.min((this.solvedBlocks / this.totalBlocks) * 100, 100) + '%';
    }

    // ── Cursor ───────────────────────────────────────────────

    _setupCursor() {
        this._pickaxeEl = document.getElementById('pickaxe-cursor');

        document.addEventListener('mousemove', function show() {
            this._pickaxeEl.style.display = 'block';
            document.removeEventListener('mousemove', show);
        }.bind(this));

        document.addEventListener('mousemove', (e) => {
            this._pickaxeEl.style.left = e.clientX + 'px';
            this._pickaxeEl.style.top = e.clientY + 'px';
        });

        document.addEventListener('mousedown', () => this._swingPickaxe());

        document.addEventListener('touchstart', () => {
            this._pickaxeEl.style.display = 'none';
            document.body.style.cursor = 'auto';
        }, { once: true });
    }

    _swingPickaxe() {
        if (!this._pickaxeEl) return;
        this._pickaxeEl.classList.remove('swing');
        void this._pickaxeEl.offsetWidth;
        this._pickaxeEl.classList.add('swing');
        clearTimeout(this._swingTimeout);
        this._swingTimeout = setTimeout(() => this._pickaxeEl.classList.remove('swing'), 240);
    }

    _updatePickaxeForDepth() {
        if (!this._pickaxeEl) return;
        const pct = this.solvedBlocks / this.totalBlocks;
        this._pickaxeEl.textContent = pct >= 0.88 ? '👑' : pct >= 0.62 ? '💎' : pct >= 0.42 ? '⚒️' : '⛏️';
    }

    // ── Game Over / Win ──────────────────────────────────────

    _gameOver() {
        document.getElementById('overlay-gameover').classList.remove('hidden');
    }

    _win() {
        const crownCountDispEl = document.getElementById('crownCount');
        const crownCounterEl = document.getElementById('crownCounter');
        const { reward, total } = CrownManager.earnAndDisplay(8, crownCountDispEl, crownCounterEl);
        document.getElementById('win-crowns').textContent = `+${reward} Kronen! (Gesamt: ${total})`;
        launchFireworks();
        document.getElementById('overlay-win').classList.remove('hidden');
    }

    _restart() {
        this.lives = this.LIVES;
        this.solvedBlocks = 0;
        this.activeBlock = null;
        this._updateHUD();
        this._updateDepthBar();
        if (this._pickaxeEl) this._pickaxeEl.textContent = '⛏️';
        document.getElementById('overlay-gameover').classList.add('hidden');
        document.getElementById('overlay-win').classList.add('hidden');
        this._buildGrid();
    }

    _setupOverlays() {
        document.getElementById('btn-restart-gameover').addEventListener('click', () => this._restart());
        document.getElementById('btn-restart-win').addEventListener('click', () => this._restart());
    }

    // ── Util ─────────────────────────────────────────────────

    _rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
}

document.addEventListener('DOMContentLoaded', () => { window._minecraftApp = new MinecraftApp(); });
