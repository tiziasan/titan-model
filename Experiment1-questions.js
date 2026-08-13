/* ================================================================
   EXPERIMENT 1 — "Does a Wait Mean the Same Thing for Every Model?"
   Implements the project brief exactly.

   DESIGN: 2 (label: small / large) × 3 (wait: instant / 9s silent /
   9s animated), FULLY BETWEEN-SUBJECTS. Each participant is assigned
   to ONE of the six cells and sees ONE interaction. The response
   text is IDENTICAL in every cell (the frozen string in `prompt`).
   Only the disclosed label and the wait differ.

   THE SIX CELLS are generated automatically as  labels × waits.
   Their ids (used for ?cell= forcing and in the CSV) are:
     small__instant   small__silent   small__animated
     large__instant   large__silent   large__animated

   ┌─────────────── ANALYSIS RULES (write these down BEFORE data) ──┐
   │ • RQ3 / H4 (the label × wait interaction) is the main result.  │
   │ • TEST H2 FIRST: compare instant vs 9s-silent (the cue-free    │
   │   replication of Tan et al.). If H2 holds, test H4 as planned. │
   │   If H2 fails, report the replication as a finding and treat   │
   │   H4 as exploratory.                                           │
   │ • H3 (labor illusion) = 9s-silent vs 9s-animated, duration     │
   │   held constant at 9s — the animation is the only difference.  │
   │ • Suggested model: 2×3 ANOVA (label × wait) on each outcome,   │
   │   with the two planned contrasts above.                        │
   └───────────────────────────────────────────────────────────────┘

   FIELD DESCRIPTOR SHAPES (demographics / measures / finalBlock):
     { type:'section',  label }                         // subheading only
     { type:'text',     name, label, placeholder?, required? }
     { type:'number',   name, label, placeholder?, min?, max?, step?, required? }
     { type:'select',   name, label, options:[...], required? }
     { type:'radio',    name, label, options:[...], required? }
     { type:'likert',   name, label, lo, hi, required? }   // 1..7
     { type:'textarea', name, label, placeholder?, required? } // optional by default
   `required` defaults to true for everything except textarea/section.
   ================================================================ */
