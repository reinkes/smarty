'use strict';

class MinecraftApp {
    constructor() {
        this.LIVES = 5;
        this.CROWN_LEVEL = 8;

        this.lives = this.LIVES;
        this.layers = [];
        this.rows = [];
        this.totalBlocks = 0;
        this.solvedBlocks = 0;
        this.activeBlock = null;
        this.isOver = false;
        this.checkpointRow = null;
        this.currentToolId = null;

        // Debris colours per block type (base + accent)
        this.PARTICLE_COLORS = {
            gras: ['#5D9B3C', '#8B6040'], erde: ['#8B6040', '#7A5030'],
            stein: ['#808080', '#6B6B6B'], kohle: ['#808080', '#1A1A1A'],
            eisen: ['#808080', '#D4B483'], gold: ['#808080', '#F9C81B'],
            diamant: ['#808080', '#5CD9D0'], gate: ['#5A5A5A', '#4A4A4A']
        };

        this._pickaxeEl = null;
        this._swingTimeout = null;
        this._textures = {};

        this._init();
    }

    async _init() {
        this._setupCursor();
        this._setupOverlays();
        CrownManager.updateDisplay(document.getElementById('crownCount'));

        try {
            const resp = await fetch('data/minecraft-layers.json');
            if (!resp.ok) throw new Error(resp.status);
            this.layers = await resp.json();
        } catch (e) {
            document.getElementById('mine-grid').textContent = '⚠️ Die Mine konnte nicht geladen werden.';
            return;
        }

        this._generateTextures();
        this._buildGrid(0);
        this._updateHUD();
    }

    // ── Pixel-Art Block Textures ──────────────────────────────

    _generateTextures() {
        ['gras', 'erde', 'stein', 'kohle', 'eisen', 'gold', 'diamant', 'chest', 'chest-gate', 'apple', 'bed', 'crack1', 'crack2', 'crack3']
            .forEach(id => { this._textures[id] = this._drawTexture(id); });
    }

    _drawTexture(type) {
        const c = document.createElement('canvas');
        c.width = 16; c.height = 16;
        const g = c.getContext('2d');
        const f = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };

        // Crack overlays (transparent), each stage adds to the previous one
        if (type.startsWith('crack')) {
            const stage = Number(type.slice(5));
            const col = 'rgba(0, 0, 0, 0.75)';
            f(7, 5, 1, 4, col); f(8, 8, 3, 1, col); f(6, 9, 1, 2, col);
            if (stage >= 2) {
                f(4, 3, 3, 1, col); f(3, 4, 1, 3, col); f(11, 8, 1, 4, col);
                f(9, 12, 2, 1, col); f(5, 11, 1, 3, col);
            }
            if (stage >= 3) {
                f(1, 1, 3, 1, col); f(12, 2, 3, 1, col); f(13, 3, 1, 3, col);
                f(1, 13, 2, 1, col); f(13, 13, 2, 2, col); f(2, 7, 2, 1, col); f(10, 4, 2, 1, col);
            }
            return c.toDataURL();
        }

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

            case 'apple':
                // Golden apple on transparent background
                f(7, 1, 2, 3, '#6B4226');                       // stem
                f(9, 2, 3, 1, '#4CAF50'); f(10, 3, 2, 1, '#2E7D32'); // leaf
                f(4, 4, 3, 1, '#F9D71C'); f(9, 4, 3, 1, '#F9D71C');
                f(3, 5, 10, 1, '#F9D71C');
                f(2, 6, 12, 6, '#F9D71C');
                f(3, 12, 10, 1, '#F9D71C');
                f(4, 13, 8, 1, '#F9D71C');
                f(5, 14, 2, 1, '#D4A017'); f(9, 14, 2, 1, '#D4A017');
                // Shading (right / bottom)
                f(12, 6, 2, 6, '#D4A017'); f(10, 12, 3, 1, '#D4A017'); f(8, 13, 4, 1, '#D4A017');
                // Highlight
                f(4, 6, 2, 2, '#FFF6A8'); f(4, 8, 1, 1, '#FFF6A8');
                break;

