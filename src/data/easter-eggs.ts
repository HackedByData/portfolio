/** Client-side intercepted commands — zero API cost. Keys are lowercase. */
export const easterEggs: Record<string, string> = {
  help: [
    "AVAILABLE COMMANDS:",
    "  help              this menu",
    "  whoami            identify yourself",
    "  ls                list unit filesystem",
    "  sudo hire devin   escalate privileges",
    "  rm -rf doubts     free up disk space",
    "  clear             wipe the terminal",
    "…or just type a question. The unit answers.",
  ].join("\n"),
  whoami: "visitor. clearance: PUBLIC. lucky for you, the unit likes visitors.",
  ls: "specs/  benchmarks/  modules/  training_data/  changelog/  secrets/ [ACCESS DENIED]",
  "sudo hire devin":
    "PERMISSION GRANTED. routing you to UPLINK… (email is at the bottom of this page. the unit responds quickly.)",
  "rm -rf doubts": "removing doubts… done. 0 doubts remain on this filesystem.",
};

export type Chip = { id: string; label: string; prompt: string };

export const chips: Chip[] = [
  {
    id: "pitch",
    label: "give me the 30-second pitch",
    prompt: "Give me the 30-second pitch on Devin.",
  },
  {
    id: "hire",
    label: "why should I hire this unit?",
    prompt: "Why should I hire Devin?",
  },
  {
    id: "retrier",
    label: "what is retrier?",
    prompt: "What is Retrier?",
  },
];

/** Canned chip answers for scripted fallback mode (no API available). */
export const scriptedResponses: Record<string, string> = {
  pitch:
    "DEVIN McCAW: co-founder & CEO of Retrier (AI follow-up that wins back the sales retail reps let walk). CS & Engineering @ UC Irvine, 3.846 GPA, Dean's List every quarter. Before that: 150–200% of quota at Verizon and a #1-of-802 nationwide store rank at MarketSource. Builds AI systems. Sells them too. Rare combination. The unit recommends acquiring it before a competitor does.",
  hire:
    "three reasons. (1) ships: builds Retrier himself, and built Parasource end-to-end — Next.js, FastAPI, pgvector RAG, AWS. (2) sells: #1-of-802 store rank, 150–200% quota, +600% team productivity, Verizon pitch-competition winner at store and district level. (3) leads: founded ZotLabs and a 350%-growth fraternity chapter in the same year. hiring managers historically do not regret this.",
  retrier:
    "RETRIER.AI — wins back the sales retail reps let walk. reps log a visit in under a minute; opted-in customers get a same-day recap from Ret, the rep's AI assistant, then one offer at a time from the store's own menu. the rep closes and keeps the commission. built for franchise wireless stores; performance-based pricing, now accepting pilots. see retrier.ai.",
};

export const RESTING_MESSAGE =
  "UNIT IS RESTING — live uplink unavailable. canned responses only: try the buttons above, or come back later.";

export const SESSION_LIMIT_MESSAGE =
  "SESSION LIMIT REACHED — the unit conserves tokens like it conserves excuses: aggressively. email devin.mccaw@outlook.com to continue offline.";

export const TRANSIENT_ERROR_MESSAGE =
  "TRANSMISSION INTERRUPTED — signal lost mid-stream. re-send your question to try again.";
