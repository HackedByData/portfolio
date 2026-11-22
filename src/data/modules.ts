export type Venture = {
  id: string;
  name: string;
  role: string;
  description: string;
  statusLine: string;
  href?: string;
  linkLabel?: string;
};

export const ventures: Venture[] = [
  {
    id: "retrier",
    name: "RETRIER.AI",
    role: "Co-Founder & CEO",
    description:
      "Wins back the sales retail reps let walk. Reps log a visit in under a minute; opted-in customers get a same-day recap from Ret, the rep's AI assistant, then one offer at a time from the store's own menu. The rep takes over the close and keeps the commission. Built for franchise wireless stores, with performance-based pricing.",
    statusLine: "PRIMARY PROCESS · now accepting pilots",
    href: "https://retrier.ai",
    linkLabel: "retrier.ai",
  },
  {
    id: "parasource",
    name: "PARASOURCE.EXE",
    role: "Founder & CEO",
    description:
      "The firm brain for immigration practice: a per-organization knowledge core with multilingual intake (11 languages), a lawyer-gated client responder, and a caseworker assistant. Provides legal information only — never autonomous legal advice.",
    statusLine: "BACKGROUND PROCESS · uptime since Apr 2026",
    href: "https://www.parasource.ai",
    linkLabel: "parasource.ai",
  },
  {
    id: "daisyhelps",
    name: "DAISYHELPS.APP",
    role: "Lead Developer & Product Manager",
    description:
      "An AI assistant that sits as an overlay and guides tech-illiterate users through their own computer. React + Python, with LLM workflows across ElevenLabs, Claude, and Groq.",
    statusLine: "RUNNING · shipped May 2026",
    href: "https://github.com/hackedbydata/daisyhelps",
    linkLabel: "github.com/hackedbydata/daisyhelps",
  },
  {
    id: "zotlabs",
    name: "ZOTLABS.ORG",
    role: "Founder & Vice-President",
    description:
      "UCI student incubator. Directed product strategy for three flagship incubations from ideation to MVP and secured funding for infrastructure and development.",
    statusLine: "RUNNING · uptime since Jan 2026",
  },
];
