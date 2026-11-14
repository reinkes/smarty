'use strict';

/**
 * Mathetest (Klasse 2)
 * A test made of sections, one per task type. Each task type is a module with
 * generate(level) and render(task, root). render() returns a checker:
 *   { inputs: [HTMLInputElement], check(): boolean }
 * check() marks the UI (correct/incorrect, reveals solutions) and returns
 * whether the whole task was solved.
 */

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};
const MINUS = '−';

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function numberInput(answer, label) {
    const input = document.createElement('input');
    input.type = 'number';
    input.inputMode = 'numeric';
    input.autocomplete = 'off';
    input.placeholder = '?';
    input.className = 'mt-input';
    input.dataset.answer = String(answer);
    if (label) input.setAttribute('aria-label', label);
    return input;
}

// Marks a single input; on a wrong answer the solution replaces the value so
// the child sees what would have been right.
function markInput(input) {
    const ok = input.value !== '' && parseInt(input.value, 10) === parseInt(input.dataset.answer, 10);
    const target = input.closest('.mt-cell') || input;
    target.classList.add(ok ? 'correct' : 'incorrect');
    if (!ok) input.value = input.dataset.answer;
    input.disabled = true;
    return ok;
}

function inputsChecker(inputs) {
    return {
        inputs,
        check: () => inputs.map(markInput).every(Boolean)
    };
}

// Renders "a op b = [input]" style rows; parts are strings or {input}.
function renderEquation(root, parts) {
    const row = el('div', 'mt-equation');
    const inputs = [];
    parts.forEach(part => {
        if (typeof part === 'string') {
            row.appendChild(el('span', 'mt-term', part));
        } else {
            const cell = el('span', 'mt-cell');
            const input = numberInput(part.answer, part.label);
            cell.appendChild(input);
            row.appendChild(cell);
            inputs.push(input);
        }
    });
    root.appendChild(row);
    return inputs;
}

const crossesTen = (a, b, op) => op === '+' ? (a % 10) + (b % 10) >= 10 : (a % 10) < (b % 10);

// ============================================
// TASK TYPES
// ============================================