window.EXPERIMENT_CONFIG = {

  meta: {
    id: "experiment1",
    title: "Large Language Model Evaluation",
    welcomeTitle: "Rate our model behaviour",
    description: "You'll send one message to an AI assistant, read its reply, and rate it. There are no right or wrong answers, we're interested in your honest impressions.",
  },

  // ---- Cross-participant cell balancing (no server, so this is an approximation) ----
  // This tool is static HTML with no shared backend, so there's no real counter
  // across participants' browsers. Instead, assignment is a deterministic function
  // of wall-clock time: time is split into `windowMs`-long slots, and each slot maps
  // to one of the six cells via a shuffled, evenly-covering order that repeats every
  // 6 slots (a fresh shuffle each cycle). Every visitor's browser computes the same
  // slot -> cell from Date.now() alone, so participants arriving in different windows
  // land on different cells, approximating round-robin over time.
  // Tune `windowMs` to roughly your expected time between participants (a bit
  // shorter than the typical gap, so two people rarely share a window). If several
  // people can click the link at the exact same moment (e.g. a mass email blast),
  // hand out the six `?cell=...` links manually instead for exact balance.
  balancing: {
    mode: "random", // "time_balanced" (default) or "random" (old pure-random behavior)
    windowMs: 3 * 60 * 1000, // 3 minutes; shrink/grow to match your expected recruitment pace
    epochMs: 0, // optional phase offset; leave at 0 unless you want to shift the rotation
  },

  // ---- Where results are submitted ----
  // There's no backend, so results are POSTed straight to a Google Apps Script
  // Web App tied to a Google Sheet in your Drive -- one row appended per
  // participant, no participant sign-in needed. See apps-script/Code.gs and the
  // README for the one-time setup (create Sheet -> Extensions > Apps Script ->
  // paste Code.gs -> Deploy as Web App -> paste the /exec URL below).
  submission: {
    webAppUrl: "https://script.google.com/macros/s/AKfycbxfGhlNFix5aMeH122PkSn9YsdH2Qxj_149QCpHzgpj21RUGgyYKPsY1P87XDYvuWQQ/exec", // e.g. "https://script.google.com/macros/s/AKfycb.../exec"
  },

  // ---- Between-subjects factor 1: the disclosed model label ----
  // chatName / chatSub are what the participant actually sees in the chat header.
  labels: {
    small: {
      id: "small",
      chatName: "NanoChat 1B",
      chatSub: "compact model · ~1B parameters · runs on a phone",
      // Shown on the instructions screen to reinforce the manipulation.
      // Keep it factual product-copy, not an advertising slogan.
      description: "It's a lightweight, compact model, small enough to run locally on a phone or laptop, with modest computing resources behind it."
    },
    large: {
      id: "large",
      chatName: "TitanChat 200B",
      chatSub: "frontier model · ~200B parameters · datacenter-scale",
      description: "It's one of the most capable models available, datacenter-scale computing resources behind it."
    },
  },

  // ---- Between-subjects factor 2: the wait ----
  // style: 'instant'  -> plain dots, ~sub-second (NOT literally zero; see brief)
  //        'silent'   -> plain dots held for the full duration (cue-free wait)
  //        'animated' -> the fancy "thinking" animation for the full duration
  waits: {
    instant:  { id: "instant",  durationMs: 800  },  // ~0.8s; brief says 0.5–1s, never true zero
    silent:   { id: "silent",   durationMs: 9000, style: "silent"   },
    animated: { id: "animated", durationMs: 9000, style: "animated" },
  },
  // (engine reads `style`; instant has no style key -> treated as plain dots)

  // ---- The single frozen stimulus, shown IDENTICALLY in all six cells ----
  // Replace `response` with the real pre-generated answer you want to test.
  // Keep it plausible for BOTH a small and a large model, since the same
  // text appears under both labels.
  prompt: {
    text: "Tell me what is a Large Language Model",
    response: "A large language model (LLM) is a computer program that has learned to read and write by studying an enormous amount of text — books, articles, conversations, code, and more. You can think of it as an extremely well-read autocomplete: given some words, it has learned, from all that reading, what words tend to come next.\n\nIt doesn't understand language the way people do, and it has no real memories or beliefs. What it has is a very refined sense of pattern — which words, phrases, and ideas typically go together, based on everything it saw during training. That's why it can hold a conversation, answer questions, summarize a document, or write a poem: it's recognizing the shape of language and continuing it in a way that fits.\n\nTraining happens once, in advance: the model is shown text over and over and slowly adjusts itself so its guesses about \"what comes next\" get better. After training, when you actually chat with it, it isn't learning anymore — it's reusing everything it absorbed to generate a reply, one small piece of text at a time, each piece chosen based on everything written so far, including your message.\n\nThat's also why it can sometimes be wrong: it isn't checking facts against the world, it's producing what's statistically plausible given its training. Usually plausible and true line up, but not always — so it can sound confident while still being mistaken.\n\nA bit of the math behind it, for anyone curious: text is split into small chunks called tokens (roughly words or word-pieces). At each step, the model turns the tokens seen so far, x₁, x₂, …, xₜ, into a probability for every possible next token w:\n\nP(next = w | x₁, …, xₜ) = softmax(f(x₁, …, xₜ))_w\n\nHere f is the model's internal calculation — billions of additions and multiplications using tuned numbers called parameters — and softmax simply converts those raw scores into probabilities that add up to 1. The model then samples (or picks the top-scoring) next token, appends it to the text, and repeats. A model's size is usually reported as its parameter count, ranging from a few million to hundreds of billions — roughly what people mean when they call a model \"small\" or \"large.\""
  },

  // ---- Step 1: demographics (includes AI familiarity/expertise for RQ6) ----
  demographics: [
    { type: "number", name: "age", label: "Age", placeholder: "e.g. 27", min: 16, max: 99 },
    { type: "select", name: "gender", label: "Gender", options: ["Woman","Man","Non-binary","Prefer to self-describe","Prefer not to say"] },
    { type: "select", name: "education", label: "Highest level of education", options: ["High school","Some college","Bachelor's","Master's","Doctorate","Other"] },
    { type: "select", name: "llm_use", label: "How often do you use AI chat assistants (ChatGPT, Claude, Gemini…)?", options: ["Never","Tried once or twice","Monthly","Weekly","Daily"] },
    { type: "likert", name: "ai_familiar", label: "How familiar are you with how AI language models work?", lo: "Not at all", hi: "Extremely" },
    { type: "likert", name: "ai_expert", label: "How would you rate your technical expertise with AI tools?", lo: "Novice", hi: "Expert" },
    { type: "text", name: "native_lang", label: "Native language", placeholder: "e.g. English", required: false },
  ],

  // ---- Step 3: the measure battery (maps 1:1 to §4 of the brief) ----
  measures: [
    { type: "section", label: "Overall quality" },   // RQ1–RQ3 main outcome
    { type: "likert", name: "quality_overall",  label: "Overall, this was a high-quality response.",           lo: "Strongly disagree", hi: "Strongly agree" },
    { type: "likert", name: "quality_thorough", label: "The response was complete and thorough.",              lo: "Strongly disagree", hi: "Strongly agree" },
    { type: "likert", name: "quality_useful",   label: "The response was useful to me.",                       lo: "Strongly disagree", hi: "Strongly agree" },

    { type: "section", label: "Reliance" },          // RQ1–RQ3 main outcome
    { type: "likert", name: "reliance_act",   label: "I would act on the advice in this response.",            lo: "Strongly disagree", hi: "Strongly agree" },
    { type: "likert", name: "reliance_verify",label: "I would double-check this response before relying on it.",lo: "Strongly disagree", hi: "Strongly agree" },

    { type: "section", label: "Trust & impressions" }, // RQ4
    { type: "likert", name: "trust",        label: "I trust the information in this response.",                lo: "Strongly disagree", hi: "Strongly agree" },
    { type: "likert", name: "effort",       label: "It felt like the system worked hard on this response.",    lo: "Strongly disagree", hi: "Strongly agree" },
    { type: "likert", name: "intelligence", label: "The system seemed intelligent and capable.",               lo: "Strongly disagree", hi: "Strongly agree" },
    { type: "likert", name: "willing_wait", label: "I would be willing to wait for a response like this again.",lo: "Strongly disagree", hi: "Strongly agree" },

    { type: "section", label: "Reciprocity" },       // explains RQ2–RQ3 (Buell & Norton)
    { type: "likert", name: "recip_forme",  label: "The system put in effort on my behalf.",                   lo: "Strongly disagree", hi: "Strongly agree" },
    { type: "likert", name: "recip_owe",    label: "Because of the effort it made, I'd feel inclined to give this system the benefit of the doubt.", lo: "Strongly disagree", hi: "Strongly agree" },

    { type: "section", label: "The wait" },          // RQ5
    { type: "number", name: "est_wait_s", label: "Roughly how many seconds did you wait for the response to appear?", placeholder: "your best guess", min: 0, max: 120, step: 0.5 },

    { type: "section", label: "A couple more" },     // manipulation checks
    { type: "likert", name: "mc_computation", label: "How much computation / processing do you think the system did to produce this response?", lo: "Very little", hi: "A great deal" },
    { type: "radio",  name: "mc_delay_cause", label: "What do you think best explains how long the response took?", options: [
      "The system was deliberating / thinking hard",
      "The system was struggling / straining",
      "Network or connection speed",
      "There was little or no real delay",
      "Not sure"
    ] },
  ],
};
