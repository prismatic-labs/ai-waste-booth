/* diagnosis.js — Diagnosis factory for both casual and builder paths */

// Pattern lookup: (appType, concern) → PatternId
const PATTERN_MAP = {
  support_bot:  { loops: "STALL-001", slow: "BABBLE-001", cost: "CACHE-001", bad_answers: "EMPTY-001", not_sure: "ZOMBIE-001" },
  rag_app:      { loops: "CTX-001",   slow: "RAG-001",    cost: "CACHE-001", bad_answers: "RAG-001",   not_sure: "RAG-001"   },
  agent:        { loops: "STALL-001", slow: "CTX-001",    cost: "ZOMBIE-001",bad_answers: "EMPTY-001", not_sure: "STALL-001" },
  copilot:      { loops: "STALL-001", slow: "BABBLE-001", cost: "CACHE-001", bad_answers: "EMPTY-001", not_sure: "CTX-001"   },
  automation:   { loops: "ZOMBIE-001",slow: "CTX-001",    cost: "CACHE-001", bad_answers: "EMPTY-001", not_sure: "ZOMBIE-001"},
  other:        { loops: "STALL-001", slow: "CTX-001",    cost: "CACHE-001", bad_answers: "EMPTY-001", not_sure: "ZOMBIE-001"},
};

function _uuid() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

const Diagnosis = {
  forCasual({ useCase, archetype }) {
    return {
      id: _uuid(),
      timestamp: new Date().toISOString(),
      isBuilder: false,
      useCase,
      archetype: archetype.id,
      symptoms: archetype.symptoms,
      humanFix: archetype.humanFix,
      verdict: archetype.verdict,
      ctaType: "upgrade_15",
    };
  },

  forBuilder({ useCase, appType, concern }) {
    const patternId = (PATTERN_MAP[appType] || PATTERN_MAP.other)[concern] || "STALL-001";
    const pattern = PATTERNS_DATA.find(p => p.id === patternId) || PATTERNS_DATA[0];
    return {
      id: _uuid(),
      timestamp: new Date().toISOString(),
      isBuilder: true,
      useCase,
      appType,
      concern,
      suspectedPattern: pattern.id,
      risk: pattern.risk,
      secondaryRisk: pattern.secondaryRisk,
      whatToCheck: pattern.whatToCheck,
      ctaType: "book_teardown",
    };
  },
};
