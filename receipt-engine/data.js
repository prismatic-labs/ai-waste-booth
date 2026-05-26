/* data.js - generated from content/*.json for file:// offline compat */

const ARCHETYPES_DATA = [
  {
    "id": "regeneration_goblin",
    "name": "Regeneration Goblin",
    "oneLiner": "Has turned 'just one more prompt' into a productivity strategy.",
    "symptoms": [
      "Your chat has become a small saga - and you can feel the answer getting closer",
      "You've tried one more wording, then one more after that, with genuine optimism",
      "At some point you stopped counting attempts and just trusted the process"
    ],
    "humanFix": [
      "Write down what good enough looks like before you start prompting",
      "Change one thing at a time so each retry actually teaches you something",
      "After three tries, switch from generating to editing - you are probably close",
      "Save the version that worked so future-you gets a shortcut"
    ],
    "verdict": "The model is close. Give your optimism a finish line."
  },
  {
    "id": "context_hoarder",
    "name": "Context Hoarder",
    "oneLiner": "Has never met a background detail that wasn't potentially load-bearing.",
    "symptoms": [
      "Your prompts sometimes look like they packed for a long weekend",
      "You've pasted an entire doc 'just in case one detail matters'",
      "The AI occasionally spends more time with the context than the question"
    ],
    "humanFix": [
      "Start with one sentence describing what the AI truly needs to know",
      "Add only the context that would actually change the answer",
      "Park nice-to-have background under 'extra if needed'",
      "Keep a short reusable setup prompt for your most common tasks"
    ],
    "verdict": "Your instinct to give the full picture is generous. The context just needs a packing list."
  },
  {
    "id": "confident_hallucination_enjoyer",
    "name": "Confident Hallucination Enjoyer",
    "oneLiner": "The AI said it with such confidence. That must count for something.",
    "symptoms": [
      "You've nearly used an AI stat before checking where it came from",
      "Polished wording can feel reassuring before the sources have caught up",
      "You've had that useful little pause: 'actually, let me just check that exists'"
    ],
    "humanFix": [
      "Treat factual claims from AI as well-written first drafts",
      "Ask for sources, then open the sources before using the claim",
      "For anything external-facing, let AI shape the structure while you verify the facts",
      "Build a quick 'does this actually exist?' check into your workflow"
    ],
    "verdict": "A confident sentence is a great first draft. Give it a friendly passport check."
  },
  {
    "id": "prompt_archaeologist",
    "name": "Prompt Archaeologist",
    "oneLiner": "Has a prompts folder. Cannot find the good ones.",
    "symptoms": [
      "You have a prompts folder that is more museum than system",
      "You've said 'there was a version of this that worked...' and gone digging",
      "The search occasionally takes longer than just writing the prompt fresh"
    ],
    "humanFix": [
      "Keep a single running doc of prompts that worked, with one-line labels",
      "If a prompt took more than three tries to get right, save the final version immediately",
      "Prune the doc occasionally so old experiments do not crowd out the useful ones",
      "Name prompts by outcome, not date - client-email-first-reply beats 'GPT prompt 14 April'"
    ],
    "verdict": "The archive has real treasure. A few labels will help it shine."
  },
  {
    "id": "copy_paste_pilot",
    "name": "Copy-Paste Pilot",
    "oneLiner": "Ships fast. The [RECIPIENT NAME] ships with it.",
    "symptoms": [
      "You've sent something that looked fine, then spotted the placeholder two minutes later",
      "You trust your eye to catch what matters on a quick read-through - and mostly it does",
      "The edit window sometimes closes a little faster than the document deserves",
      "A deadline and a solid first draft are a very persuasive combination"
    ],
    "humanFix": [
      "Before you send an AI draft, read it once as if your name is on every word",
      "Add at least one sentence that is purely yours",
      "Ask: could I defend this in a call? If not, give it another pass",
      "Use AI to make a draft, then make the draft yours"
    ],
    "verdict": "The draft is helpful. The final gets stronger with your fingerprints."
  },
  {
    "id": "improviser",
    "name": "The Improviser",
    "oneLiner": "Figures it out as they go. Has been figuring it out for a while.",
    "symptoms": [
      "Every session starts fresh - you like to follow the task as it unfolds",
      "You've definitely solved the same thing from scratch at least twice",
      "A workflow works beautifully, then disappears into browser history"
    ],
    "humanFix": [
      "When something works, write down the steps before you close the tab",
      "Pick the three AI tasks you repeat most and make a tiny template for each",
      "Start each session with: I need X for Y, using Z",
      "A result that worked once can work every time - write it down"
    ],
    "verdict": "Improvisation is a real skill. A tiny repeatable pattern lets it help you twice."
  }
];

