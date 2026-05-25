/* data.js — all JSON content inlined as JS constants for file:// offline compat */

const ARCHETYPES_DATA = [
  {
    "id": "regeneration_goblin",
    "name": "Regeneration Goblin",
    "oneLiner": "Asks the same question six ways, hoping the machine gets wiser.",
    "symptoms": [
      "Your chat is 40 messages long and you still don't have the paragraph you wanted",
      "You've used the words 'actually', 'no wait', and 'try again' more than the AI has",
      "You genuinely believe the seventh attempt will be the one"
    ],
    "humanFix": [
      "Write down what 'good' looks like before you start prompting",
      "Give the AI one constraint at a time, not a wall of corrections",
      "If it's not working after three tries, edit the output yourself — it's faster",
      "Save the prompt that worked. You'll need it again."
    ],
    "verdict": "You're not prompting. You're negotiating with a magic 8-ball."
  },
  {
    "id": "context_hoarder",
    "name": "Context Hoarder",
    "oneLiner": "Pastes everything because they don't know what matters.",
    "symptoms": [
      "Your prompts regularly exceed the word count of a cover letter",
      "You've copy-pasted an entire Notion page 'just for context'",
      "The AI's response spends two paragraphs summarising what you gave it before doing anything"
    ],
    "humanFix": [
      "Write one sentence describing what the AI actually needs to know to do this task",
      "Cut your context in half. Then cut it in half again.",
      "If you can't explain what each piece of context does, it probably doesn't need to be there",
      "Build a short reusable system prompt instead of pasting everything each time"
    ],
    "verdict": "More context doesn't mean better answers. It means slower, blurrier answers."
  },
  {
    "id": "confident_hallucination_enjoyer",
    "name": "Confident Hallucination Enjoyer",
    "oneLiner": "Trusts the answer because it sounded like it wore a blazer.",
    "symptoms": [
      "You've sent an AI-written stat to a client without checking the source",
      "You think 'it sounds authoritative' is a form of verification",
      "You've been mildly surprised — but not that surprised — when something turned out to be made up"
    ],
    "humanFix": [
      "Treat every factual claim from an AI like a first draft from an eager intern: plausible, but needs checking",
      "Ask the AI to cite its sources — then actually look them up",
      "For anything that matters, use AI for structure and do the research yourself",
      "Build a quick 'does this actually exist?' check into your workflow for any fact you're about to use externally"
    ],
    "verdict": "Confidence is not accuracy. The AI learned that from LinkedIn."
  },
  {
    "id": "prompt_archaeologist",
    "name": "Prompt Archaeologist",
    "oneLiner": "Spends more time finding old prompts than doing the work.",
    "symptoms": [
      "You have a 'prompts' folder somewhere, last organised never",
      "You've typed the phrase 'there was this one prompt I used in March...'",
      "Recovering an old prompt now takes longer than just writing the thing from scratch"
    ],
    "humanFix": [
      "Keep a single running doc of prompts that have worked, with one-line labels",
      "If a prompt took more than three iterations to get right, it goes in the doc immediately",
      "Review and cull the doc monthly — dead prompts are noise",
      "Name prompts by outcome, not by date or topic ('client_email_first_reply' not 'GPT prompt 14 April')"
    ],
    "verdict": "A prompt graveyard is not a system. It's archaeology with extra steps."
  },
  {
    "id": "copy_paste_pilot",
    "name": "Copy-Paste Pilot",
    "oneLiner": "Ferries AI output onward without really owning it.",
    "symptoms": [
      "You could not explain the reasoning in the last thing you sent, but it looked fine",
      "You've forwarded AI output that contained a placeholder you didn't notice",
      "Your name is on work that, if pushed, you'd have to describe as 'the AI said'",
      "Your editing contribution is mainly selecting and pressing Ctrl+C"
    ],
    "humanFix": [
      "Before you send anything AI-wrote, read it fully once as if you wrote every word",
      "Change at least one sentence in every AI draft — not to improve it, but to own it",
      "Ask yourself: could I defend this in a call? If not, it needs more work",
      "Use AI to produce a first draft, not a final draft"
    ],
    "verdict": "Relaying is not working. It's outsourcing your judgment."
  },
  {
    "id": "improviser",
    "name": "The Improviser",
    "oneLiner": "No repeatable process; every task starts from zero.",
    "symptoms": [
      "Your approach to any AI task is 'see what happens'",
      "You've solved the same problem three times without noticing it was the same problem",
      "The phrase 'I'll just wing it' applies to most of your AI interactions"
    ],
    "humanFix": [
      "Next time something works, write down the steps before you close the tab",
      "Identify the three AI tasks you do most often and build a simple template for each",
      "Start every session with one sentence: 'I am trying to produce X for Y by doing Z'",
      "Treat each successful AI task as a reusable workflow, not a one-off win"
    ],
    "verdict": "Improvisation is a creative act. Doing it every time is just forgetting."
  }
];

