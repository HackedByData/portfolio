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
    id: "parasource",
    label: "what is parasource?",
    prompt: "What is Parasource?",
  },
];

/** Canned chip answers for scripted fallback mode (no API available). */
export const scriptedResponses: Record<string, string> = {
  pitch:
    "DEVIN McCAW: founder & CEO of Parasource (AI firm-brain for immigration legal services). CS & Engineering @ UC Irvine, 3.846 GPA, Dean's List every quarter. Before that: 150–200% of quota at Verizon and a #1-of-802 nationwide store rank at MarketSource. Builds AI systems. Sells them too. Rare combination. The unit recommends acquiring it before a competitor does.",
  hire:
    "three reasons. (1) ships: built Parasource end-to-end — Next.js, FastAPI, pgvector RAG, AWS. (2) sells: #1-of-802 store rank, 150–200% quota, +600% team productivity. (3) leads: founded ZotLabs and a 350%-growth fraternity chapter in the same year. hiring managers historically do not regret this.",
  parasource:
    "PARASOURCE.EXE — the firm brain for immigration practice. A per-organization knowledge core serving multilingual intake (11 languages), a lawyer-gated client responder, and a caseworker assistant. Legal information only; a human attorney always gates anything advice-like. see parasource.ai.",
};

export const RESTING_MESSAGE =
  "UNIT IS RESTING — live uplink unavailable. canned responses only: try the buttons above, or come back later.";

export const SESSION_LIMIT_MESSAGE =
  "SESSION LIMIT REACHED — the unit conserves tokens like it conserves excuses: aggressively. email devin.mccaw@outlook.com to continue offline.";

export const TRANSIENT_ERROR_MESSAGE =
  "TRANSMISSION INTERRUPTED — signal lost mid-stream. re-send your question to try again.";