const PATTERNS_DATA = [
  {
    "id": "STALL-001",
    "name": "Stalled Agent Loop",
    "risk": "Repeated LLM calls with no measurable progress - tokens spent, output stalled.",
    "secondaryRisk": "Users hit the failure before your team sees it - the agent is spinning while the user waits for a response that never arrives.",
    "whatToCheck": [
      "Are you tracking per-call progress, not just whether the loop terminates?",
      "Is there a maximum-step guardrail before graceful failure?",
      "Do your logs distinguish 'still working' from 'spinning on the same state'?"
    ]
  },
  {
    "id": "CACHE-001",
    "name": "Repeated Input Burn",
    "risk": "Identical or near-identical prompts re-paid on every call - prompt caching not in use.",
    "secondaryRisk": "Users hit the failure before your team sees it - latency and costs climb invisibly as usage scales, before anyone notices the bill.",
    "whatToCheck": [
      "Are you using prompt caching for static system prompts and shared context?",
      "Are your cache keys stable, or does small variation invalidate the cache each time?",
      "Have you measured cache hit rate in production, not just in local tests?"
    ]
  },
  {
    "id": "RAG-001",
    "name": "RAG Bloat",
    "risk": "High input-to-output token ratio - retrieval pulling too much, relevance ranking too loose.",
    "secondaryRisk": "Users hit the failure before your team sees it - answers degrade as the knowledge base grows, and the signal gets buried in retrieved noise.",
    "whatToCheck": [
      "What is your average retrieved-chunk count per query, and have you measured answer quality vs chunk count?",
      "Is your similarity threshold tuned on real user queries, or left at default?",
      "Are you re-ranking retrieved chunks before injecting them into context?"
    ]
  },
  {
    "id": "BABBLE-001",
    "name": "Excessive Generation",
    "risk": "Unusually long, unconstrained outputs - no max_tokens or response-length guidance in prompts.",
    "secondaryRisk": "Users hit the failure before your team sees it - responses feel slow and verbose, and users stop reading before the useful part.",
    "whatToCheck": [
      "Are you setting max_tokens or an explicit length instruction in your prompts?",
      "Are your prompts asking for structured output (lists, JSON) rather than open-ended prose?",
      "What is your p95 output token count? Does it track with actual user need?"
    ]
  },
  {
    "id": "ZOMBIE-001",
    "name": "Post-Completion Drift",
    "risk": "LLM calls continuing after the task is done - no completion signal, loop overshoots.",
    "secondaryRisk": "Users hit the failure before your team sees it - the user got their answer three steps ago; your system is still burning tokens on cleanup no one asked for.",
    "whatToCheck": [
      "Is there an explicit done-signal in your agent loop, or does it always run to max steps?",
      "Are post-task calls (summaries, logs, cleanup) gated on whether the task actually completed?",
      "Have you instrumented which step in a multi-step task is actually the last useful one?"
    ]
  },
  {
    "id": "CTX-001",
    "name": "Context Snowball",
    "risk": "Context window grows across turns while output quality stalls - compounding noise, no pruning.",
    "secondaryRisk": "Users hit the failure before your team sees it - conversation quality degrades mid-session as old, irrelevant turns crowd out useful context.",
    "whatToCheck": [
      "Are you pruning or summarising older turns before they fill the context window?",
      "Have you measured whether later turns in a long conversation are actually better or worse?",
      "Is your system distinguishing 'memory worth keeping' from 'raw conversation history'?"
    ]
  },
  {
    "id": "EMPTY-001",
    "name": "Invisible Output Burn",
    "risk": "Tokens spent on generation with little visible answer - model producing hedging, refusals, or padding instead of content.",
    "secondaryRisk": "Users hit the failure before your team sees it - users get plausible-looking non-answers and assume the product doesn't work, not that the model is hedging.",
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
        {
          "id": "q1a",
          "text": "Ask again, but slightly differently.",
          "weights": {
            "regeneration_goblin": 3
          }
        },
        {
          "id": "q1b",
          "text": "Paste more context and hope that unlocks it.",
          "weights": {
            "context_hoarder": 3
          }
        },
        {
          "id": "q1c",
          "text": "Copy the best bit and keep moving.",
          "weights": {
            "copy_paste_pilot": 2,
            "confident_hallucination_enjoyer": 1
          }
        },
        {
          "id": "q1d",
          "text": "Start over with a totally new angle.",
          "weights": {
            "improviser": 3
          }
        }
      ]
    },
    {
      "id": "q2",
      "text": "Before starting a new AI task, what do you usually use?",
      "answers": [
        {
          "id": "q2a",
          "text": "An old prompt I vaguely remember working.",
          "weights": {
            "prompt_archaeologist": 3
          }
        },
        {
          "id": "q2b",
          "text": "A heroic pile of docs, notes, and links.",
          "weights": {
            "context_hoarder": 2,
            "confident_hallucination_enjoyer": 1
          }
        },
        {
          "id": "q2c",
          "text": "Whatever sentence comes to mind first.",
          "weights": {
            "improviser": 2,
            "regeneration_goblin": 1
          }
        },
        {
          "id": "q2d",
          "text": "A quick prompt, then I tidy the result later.",
          "weights": {
            "copy_paste_pilot": 2,
            "prompt_archaeologist": 1
          }
        }
      ]
    },
    {
      "id": "q3",
      "text": "What makes an AI answer feel ready to use?",
      "answers": [
        {
          "id": "q3a",
          "text": "I have checked the facts, logic, and tone.",
          "weights": {
            "prompt_archaeologist": 2,
            "context_hoarder": 1
          }
        },
        {
          "id": "q3b",
          "text": "It sounds polished and oddly persuasive.",
          "weights": {
            "confident_hallucination_enjoyer": 3
          }
        },
        {
          "id": "q3c",
          "text": "It is the best of several regenerated versions.",
          "weights": {
            "regeneration_goblin": 3
          }
        },
        {
          "id": "q3d",
          "text": "It looks good enough to copy-paste onward.",
          "weights": {
            "copy_paste_pilot": 2,
            "confident_hallucination_enjoyer": 1
          }
        }
      ]
    }
  ]
};
