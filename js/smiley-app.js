'use strict';

(function () {
    // ── State ─────────────────────────────────────────────────────────
    const state = {
        level: 5,
        score: 0,
        streak: 0,
        problem: null,
        isAnimating: false,
    };

    // ── DOM refs ──────────────────────────────────────────────────────
    const el = {};

    function cacheElements() {
        el.smileySvg     = document.getElementById('smileySvg');
        el.problemText   = document.getElementById('problemText');
        el.answerInput   = document.getElementById('answerInput');
        el.submitBtn     = document.getElementById('submitBtn');
        el.answerToken   = document.getElementById('answerToken');
        el.statScore     = document.getElementById('statScore');
        el.statStreak    = document.getElementById('statStreak');
        el.levelSlider   = document.getElementById('levelSlider');
        el.levelBadge    = document.getElementById('levelBadge');
        el.correctHint   = document.getElementById('correctHint');
        el.crownCounter  = document.getElementById('crownCounter');
        el.crownCount    = document.getElementById('crownCount');
        el.feedbackOverlay = document.getElementById('feedbackOverlay');
        // smiley parts
        el.eyesNormal    = document.getElementById('eyesNormal');
        el.eyesHappy     = document.getElementById('eyesHappy');
        el.eyesSad       = document.getElementById('eyesSad');
        el.mouthNeutral  = document.getElementById('mouthNeutral');
        el.mouthOpen     = document.getElementById('mouthOpen');
        el.mouthHappy    = document.getElementById('mouthHappy');
        el.mouthSad      = document.getElementById('mouthSad');
        el.spitParticles = document.getElementById('spitParticles');
    }

    // ── Init ──────────────────────────────────────────────────────────
    function init() {
        cacheElements();

        const saved = parseInt(localStorage.getItem('smarty-smiley-level') || '5', 10);
        state.level = Math.max(1, Math.min(10, saved));
        el.levelSlider.value = state.level;
        updateLevelDisplay();

        el.submitBtn.addEventListener('click', submitAnswer);
        el.answerInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') submitAnswer();
        });
        el.levelSlider.addEventListener('input', function () {
            state.level = parseInt(this.value, 10);
            localStorage.setItem('smarty-smiley-level', state.level);
            updateLevelDisplay();
        });

        CrownManager.showCounter(el.crownCounter, el.crownCount);
        CrownManager.updateDisplay(el.crownCount, el.crownCounter);

        setSmileyState('neutral');
        nextProblem();
        el.answerInput.focus();
    }

    // ── Problem generation ────────────────────────────────────────────
    function generateProblem(level) {
        const rnd = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        const ops = ['+'];
        if (level >= 3) ops.push('−'); // −
        if (level >= 6) ops.push('×'); // ×
        if (level >= 9) ops.push('÷'); // ÷

        const op = ops[rnd(0, ops.length - 1)];
        const maxNums = [5, 10, 10, 15, 20, 30, 50, 50, 100, 100];
        const max = maxNums[level - 1];

        var a, b, answer;

        if (op === '+') {
            a = rnd(1, max);
            b = rnd(1, max);
            answer = a + b;
        } else if (op === '−') {
            b = rnd(1, max);
            a = b + rnd(0, max);
            answer = a - b;
        } else if (op === '×') {
            var mf = level <= 7 ? 3 : level <= 8 ? 5 : 10;
            a = rnd(1, mf);
            b = rnd(1, mf);
            answer = a * b;
        } else {
            // division — always exact
            b = rnd(2, 10);
            answer = rnd(1, 10);
            a = answer * b;
        }

        return { text: a + ' ' + op + ' ' + b + ' = ?', answer: answer };
    }

    // ── Submit ────────────────────────────────────────────────────────
    function submitAnswer() {
        if (state.isAnimating) return;

        var raw = el.answerInput.value.trim();
        if (raw === '') {
            el.answerInput.focus();
            return;
        }

        var userAnswer = parseInt(raw, 10);
        if (isNaN(userAnswer)) return;

        state.isAnimating = true;
        el.submitBtn.disabled = true;
        el.answerInput.disabled = true;
        el.correctHint.style.display = 'none';

        animateToken(String(userAnswer), function () {
            handleResult(userAnswer === state.problem.answer, userAnswer);
        });
    }

    // ── Result ────────────────────────────────────────────────────────
    function handleResult(correct, userAnswer) {
        if (correct) {
            setSmileyState('open');

            setTimeout(function () {
                setSmileyState('happy');
                el.smileySvg.classList.remove('bouncing');
                el.smileySvg.classList.add('celebrating');

                state.score++;
                state.streak++;
                updateStats();

                var result = CrownManager.earnAndDisplay(state.level, el.crownCount, el.crownCounter);

                if (state.streak > 0 && state.streak % 5 === 0) {
                    launchFireworks();
                    showMilestoneCelebration('🔥 ' + state.streak + 'er Streak! +' + result.reward + ' 👑');
                } else {
                    showFeedback(true, '+ ' + result.reward + ' 👑');
                }

                setTimeout(function () {
                    el.smileySvg.classList.remove('celebrating');
                    el.smileySvg.classList.add('bouncing');
                    setSmileyState('neutral');
                    nextProblem();
                    resetInput();
                }, 1600);
            }, 300);

        } else {
            setSmileyState('open');

            spitToken(function () {
                setSmileyState('sad');
                el.smileySvg.classList.remove('bouncing');
                el.smileySvg.classList.add('shaking');

                state.streak = 0;
                updateStats();

                showFeedback(false, 'Richtig: ' + state.problem.answer);
                el.correctHint.textContent = '✅ Richtige Antwort: ' + state.problem.answer;
                el.correctHint.style.display = 'block';

                setTimeout(function () {
                    el.smileySvg.classList.remove('shaking');
                    el.smileySvg.classList.add('bouncing');
                    setSmileyState('neutral');
                    el.correctHint.style.display = 'none';
                    nextProblem();
                    resetInput();
                }, 2200);
            });
        }
    }

    // ── Token animations ──────────────────────────────────────────────
    function getMouthPos() {
        var rect = el.smileySvg.getBoundingClientRect();
        // mouth is at approx (50%, 72%) of the 400×400 viewBox
        return {
            x: rect.left + rect.width * 0.5,
            y: rect.top + rect.height * 0.72,
        };
    }

    function animateToken(text, onArrival) {
        var token = el.answerToken;
        var inputRect = el.answerInput.getBoundingClientRect();
        var mouth = getMouthPos();

        var startX = inputRect.left + inputRect.width / 2 - 31;
        var startY = inputRect.top + inputRect.height / 2 - 31;
        var endX = mouth.x - 31;
        var endY = mouth.y - 31;

        token.textContent = text;
        token.style.left = startX + 'px';
        token.style.top = startY + 'px';
        token.style.opacity = '1';
        token.style.transform = 'scale(1)';
        token.style.transition = 'none';
        token.style.display = 'flex';

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                token.style.transition = 'left 1.4s cubic-bezier(0.4,0,0.6,1), top 1.4s cubic-bezier(0.4,0,0.6,1), transform 0.7s ease';
                token.style.left = endX + 'px';
                token.style.top = endY + 'px';
                token.style.transform = 'scale(1.35)';

                setTimeout(function () {
                    token.style.display = 'none';
                    token.style.transform = 'scale(1)';
                    onArrival();
                }, 1400);
            });
        });
    }

    function spitToken(onDone) {
        var token = el.answerToken;
        var mouth = getMouthPos();

        token.style.left = (mouth.x - 31) + 'px';
        token.style.top = (mouth.y - 31) + 'px';
        token.style.opacity = '1';
        token.style.transition = 'none';
        token.style.transform = 'scale(1.35)';
        token.style.display = 'flex';

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                token.style.transition = 'left 0.85s ease-out, top 0.85s ease-out, opacity 0.85s ease, transform 0.85s ease';
                token.style.left = (mouth.x + 110) + 'px';
                token.style.top = (mouth.y - 90) + 'px';
                token.style.opacity = '0';
                token.style.transform = 'scale(0.4) rotate(200deg)';

                setTimeout(function () {
                    token.style.display = 'none';
                    token.style.transform = 'scale(1) rotate(0deg)';
                    onDone();
                }, 850);
            });
        });
    }

    // ── Smiley state ──────────────────────────────────────────────────
    function setSmileyState(stateName) {
        el.eyesNormal.style.display    = 'block';
        el.eyesHappy.style.display     = 'none';
        el.eyesSad.style.display       = 'none';
        el.mouthNeutral.style.display  = 'block';
        el.mouthOpen.style.display     = 'none';
        el.mouthHappy.style.display    = 'none';
        el.mouthSad.style.display      = 'none';
        el.spitParticles.style.display = 'none';

        switch (stateName) {
            case 'open':
                el.mouthNeutral.style.display = 'none';
                el.mouthOpen.style.display    = 'block';
                break;
            case 'happy':
                el.eyesNormal.style.display = 'none';
                el.eyesHappy.style.display  = 'block';
                el.mouthNeutral.style.display = 'none';
                el.mouthHappy.style.display   = 'block';
                break;
            case 'sad':
                el.eyesNormal.style.display = 'none';
                el.eyesSad.style.display    = 'block';
                el.mouthNeutral.style.display = 'none';
                el.mouthSad.style.display     = 'block';
                el.spitParticles.style.display = 'block';
                break;
            // 'neutral' — defaults are correct
        }
    }

    // ── Feedback popup ────────────────────────────────────────────────
    function showFeedback(correct, message) {
        el.feedbackOverlay.textContent = correct ? '✅ ' + message : '❌ ' + message;
        el.feedbackOverlay.className = correct ? 'show correct' : 'show wrong';
        setTimeout(function () {
            el.feedbackOverlay.className = '';
        }, 1500);
    }

    // ── Helpers ───────────────────────────────────────────────────────
    function nextProblem() {
        state.problem = generateProblem(state.level);
        el.problemText.textContent = state.problem.text;
    }

    function resetInput() {
        el.answerInput.value = '';
        el.answerInput.disabled = false;
        el.submitBtn.disabled = false;
        state.isAnimating = false;
        el.answerInput.focus();
    }

    function updateStats() {
        el.statScore.textContent  = '✅ ' + state.score + ' richtig';
        el.statStreak.textContent = state.streak > 1
            ? '🔥 ' + state.streak + 'er Streak'
            : '🔥 0er Streak';
    }

    function updateLevelDisplay() {
        var labels = ['', 'Einfach 😊', 'Einfach 😊', 'Einfach 😊',
                      'Mittel 🤔', 'Mittel 🤔', 'Mittel 🤔',
                      'Schwer 🔥', 'Schwer 🔥', 'Schwer 🔥',
                      'Experte ⚡'];
        el.levelBadge.textContent = 'Level ' + state.level + ' – ' + labels[state.level];
    }

    document.addEventListener('DOMContentLoaded', init);
})();
