/* app.js — screen router and builder diagnostic flow */

const APP_TYPES = [
  { id: "support_bot",  label: "Support bot / chatbot" },
  { id: "rag_app",      label: "RAG app" },
  { id: "agent",        label: "AI agent" },
  { id: "copilot",      label: "Coding / writing copilot" },
  { id: "automation",   label: "Automation pipeline" },
  { id: "other",        label: "Something else" },
];
const CONCERNS = [
  { id: "loops",       label: "It gets stuck in loops" },
  { id: "slow",        label: "It's slow or costs too much" },
  { id: "cost",        label: "Token / API costs are climbing" },
  { id: "bad_answers", label: "Output quality is poor" },
  { id: "not_sure",    label: "Not sure — something feels off" },
];

// ── State ──────────────────────────────────────────────────────────────
const state = {
  isBuilder: null,
  useCase: "",
  appType: null,
  concern: null,
  diagnosis: null,
};

// ── Screen management ──────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}

// ── Fork screen ────────────────────────────────────────────────────────
document.querySelectorAll(".fork-tile").forEach(btn => {
  btn.addEventListener("click", () => {
    const fork = btn.dataset.fork;
    state.isBuilder = fork === "builder";
    if (state.isBuilder) {
      showScreen("screen-builder");
      renderBuilderStep1();
    } else {
      showScreen("screen-casual");
      Quiz.start(state, onCasualComplete);
    }
  });
});

// ── Builder step 1: app type ───────────────────────────────────────────
function renderBuilderStep1() {
  setBuilderProgress(1, 2);
  const c = document.getElementById("builder-container");
  c.innerHTML = `
    <p class="quiz-question-text">What are you building?</p>
    <div class="quiz-answers" id="app-type-answers"></div>
  `;
  const wrap = document.getElementById("app-type-answers");
  APP_TYPES.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "quiz-answer-btn";
    btn.textContent = opt.label;
    btn.addEventListener("click", () => {
      state.appType = opt.id;
      renderBuilderStep2();
    });
    wrap.appendChild(btn);
  });
}

// ── Builder step 2: main concern ──────────────────────────────────────
function renderBuilderStep2() {
  setBuilderProgress(2, 2);
  const c = document.getElementById("builder-container");
  c.innerHTML = `
    <p class="quiz-question-text">What's your main concern with it?</p>
    <div class="quiz-answers" id="concern-answers"></div>
  `;
  const wrap = document.getElementById("concern-answers");
  CONCERNS.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "quiz-answer-btn";
    btn.textContent = opt.label;
    btn.addEventListener("click", () => {
      state.concern = opt.id;
      state.useCase = APP_TYPES.find(a => a.id === state.appType)?.label || "your system";
      const diagnosis = Diagnosis.forBuilder(state);
      state.diagnosis = diagnosis;
      onBuilderComplete(diagnosis);
    });
    wrap.appendChild(btn);
  });
}

function setBuilderProgress(step, total) {
  document.getElementById("builder-progress-fill").style.width = `${(step / total) * 100}%`;
  document.getElementById("builder-progress-label").textContent = `Step ${step} / ${total}`;
}

// ── Completion callbacks ───────────────────────────────────────────────
function onCasualComplete(diagnosis) {
  state.diagnosis = diagnosis;
  showScreen("screen-receipt");
  Receipt.render(diagnosis);
  pingCensus(diagnosis);
}

function onBuilderComplete(diagnosis) {
  showScreen("screen-receipt");
  Receipt.render(diagnosis);
  pingCensus(diagnosis);
}

// ── Share card button ─────────────────────────────────────────────────
document.getElementById("btn-share-card").addEventListener("click", () => {
  if (state.diagnosis) ShareCard.generate(state.diagnosis);
});

// ── Restart ───────────────────────────────────────────────────────────
document.getElementById("btn-restart").addEventListener("click", () => {
  state.isBuilder = null;
  state.useCase = "";
  state.appType = null;
  state.concern = null;
  state.diagnosis = null;
  showScreen("screen-fork");
});

// ── Census ping (fail silent) ─────────────────────────────────────────
function pingCensus(diagnosis) {
  try {
    const endpoint = (typeof CONFIG !== "undefined") && CONFIG.CENSUS_ENDPOINT;
    if (!endpoint) return;
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: diagnosis.id,
        useCase: diagnosis.useCase,
        archetype: diagnosis.archetype || null,
        suspectedPattern: diagnosis.suspectedPattern || null,
        isBuilder: diagnosis.isBuilder,
      }),
    }).catch(() => {});
  } catch (e) {}
}
