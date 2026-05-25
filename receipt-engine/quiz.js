/* quiz.js — casual quiz flow: use case Q0, then Q1-Q3 weighted */

const TIEBREAK_ORDER = [
  "confident_hallucination_enjoyer",
  "prompt_archaeologist",
  "improviser",
  "regeneration_goblin",
  "context_hoarder",
  "copy_paste_pilot",
];

const Quiz = (() => {
  let _state = null;
  let _onComplete = null;
  let _currentStep = 0; // 0 = use case, 1-3 = quiz questions
  let _weights = {};
  let _useCase = "";

  function start(state, onComplete) {
    _state = state;
    _onComplete = onComplete;
    _currentStep = 0;
    _weights = {};
    TIEBREAK_ORDER.forEach(id => { _weights[id] = 0; });
    _renderUseCase();
  }

  function _setProgress(step, total) {
    const pct = (step / total) * 100;
    document.getElementById("progress-fill").style.width = `${pct}%`;
    document.getElementById("progress-label").textContent = `Q ${step} / ${total}`;
  }

  // ── Q0: use case ───────────────────────────────────────────────────
  function _renderUseCase() {
    _setProgress(0, 4);
    const c = document.getElementById("quiz-container");
    c.innerHTML = `
      <p class="quiz-question-text">What's one thing you use AI for?</p>
      <input
        id="use-case-input"
        class="use-case-input"
        type="text"
        placeholder="e.g. writing emails, summarising docs, coding help…"
        autocomplete="off"
        maxlength="120"
      >
      <button id="use-case-next" class="quiz-next-btn" disabled>Next →</button>
    `;
    const input = document.getElementById("use-case-input");
    const btn = document.getElementById("use-case-next");
    input.addEventListener("input", () => {
      btn.disabled = input.value.trim().length < 3;
    });
    input.addEventListener("keydown", e => {
      if (e.key === "Enter" && !btn.disabled) btn.click();
    });
    btn.addEventListener("click", () => {
      _useCase = input.value.trim();
      _currentStep = 1;
      _renderQuestion(_currentStep - 1);
    });
    // autofocus after slight delay (avoids iOS keyboard jumping)
    setTimeout(() => input.focus(), 100);
  }

  // ── Q1–Q3: behaviour questions ─────────────────────────────────────
  function _renderQuestion(qIndex) {
    const question = QUIZ_DATA.questions[qIndex];
    _setProgress(qIndex + 1, 4);
    const c = document.getElementById("quiz-container");
    c.innerHTML = `
      <p class="quiz-question-text">${_escHtml(question.text)}</p>
      <div class="quiz-answers" id="quiz-answers-wrap"></div>
    `;
    const wrap = document.getElementById("quiz-answers-wrap");
    question.answers.forEach(answer => {
      const btn = document.createElement("button");
      btn.className = "quiz-answer-btn";
      btn.textContent = answer.text;
      btn.addEventListener("click", () => {
        _applyWeights(answer.weights);
        const nextIndex = qIndex + 1;
        if (nextIndex < QUIZ_DATA.questions.length) {
          _renderQuestion(nextIndex);
        } else {
          _finish();
        }
      });
      wrap.appendChild(btn);
    });
  }

  function _applyWeights(weights) {
    Object.entries(weights).forEach(([archetypeId, w]) => {
      if (_weights.hasOwnProperty(archetypeId)) {
        _weights[archetypeId] += w;
      }
    });
  }

  function _finish() {
    const archetypeId = _resolveArchetype();
    const archetype = ARCHETYPES_DATA.find(a => a.id === archetypeId);
    if (!archetype) return;
    const diagnosis = Diagnosis.forCasual({
      useCase: _useCase,
      archetype: archetype,
    });
    _onComplete(diagnosis);
  }

  function _resolveArchetype() {
    let maxScore = -1;
    let winner = TIEBREAK_ORDER[TIEBREAK_ORDER.length - 1];
    TIEBREAK_ORDER.forEach(id => {
      const score = _weights[id] || 0;
      if (score > maxScore) {
        maxScore = score;
        winner = id;
      }
    });
    return winner;
  }

  function _escHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  return { start };
})();
