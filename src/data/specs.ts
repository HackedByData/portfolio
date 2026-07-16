export type SpecGroup = {
  id: string;
  label: string;
  status: string;
  skills: string[];
};

export const specGroups: SpecGroup[] = [
  {
    id: "neural",
    label: "NEURAL SYSTEMS",
    status: "ONLINE",
    skills: [
      "RAG pipelines",
      "LangChain",
      "Vector databases (pgvector)",
      "Anthropic Claude API",
      "OpenAI API",
      "LLM prompt engineering",
      "Subagent-driven development",
      "Human-in-the-loop gating",
    ],
  },
  {
    id: "persuasion",
    label: "PERSUASION SYSTEMS",
    status: "ONLINE",
    skills: [
      "Consultative sales",
      "Go-to-market strategy",
      "Customer discovery",
      "Stakeholder management",
      "MVP scoping",
      "Roadmap planning",
      "Recruiting & growth",
    ],
  },
  {
    id: "runtime",
    label: "RUNTIME",
    status: "ONLINE",
    skills: [
      "Python",
      "C/C++",
      "TypeScript / JavaScript",
      "React",
      "Next.js",
      "Node.js",
      "SQL",
      "Arduino",
    ],
  },
  {
    id: "infra",
    label: "INFRASTRUCTURE",
    status: "ONLINE",
    skills: [
      "AWS (EC2, S3, Lambda)",
      "Docker",
      "PostgreSQL",
      "CI/CD",
      "Cloudflare",
      "Git",
      "Test-driven development",
    ],
  },
];

export const certification =
  "FIRMWARE CERTIFICATION: CompTIA Security+ (network security, threat mitigation, identity management)";

export type Diagnostic = { label: string; fill: number; note: string };

/** Openly comedic self-diagnostics — clearly jokes, not measurements. */
export const diagnostics: Diagnostic[] = [
  { label: "CAFFEINE BUFFER", fill: 97, note: "nominal" },
  { label: "WORK ETHIC", fill: 100, note: "value clamped at max" },
  { label: "HUMILITY MODULE", fill: 12, note: "file not found" },
];