const TASK_TYPES = [
    {
        id: 'pm20',
        title: 'Plus und Minus bis 20',
        icon: '➕',
        instruction: 'Rechne aus!',
        generate(level) {
            const withCrossing = level >= 4 && Math.random() < 0.7;
            const op = Math.random() < 0.5 ? '+' : MINUS;
            let a, b, result;
            do {
                if (op === '+') {
                    a = rand(2, 18);
                    b = rand(1, 20 - a);
                    result = a + b;
                } else {
                    a = rand(3, 20);
                    b = rand(1, a - 1);
                    result = a - b;
                }
            } while (crossesTen(a, b, op) !== withCrossing);
            return { a, b, op, result };
        },
        render(task, root) {
            const inputs = renderEquation(root, [`${task.a} ${task.op} ${task.b} =`, { answer: task.result }]);
            return inputsChecker(inputs);
        }
    },
    {
        id: 'nachbarzehner',
        title: 'Nachbarzehner',
        icon: '🏠',
        instruction: 'Schreibe die Nachbarzehner auf!',
        generate(level) {
            const max = level <= 3 ? 50 : 99;
            let n;
            do { n = rand(11, max); } while (n % 10 === 0);
            return { n, lower: Math.floor(n / 10) * 10, upper: Math.ceil(n / 10) * 10 };
        },
        render(task, root) {
            const inputs = renderEquation(root, [
                { answer: task.lower, label: `Kleinerer Nachbarzehner von ${task.n}` },
                '<',
                `${task.n}`,
                '<',
                { answer: task.upper, label: `Größerer Nachbarzehner von ${task.n}` }
            ]);
            return inputsChecker(inputs);
        }
    },
    {
        id: 'pm100',
        title: 'Plus und Minus bis 100',
        icon: '💯',
        instruction: 'Rechne aus! (ohne Zehnerübergang)',
        generate(level) {
            // Level 1-3: ZE ± Z or ZE ± E; Level 4+: also ZE ± ZE
            const kind = level <= 3 ? pick(['Z', 'E']) : pick(['Z', 'E', 'ZE', 'ZE']);
            const op = Math.random() < 0.5 ? '+' : MINUS;
            let a, b, result;
            do {
                a = rand(11, 89);
                b = kind === 'Z' ? rand(1, 8) * 10 : kind === 'E' ? rand(1, 9) : rand(11, 88);
                result = op === '+' ? a + b : a - b;
            } while (result < 1 || result > 100 || crossesTen(a, b, op) || a % 10 === 0);
            return { a, b, op, result };
        },
        render(task, root) {
            const inputs = renderEquation(root, [`${task.a} ${task.op} ${task.b} =`, { answer: task.result }]);
            return inputsChecker(inputs);
        }
    },
    {
        id: 'zehneruebergang',
        title: 'Plusaufgaben über den Zehner',
        icon: '🚀',
        instruction: 'Rechne aus! Achtung, Zehnerübergang!',
        generate(level) {
            const twoDigit = level >= 5 && Math.random() < 0.6;
            let a, b;
            do {
                a = twoDigit ? rand(11, 78) : rand(11, 88);
                b = twoDigit ? rand(11, 89 - a) : rand(2, 9);
            } while (!crossesTen(a, b, '+') || a + b > 100 || a % 10 === 0);
            return { a, b, op: '+', result: a + b };
        },
        render(task, root) {
            const inputs = renderEquation(root, [`${task.a} + ${task.b} =`, { answer: task.result }]);
            return inputsChecker(inputs);
        }
    },
    {
        id: 'tabelle',
        title: 'Tabellenrechnen',
        icon: '📋',
        instruction: 'Fülle die Tabelle aus!',
        generate(level) {
            const size = level <= 5 ? 2 : 3;
            const allowCrossing = level >= 4;
            const allowMinus = level >= 3;
            let ops, starts;
            const valid = () => starts.every(s => ops.every(o => {
                const r = o.op === '+' ? s + o.n : s - o.n;
                return r >= 0 && r <= 100 && (allowCrossing || !crossesTen(s, o.n, o.op));
            }));
            let tries = 0;
            do {
                const seen = new Set();
                ops = [];
                while (ops.length < size) {
                    const op = allowMinus && Math.random() < 0.4 ? MINUS : '+';
                    const n = Math.random() < 0.5 ? rand(1, 8) * 10 : rand(2, 9);
                    if (seen.has(op + n)) continue;
                    seen.add(op + n);
                    ops.push({ op, n });
                }
                starts = shuffle(Array.from({ length: 80 }, (_, i) => i + 11)).slice(0, size);
                tries++;
            } while (!valid() && tries < 500);
            return { ops, starts };
        },
        render(task, root) {
            // Reuses the Additions-Tabelle grid styles (theme-tabelle.css)
            const wrap = el('div', 'table-wrapper');
            const grid = el('div', 'addition-grid');
            grid.style.gridTemplateColumns = `repeat(${task.ops.length + 1}, 1fr)`;
            const inputs = [];

            grid.appendChild(el('div', 'grid-cell corner-cell', ''));
            task.ops.forEach(o => grid.appendChild(el('div', 'grid-cell header-cell col-header', `${o.op}${o.n}`)));
            task.starts.forEach(s => {
                grid.appendChild(el('div', 'grid-cell header-cell row-header', String(s)));
                task.ops.forEach(o => {
                    const cell = el('div', 'grid-cell result-cell mt-cell');
                    const answer = o.op === '+' ? s + o.n : s - o.n;
                    const input = numberInput(answer, `${s} ${o.op} ${o.n}`);
                    cell.appendChild(input);
                    grid.appendChild(cell);
                    inputs.push(input);
                });
            });

            wrap.appendChild(grid);
            root.appendChild(wrap);
            return inputsChecker(inputs);
        }
    },
    {
        id: 'zahlenmauer',
        title: 'Zahlenmauer',
        icon: '🧱',
        instruction: 'Zwei Steine nebeneinander ergeben den Stein darüber.',
        generate(level) {
            const rows = level >= 8 ? 4 : 3;
            const max = level <= 5 ? 20 : 100;
            const onlyBase = level <= 3 || level === 8;

            // values[r][i], r = 0 is the bottom row
            let values;
            do {
                const base = Array.from({ length: rows }, () => rand(1, rows === 3 ? Math.floor(max / 3) : Math.floor(max / 7)));
                values = [base];
                for (let r = 1; r < rows; r++) {
                    const below = values[r - 1];
                    values.push(below.slice(1).map((v, i) => below[i] + v));
                }
            } while (values[rows - 1][0] > max || values[rows - 1][0] < max / 3);

            const cells = [];
            values.forEach((row, r) => row.forEach((_, i) => cells.push([r, i])));

            let given;
            if (onlyBase) {
                given = new Set(values[0].map((_, i) => `0,${i}`));
            } else {
                // Pick `rows` random givens until the wall is uniquely solvable
                // and at least one base stone must be found by subtracting.
                do {
                    given = new Set(shuffle(cells.slice()).slice(0, rows).map(([r, i]) => `${r},${i}`));
                } while (!this.solvable(rows, given) || values[0].every((_, i) => given.has(`0,${i}`)));
            }
            return { rows, values, given: [...given] };
        },
        // Propagates a + b = top through the wall; solvable if every stone gets known.
        solvable(rows, givenSet) {
            const known = new Set(givenSet);
            let changed = true;
            while (changed) {
                changed = false;
                for (let r = 1; r < rows; r++) {
                    for (let i = 0; i < rows - r; i++) {
                        const trio = [`${r},${i}`, `${r - 1},${i}`, `${r - 1},${i + 1}`];
                        const missing = trio.filter(k => !known.has(k));
                        if (missing.length === 1) {
                            known.add(missing[0]);
                            changed = true;
                        }
                    }
                }
            }
            return known.size === rows * (rows + 1) / 2;
        },
        render(task, root) {
            const given = new Set(task.given);
            const wall = el('div', 'mt-wall');
            const inputs = [];
            // Top row first; inputs ordered bottom-up so kids work upwards
            const rowsTopDown = [];
            for (let r = task.rows - 1; r >= 0; r--) {
                const row = el('div', 'mt-wall-row');
                task.values[r].forEach((v, i) => {
                    const stone = el('div', 'mt-stone');
                    if (given.has(`${r},${i}`)) {
                        stone.classList.add('given');
                        stone.textContent = String(v);
                    } else {
                        stone.classList.add('mt-cell');
                        const input = numberInput(v, `Stein in Reihe ${r + 1}`);
                        stone.appendChild(input);
                        inputs.push({ r, input });
                    }
                    row.appendChild(stone);
                });
                rowsTopDown.push(row);
            }
            rowsTopDown.forEach(row => wall.appendChild(row));
            root.appendChild(wall);
            const ordered = inputs.sort((x, y) => x.r - y.r).map(x => x.input);
            return inputsChecker(ordered);
        }
    },
    {
        id: 'blume',
        title: 'Blumenaufgaben',
        icon: '🌸',
        instruction: 'Rechne mit der Zahl in der Mitte!',
        generate(level) {
            const petals = level <= 4 ? 4 : 6;
            const op = level >= 3 && Math.random() < 0.4 ? MINUS : '+';
            const n = level <= 3 ? rand(2, 5) : Math.random() < 0.5 ? rand(2, 9) : rand(1, 5) * 10;
            const reverse = level >= 7;
            const inner = [];
            const seen = new Set();
            while (inner.length < petals) {
                const v = level <= 2 ? rand(1, 20 - n) : rand(op === MINUS ? n + 1 : 1, op === '+' ? 100 - n : 99);
                if (seen.has(v)) continue;
                if (level <= 3 && crossesTen(v, n, op)) continue;
                seen.add(v);
                inner.push(v);
            }
            const outer = inner.map(v => op === '+' ? v + n : v - n);
            // From level 7 some inner petals are blank: kids reverse the operation
            const blankInner = new Set(reverse ? shuffle([...inner.keys()]).slice(0, Math.floor(petals / 3)) : []);
            return { op, n, inner, outer, blankInner: [...blankInner] };
        },
        render(task, root) {
            const flower = el('div', 'mt-flower');
            const count = task.inner.length;
            const blankInner = new Set(task.blankInner);
            const inputs = [];
            flower.appendChild(el('div', 'mt-flower-center', `${task.op}${task.n}`));
            task.inner.forEach((v, i) => {
                const angle = (360 / count) * i - 90;
                const innerEl = el('div', 'mt-petal inner');
                const outerEl = el('div', 'mt-petal outer');
                innerEl.style.setProperty('--angle', `${angle}deg`);
                outerEl.style.setProperty('--angle', `${angle}deg`);
                if (blankInner.has(i)) {
                    innerEl.classList.add('mt-cell');
                    const input = numberInput(v, `Inneres Blatt: ? ${task.op} ${task.n} = ${task.outer[i]}`);
                    innerEl.appendChild(input);
                    inputs.push(input);
                    outerEl.textContent = String(task.outer[i]);
                    outerEl.classList.add('given');
                } else {
                    innerEl.textContent = String(v);
                    outerEl.classList.add('mt-cell');
                    const input = numberInput(task.outer[i], `${v} ${task.op} ${task.n}`);
                    outerEl.appendChild(input);
                    inputs.push(input);
                }
                flower.appendChild(innerEl);
                flower.appendChild(outerEl);
            });
            root.appendChild(flower);
            return inputsChecker(inputs);
        }
    },
    {
        id: 'fehler',
        title: 'Finde den Fehler',
        icon: '🔍',
        instruction: '',
        generate(level) {
            const errors = level <= 4 ? 1 : 2;
            const source = level <= 3 ? TASK_TYPES[0] : pick([TASK_TYPES[2], TASK_TYPES[3]]);
            const rows = [];
            const keys = new Set();
            while (rows.length < 6) {
                const t = source.generate(level);
                const key = `${t.a}${t.op}${t.b}`;
                if (keys.has(key)) continue;
                keys.add(key);
                rows.push({ a: t.a, b: t.b, op: t.op, result: t.result, shown: t.result });
            }
            // Typical kid mistakes: off by ten (forgot a ten) or off by one
            shuffle([...rows.keys()]).slice(0, errors).forEach(i => {
                const r = rows[i];
                const deltas = [10, -10, 1, -1].filter(d => r.result + d >= 0 && r.result + d <= 100);
                r.shown = r.result + pick(deltas);
            });
            return { rows, errors };
        },
        render(task, root) {
            root.querySelector('.mt-instruction').textContent =
                `Tippe ${task.errors === 1 ? 'die falsche Aufgabe' : 'die 2 falschen Aufgaben'} an und verbessere!`;
            const list = el('div', 'mt-error-list');
            const rowEls = task.rows.map(r => {
                // A div, not a <button>: inputs inside buttons can't be focused in Firefox
                const row = el('div', 'mt-error-row');
                row.setAttribute('role', 'button');
                row.tabIndex = 0;
                row.appendChild(el('span', 'mt-term', `${r.a} ${r.op} ${r.b} = ${r.shown}`));
                const fix = el('span', 'mt-cell mt-fix');
                const input = numberInput(r.result, `Verbesserung für ${r.a} ${r.op} ${r.b}`);
                fix.appendChild(input);
                row.appendChild(fix);
                const toggle = () => {
                    if (row.classList.contains('locked')) return;
                    row.classList.toggle('marked');
                    if (row.classList.contains('marked')) input.focus();
                };
                row.addEventListener('click', e => { if (e.target !== input) toggle(); });
                row.addEventListener('keydown', e => {
                    if (e.target === row && (e.key === ' ' || e.key === 'Enter')) {
                        e.preventDefault();
                        e.stopPropagation();
                        toggle();
                    }
                });
                list.appendChild(row);
                return { row, input, data: r };
            });
            root.appendChild(list);

            return {
                get inputs() {
                    return rowEls.filter(x => x.row.classList.contains('marked')).map(x => x.input);
                },
                check() {
                    let allOk = true;
                    rowEls.forEach(({ row, input, data }) => {
                        const wrong = data.shown !== data.result;
                        const marked = row.classList.contains('marked');
                        row.classList.add('locked');
                        row.tabIndex = -1;
                        input.disabled = true;
                        if (wrong) {
                            const fixed = marked && parseInt(input.value, 10) === data.result;
                            row.classList.add('marked', fixed ? 'correct' : 'incorrect');
                            if (!fixed) input.value = data.result;
                            allOk = allOk && fixed;
                        } else if (marked) {
                            row.classList.add('incorrect', 'false-alarm');
                            allOk = false;
                        }
                    });
                    return allOk;
                }
            };
        }
    },
    {
        id: 'rechenstrich',
        title: 'Aufgaben am Rechenstrich',
        icon: '📏',
        instruction: 'Rechne in Schritten: erst die Zehner, dann die Einer.',
        generate(level) {
            const op = level >= 3 && Math.random() < 0.5 ? MINUS : '+';
            let a, b, result;
            do {
                a = rand(12, 88);
                b = rand(11, 59);
                result = op === '+' ? a + b : a - b;
            } while (result < 1 || result > 100 || b % 10 === 0 || (level <= 5 && crossesTen(a, b, op)));
            const tens = b - (b % 10);
            const ones = b % 10;
            const mid = op === '+' ? a + tens : a - tens;
            return { a, b, op, tens, ones, mid, result, blankJumps: level >= 7 };
        },
        render(task, root) {
            root.appendChild(el('div', 'mt-equation mt-term', `${task.a} ${task.op} ${task.b} = ?`));

            const strich = el('div', 'mt-strich');
            const arcs = el('div', 'mt-arcs');
            const line = el('div', 'mt-line');
            const stops = el('div', 'mt-stops');

            // Jumps are laid out left to right in number order; for minus the
            // child jumps right-to-left, so the ones jump sits on the left.
            const jumps = task.op === '+' ? [task.tens, task.ones] : [task.ones, task.tens];
            const frac = Math.min(0.7, Math.max(0.3, jumps[0] / task.b));
            const points = task.op === '+'
                ? [task.a, task.mid, task.result]
                : [task.result, task.mid, task.a];

            const jumpInputs = [];
            jumps.forEach((size, i) => {
                const arc = el('div', `mt-arc ${task.op === '+' ? 'forward' : 'backward'}`);
                arc.style.width = `${(i === 0 ? frac : 1 - frac) * 100}%`;
                const label = el('div', 'mt-arc-label');
                if (task.blankJumps) {
                    label.classList.add('mt-cell');
                    const input = numberInput(size, `Sprung um ${size}`);
                    label.appendChild(el('span', '', task.op));
                    label.appendChild(input);
                    jumpInputs.push({ size, input });
                } else {
                    label.textContent = `${task.op}${size}`;
                }
                arc.appendChild(label);
                arcs.appendChild(arc);
            });

            const stopInputs = {};
            points.forEach((v, i) => {
                const stop = el('div', 'mt-stop');
                stop.style.left = `${[0, frac, 1][i] * 100}%`;
                line.appendChild(el('div', 'mt-line-tick')).style.left = stop.style.left;
                if (v === task.a) {
                    stop.textContent = String(v);
                    stop.classList.add('given');
                } else {
                    stop.classList.add('mt-cell');
                    const input = numberInput(v, v === task.mid ? 'Zwischenergebnis' : 'Ergebnis');
                    stop.appendChild(input);
                    stopInputs[v === task.mid ? 'mid' : 'end'] = input;
                }
                stops.appendChild(stop);
            });

            strich.appendChild(arcs);
            strich.appendChild(line);
            strich.appendChild(stops);
            root.appendChild(strich);

            // Order follows the calculation: tens jump, stop, ones jump, result
            const byJump = size => jumpInputs.filter(j => j.size === size).map(j => j.input);
            const ordered = [...byJump(task.tens), stopInputs.mid, ...byJump(task.ones), stopInputs.end];
            return inputsChecker(ordered);
        }
    }
];

