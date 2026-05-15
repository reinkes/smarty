'use strict';

(function () {
    // ── Constants ─────────────────────────────────────────────────────
    var TOTAL_TASKS         = 10;  // correct answers needed per round
    var LEVEL_UP_THRESHOLD  = 3;   // consecutive correct → level up
    var LEVEL_DOWN_THRESHOLD = 2;  // consecutive wrong   → level down
    var MIN_LEVEL           = 1;
    var MAX_LEVEL           = 10;

    // ── State ─────────────────────────────────────────────────────────
    var level          = 1;
    var tasksCompleted = 0;   // only increments on correct answer
    var correctStreak  = 0;
    var wrongStreak    = 0;
    var problem        = null;
    var isAnimating    = false;

    // ── DOM refs ──────────────────────────────────────────────────────
    var el = {};

    function cacheElements() {
        el.smileySvg      = document.getElementById('smileySvg');
        el.problemText    = document.getElementById('problemText');
        el.answerInput    = document.getElementById('answerInput');
        el.submitBtn      = document.getElementById('submitBtn');
        el.answerToken    = document.getElementById('answerToken');
        el.feedback       = document.getElementById('feedback');
        el.levelDisplay   = document.getElementById('levelDisplay');
        el.progressFill   = document.getElementById('progressFill');
        el.progressText   = document.getElementById('progressText');
        el.crownCounter   = document.getElementById('crownCounter');
        el.crownCount     = document.getElementById('crownCount');
        el.taskArea       = document.getElementById('taskArea');
        el.completionScreen  = document.getElementById('completionScreen');
        el.completionCrowns  = document.getElementById('completionCrowns');
        el.restartBtn        = document.getElementById('restartBtn');
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

        var saved = ProgressTracker.getProgress('smiley-rechner');
        level = saved.level || 1;

        el.submitBtn.addEventListener('click', submitAnswer);
        el.answerInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') submitAnswer();
        });
        el.restartBtn.addEventListener('click', restart);

        CrownManager.showCounter(el.crownCounter, el.crownCount);

        setSmileyState('neutral');
        nextProblem();
        updateLevelDisplay();
        updateProgress();
        el.answerInput.focus();
    }

    // ── Problem generation ────────────────────────────────────────────
    // Scope: Klasse 1 Germany — addition and subtraction only, numbers up to 20.
    // No multiplication or division (not part of Klasse 1 curriculum).
    function generateProblem(lvl) {
        var rnd = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        // Only + and −. Subtraction unlocks at level 4.
        var ops = ['+'];
        if (lvl >= 4) ops.push('−');
        var op = ops[rnd(0, ops.length - 1)];

        // Number ranges by level, max 20 (Klasse 1 curriculum)
        var maxNums = [5, 10, 10, 15, 15, 15, 20, 20, 20, 20];
        var max = maxNums[lvl - 1];

        var a, b, answer;
        if (op === '+') {
            a = rnd(1, Math.min(max, 19));
            b = rnd(1, Math.min(max, 20 - a));
            answer = a + b;
        } else {
            b = rnd(1, max);
            a = b + rnd(0, Math.min(max, 20 - b));
            answer = a - b;
        }

        return { text: a + ' ' + op + ' ' + b + ' = ?', answer: answer };
    }

    // ── Submit ────────────────────────────────────────────────────────
    function submitAnswer() {
        if (isAnimating) return;

        var raw = el.answerInput.value.trim();
        if (raw === '') { el.answerInput.focus(); return; }

        var userAnswer = parseInt(raw, 10);
        if (isNaN(userAnswer)) return;

        isAnimating = true;
        el.submitBtn.disabled = true;
        el.answerInput.disabled = true;

        animateToken(String(userAnswer), function () {
            handleResult(userAnswer === problem.answer);
        });
    }

    // ── Result handling ───────────────────────────────────────────────
    function handleResult(correct) {
        if (correct) {
            setSmileyState('open');
            setTimeout(function () {
                setSmileyState('happy');
                el.smileySvg.classList.remove('bouncing');
                el.smileySvg.classList.add('celebrating');

                correctStreak++;
                wrongStreak = 0;
                tasksCompleted++;

                el.feedback.textContent = '✓ Richtig!';
                el.feedback.className = 'feedback correct';

                if (correctStreak >= LEVEL_UP_THRESHOLD) {
                    correctStreak = 0;
                    levelUp();
                }

                ProgressTracker.recordAttempt('smiley-rechner', true);
                updateProgress();

                if (tasksCompleted >= TOTAL_TASKS) {
                    setTimeout(showCompletion, 900);
                } else {
                    setTimeout(function () {
                        el.smileySvg.classList.remove('celebrating');
                        el.smileySvg.classList.add('bouncing');
                        setSmileyState('neutral');
                        nextProblem();
                        resetInput();
                    }, 1400);
                }
            }, 300);

        } else {
            // Wrong — spit and keep the SAME problem so the kid can retry
            setSmileyState('open');
            spitToken(function () {
                setSmileyState('sad');
                el.smileySvg.classList.remove('bouncing');
                el.smileySvg.classList.add('shaking');

                correctStreak = 0;
                wrongStreak++;

                el.feedback.textContent = '✗ Falsch – versuch es nochmal!';
                el.feedback.className = 'feedback incorrect';

                if (wrongStreak >= LEVEL_DOWN_THRESHOLD) {
                    wrongStreak = 0;
                    levelDown();
                }

                ProgressTracker.recordAttempt('smiley-rechner', false);

                setTimeout(function () {
                    el.smileySvg.classList.remove('shaking');
                    el.smileySvg.classList.add('bouncing');
                    setSmileyState('neutral');
                    // Same problem stays — just clear the input
                    el.feedback.textContent = '';
                    el.feedback.className = 'feedback';
                    resetInput();
                }, 1400);
            });
        }
    }

    // ── Completion ────────────────────────────────────────────────────
    function showCompletion() {
        var result = CrownManager.earnAndDisplay(level, el.crownCount, el.crownCounter);
        el.taskArea.style.display = 'none';
        el.completionScreen.style.display = 'block';
        el.completionCrowns.textContent = '👑 +' + result.reward + ' = ' + result.total + ' Kronen';
        launchFireworks();
    }

    function restart() {
        tasksCompleted = 0;
        correctStreak  = 0;
        wrongStreak    = 0;
        problem        = null;
        el.taskArea.style.display = 'block';
        el.completionScreen.style.display = 'none';
        el.feedback.textContent = '';
        el.feedback.className = 'feedback';
        setSmileyState('neutral');
        el.smileySvg.classList.remove('celebrating', 'shaking');
        el.smileySvg.classList.add('bouncing');
        nextProblem();
        updateProgress();
        resetInput();
    }

    // ── Adaptive level ────────────────────────────────────────────────
    function levelUp() {
        if (level < MAX_LEVEL) {
            level = Math.min(level + 1, MAX_LEVEL);
            ProgressTracker.updateLevel('smiley-rechner', level);
            updateLevelDisplay();
            showLevelUpCelebration(level);
        }
    }

    function levelDown() {
        if (level > MIN_LEVEL) {
            level = Math.max(level - 1, MIN_LEVEL);
            ProgressTracker.updateLevel('smiley-rechner', level);
            updateLevelDisplay();
        }
    }

    // ── Token animations ──────────────────────────────────────────────
    function getMouthPos() {
        var rect = el.smileySvg.getBoundingClientRect();
        // mouth is at approx (50%, 72%) of the 400×400 viewBox
        return {
            x: rect.left + rect.width * 0.5,
            y: rect.top  + rect.height * 0.72,
        };
    }

    function animateToken(text, onArrival) {
        var token     = el.answerToken;
        var inputRect = el.answerInput.getBoundingClientRect();
        var mouth     = getMouthPos();

        var startX = inputRect.left + inputRect.width  / 2 - 31;
        var startY = inputRect.top  + inputRect.height / 2 - 31;

        token.textContent      = text;
        token.style.left       = startX + 'px';
        token.style.top        = startY + 'px';
        token.style.opacity    = '1';
        token.style.transform  = 'scale(1)';
        token.style.transition = 'none';
        token.style.display    = 'flex';

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                token.style.transition = [
                    'left 1.3s cubic-bezier(0.4,0,0.6,1)',
                    'top 1.3s cubic-bezier(0.4,0,0.6,1)',
                    'transform 0.65s ease'
                ].join(', ');
                token.style.left      = (mouth.x - 31) + 'px';
                token.style.top       = (mouth.y - 31) + 'px';
                token.style.transform = 'scale(1.35)';

                setTimeout(function () {
                    token.style.display   = 'none';
                    token.style.transform = 'scale(1)';
                    onArrival();
                }, 1300);
            });
        });
    }

    function spitToken(onDone) {
        var token = el.answerToken;
        var mouth = getMouthPos();

        token.style.left       = (mouth.x - 31) + 'px';
        token.style.top        = (mouth.y - 31) + 'px';
        token.style.opacity    = '1';
        token.style.transform  = 'scale(1.35)';
        token.style.transition = 'none';
        token.style.display    = 'flex';

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                token.style.transition = [
                    'left 0.85s ease-out',
                    'top 0.85s ease-out',
                    'opacity 0.85s ease',
                    'transform 0.85s ease'
                ].join(', ');
                token.style.left      = (mouth.x + 110) + 'px';
                token.style.top       = (mouth.y - 90)  + 'px';
                token.style.opacity   = '0';
                token.style.transform = 'scale(0.4) rotate(200deg)';

                setTimeout(function () {
                    token.style.display   = 'none';
                    token.style.transform = 'scale(1) rotate(0deg)';
                    onDone();
                }, 850);
            });
        });
    }

    // ── Smiley state machine ──────────────────────────────────────────
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
                el.eyesNormal.style.display   = 'none';
                el.eyesHappy.style.display    = 'block';
                el.mouthNeutral.style.display = 'none';
                el.mouthHappy.style.display   = 'block';
                break;
            case 'sad':
                el.eyesNormal.style.display   = 'none';
                el.eyesSad.style.display      = 'block';
                el.mouthNeutral.style.display = 'none';
                el.mouthSad.style.display     = 'block';
                el.spitParticles.style.display = 'block';
                break;
            // 'neutral' — defaults above are correct
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────
    function nextProblem() {
        problem = generateProblem(level);
        el.problemText.textContent = problem.text;
    }

    function resetInput() {
        el.answerInput.value    = '';
        el.answerInput.disabled = false;
        el.submitBtn.disabled   = false;
        isAnimating             = false;
        el.answerInput.focus();
    }

    function updateLevelDisplay() {
        el.levelDisplay.textContent = 'Level ' + level;
    }

    function updateProgress() {
        var pct = (tasksCompleted / TOTAL_TASKS) * 100;
        el.progressFill.style.width = Math.min(pct, 100) + '%';
        el.progressText.textContent = tasksCompleted + ' / ' + TOTAL_TASKS;
    }

    document.addEventListener('DOMContentLoaded', init);
})();