            case 'bed':
                // Red bed (side view) — Minecraft respawn point
                f(1, 3, 2, 10, '#8B5A2B');                      // headboard
                f(3, 6, 4, 3, '#F0F0F0'); f(3, 8, 4, 1, '#C8C8C8'); // pillow
                f(7, 5, 8, 4, '#C62828'); f(7, 5, 8, 1, '#E53935'); // blanket
                f(7, 8, 8, 1, '#8E0000');
                f(1, 9, 14, 2, '#A0522D');                      // frame
                f(1, 11, 14, 1, '#6B3A1E');
                f(1, 12, 2, 2, '#6B3A1E'); f(13, 12, 2, 2, '#6B3A1E'); // legs
                break;
        }

        return c.toDataURL();
    }

    // ── Grid Construction ────────────────────────────────────

    /** Builds the mine. Rows before startRow are already mined (respawn at a checkpoint). */
    _buildGrid(startRow) {
        const grid = document.getElementById('mine-grid');
        grid.innerHTML = '';
        this.rows = [];
        this.totalBlocks = 0;
        this.solvedBlocks = 0;

        this.layers.forEach((layer) => {
            const divider = document.createElement('div');
            divider.className = 'layer-divider';
            divider.textContent = `── ${layer.emoji} ${layer.name.toUpperCase()} ──`;
            grid.appendChild(divider);

            const layerRows = [];

            if (layer.id === 'chest') {
                const chestRow = { layer, blocks: [], isChestRow: true };

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
                    const row = { layer, blocks: [] };
                    for (let c = 0; c < 3; c++) {
                        const { el, data } = this._createCalcBlock(layer, null);
                        data.rowRef = row;
                        row.blocks.push(data);
                        grid.appendChild(el);
                        this.totalBlocks++;
                    }
                    this.rows.push(row);
                    layerRows.push(row);
                }
            }

            this._placeItems(layer, layerRows, startRow);
        });

        this.rows.forEach((row, i) => {
            if (i < startRow) {
                row.blocks.forEach(b => {
                    if (b.isChest) return;
                    b.solved = true;
                    b.el.classList.add('solved');
                    this.solvedBlocks++;
                });
            } else if (i === startRow) {
                this._unlockRow(row);
            } else {
                this._lockRow(row);
            }
        });

        this._updateDepthBar();
        this._setTool(this.rows[startRow].layer.tool, false);
        if (startRow > 0) this._scrollToRow(this.rows[startRow]);
    }

    /** Hides golden apples / checkpoints inside random blocks of a layer. */
    _placeItems(layer, layerRows, startRow) {
        if (!layer.items) return;
        const candidates = [];
        layerRows.forEach(row => {
            const rowIdx = this.rows.indexOf(row);
            if (rowIdx < startRow) return;
            row.blocks.forEach(b => candidates.push({ b, rowIdx }));
        });

        Object.entries(layer.items).forEach(([type, count]) => {
            for (let i = 0; i < count && candidates.length; i++) {
                const pick = candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0];
                // A checkpoint we already respawned from must not show up again
                if (type === 'checkpoint' && this.checkpointRow !== null && pick.rowIdx <= this.checkpointRow) continue;
                pick.b.item = type;
            }
        });
    }

    /** Numbers stay within the layer's range: sums never exceed max, differences never go below 0. */
    _generateCalc(math) {
        const op = math.operators[Math.floor(Math.random() * math.operators.length)];
        if (op === '+') {
            const a = this._rand(math.min, math.max - math.min);
            const b = this._rand(math.min, math.max - a);
            return { text: `${a} + ${b} = ?`, answer: a + b };
        }
        const a = this._rand(math.min, math.max);
        const b = this._rand(Math.min(math.min, a), a);
        return { text: `${a} - ${b} = ?`, answer: a - b };
    }

    _applyTexture(el, textureKey) {
        const url = this._textures[textureKey];
        if (url) el.style.backgroundImage = `url(${url})`;
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
                    <input class="block-input" type="number" inputmode="numeric" autocomplete="off" aria-label="Ergebnis" />
                </div>
            </div>`;

        const input = el.querySelector('.block-input');
        const data = { el, calc, input, solved: false, rowRef: null, gateRole, item: null, _autoTimer: null };

        el.addEventListener('click', () => this._onBlockClick(data));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { this._clearAutoTimer(data); this._onSubmit(data); }
        });
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

    _scrollToRow(row) {
        row.blocks[0].el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ── Block Interaction ────────────────────────────────────

    _onBlockClick(data) {
        if (this.isOver || data.solved || data.isChest || data.el.classList.contains('locked')) return;
        this._swingPickaxe();
        if (this.activeBlock && this.activeBlock !== data) this._deactivateBlock(this.activeBlock);
        this.activeBlock = data;
        data.el.classList.add('active');
        data.el.querySelector('.block-input-wrap').classList.add('active');
        // Focus synchronously so mobile browsers open the keyboard
        data.input.focus();
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
        data.el.classList.remove('active');
        data.el.querySelector('.block-input-wrap').classList.remove('active');
        data.input.value = '';
        if (this.activeBlock === data) this.activeBlock = null;
    }

    _onSubmit(data) {
        if (this.isOver || data.solved) return;
        const val = parseInt(data.input.value.trim(), 10);
        if (isNaN(val)) return;
        if (val === data.calc.answer) this._solveBlock(data);
        else this._wrongAnswer(data);
    }

    async _solveBlock(data) {
        this._clearAutoTimer(data);
        data.solved = true;
        data.input.blur();
        data.el.classList.remove('active');
        data.el.querySelector('.block-input-wrap').classList.remove('active');
        if (this.activeBlock === data) this.activeBlock = null;

        await this._strikeBlock(data);
        this._spawnParticles(data, 10);
        data.el.classList.add('breaking');

        setTimeout(() => {
            data.el.classList.add('solved');
            data.el.classList.remove('breaking');
            data.el.style.removeProperty('--crack');
            if (data.item) this._revealItem(data);
            this.solvedBlocks++;
            this._updateDepthBar();

            const row = data.rowRef;
            if (row.blocks.every(b => b.solved || b.isChest)) {
                this._onRowComplete(row);
            }
        }, 400);
    }

    /** The current tool flies to the block and hits it three times, cracking it further each hit. */
    async _strikeBlock(data) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const sleep = ms => new Promise(res => setTimeout(res, ms));
        const r = data.el.getBoundingClientRect();
        const size = r.width * 0.5;

        const tool = document.createElement('div');
        tool.className = 'strike-tool';
        tool.textContent = '⛏️';
        tool.dataset.tool = this.currentToolId;
        tool.style.fontSize = size + 'px';
        const from = this._toolOrigin();
        tool.style.left = from.x + 'px';
        tool.style.top = from.y + 'px';
        document.body.appendChild(tool);
        document.body.classList.add('striking');

        await sleep(20);
        tool.style.left = (r.right - size * 1.1) + 'px';
        tool.style.top = (r.top - size * 0.15) + 'px';
        await sleep(260);

        for (let stage = 1; stage <= 3; stage++) {
            tool.classList.remove('hit');
            void tool.offsetWidth;
            tool.classList.add('hit');
            await sleep(90);
            data.el.style.setProperty('--crack', `url(${this._textures['crack' + stage]})`);
            this._spawnParticles(data, 3);
            await sleep(90);
        }

        tool.classList.add('leave');
        setTimeout(() => {
            tool.remove();
            if (!document.querySelector('.strike-tool')) document.body.classList.remove('striking');
        }, 250);
    }

    /** Where the flying tool starts: the mouse pickaxe if visible, otherwise the HUD tool icon. */
    _toolOrigin() {
        const src = document.body.classList.contains('custom-cursor')
            ? this._pickaxeEl
            : document.getElementById('hud-tool');
        const r = src.getBoundingClientRect();
        return { x: r.left, y: r.top };
    }

    _spawnParticles(data, count) {
        const r = data.el.getBoundingClientRect();
        const colors = this.PARTICLE_COLORS[data.gateRole ? 'gate' : data.rowRef.layer.id];
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'mc-particle';
            p.style.left = (r.left + r.width * (0.3 + Math.random() * 0.4)) + 'px';
            p.style.top = (r.top + r.height * (0.3 + Math.random() * 0.4)) + 'px';
            p.style.background = colors[i % colors.length];
            p.style.setProperty('--dx', ((Math.random() * 2 - 1) * r.width * 0.6) + 'px');
            p.style.setProperty('--dy', (-Math.random() * r.height * 0.5) + 'px');
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 700);
        }
    }

    _wrongAnswer(data) {
        this._clearAutoTimer(data);
        this.lives = Math.max(0, this.lives - 1);
        data.input.value = '';
        data.el.classList.add('shake');
        setTimeout(() => data.el.classList.remove('shake'), 320);
        this._updateHUD('hurt');
        if (this.lives === 0) {
            this.isOver = true;
            data.input.blur();
            setTimeout(() => this._gameOver(), 400);
        }
    }

    _onRowComplete(row) {
        if (row.isChestRow) {
            this._openChest(row);
            return;
        }

        const nextRow = this.rows[this.rows.indexOf(row) + 1];
        if (!nextRow) return;

        setTimeout(() => {
            this._unlockRow(nextRow);
            if (nextRow.isChestRow) this._revealChestGates(nextRow);
            if (nextRow.layer !== row.layer) this._setTool(nextRow.layer.tool, true);
            this._scrollToRow(nextRow);
        }, 300);
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
        this.isOver = true;
        const chest = chestRow.blocks.find(b => b.isChest);
        if (chest) {
            chest.el.classList.remove('chest-unlocked', 'chest-locked');
            chest.el.classList.add('chest-open');
            chest.el.querySelector('.chest-lock-icon').textContent = '💰';
        }
        setTimeout(() => this._win(), 700);
    }

    // ── Items: Golden Apples & Checkpoints ───────────────────

    _revealItem(data) {
        const isApple = data.item === 'apple';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `mc-item item-${data.item}`;
        btn.title = isApple ? 'Goldener Apfel: +1 Herz' : 'Bett: Checkpoint';
        btn.innerHTML = `
            <img src="${this._textures[isApple ? 'apple' : 'bed']}" alt="">
            <span class="item-label">${isApple ? 'Goldener Apfel' : 'Checkpoint'}</span>`;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._pickUpItem(data, btn);
        });
        data.el.appendChild(btn);
    }

    _pickUpItem(data, btn) {
        if (this.isOver) return;
        this._swingPickaxe();

        if (data.item === 'apple') {
            if (this.lives >= this.LIVES) {
                showMilestoneCelebration('❤️ Herzen sind voll!');
                btn.classList.add('wobble');
                setTimeout(() => btn.classList.remove('wobble'), 400);
                return;
            }
            this.lives++;
            this._updateHUD('heal');
            showMilestoneCelebration('🍏 +1 Herz!');
        } else {
            this.checkpointRow = this.rows.indexOf(data.rowRef);
            document.getElementById('hud-checkpoint').classList.remove('hidden');
            showMilestoneCelebration('🛏️ Checkpoint!');
        }

        data.item = null;
        btn.classList.add('picked');
        setTimeout(() => btn.remove(), 350);
    }

    // ── HUD ─────────────────────────────────────────────────

    _updateHUD(effect) {
        const el = document.getElementById('hud-hearts');
        el.textContent = '❤️'.repeat(this.lives) + '🖤'.repeat(this.LIVES - this.lives);
        if (effect) {
            el.classList.remove('hurt', 'heal');
            void el.offsetWidth;
            el.classList.add(effect);
        }
    }

    _updateDepthBar() {
        const bar = document.getElementById('depth-bar');
        if (bar) bar.style.height = Math.min((this.solvedBlocks / this.totalBlocks) * 100, 100) + '%';
    }

    _setTool(tool, announce) {
        if (tool.id === this.currentToolId) return;
        this.currentToolId = tool.id;
        if (this._pickaxeEl) this._pickaxeEl.dataset.tool = tool.id;
        document.getElementById('hud-tool').dataset.tool = tool.id;
        document.getElementById('hud-tool').title = tool.name;
        if (announce) showMilestoneCelebration(`⛏️ ${tool.name}!`);
    }

    // ── Cursor ───────────────────────────────────────────────

    _setupCursor() {
        this._pickaxeEl = document.getElementById('pickaxe-cursor');

        // Custom pickaxe only for real mice; touch keeps the native behaviour
        document.addEventListener('pointermove', (e) => {
            if (e.pointerType !== 'mouse') return;
            document.body.classList.add('custom-cursor');
            this._pickaxeEl.style.left = e.clientX + 'px';
            this._pickaxeEl.style.top = e.clientY + 'px';
        });

        document.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse') this._swingPickaxe();
            else document.body.classList.remove('custom-cursor');
        });
    }

    _swingPickaxe() {
        if (!this._pickaxeEl) return;
        this._pickaxeEl.classList.remove('swing');
        void this._pickaxeEl.offsetWidth;
        this._pickaxeEl.classList.add('swing');
        clearTimeout(this._swingTimeout);
        this._swingTimeout = setTimeout(() => this._pickaxeEl.classList.remove('swing'), 240);
    }

    // ── Game Over / Win ──────────────────────────────────────

    _gameOver() {
        document.getElementById('btn-respawn').classList.toggle('hidden', this.checkpointRow === null);
        document.getElementById('overlay-gameover').classList.remove('hidden');
    }

    _win() {
        const { reward, total } = CrownManager.earnAndDisplay(
            this.CROWN_LEVEL,
            document.getElementById('crownCount'),
            document.getElementById('crownCounter')
        );
        document.getElementById('win-crowns').textContent = `+${reward} Kronen! (Gesamt: ${total})`;
        launchFireworks();
        document.getElementById('overlay-win').classList.remove('hidden');
    }

    _restart(fromCheckpoint) {
        if (!fromCheckpoint) {
            this.checkpointRow = null;
            document.getElementById('hud-checkpoint').classList.add('hidden');
        }
        this.lives = this.LIVES;
        this.activeBlock = null;
        this.isOver = false;
        this._updateHUD();
        document.getElementById('overlay-gameover').classList.add('hidden');
        document.getElementById('overlay-win').classList.add('hidden');
        if (!fromCheckpoint) document.getElementById('mine-viewport').scrollTop = 0;
        this._buildGrid(fromCheckpoint ? this.checkpointRow : 0);
    }

    _setupOverlays() {
        document.getElementById('btn-respawn').addEventListener('click', () => this._restart(true));
        document.getElementById('btn-restart-gameover').addEventListener('click', () => this._restart(false));
        document.getElementById('btn-restart-win').addEventListener('click', () => this._restart(false));
    }

    // ── Util ─────────────────────────────────────────────────

    _rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
}

document.addEventListener('DOMContentLoaded', () => { window._minecraftApp = new MinecraftApp(); });