// ============================================
// APP
// ============================================

class MathetestApp {
    static TASKS_PER_SECTION = 3;
    static PRACTICE_TASKS = 6;

    constructor() {
        this.level = 1;
        this.tasks = [];
        this.index = 0;
        this.checker = null;
        this.checked = false;
        this.isTest = true;
        this.dom = {};
    }

    init() {
        const ids = ['difficultySlider', 'difficultyValue', 'startTestBtn', 'topicGrid', 'setupCard',
            'taskCard', 'sectionTitle', 'progressFill', 'progressText', 'taskBody', 'feedback',
            'checkBtn', 'nextBtn', 'resultCard', 'resultStars', 'resultSummary', 'resultCrowns',
            'resultList', 'againBtn', 'menuBtn', 'quitBtn', 'crownCounter', 'crownCount'];
        ids.forEach(id => { this.dom[id] = document.getElementById(id); });

        this.level = ProgressTracker.getProgress('mathetest').level || 1;
        this.dom.difficultySlider.value = this.level;
        this.updateDifficultyLabel();
        CrownManager.showCounter(this.dom.crownCounter, this.dom.crownCount);

        TASK_TYPES.forEach(type => {
            const btn = el('button', 'mt-topic');
            btn.type = 'button';
            btn.appendChild(el('span', 'mt-topic-icon', type.icon));
            btn.appendChild(el('span', '', type.title));
            btn.addEventListener('click', () => this.start([type]));
            this.dom.topicGrid.appendChild(btn);
        });

        this.dom.difficultySlider.addEventListener('input', () => this.updateDifficultyLabel());
        this.dom.startTestBtn.addEventListener('click', () => this.start(TASK_TYPES));
        this.dom.checkBtn.addEventListener('click', () => this.check());
        this.dom.nextBtn.addEventListener('click', () => this.next());
        this.dom.againBtn.addEventListener('click', () => this.start(this.lastTypes));
        this.dom.menuBtn.addEventListener('click', () => this.show('setupCard'));
        this.dom.quitBtn.addEventListener('click', () => this.show('setupCard'));
        this.dom.taskBody.addEventListener('keydown', e => this.onKeyDown(e));
        document.addEventListener('keydown', e => {
            if (e.key === 'Enter' && this.checked && !this.dom.taskCard.hidden) {
                e.preventDefault();
                this.next();
            }
        });
    }