const PATTERNS_DATA = [
  {
    "id": "STALL-001",
    "name": "Stalled Agent Loop",
    "risk": "Repeated LLM calls with no measurable progress — tokens spent, output stalled.",
    "secondaryRisk": "Users hit the failure before your team sees it — the agent is spinning while the user waits for a response that never arrives.",
    "whatToCheck": [
      "Are you tracking per-call progress, not just whether the loop terminates?",
      "Is there a maximum-step guardrail before graceful failure?",
      "Do your logs distinguish 'still working' from 'spinning on the same state'?"
    ]
  },
  {
    "id": "CACHE-001",
    "name": "Repeated Input Burn",
    "risk": "Identical or near-identical prompts re-paid on every call — prompt caching not in use.",
    "secondaryRisk": "Users hit the failure before your team sees it — latency and costs climb invisibly as usage scales, before anyone notices the bill.",
    "whatToCheck": [
      "Are you using prompt caching for static system prompts and shared context?",
      "Are your cache keys stable, or does small variation invalidate the cache each time?",
      "Have you measured cache hit rate in production, not just in local tests?"
    ]
  },
  {
    "id": "RAG-001",
    "name": "RAG Bloat",
    "risk": "High input-to-output token ratio — retrieval pulling too much, relevance ranking too loose.",
    "secondaryRisk": "Users hit the failure before your team sees it — answers degrade as the knowledge base grows, and the signal gets buried in retrieved noise.",
    "whatToCheck": [
      "What is your average retrieved-chunk count per query, and have you measured answer quality vs chunk count?",
      "Is your similarity threshold tuned on real user queries, or left at default?",
      "Are you re-ranking retrieved chunks before injecting them into context?"
    ]
  },
  {
    "id": "BABBLE-001",
    "name": "Excessive Generation",
    "risk": "Unusually long, unconstrained outputs — no max_tokens or response-length guidance in prompts.",
    "secondaryRisk": "Users hit the failure before your team sees it — responses feel slow and verbose, and users stop reading before the useful part.",
    "whatToCheck": [
      "Are you setting max_tokens or an explicit length instruction in your prompts?",
      "Are your prompts asking for structured output (lists, JSON) rather than open-ended prose?",
      "What is your p95 output token count? Does it track with actual user need?"
    ]
  },
  {
    "id": "ZOMBIE-001",
    "name": "Post-Completion Drift",
    "risk": "LLM calls continuing after the task is done — no completion signal, loop overshoots.",
    "secondaryRisk": "Users hit the failure before your team sees it — the user got their answer three steps ago; your system is still burning tokens on cleanup no one asked for.",
    "whatToCheck": [
      "Is there an explicit done-signal in your agent loop, or does it always run to max steps?",
      "Are post-task calls (summaries, logs, cleanup) gated on whether the task actually completed?",
      "Have you instrumented which step in a multi-step task is actually the last useful one?"
    ]
  },
  {
    "id": "CTX-001",
    "name": "Context Snowball",
    "risk": "Context window grows across turns while output quality stalls — compounding noise, no pruning.",
    "secondaryRisk": "Users hit the failure before your team sees it — conversation quality degrades mid-session as old, irrelevant turns crowd out useful context.",
    "whatToCheck": [
      "Are you pruning or summarising older turns before they fill the context window?",
      "Have you measured whether later turns in a long conversation are actually better or worse?",
      "Is your system distinguishing 'memory worth keeping' from 'raw conversation history'?"
    ]
  },
  {
    "id": "EMPTY-001",
    "name": "Invisible Output Burn",
    "risk": "Tokens spent on generation with little visible answer — model producing hedging, refusals, or padding instead of content.",
    "secondaryRisk": "Users hit the failure before your team sees it — users get plausible-looking non-answers and assume the product doesn't work, not that the model is hedging.",
    "whatToCheck": [
      "What fraction of your responses contain a substantive answer vs a hedge, disclaimer, or refusal?",
      "Are your prompts granting the model the context it needs to give a direct answer?",
      "Have you measured output token count vs user-perceived usefulness?"
    ]
  }
];

const QUIZ_DATA = {
  "questions": [
    {
      "id": "q1",
      "text": "When the AI answer is nearly useful, what do you do next?",
      "answers": [
        { "id": "q1a", "text": "Ask again, but slightly differently.",        "weights": { "regeneration_goblin": 3 } },
        { "id": "q1b", "text": "Paste more context and hope that unlocks it.", "weights": { "context_hoarder": 3 } },
        { "id": "q1c", "text": "Copy the best bit and keep moving.",           "weights": { "copy_paste_pilot": 2, "confident_hallucination_enjoyer": 1 } },
        { "id": "q1d", "text": "Start over with a totally new angle.",         "weights": { "improviser": 3 } }
      ]
    },
    {
      "id": "q2",
      "text": "Before starting a new AI task, what do you usually use?",
      "answers": [
        { "id": "q2a", "text": "An old prompt I vaguely remember working.",     "weights": { "prompt_archaeologist": 3 } },
        { "id": "q2b", "text": "A heroic pile of docs, notes, and links.",      "weights": { "context_hoarder": 2, "confident_hallucination_enjoyer": 1 } },
        { "id": "q2c", "text": "Whatever sentence comes to mind first.",        "weights": { "improviser": 2, "regeneration_goblin": 1 } },
        { "id": "q2d", "text": "A quick prompt, then I tidy the result later.", "weights": { "copy_paste_pilot": 2, "prompt_archaeologist": 1 } }
      ]
    },
    {
      "id": "q3",
      "text": "What makes an AI answer feel ready to use?",
      "answers": [
        { "id": "q3a", "text": "I have checked the facts, logic, and tone.",      "weights": { "prompt_archaeologist": 2, "context_hoarder": 1 } },
        { "id": "q3b", "text": "It sounds polished and oddly persuasive.",         "weights": { "confident_hallucination_enjoyer": 3 } },
        { "id": "q3c", "text": "It is the best of several regenerated versions.",  "weights": { "regeneration_goblin": 3 } },
        { "id": "q3d", "text": "It looks good enough to copy-paste onward.",       "weights": { "copy_paste_pilot": 2, "confident_hallucination_enjoyer": 1 } }
      ]
    }
  ]
};