    updateDifficultyLabel() {
        this.level = parseInt(this.dom.difficultySlider.value, 10);
        this.dom.difficultyValue.textContent =
            `Level ${this.level} (${getDifficultyLabel(this.level)}) ${getDifficultyEmoji(this.level)}`;
    }

    show(cardId) {
        ['setupCard', 'taskCard', 'resultCard'].forEach(id => { this.dom[id].hidden = id !== cardId; });
        this.dom[cardId].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    start(types) {
        ProgressTracker.updateLevel('mathetest', this.level);
        this.lastTypes = types;
        this.isTest = types.length > 1;
        const perType = this.isTest ? MathetestApp.TASKS_PER_SECTION : MathetestApp.PRACTICE_TASKS;
        this.tasks = [];
        types.forEach(type => {
            for (let i = 0; i < perType; i++) {
                this.tasks.push({ type, data: type.generate(this.level), correct: null });
            }
        });
        this.index = 0;
        this.show('taskCard');
        this.renderTask();
    }

    renderTask() {
        const { type, data } = this.tasks[this.index];
        this.checked = false;
        this.dom.sectionTitle.textContent = `${type.icon} ${type.title}`;
        this.dom.progressText.textContent = `${this.index + 1} / ${this.tasks.length}`;
        this.dom.progressFill.style.width = `${(this.index / this.tasks.length) * 100}%`;
        this.dom.feedback.textContent = '';
        this.dom.feedback.className = 'feedback';
        this.dom.checkBtn.hidden = false;
        this.dom.nextBtn.hidden = true;

        const body = this.dom.taskBody;
        body.innerHTML = '';
        body.dataset.type = type.id;
        body.appendChild(el('p', 'mt-instruction', type.instruction));
        this.checker = type.render(data, body);

        const first = this.checker.inputs[0];
        if (first) first.focus({ preventScroll: true });
    }

    onKeyDown(e) {
        if (e.key !== 'Enter' || this.checked || e.target.tagName !== 'INPUT') return;
        e.preventDefault();
        e.stopPropagation();
        // Enter checks once everything is filled, otherwise jumps to the next empty field
        const inputs = this.checker.inputs;
        const idx = inputs.indexOf(e.target);
        const rotated = [...inputs.slice(idx + 1), ...inputs.slice(0, idx + 1)];
        const nextEmpty = rotated.find(i => i.value === '');
        if (nextEmpty) nextEmpty.focus();
        else this.check();
    }

    check() {
        if (this.checked) return;
        const inputs = this.checker.inputs;
        const empty = inputs.some(i => i.value === '');
        if (empty && !this.dom.feedback.classList.contains('warn') && this.dom.taskBody.dataset.type !== 'fehler') {
            this.dom.feedback.textContent = 'Fülle erst alle Felder aus!';
            this.dom.feedback.className = 'feedback warn';
            return;
        }

        this.checked = true;
        const correct = this.checker.check();
        this.tasks[this.index].correct = correct;
        if (correct) {
            this.dom.feedback.textContent = '✓ Richtig!';
            this.dom.feedback.className = 'feedback correct';
            audioManager.playSuccessSound();
        } else {
            this.dom.feedback.textContent = '✗ Nicht ganz – die Lösung steht jetzt in Rot.';
            this.dom.feedback.className = 'feedback incorrect';
        }
        this.dom.checkBtn.hidden = true;
        this.dom.nextBtn.hidden = false;
        this.dom.nextBtn.textContent = this.index < this.tasks.length - 1 ? 'Weiter ➜' : 'Auswertung 🏁';
        this.dom.nextBtn.focus({ preventScroll: true });
    }

    next() {
        if (!this.checked) return;
        if (this.index < this.tasks.length - 1) {
            this.index++;
            this.renderTask();
        } else {
            this.showResult();
        }
    }

    static starsFor(ratio) {
        if (ratio >= 0.9) return 3;
        if (ratio >= 0.7) return 2;
        if (ratio >= 0.5) return 1;
        return 0;
    }

    showResult() {
        this.dom.progressFill.style.width = '100%';
        const total = this.tasks.length;
        const correct = this.tasks.filter(t => t.correct).length;
        const stars = MathetestApp.starsFor(correct / total);

        this.dom.resultStars.textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        this.dom.resultSummary.textContent = `${correct} von ${total} Aufgaben richtig`;

        // One crown per star, plus the usual level bonus once at least one star is earned
        if (stars > 0) {
            const reward = stars + CrownManager.calculateReward(this.level) - 1;
            const sum = CrownManager.earn(reward);
            CrownManager.updateDisplay(this.dom.crownCount);
            CrownManager.animateEarn(this.dom.crownCounter);
            this.dom.resultCrowns.textContent = `👑 +${reward} = ${sum} Kronen`;
            this.dom.resultCrowns.hidden = false;
            launchFireworks();
        } else {
            this.dom.resultCrowns.hidden = true;
        }

        this.dom.resultList.innerHTML = '';
        this.lastTypes.forEach(type => {
            const own = this.tasks.filter(t => t.type === type);
            const ok = own.filter(t => t.correct).length;
            const row = el('li', ok === own.length ? 'perfect' : ok === 0 ? 'none' : '');
            row.appendChild(el('span', '', `${type.icon} ${type.title}`));
            row.appendChild(el('strong', '', `${ok} / ${own.length}`));
            this.dom.resultList.appendChild(row);
        });

        this.show('resultCard');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MathetestApp().init();
});
