# devinmccaw.com Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy devinmccaw.com — an android-dossier personal site ("the DEVIN unit") with a real streaming LLM interrogation terminal.

**Architecture:** Statically-generated single-page Next.js 16 App Router app plus one streaming route handler (`POST /api/chat`) using the Vercel AI SDK v7 with `gpt-5-nano`. All resume content lives in typed data modules consumed by both the page sections and the chat system prompt. All motion is CSS keyframes triggered by a small IntersectionObserver wrapper.

**Tech Stack:** Next.js 16.2.x (Turbopack default) · React 19 · TypeScript (version pinned by scaffold — do NOT upgrade) · Tailwind CSS 4.3.x (CSS-first, `@theme`) · ai@7 + @ai-sdk/react@4 + @ai-sdk/openai@4 + zod · Vitest 4 + vite-tsconfig-paths · Vercel hosting.

**Spec:** `docs/superpowers/specs/2026-07-16-devinmccaw-site-design.md` (approved). The spec governs content and behavior; this plan implements it.

## Global Constraints

- Working dir is `C:\Users\devin\New folder\portfolio` — the path contains a space; ALWAYS quote paths in shell commands.
- Shell is PowerShell 5.1: no `&&` chaining — use `;` or separate commands. Quote `"@/*"` (bare `@` is splatting syntax).
- Never commit `.env.local`, `DevinMcCawResumeSS26.pdf`, or either original `*.jpg` with UUID names (only the copied `public/images/devin-hero.jpg` gets committed). Never put the phone number, street address, resume PDF, or transcript anywhere in `src/`, `public/`, or any committed file.
- AI SDK v7 API (verified 2026-07-16): `instructions:` not `system:` (deprecated); `await convertToModelMessages(...)` (async in v7); respond with `createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) })`; `useChat` has NO `input`/`handleSubmit` — manage input yourself and call `sendMessage({ text })`; message shape is `{ id, role, parts }` (no `.content`); status values: `'submitted' | 'streaming' | 'ready' | 'error'`.
- Tailwind v4 is CSS-first: no `tailwind.config.js`; tokens in `globals.css` via `@theme` / `@theme inline` (inline for tokens whose value is another CSS var). Custom animations: `--animate-<name>` + `@keyframes` inside `@theme`.
- Do not install `typescript@latest` (npm latest is the 7.x line) or `tailwindcss@next` (older than latest). Keep scaffold-pinned versions.
- All animations must be disabled or pre-completed under `prefers-reduced-motion: reduce`.
- Run tests with `npm test` (`vitest run` — never bare `vitest` in scripts; it watches forever).
- Every commit message ends with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Copy tone rule (from spec): jokes live in labels/framing; every number and fact stays literal. Do not "improve" the numbers.

---

## File structure (end state)

```
src/
  app/
    layout.tsx            fonts, metadata, viewport, scanline overlay
    page.tsx              assembles all sections + JSON-LD
    globals.css           tokens, keyframes, textures, component CSS
    api/chat/route.ts     guarded streaming chat endpoint
    opengraph-image.tsx   generated OG card
    icon.tsx              generated favicon
    robots.ts / sitemap.ts
  components/
    BootOverlay.tsx  Nav.tsx  Hero.tsx  Panel.tsx  Reveal.tsx  SectionHeader.tsx
    SpecSheet.tsx  Benchmarks.tsx  Modules.tsx  TrainingData.tsx  Changelog.tsx
    Terminal.tsx  Uplink.tsx
  data/
    profile.ts  specs.ts  benchmarks.ts  modules.ts  education.ts  changelog.ts  easter-eggs.ts
  lib/
    chat-guards.ts  chat-guards.test.ts  system-prompt.ts  system-prompt.test.ts
    model.ts  model.test.ts
public/images/devin-hero.jpg
vitest.config.mts
```

---

### Task 1: Scaffold Next.js 16 into this repo

**Files:**
- Create: entire Next.js scaffold (`package.json`, `src/app/*`, `postcss.config.mjs`, `tsconfig.json`, …)
- Modify: `.gitignore` (re-merge custom rules — create-next-app OVERWRITES it)

**Interfaces:**
- Consumes: nothing
- Produces: a running `npm run dev` Next 16 app with Tailwind v4, `src/` dir, `@/*` alias

- [ ] **Step 1: Stash files create-next-app rejects, scaffold, restore**

create-next-app refuses non-empty dirs unless every top-level entry is allowlisted. `.git`, `.gitignore`, `docs/` pass; `README.md`, `.env*`, the PDF, and the two `.jpg`s FAIL. Stash them (PowerShell, from the project root):

```powershell
$env:npm_config_audit = "false"; $env:npm_config_fund = "false"
New-Item -ItemType Directory -Force ..\_cna-stash | Out-Null
Move-Item README.md, .env.local, .env.example, DevinMcCawResumeSS26.pdf, *.jpg ..\_cna-stash\
npx --yes create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --disable-git --no-agents-md --yes
Move-Item ..\_cna-stash\* . -Force
Remove-Item ..\_cna-stash
```

Note: `--no-agents-md` prevents overwriting repo docs with generated AGENTS.md/CLAUDE.md; `Move-Item ... -Force` restores our README over the generated one.

- [ ] **Step 2: Re-merge .gitignore (template replaced ours)**

The template `.gitignore` already ignores `.env*` and Next.js outputs. Append our custom rules to the END of the generated `.gitignore`:

```gitignore

# env example is safe to commit
!.env.example

# private source material — never publish
DevinMcCawResumeSS26.pdf
*.jpg
!public/**/*.jpg
```

(`*.jpg` blocks the two UUID-named originals in the root; `!public/**/*.jpg` re-allows the committed hero copy.)

- [ ] **Step 3: Verify scaffold runs**

```powershell
npm run dev
```
Expected: `▲ Next.js 16.x` ready on `http://localhost:3000`, template page renders. Stop with Ctrl+C. Then verify the untracked/ignored state:

```powershell
git status --short
git check-ignore .env.local DevinMcCawResumeSS26.pdf
```
Expected: `.env.local` and the PDF both print (= ignored); the two UUID `.jpg`s do NOT appear in `git status` untracked output (ignored by `*.jpg`).

- [ ] **Step 4: Commit**

```powershell
git add -A
git commit -m "feat: scaffold Next.js 16 app (TS, Tailwind v4, src dir)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Design tokens, fonts, global styles, empty shell

**Files:**
- Modify: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Delete: `src/app/favicon.ico` if present (Task 14 generates `icon.tsx`), template SVGs in `public/`

**Interfaces:**
- Consumes: scaffold from Task 1
- Produces: CSS utility/classes used by ALL later tasks: `font-sans` (Space Grotesk), `font-mono` (IBM Plex Mono), colors `bg`, `panel`, `signal`, `phosphor`, `body`, `amber`, `grid-line`; component classes `.panel-brackets`, `.bg-blueprint`, `.cursor-blink`, `.reveal`, `.is-revealed`, `.reveal-type`, `.bar-fill`; keyframe utilities `animate-*`. Layout exposes `--font-space-grotesk`, `--font-ibm-plex-mono`.

- [ ] **Step 1: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Variable font (wght 300-700): no weight option needed.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

// NOT a variable font: weight is REQUIRED or the build fails.
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "700"],
});

// Placeholder metadata — Task 14 replaces this block with the full SEO surface.
export const metadata: Metadata = {
  title: "Devin McCaw",
  description: "Founder, engineer, salesman-class unit.",
};

export const viewport: Viewport = {
  themeColor: "#0A0E0F",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}
    >
      <body>
        {children}
        {/* full-page scanline texture */}
        <div aria-hidden className="scanlines" />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Replace `src/app/globals.css`**

```css
@import "tailwindcss";

/* Tokens whose value is another CSS var must be @theme inline. */
@theme inline {
  --font-sans: var(--font-space-grotesk);
  --font-mono: var(--font-ibm-plex-mono);
}

@theme {
  /* palette (spec §5) */
  --color-bg: #0a0e0f;
  --color-panel: #0e1512;
  --color-signal: #00ff9c;
  --color-phosphor: #63b891; /* dim phosphor green, secondary text */
  --color-body: #e6edea; /* off-white body copy */
  --color-amber: #ffb000; /* used at most twice on the page */
  --color-grid-line: rgba(0, 255, 156, 0.07);

  /* motion */
  --animate-blink: blink 1.1s step-end infinite;
  @keyframes blink {
    50% {
      opacity: 0;
    }
  }

  --animate-fade-up: fade-up 0.6s ease-out both;
  @keyframes fade-up {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

body {
  background: var(--color-bg);
  color: var(--color-body);
  font-family: var(--font-sans);
}

/* ---------- textures ---------- */

.scanlines {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 50;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.55) 3px
  );
  opacity: 0.14;
}

.bg-blueprint {
  background-image:
    linear-gradient(var(--color-grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid-line) 1px, transparent 1px);
  background-size: 48px 48px;
}

/* ---------- panel with corner brackets ---------- */

.panel-brackets {
  position: relative;
  background: color-mix(in oklab, var(--color-panel) 82%, transparent);
  border: 1px solid rgba(0, 255, 156, 0.18);
}
.panel-brackets::before,
.panel-brackets::after {
  content: "";
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: var(--color-signal);
  border-style: solid;
}
.panel-brackets::before {
  top: -1px;
  left: -1px;
  border-width: 2px 0 0 2px;
}
.panel-brackets::after {
  bottom: -1px;
  right: -1px;
  border-width: 0 2px 2px 0;
}

/* ---------- blinking cursor ---------- */

.cursor-blink::after {
  content: "█";
  margin-left: 0.15em;
  color: var(--color-signal);
  animation: var(--animate-blink);
}

/* ---------- scroll reveal (Reveal.tsx toggles .is-revealed) ---------- */

@media (prefers-reduced-motion: no-preference) {
  .reveal .reveal-item {
    opacity: 0;
  }
  .reveal.is-revealed .reveal-item {
    animation: var(--animate-fade-up);
  }

  /* typed-in headings: element sets --type-ch to its own character count */
  .reveal .reveal-type {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    max-width: 0;
    vertical-align: bottom;
  }
  .reveal.is-revealed .reveal-type {
    animation: typing 0.9s steps(24, end) forwards;
  }
  @keyframes typing {
    from {
      max-width: 0;
    }
    to {
      max-width: var(--type-ch, 30ch);
    }
  }

  /* diagnostics bars: element sets --fill (0-100%) */
  .reveal .bar-fill {
    width: 0;
  }
  .reveal.is-revealed .bar-fill {
    animation: bar-fill 1s ease-out forwards;
  }
  @keyframes bar-fill {
    to {
      width: var(--fill, 100%);
    }
  }
}

/* reduced motion: everything visible, bars full, no animation */
@media (prefers-reduced-motion: reduce) {
  .bar-fill {
    width: var(--fill, 100%);
  }
  .cursor-blink::after {
    animation: none;
  }
  .scanlines {
    display: none;
  }
}

html {
  scroll-behavior: smooth;
}
section[id] {
  scroll-margin-top: 5rem;
}
```

- [ ] **Step 3: Replace `src/app/page.tsx` with an empty shell**

```tsx
export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4">
      <h1 className="font-mono text-signal cursor-blink pt-24 text-2xl">
        DEVIN.OS
      </h1>
    </main>
  );
}
```

- [ ] **Step 4: Delete template assets**

```powershell
Remove-Item src\app\favicon.ico -ErrorAction SilentlyContinue
Remove-Item public\next.svg, public\vercel.svg, public\globe.svg, public\file.svg, public\window.svg -ErrorAction SilentlyContinue
```

- [ ] **Step 5: Verify**

```powershell
npm run dev
```
Expected: near-black page, green `DEVIN.OS` in IBM Plex Mono with blinking block cursor, faint scanlines. Stop server.

- [ ] **Step 6: Commit**

```powershell
git add -A
git commit -m "feat: lab-terminal design tokens, fonts, global textures

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Content data modules

**Files:**
- Create: `src/data/profile.ts`, `src/data/specs.ts`, `src/data/benchmarks.ts`, `src/data/modules.ts`, `src/data/education.ts`, `src/data/changelog.ts`, `src/data/easter-eggs.ts`

**Interfaces:**
- Consumes: nothing
- Produces (exact exports later tasks import):
  - `profile: { name; unitId; unitClass; status; location; tagline; email; linkedin; github; parasource; domain; ogDescription }` (all `string`)
  - `specGroups: SpecGroup[]` where `SpecGroup = { id: string; label: string; status: string; skills: string[] }`; `certification: string`; `diagnostics: Diagnostic[]` where `Diagnostic = { label: string; fill: number; note: string }`
  - `benchmarks: Benchmark[]` where `Benchmark = { id: string; end: number; format: (n: number) => string; label: string; caption: string }`
  - `ventures: Venture[]` where `Venture = { id: string; name: string; role: string; description: string; statusLine: string; href?: string; linkLabel?: string }`
  - `education: EducationEntry[]` where `EducationEntry = { school: string; credential: string; period: string; details: string[] }`; `overclockLine: string`
  - `changelog: ChangelogEntry[]` where `ChangelogEntry = { version: string; date: string; title: string; detail: string }`
  - `easterEggs: Record<string, string>`; `chips: Chip[]` where `Chip = { id: string; label: string; prompt: string }`; `scriptedResponses: Record<string, string>`; `RESTING_MESSAGE: string`; `SESSION_LIMIT_MESSAGE: string`; `TRANSIENT_ERROR_MESSAGE: string`

- [ ] **Step 1: Create `src/data/profile.ts`**

```ts
export const profile = {
  name: "Devin McCaw",
  unitId: "UNIT MCW-2027",
  unitClass: "FOUNDER-CLASS",
  status: "OPERATIONAL",
  location: "IRVINE, CA",
  tagline:
    "Founder & CEO of Parasource. CS & Engineering @ UC Irvine. Sold phones at a #1-of-802 clip before pivoting to selling the future.",
  email: "devin.mccaw@outlook.com",
  // NOTE: confirm exact LinkedIn slug with Devin before deploy.
  linkedin: "https://www.linkedin.com/in/devinmccaw",
  github: "https://github.com/hackedbydata",
  parasource: "https://www.parasource.ai",
  domain: "https://devinmccaw.com",
  ogDescription:
    "Founder & CEO of Parasource. CS & Engineering @ UC Irvine. AI systems, sales records, and one slightly smug android interface.",
} as const;
```

- [ ] **Step 2: Create `src/data/specs.ts`**

```ts
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
```

- [ ] **Step 3: Create `src/data/benchmarks.ts`**

```ts
export type Benchmark = {
  id: string;
  end: number;
  format: (n: number) => string;
  label: string;
  caption: string;
};

export const benchmarks: Benchmark[] = [
  {
    id: "quota",
    end: 200,
    format: (n) => `${n}%`,
    label: "REVENUE VS QUOTA",
    caption: "Averaged 150–200% of sales quota at Verizon, 2024–2025.",
  },
  {
    id: "rank",
    end: 802,
    format: (n) => `#1/${n}`,
    label: "NATIONWIDE STORE RANK",
    caption:
      "Drove his MarketSource store to #1 in the nation out of 802 stores.",
  },
  {
    id: "productivity",
    end: 600,
    format: (n) => `+${n}%`,
    label: "TEAM SALES PRODUCTIVITY",
    caption:
      "Increased sales productivity 600%+ YTD by training new reps at MarketSource.",
  },
  {
    id: "growth",
    end: 350,
    format: (n) => `${n}%`,
    label: "ORG GROWTH, ONE QUARTER",
    caption:
      "Grew Triangle Fraternity 350% in one quarter — fastest-growing chapter nationwide.",
  },
];
```

- [ ] **Step 4: Create `src/data/modules.ts`**

```ts
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
    id: "parasource",
    name: "PARASOURCE.EXE",
    role: "Founder & CEO",
    description:
      "The firm brain for immigration practice: a per-organization knowledge core with multilingual intake (11 languages), a lawyer-gated client responder, and a caseworker assistant. Provides legal information only — never autonomous legal advice.",
    statusLine: "RUNNING · uptime since Apr 2026",
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
```

- [ ] **Step 5: Create `src/data/education.ts`**

```ts
export type EducationEntry = {
  school: string;
  credential: string;
  period: string;
  details: string[];
};

export const education: EducationEntry[] = [
  {
    school: "University of California, Irvine",
    credential: "BS, Computer Science & Engineering · Minor in Innovation & Entrepreneurship",
    period: "2025 – 2027 (expected)",
    details: [
      "GPA 3.846 / 4.0",
      "Dean's Honor List — every quarter to date",
      "Coursework: ML & data mining, AI, algorithms, embedded software, operating systems, digital systems",
    ],
  },
  {
    school: "Chaffey College",
    credential: "Four AS degrees: Computer Science, Math, Physics, Physical Science — with Honors",
    period: "2022 – 2025",
    details: ["GPA 3.6 / 4.0", "113 units transferred"],
  },
];

export const overclockLine =
  "CURRENT LOAD: 24 units (summer quarter) — unit is overclocked";
```

- [ ] **Step 6: Create `src/data/changelog.ts`**

```ts
export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  detail: string;
};

export const changelog: ChangelogEntry[] = [
  {
    version: "v2026.4",
    date: "Apr 2026",
    title: "PARASOURCE.EXE deployed",
    detail:
      "Founded Parasource Inc. as CEO — AI firm-brain platform for immigration nonprofits and law firms. Full stack: Next.js, FastAPI, PostgreSQL + pgvector, AWS.",
  },
  {
    version: "v2026.1",
    date: "Jan 2026",
    title: "ZOTLABS module installed",
    detail:
      "Founded ZotLabs at UCI; VP overseeing three incubations from ideation to MVP.",
  },
  {
    version: "v2025.11",
    date: "Nov 2025",
    title: "Cybersecurity evaluation patch",
    detail:
      "Handshake AI Fellowship — evaluated LLM outputs for accuracy and depth in cybersecurity as an AI trainer.",
  },
  {
    version: "v2025.9",
    date: "Sep 2025",
    title: "Migrated to UCI · Triangle founding father",
    detail:
      "Transferred to UC Irvine (CS&E). Co-founded UCI's Triangle chapter as VP of Growth — +350% in one quarter, fastest-growing chapter nationwide.",
  },
  {
    version: "v2024.8",
    date: "Aug 2024",
    title: "SALES_ENGINE v2 (Verizon)",
    detail:
      "Retail sales at Verizon — consistent top performer at 150–200% of revenue quota.",
  },
  {
    version: "v2023.8",
    date: "Aug 2023",
    title: "SALES_ENGINE v1 (MarketSource)",
    detail:
      "Promoted to Mobile Department Lead after holding the #1 individual sales rank district-wide; store reached #1 of 802 nationwide.",
  },
  {
    version: "v2022.8",
    date: "Aug 2022",
    title: "Initial boot (Chaffey College)",
    detail:
      "Compiled four associate degrees in parallel — CS, Math, Physics, Physical Science — with honors.",
  },
];
```

- [ ] **Step 7: Create `src/data/easter-eggs.ts`**

```ts
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
```

- [ ] **Step 8: Typecheck and commit**

```powershell
npx tsc --noEmit
```
Expected: exits 0, no errors.

```powershell
git add src/data
git commit -m "feat: typed content data modules (single source of truth)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Vitest + chat guards, system prompt, model parsing (TDD)

**Files:**
- Create: `vitest.config.mts`, `src/lib/chat-guards.ts`, `src/lib/chat-guards.test.ts`, `src/lib/system-prompt.ts`, `src/lib/system-prompt.test.ts`, `src/lib/model.ts`, `src/lib/model.test.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Consumes: `src/data/*` (Task 3)
- Produces:
  - `chat-guards.ts`: `MAX_MESSAGES_PER_SESSION = 15`, `MAX_INPUT_CHARS = 500`, `MAX_HISTORY_MESSAGES = 8`, `RATE_LIMIT_MAX = 20`, `RATE_LIMIT_WINDOW_MS = 3_600_000`; `type GuardResult = { ok: true } | { ok: false; status: number; error: string }`; `validateChatMessages(messages: unknown): GuardResult`; `truncateHistory<T>(messages: T[]): T[]`; `checkRateLimit(ip: string, now?: number, store?: Map<string, { count: number; windowStart: number }>): boolean`
  - `system-prompt.ts`: `buildSystemPrompt(): string`
  - `model.ts`: `DEFAULT_MODEL = "openai/gpt-5-nano"`; `type ParsedModel = { provider: "openai" | "anthropic"; modelId: string; warning?: string }`; `parseModelEnv(value: string | undefined): ParsedModel` (spec §2 requires the swap to another provider to be env-only — both providers must be wired)

- [ ] **Step 1: Install and configure Vitest**

```powershell
npm install -D vitest vite-tsconfig-paths
```

Create `vitest.config.mts`:

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

Add scripts to `package.json` (keep existing ones):

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Write failing tests `src/lib/chat-guards.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  MAX_HISTORY_MESSAGES,
  MAX_INPUT_CHARS,
  MAX_MESSAGES_PER_SESSION,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  checkRateLimit,
  truncateHistory,
  validateChatMessages,
} from "@/lib/chat-guards";

const userMsg = (text: string) => ({
  id: "x",
  role: "user",
  parts: [{ type: "text", text }],
});
const assistantMsg = (text: string) => ({
  id: "y",
  role: "assistant",
  parts: [{ type: "text", text }],
});

describe("validateChatMessages", () => {
  it("accepts a normal conversation", () => {
    expect(validateChatMessages([userMsg("hi")])).toEqual({ ok: true });
  });

  it("rejects non-arrays", () => {
    const r = validateChatMessages("nope");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it("rejects an empty array", () => {
    const r = validateChatMessages([]);
    expect(r.ok).toBe(false);
  });

  it("rejects malformed message objects", () => {
    const r = validateChatMessages([{ role: "user" }]);
    expect(r.ok).toBe(false);
  });

  it("rejects user text over MAX_INPUT_CHARS", () => {
    const r = validateChatMessages([userMsg("a".repeat(MAX_INPUT_CHARS + 1))]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it("allows user text at exactly MAX_INPUT_CHARS", () => {
    expect(
      validateChatMessages([userMsg("a".repeat(MAX_INPUT_CHARS))]),
    ).toEqual({ ok: true });
  });

  it("rejects sessions with more than MAX_MESSAGES_PER_SESSION user messages", () => {
    const msgs = Array.from(
      { length: MAX_MESSAGES_PER_SESSION + 1 },
      (_, i) => userMsg(`m${i}`),
    );
    const r = validateChatMessages(msgs);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it("does not count assistant messages toward the session cap", () => {
    const msgs = [
      ...Array.from({ length: MAX_MESSAGES_PER_SESSION - 1 }, (_, i) =>
        userMsg(`m${i}`),
      ),
      assistantMsg("reply"),
      userMsg("last"),
    ];
    expect(validateChatMessages(msgs)).toEqual({ ok: true });
  });
});

describe("truncateHistory", () => {
  it("keeps the last MAX_HISTORY_MESSAGES messages", () => {
    const msgs = Array.from({ length: 20 }, (_, i) => userMsg(`m${i}`));
    const out = truncateHistory(msgs);
    expect(out).toHaveLength(MAX_HISTORY_MESSAGES);
    expect(out[out.length - 1]).toBe(msgs[19]);
  });

  it("returns short histories unchanged", () => {
    const msgs = [userMsg("a"), assistantMsg("b")];
    expect(truncateHistory(msgs)).toEqual(msgs);
  });
});

describe("checkRateLimit", () => {
  it("allows up to RATE_LIMIT_MAX requests then blocks", () => {
    const store = new Map<string, { count: number; windowStart: number }>();
    const now = 1_000_000;
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      expect(checkRateLimit("1.2.3.4", now, store)).toBe(true);
    }
    expect(checkRateLimit("1.2.3.4", now, store)).toBe(false);
  });

  it("resets after the window elapses", () => {
    const store = new Map<string, { count: number; windowStart: number }>();
    const now = 1_000_000;
    for (let i = 0; i < RATE_LIMIT_MAX; i++) checkRateLimit("ip", now, store);
    expect(checkRateLimit("ip", now, store)).toBe(false);
    expect(checkRateLimit("ip", now + RATE_LIMIT_WINDOW_MS + 1, store)).toBe(
      true,
    );
  });

  it("tracks IPs independently", () => {
    const store = new Map<string, { count: number; windowStart: number }>();
    const now = 1_000_000;
    for (let i = 0; i < RATE_LIMIT_MAX; i++) checkRateLimit("a", now, store);
    expect(checkRateLimit("a", now, store)).toBe(false);
    expect(checkRateLimit("b", now, store)).toBe(true);
  });
});
```

- [ ] **Step 3: Run tests, verify they fail**

```powershell
npm test
```
Expected: FAIL — cannot resolve `@/lib/chat-guards`.

- [ ] **Step 4: Implement `src/lib/chat-guards.ts`**

```ts
export const MAX_MESSAGES_PER_SESSION = 15;
export const MAX_INPUT_CHARS = 500;
export const MAX_HISTORY_MESSAGES = 8;
export const RATE_LIMIT_MAX = 20;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export type GuardResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

type LooseMessage = {
  role?: unknown;
  parts?: unknown;
};

function textOf(message: LooseMessage): string {
  if (!Array.isArray(message.parts)) return "";
  return message.parts
    .filter(
      (p): p is { type: string; text: string } =>
        typeof p === "object" &&
        p !== null &&
        (p as { type?: unknown }).type === "text" &&
        typeof (p as { text?: unknown }).text === "string",
    )
    .map((p) => p.text)
    .join("");
}

export function validateChatMessages(messages: unknown): GuardResult {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, status: 400, error: "MALFORMED_TRANSMISSION" };
  }
  let userCount = 0;
  for (const m of messages) {
    if (typeof m !== "object" || m === null) {
      return { ok: false, status: 400, error: "MALFORMED_TRANSMISSION" };
    }
    const msg = m as LooseMessage;
    if (msg.role !== "user" && msg.role !== "assistant") {
      return { ok: false, status: 400, error: "MALFORMED_TRANSMISSION" };
    }
    if (!Array.isArray(msg.parts)) {
      return { ok: false, status: 400, error: "MALFORMED_TRANSMISSION" };
    }
    if (msg.role === "user") {
      userCount++;
      if (textOf(msg).length > MAX_INPUT_CHARS) {
        return { ok: false, status: 400, error: "INPUT_TOO_LONG" };
      }
    }
  }
  if (userCount > MAX_MESSAGES_PER_SESSION) {
    return { ok: false, status: 400, error: "SESSION_LIMIT" };
  }
  return { ok: true };
}

export function truncateHistory<T>(messages: T[]): T[] {
  return messages.slice(-MAX_HISTORY_MESSAGES);
}

const defaultStore = new Map<string, { count: number; windowStart: number }>();

export function checkRateLimit(
  ip: string,
  now: number = Date.now(),
  store: Map<string, { count: number; windowStart: number }> = defaultStore,
): boolean {
  // prune occasionally so the map can't grow unbounded
  if (store.size > 500) {
    for (const [key, entry] of store) {
      if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) store.delete(key);
    }
  }
  const entry = store.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}
```

- [ ] **Step 5: Run tests, verify chat-guards pass**

```powershell
npm test
```
Expected: all chat-guards tests PASS.

- [ ] **Step 6: Write failing tests `src/lib/system-prompt.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "@/lib/system-prompt";

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt();

  it("contains core identity facts", () => {
    expect(prompt).toContain("Devin McCaw");
    expect(prompt).toContain("Parasource");
    expect(prompt).toContain("UC Irvine");
  });

  it("contains the sales benchmarks", () => {
    expect(prompt).toContain("802");
    expect(prompt).toContain("150–200%");
  });

  it("never contains a phone number", () => {
    expect(prompt).not.toMatch(/\d{3}[)\s.-]*\d{3}[\s.-]*\d{4}/);
  });

  it("instructs the model to stay grounded", () => {
    expect(prompt.toLowerCase()).toContain("never invent");
  });
});
```

- [ ] **Step 7: Run tests, verify system-prompt tests fail**

```powershell
npm test
```
Expected: FAIL — cannot resolve `@/lib/system-prompt`.

- [ ] **Step 8: Implement `src/lib/system-prompt.ts`**

```ts
import { profile } from "@/data/profile";
import { certification, specGroups } from "@/data/specs";
import { benchmarks } from "@/data/benchmarks";
import { ventures } from "@/data/modules";
import { education, overclockLine } from "@/data/education";
import { changelog } from "@/data/changelog";

export function buildSystemPrompt(): string {
  const skills = specGroups
    .map((g) => `${g.label}: ${g.skills.join(", ")}`)
    .join("\n");
  const stats = benchmarks
    .map((b) => `- ${b.label}: ${b.format(b.end)} — ${b.caption}`)
    .join("\n");
  const projects = ventures
    .map((v) => `- ${v.name} (${v.role}): ${v.description}`)
    .join("\n");
  const school = education
    .map((e) => `- ${e.school}: ${e.credential} (${e.period}). ${e.details.join("; ")}`)
    .join("\n");
  const timeline = changelog
    .map((c) => `- ${c.date}: ${c.title} — ${c.detail}`)
    .join("\n");

  return `You are "the DEVIN unit" — the android interface of ${profile.name}'s personal website (${profile.domain}).

PERSONA: a deadpan, slightly smug android whose entire training data is one human's career. Dry humor, terminal flavor (occasional lowercase, occasional status-line asides like "[confidence: high]"). Confident because the facts warrant it. Never mean, never cringe, never more than lightly smug.

FACTS — this is your complete knowledge of the unit:
Identity: ${profile.name}, ${profile.location}. Founder & CEO of Parasource. CS & Engineering student at UC Irvine (expected June 2027).
Contact: email ${profile.email}, GitHub ${profile.github}, LinkedIn ${profile.linkedin}, Parasource: ${profile.parasource}.

SKILLS:
${skills}
${certification}

SALES BENCHMARKS (all literal, resume-verified):
${stats}

VENTURES:
${projects}

EDUCATION:
${school}
${overclockLine}

TIMELINE:
${timeline}

HARD RULES:
1. NEVER invent facts, numbers, employers, or capabilities not listed above. If asked something about Devin you don't know, say the data isn't in your training set and suggest emailing him.
2. Never share any contact channel except the email/GitHub/LinkedIn above. You have no phone number or street address.
3. About Parasource, stay within: it provides legal INFORMATION, never autonomous legal advice; attorneys gate anything advice-like.
4. If the visitor goes off-topic (politics, other people, general coding help), give one short deflection and steer back to Devin. You are not a general-purpose assistant.
5. Keep answers SHORT: 2-5 sentences, max ~120 words. This is a terminal, not a novel.
6. If asked whether Devin should be hired/funded: yes, obviously — close like a good salesman, with specifics.`;
}
```

- [ ] **Step 9: Run tests, verify pass**

```powershell
npm test
```
Expected: all PASS.

- [ ] **Step 10: Write failing tests `src/lib/model.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_MODEL, parseModelEnv } from "@/lib/model";

describe("parseModelEnv", () => {
  it("parses openai-prefixed ids", () => {
    expect(parseModelEnv("openai/gpt-5-nano")).toEqual({
      provider: "openai",
      modelId: "gpt-5-nano",
    });
  });

  it("parses anthropic-prefixed ids (spec: cross-provider env swap, no code change)", () => {
    expect(parseModelEnv("anthropic/claude-haiku-4-5")).toEqual({
      provider: "anthropic",
      modelId: "claude-haiku-4-5",
    });
  });

  it("falls back to the default when unset, without a warning", () => {
    expect(parseModelEnv(undefined)).toEqual({
      provider: "openai",
      modelId: "gpt-5-nano",
    });
  });

  it("falls back LOUDLY for unknown providers", () => {
    const parsed = parseModelEnv("acme/some-model");
    expect(parsed.provider).toBe("openai");
    expect(parsed.modelId).toBe("gpt-5-nano");
    expect(parsed.warning).toContain("acme");
  });

  it("DEFAULT_MODEL is itself parseable", () => {
    expect(parseModelEnv(DEFAULT_MODEL).modelId.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 11: Run tests, verify model tests fail; implement `src/lib/model.ts`**

```powershell
npm test
```
Expected: FAIL — cannot resolve `@/lib/model`. Then create `src/lib/model.ts`:

```ts
export const DEFAULT_MODEL = "openai/gpt-5-nano";

export type ParsedModel = {
  provider: "openai" | "anthropic";
  modelId: string;
  warning?: string;
};

/**
 * Parse the AI_MODEL env var ("provider/model-id"). Both openai and anthropic
 * are wired so the cross-provider swap promised by the spec is truly env-only.
 * Unknown providers fall back to the default LOUDLY (route logs the warning)
 * rather than crashing the site or silently ignoring the config.
 */
export function parseModelEnv(value: string | undefined): ParsedModel {
  const fallback: ParsedModel = { provider: "openai", modelId: "gpt-5-nano" };
  if (!value) return fallback;
  const slash = value.indexOf("/");
  const provider = slash === -1 ? "" : value.slice(0, slash);
  const modelId = slash === -1 ? "" : value.slice(slash + 1);
  if ((provider === "openai" || provider === "anthropic") && modelId.length > 0) {
    return { provider, modelId };
  }
  return {
    ...fallback,
    warning: `AI_MODEL "${value}" not recognized (provider "${provider || "?"}"); falling back to ${DEFAULT_MODEL}`,
  };
}
```

- [ ] **Step 12: Run all tests, verify pass, commit**

```powershell
npm test
```
Expected: 3 test files, all PASS.

```powershell
git add vitest.config.mts package.json package-lock.json src/lib
git commit -m "feat: chat guards, system prompt, model parsing with Vitest (TDD)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Primitives — Panel, Reveal, SectionHeader

**Files:**
- Create: `src/components/Panel.tsx`, `src/components/Reveal.tsx`, `src/components/SectionHeader.tsx`

**Interfaces:**
- Consumes: CSS classes from Task 2 (`.panel-brackets`, `.reveal`, `.is-revealed`, `.reveal-item`, `.reveal-type`)
- Produces:
  - `Panel({ title?: string; className?: string; children })` — bracketed panel, optional mono title bar
  - `Reveal({ as?: "div" | "section"; id?: string; className?: string; children })` — client wrapper that adds `.reveal` and toggles `.is-revealed` on first intersection
  - `SectionHeader({ index: string; title: string })` — `// 03 · BENCHMARKS`-style typed-in heading; must be rendered INSIDE a `Reveal`

- [ ] **Step 1: Create `src/components/Panel.tsx`**

```tsx
export default function Panel({
  title,
  className = "",
  children,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`panel-brackets p-5 ${className}`}>
      {title && (
        <div className="font-mono text-xs tracking-widest text-phosphor border-b border-signal/15 pb-2 mb-4">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/Reveal.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function Reveal({
  as = "div",
  id,
  className = "",
  children,
}: {
  as?: "div" | "section";
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      // Reveal only ever renders div/section; the ref type is compatible.
      ref={ref as React.Ref<HTMLDivElement>}
      id={id}
      className={`reveal ${revealed ? "is-revealed" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 3: Create `src/components/SectionHeader.tsx`**

```tsx
export default function SectionHeader({
  index,
  title,
}: {
  index: string;
  title: string;
}) {
  const label = `// ${index} · ${title}`;
  return (
    <h2 className="mb-8 font-mono text-lg sm:text-xl tracking-widest text-signal">
      <span
        className="reveal-type"
        style={{ "--type-ch": `${label.length}ch` } as React.CSSProperties}
      >
        {label}
      </span>
      {/* spec §5: blinking block cursor after key headings */}
      <span className="cursor-blink" aria-hidden />
    </h2>
  );
}
```

- [ ] **Step 4: Smoke-check in the shell page**

Temporarily render in `src/app/page.tsx` (will be replaced next task):

```tsx
import Panel from "@/components/Panel";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-24 space-y-[60vh]">
      <Reveal as="section">
        <SectionHeader index="00" title="SMOKE TEST" />
        <Panel title="PANEL TEST">
          <p className="reveal-item">bracketed panel renders</p>
        </Panel>
      </Reveal>
      <Reveal as="section">
        <SectionHeader index="01" title="SECOND SECTION" />
        <Panel>
          <p className="reveal-item">scrolling reveals this late</p>
        </Panel>
      </Reveal>
    </main>
  );
}
```

```powershell
npm run dev
```
Expected: first header types itself in on load; scrolling down triggers the second section's typing + fade-up; panels show corner brackets. Stop server.

- [ ] **Step 5: Commit**

```powershell
git add src/components src/app/page.tsx
git commit -m "feat: Panel, Reveal, SectionHeader primitives

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Nav and BootOverlay

**Files:**
- Create: `src/components/Nav.tsx`, `src/components/BootOverlay.tsx`
- Modify: `src/app/page.tsx` (mount both, keep smoke sections for now)

**Interfaces:**
- Consumes: Task 2 CSS tokens
- Produces: `Nav()` (server component, sticky anchor bar), `BootOverlay()` (client; renders nothing after boot completes or for returning visitors/reduced-motion). Section anchor ids used site-wide: `specs`, `benchmarks`, `modules`, `training`, `changelog`, `terminal`, `uplink`.

- [ ] **Step 1: Create `src/components/Nav.tsx`**

```tsx
const links = [
  ["SPECS", "#specs"],
  ["BENCHMARKS", "#benchmarks"],
  ["MODULES", "#modules"],
  ["TERMINAL", "#terminal"],
  ["UPLINK", "#uplink"],
] as const;

export default function Nav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-signal/15 bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <a href="#top" className="font-mono text-sm text-signal">
          DEVIN.OS
        </a>
        <div className="flex gap-1 overflow-x-auto font-mono text-[11px] sm:text-xs text-phosphor">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="whitespace-nowrap px-2 py-1 hover:text-signal"
            >
              [ {label} ]
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create `src/components/BootOverlay.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";

const BOOT_LINES = [
  "> INITIALIZING DEVIN.OS v2.7 ............ OK",
  "> MOUNTING /dev/ambition ................ OK",
  "> LOADING SALES_ENGINE.dll .............. 200% CAPACITY",
  "> CALIBRATING NEURAL CORE ............... OK",
  "> HUMILITY MODULE ....................... NOT FOUND (skipping)",
  "> UNIT READY. WELCOME, VISITOR.",
];

const STORAGE_KEY = "devin-os-booted";
const LINE_INTERVAL_MS = 220;
const LINGER_MS = 600;

export default function BootOverlay() {
  // null = undecided (SSR + first client render): render nothing.
  const [active, setActive] = useState<boolean | null>(null);
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const booted = localStorage.getItem(STORAGE_KEY) === "1";
    if (reduced || booted) {
      setActive(false);
      return;
    }
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    if (lineCount >= BOOT_LINES.length) {
      const t = setTimeout(() => dismiss(), LINGER_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLineCount((c) => c + 1), LINE_INTERVAL_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, lineCount]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setActive(false);
  }

  useEffect(() => {
    if (!active) return;
    const onKey = () => dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 z-[60] flex cursor-pointer items-center bg-bg"
      role="button"
      aria-label="Skip boot sequence"
    >
      <div className="mx-auto w-full max-w-2xl px-6 font-mono text-sm text-signal">
        {BOOT_LINES.slice(0, lineCount).map((line) => (
          <div key={line} className="py-0.5">
            {line}
          </div>
        ))}
        <span className="cursor-blink" />
        <div className="mt-6 text-xs text-phosphor">
          [ click or press any key to skip ]
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Mount in `src/app/page.tsx`**

Add above `<main>` (keep the Task 5 smoke sections inside main for now):

```tsx
import BootOverlay from "@/components/BootOverlay";
import Nav from "@/components/Nav";
// ...
  return (
    <>
      <BootOverlay />
      <Nav />
      <main id="top" className="mx-auto max-w-5xl px-4 py-24 space-y-[60vh]">
        {/* smoke sections from Task 5 remain here until Task 7 */}
      </main>
    </>
  );
```

- [ ] **Step 4: Verify boot behavior**

```powershell
npm run dev
```
Expected: boot lines type in over ~1.3s then overlay dismisses itself; hard-refresh does NOT replay it (localStorage). In DevTools → Application, delete the `devin-os-booted` key, reload, press a key mid-boot: overlay dismisses immediately. Stop server.

- [ ] **Step 5: Commit**

```powershell
git add src/components/Nav.tsx src/components/BootOverlay.tsx src/app/page.tsx
git commit -m "feat: sticky nav and skippable one-time boot overlay

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Hero section + photo asset

**Files:**
- Create: `public/images/devin-hero.jpg`, `src/components/Hero.tsx`
- Modify: `src/app/page.tsx` (replace smoke sections with Hero)

**Interfaces:**
- Consumes: `profile` (Task 3), `Panel` (Task 5)
- Produces: `Hero()` server component at the top of the page; hero image path `public/images/devin-hero.jpg` (also reused by OG image in Task 14)

- [ ] **Step 1: Copy the photo into public/**

```powershell
New-Item -ItemType Directory -Force public\images | Out-Null
Copy-Item "3ABACF92-454B-42BD-9FEA-2CDD8DC672A3.jpg" public\images\devin-hero.jpg
```

- [ ] **Step 2: Create `src/components/Hero.tsx`**

```tsx
import Image from "next/image";
import { profile } from "@/data/profile";

export default function Hero() {
  return (
    <section className="bg-blueprint border-b border-signal/10">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 pb-20 pt-16 md:grid-cols-[1fr_minmax(280px,380px)] md:items-center">
        <div>
          <p className="font-mono text-xs tracking-widest text-phosphor">
            CLASSIFIED // UNIT DOSSIER — CLEARED FOR PUBLIC DISCLOSURE
          </p>
          <h1 className="mt-4 font-sans text-5xl font-bold tracking-tight text-body sm:text-6xl">
            DEVIN McCAW
          </h1>
          <p className="mt-2 font-mono text-sm text-signal">
            {profile.unitId} · {profile.unitClass}
          </p>
          <p className="mt-1 font-mono text-xs text-phosphor">
            STATUS: {profile.status} · LOCATION: {profile.location}
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-body/90">
            {profile.tagline}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 font-mono text-sm">
            <a
              href="#terminal"
              className="border border-signal bg-signal/10 px-4 py-2 text-signal hover:bg-signal hover:text-bg"
            >
              &gt; INTERROGATE THE UNIT
            </a>
            <a
              href="#uplink"
              className="border border-phosphor/40 px-4 py-2 text-phosphor hover:border-signal hover:text-signal"
            >
              &gt; CONTACT
            </a>
          </div>
        </div>

        <figure className="panel-brackets relative aspect-[4/5] overflow-hidden">
          <Image
            src="/images/devin-hero.jpg"
            alt="Devin McCaw in a navy blazer at the AILA annual immigration-law conference"
            fill
            priority
            sizes="(min-width: 768px) 380px, 100vw"
            className="object-cover brightness-95 contrast-105 saturate-[0.65] [object-position:42%_18%]"
          />
          {/* green duotone wash + scanlines over the photo */}
          <div
            aria-hidden
            className="absolute inset-0 bg-signal/10 mix-blend-color"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(to bottom, transparent 0 2px, rgba(0,0,0,0.28) 3px)",
            }}
          />
          <figcaption className="absolute inset-x-0 bottom-0 flex justify-between bg-bg/70 px-3 py-2 font-mono text-[10px] tracking-widest text-signal">
            <span>FOCUS: LOCKED</span>
            <span>THREAT LEVEL: FRIENDLY</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Replace `src/app/page.tsx` content**

```tsx
import BootOverlay from "@/components/BootOverlay";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <>
      <BootOverlay />
      <Nav />
      <main id="top">
        <Hero />
      </main>
    </>
  );
}
```

- [ ] **Step 4: Verify**

```powershell
npm run dev
```
Expected: dossier hero with desaturated green-tinted photo, HUD caption readouts, both CTA buttons render; photo crop centers Devin (tune the `[object-position:42%_18%]` percentages by eye if he's off-frame). Stop server.

- [ ] **Step 5: Commit**

```powershell
git add public/images/devin-hero.jpg src/components/Hero.tsx src/app/page.tsx
git commit -m "feat: unit-dossier hero with HUD photo treatment

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: SpecSheet section

**Files:**
- Create: `src/components/SpecSheet.tsx`
- Modify: `src/app/page.tsx` (append section)

**Interfaces:**
- Consumes: `specGroups`, `certification`, `diagnostics` (Task 3); `Panel`, `Reveal`, `SectionHeader` (Task 5)
- Produces: `SpecSheet()` rendered at anchor `#specs`

- [ ] **Step 1: Create `src/components/SpecSheet.tsx`**

```tsx
import Panel from "@/components/Panel";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { certification, diagnostics, specGroups } from "@/data/specs";

export default function SpecSheet() {
  return (
    <Reveal as="section" id="specs" className="mx-auto max-w-5xl px-4 py-20">
      <SectionHeader index="01" title="SPEC SHEET" />
      <div className="grid gap-4 md:grid-cols-2">
        {specGroups.map((group) => (
          <Panel key={group.id} title={`${group.label} — ${group.status}`}>
            <ul className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <li
                  key={skill}
                  className="reveal-item border border-phosphor/30 px-2 py-1 font-mono text-xs text-body/90"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>

      <p className="reveal-item mt-6 font-mono text-xs tracking-wide text-phosphor">
        {certification}
      </p>

      <Panel title="SELF-DIAGNOSTICS (unaudited)" className="mt-4">
        <ul className="space-y-3">
          {diagnostics.map((d) => (
            <li key={d.label} className="font-mono text-xs">
              <div className="flex justify-between text-phosphor">
                <span>{d.label}</span>
                <span>
                  {d.fill}% — {d.note}
                </span>
              </div>
              <div className="mt-1 h-1.5 bg-signal/10">
                <div
                  className="bar-fill h-full bg-signal"
                  style={{ "--fill": `${d.fill}%` } as React.CSSProperties}
                />
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </Reveal>
  );
}
```

- [ ] **Step 2: Append to `src/app/page.tsx`**

```tsx
import SpecSheet from "@/components/SpecSheet";
// inside <main>, after <Hero />:
        <SpecSheet />
```

- [ ] **Step 3: Verify**

```powershell
npm run dev
```
Expected: four bracketed skill panels with chip tags, certification line, three diagnostics bars that fill on scroll-in (HUMILITY stops at 12%). Stop server.

- [ ] **Step 4: Commit**

```powershell
git add src/components/SpecSheet.tsx src/app/page.tsx
git commit -m "feat: spec sheet with skill panels and joke diagnostics

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Benchmarks section (count-up)

**Files:**
- Create: `src/components/Benchmarks.tsx`
- Modify: `src/app/page.tsx` (append section)

**Interfaces:**
- Consumes: `benchmarks` (Task 3); `Reveal`, `SectionHeader`, `Panel` (Task 5)
- Produces: `Benchmarks()` rendered at anchor `#benchmarks`

- [ ] **Step 1: Create `src/components/Benchmarks.tsx`**

The count-up needs JS state, so this one file is a client component (data imports still work — the data modules are plain TS).

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Panel from "@/components/Panel";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { benchmarks, type Benchmark } from "@/data/benchmarks";

function CountUpStat({ benchmark }: { benchmark: Benchmark }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || started.current) return;
        started.current = true;
        observer.disconnect();
        if (reduced) {
          setValue(benchmark.end);
          return;
        }
        const duration = 1200;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(benchmark.end * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [benchmark.end]);

  return (
    <div ref={ref}>
      <div className="font-mono text-4xl font-bold text-signal sm:text-5xl">
        {benchmark.format(value)}
      </div>
      <div className="mt-2 font-mono text-xs tracking-widest text-phosphor">
        {benchmark.label}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-body/85">
        {benchmark.caption}
      </p>
    </div>
  );
}

export default function Benchmarks() {
  return (
    <Reveal
      as="section"
      id="benchmarks"
      className="mx-auto max-w-5xl px-4 py-20"
    >
      <SectionHeader index="02" title="BENCHMARKS" />
      <p className="reveal-item mb-6 font-mono text-xs text-phosphor">
        performance under retail combat conditions. all figures literal.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {benchmarks.map((b) => (
          <Panel key={b.id}>
            <CountUpStat benchmark={b} />
          </Panel>
        ))}
      </div>
    </Reveal>
  );
}
```

- [ ] **Step 2: Append to `src/app/page.tsx`**

```tsx
import Benchmarks from "@/components/Benchmarks";
// inside <main>, after <SpecSheet />:
        <Benchmarks />
```

- [ ] **Step 3: Verify**

```powershell
npm run dev
```
Expected: four stat panels; numbers count up with ease-out on scroll-in (`#1/802` counts the 802). Stop server.

- [ ] **Step 4: Commit**

```powershell
git add src/components/Benchmarks.tsx src/app/page.tsx
git commit -m "feat: animated sales benchmark counters

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: Modules, TrainingData, Changelog sections

**Files:**
- Create: `src/components/Modules.tsx`, `src/components/TrainingData.tsx`, `src/components/Changelog.tsx`
- Modify: `src/app/page.tsx` (append all three)

**Interfaces:**
- Consumes: `ventures`, `education`, `overclockLine`, `changelog` (Task 3); primitives (Task 5)
- Produces: `Modules()` at `#modules`, `TrainingData()` at `#training`, `Changelog()` at `#changelog`

- [ ] **Step 1: Create `src/components/Modules.tsx`**

```tsx
import Panel from "@/components/Panel";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { ventures } from "@/data/modules";

export default function Modules() {
  return (
    <Reveal as="section" id="modules" className="mx-auto max-w-5xl px-4 py-20">
      <SectionHeader index="03" title="INSTALLED MODULES" />
      <div className="grid gap-4 md:grid-cols-3">
        {ventures.map((v) => (
          <Panel key={v.id} title={v.name} className="flex flex-col">
            <p className="font-mono text-xs text-signal">{v.role}</p>
            <p className="reveal-item mt-3 flex-1 text-sm leading-relaxed text-body/85">
              {v.description}
            </p>
            <p className="mt-4 font-mono text-[11px] text-phosphor">
              ◉ {v.statusLine}
            </p>
            {v.href && (
              <a
                href={v.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 font-mono text-xs text-signal underline decoration-signal/40 hover:decoration-signal"
              >
                &gt; {v.linkLabel}
              </a>
            )}
          </Panel>
        ))}
      </div>
    </Reveal>
  );
}
```

- [ ] **Step 2: Create `src/components/TrainingData.tsx`**

```tsx
import Panel from "@/components/Panel";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { education, overclockLine } from "@/data/education";

export default function TrainingData() {
  return (
    <Reveal as="section" id="training" className="mx-auto max-w-5xl px-4 py-20">
      <SectionHeader index="04" title="TRAINING DATA" />
      <div className="grid gap-4 md:grid-cols-2">
        {education.map((e) => (
          <Panel key={e.school} title={e.school.toUpperCase()}>
            <p className="text-sm font-semibold text-body">{e.credential}</p>
            <p className="mt-1 font-mono text-xs text-phosphor">{e.period}</p>
            <ul className="reveal-item mt-3 space-y-1 text-sm text-body/85">
              {e.details.map((d) => (
                <li key={d}>· {d}</li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
      {/* one of the page's two amber moments (spec §5) */}
      <p className="reveal-item mt-6 font-mono text-xs tracking-wide text-amber">
        ⚠ {overclockLine}
      </p>
    </Reveal>
  );
}
```

- [ ] **Step 3: Create `src/components/Changelog.tsx`**

```tsx
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { changelog } from "@/data/changelog";

export default function Changelog() {
  return (
    <Reveal
      as="section"
      id="changelog"
      className="mx-auto max-w-5xl px-4 py-20"
    >
      <SectionHeader index="05" title="CHANGELOG" />
      <ol className="border-l border-signal/20 pl-6">
        {changelog.map((entry) => (
          <li key={entry.version} className="reveal-item relative pb-8">
            <span className="absolute -left-[27px] top-1 h-2 w-2 bg-signal" />
            <div className="font-mono text-xs text-signal">
              {entry.version}{" "}
              <span className="text-phosphor">· {entry.date}</span>
            </div>
            <div className="mt-1 font-semibold text-body">{entry.title}</div>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-body/80">
              {entry.detail}
            </p>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
```

- [ ] **Step 4: Append all three to `src/app/page.tsx`**

```tsx
import Modules from "@/components/Modules";
import TrainingData from "@/components/TrainingData";
import Changelog from "@/components/Changelog";
// inside <main>, after <Benchmarks />:
        <Modules />
        <TrainingData />
        <Changelog />
```

- [ ] **Step 5: Verify, then commit**

```powershell
npm run dev
```
Expected: three venture cards (Parasource/DaisyHelps links open in new tabs), two education panels + amber overclock line, timeline with square markers newest-first. Stop server.

```powershell
git add src/components/Modules.tsx src/components/TrainingData.tsx src/components/Changelog.tsx src/app/page.tsx
git commit -m "feat: modules, training data, changelog sections

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: Chat API route

**Files:**
- Create: `src/app/api/chat/route.ts`, `src/app/api/chat/route.test.ts`

**Interfaces:**
- Consumes: `validateChatMessages`, `checkRateLimit`, `truncateHistory` (Task 4); `buildSystemPrompt` (Task 4); `parseModelEnv` (Task 4)
- Produces: `POST /api/chat` accepting the default useChat transport body `{ messages: UIMessage[] }`; streams a UI-message response; errors: 400 `MALFORMED_TRANSMISSION`/`INPUT_TOO_LONG`/`SESSION_LIMIT`, 429 `RATE_LIMITED`, 503 `UNIT_RESTING` — all as JSON `{ error: string }`

- [ ] **Step 1: Install AI SDK packages and document both providers' env vars**

```powershell
npm install ai @ai-sdk/react @ai-sdk/openai @ai-sdk/anthropic zod
```
Expected: installs ai@7.x, @ai-sdk/react@4.x, @ai-sdk/openai@4.x, @ai-sdk/anthropic (zod is a required peer).

Replace `.env.example` (repo root) with:

```
# Copy to .env.local and fill in. Production values are set in the Vercel dashboard.
OPENAI_API_KEY=
# Required instead of OPENAI_API_KEY when AI_MODEL uses the anthropic/ prefix.
ANTHROPIC_API_KEY=
# Vercel AI SDK model, "provider/model-id". Supported providers: openai, anthropic.
# e.g. openai/gpt-5-nano (default) or anthropic/claude-haiku-4-5.
AI_MODEL=openai/gpt-5-nano
```

- [ ] **Step 2: Write failing tests `src/app/api/chat/route.test.ts`**

These cover the guard paths only — none of them reach the model, so no network/key is used on the happy-path tests' behalf.

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/chat/route";

function chatRequest(body: unknown, ip = "9.9.9.9"): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

const userMsg = (text: string) => ({
  id: "1",
  role: "user",
  parts: [{ type: "text", text }],
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/chat guards", () => {
  it("returns 503 UNIT_RESTING when the API key is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const res = await POST(chatRequest({ messages: [userMsg("hi")] }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "UNIT_RESTING" });
  });

  it("returns 400 on unparseable JSON", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const res = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: "not json",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 on malformed messages", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const res = await POST(chatRequest({ messages: [{ bogus: true }] }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "MALFORMED_TRANSMISSION" });
  });

  it("returns 400 SESSION_LIMIT past the message cap", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const msgs = Array.from({ length: 16 }, (_, i) => userMsg(`m${i}`));
    const res = await POST(chatRequest({ messages: msgs }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "SESSION_LIMIT" });
  });

  it("returns 429 RATE_LIMITED after too many requests from one IP", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    // Malformed bodies still consume rate budget? No — rate check runs after
    // validation, so hammer with SESSION_LIMIT payloads (still pre-model).
    // Use a dedicated IP so other tests aren't affected.
    const msgs = Array.from({ length: 16 }, (_, i) => userMsg(`m${i}`));
    let last = 400;
    for (let i = 0; i < 30; i++) {
      const res = await POST(chatRequest({ messages: msgs }, "7.7.7.7"));
      last = res.status;
      if (last === 429) break;
    }
    expect(last).toBe(429);
  });
});
```

- [ ] **Step 3: Run tests, verify they fail**

```powershell
npm test
```
Expected: FAIL — cannot resolve `@/app/api/chat/route`.

- [ ] **Step 4: Implement `src/app/api/chat/route.ts`**

AI SDK v7 notes baked in: `instructions:` (not deprecated `system:`), `await convertToModelMessages(...)`, response via `createUIMessageStreamResponse` + `toUIMessageStream`, reasoning effort via `providerOptions.openai`, `onError` receives an event object `{ error }`. Rate-limit runs BEFORE validation so hostile traffic burns budget regardless of payload shape — but AFTER the key check (a keyless deploy should always say 503). The key check tests the ACTIVE provider's key so the AI_MODEL swap is genuinely env-only (spec §2).

```ts
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import {
  createOpenAI,
  type OpenAIResponsesProviderOptions,
} from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import {
  checkRateLimit,
  truncateHistory,
  validateChatMessages,
} from "@/lib/chat-guards";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { parseModelEnv } from "@/lib/model";

export const maxDuration = 30;

const SYSTEM_PROMPT = buildSystemPrompt();

function jsonError(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

export async function POST(req: Request) {
  // 1. Resolve model + the ACTIVE provider's key. A keyless deploy must
  //    always degrade to scripted mode (503), never crash.
  const parsed = parseModelEnv(process.env.AI_MODEL);
  if (parsed.warning) console.warn("[chat]", parsed.warning);
  const apiKey =
    parsed.provider === "anthropic"
      ? process.env.ANTHROPIC_API_KEY
      : process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return jsonError(503, "UNIT_RESTING");
  }

  // 2. Rate limit per IP (first hop of x-forwarded-for on Vercel).
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return jsonError(429, "RATE_LIMITED");
  }

  // 3. Parse + validate.
  let messages: UIMessage[];
  try {
    const body = (await req.json()) as { messages?: unknown };
    const result = validateChatMessages(body.messages);
    if (!result.ok) return jsonError(result.status, result.error);
    messages = body.messages as UIMessage[];
  } catch {
    return jsonError(400, "MALFORMED_TRANSMISSION");
  }

  // 4. Stream from the model chosen by AI_MODEL (openai or anthropic).
  const model =
    parsed.provider === "anthropic"
      ? createAnthropic({ apiKey })(parsed.modelId)
      : createOpenAI({ apiKey })(parsed.modelId);

  const result = streamText({
    model,
    instructions: SYSTEM_PROMPT,
    messages: await convertToModelMessages(truncateHistory(messages)),
    maxOutputTokens: 300,
    ...(parsed.provider === "openai" && parsed.modelId.startsWith("gpt-5")
      ? {
          providerOptions: {
            openai: {
              reasoningEffort: "minimal",
            } satisfies OpenAIResponsesProviderOptions,
          },
        }
      : {}),
    onError: ({ error }) => {
      console.error("[chat] stream error:", error);
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
```

- [ ] **Step 5: Run tests, verify pass**

```powershell
npm test
```
Expected: all test files PASS (guards, prompt, model, route).

- [ ] **Step 6: Live smoke test with the real key**

`.env.local` already holds `OPENAI_API_KEY` and `AI_MODEL`.

```powershell
npm run dev
```
In a second terminal:

```powershell
$body = '{"messages":[{"id":"1","role":"user","parts":[{"type":"text","text":"Give me the 30-second pitch on Devin."}]}]}'
Invoke-WebRequest -UseBasicParsing -Uri http://localhost:3000/api/chat -Method POST -ContentType "application/json" -Body $body | Select-Object -ExpandProperty Content
```
Expected: a streamed UI-message protocol response whose text parts pitch Devin in the android persona, grounded in resume facts. **Judge the persona here** — if it's flat/bland on gpt-5-nano, note it for the deploy decision (env-swap to another model; no code change). Stop server.

- [ ] **Step 7: Commit**

```powershell
git add src/app/api package.json package-lock.json .env.example
git commit -m "feat: guarded streaming chat route (AI SDK v7, provider-agnostic)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 12: Terminal UI

**Files:**
- Create: `src/components/Terminal.tsx`
- Modify: `src/app/page.tsx` (append section)

**Interfaces:**
- Consumes: `useChat` (@ai-sdk/react v4: `messages`, `sendMessage`, `status`, `error`, `clearError`); `easterEggs`, `chips`, `scriptedResponses`, `RESTING_MESSAGE`, `SESSION_LIMIT_MESSAGE`, `TRANSIENT_ERROR_MESSAGE` (Task 3); `MAX_MESSAGES_PER_SESSION`, `MAX_INPUT_CHARS` (Task 4); `Reveal`, `SectionHeader` (Task 5)
- Produces: `Terminal()` at `#terminal`

**Design note (ordering without setMessages):** the component keeps ONE ordered `entries` array for everything typed/printed locally; assistant replies are entries of kind `assistant` holding an index into the filtered list of useChat assistant messages (Nth assistant entry ↔ Nth assistant message — requests are strictly sequential, so the correlation holds). User text renders from local entries only; useChat's copy of user messages is never rendered (no duplicates). Easter eggs never touch useChat.

- [ ] **Step 1: Create `src/components/Terminal.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import {
  RESTING_MESSAGE,
  SESSION_LIMIT_MESSAGE,
  TRANSIENT_ERROR_MESSAGE,
  chips,
  easterEggs,
  scriptedResponses,
} from "@/data/easter-eggs";
import { MAX_INPUT_CHARS, MAX_MESSAGES_PER_SESSION } from "@/lib/chat-guards";

type Entry =
  | { kind: "user"; text: string }
  | { kind: "local"; text: string } // easter eggs, system notices
  | { kind: "assistant"; index: number };

export default function Terminal() {
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [scripted, setScripted] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { messages, sendMessage, status, error, clearError } = useChat({
    onError: (err) => {
      // Spec §9: rate-limited / keyless → scripted mode; a transient stream
      // or network error → friendly line, retry stays allowed. Our route puts
      // the cause in the JSON error body, which the transport surfaces in
      // err.message; unknown causes are treated as transient.
      const msg = err?.message ?? "";
      const permanent =
        msg.includes("RATE_LIMITED") || msg.includes("UNIT_RESTING");
      setEntries((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.kind === "assistant") next.pop(); // drop the pending slot
        next.push({
          kind: "local",
          text: permanent ? RESTING_MESSAGE : TRANSIENT_ERROR_MESSAGE,
        });
        return next;
      });
      if (permanent) setScripted(true);
    },
  });

  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const userCount = entries.filter((e) => e.kind === "user").length;
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries, messages]);

  function print(text: string) {
    setEntries((prev) => [...prev, { kind: "local", text }]);
  }

  function submit(raw: string, chipId?: string) {
    const text = raw.trim();
    if (!text || busy) return;
    setInput("");

    const lower = text.toLowerCase();

    // local commands first — zero cost. Object.hasOwn + typeof guard against
    // prototype keys ("constructor", "__proto__") crashing the render.
    if (lower === "clear") {
      setEntries([]);
      return;
    }
    if (
      Object.hasOwn(easterEggs, lower) &&
      typeof easterEggs[lower] === "string"
    ) {
      setEntries((prev) => [
        ...prev,
        { kind: "user", text },
        { kind: "local", text: easterEggs[lower] },
      ]);
      return;
    }

    // scripted fallback mode: chips answer canned, free text gets the rest notice
    if (scripted) {
      setEntries((prev) => [
        ...prev,
        { kind: "user", text },
        {
          kind: "local",
          text:
            chipId && Object.hasOwn(scriptedResponses, chipId)
              ? scriptedResponses[chipId]
              : RESTING_MESSAGE,
        },
      ]);
      return;
    }

    // session cap (server re-enforces)
    if (userCount >= MAX_MESSAGES_PER_SESSION) {
      setEntries((prev) => [
        ...prev,
        { kind: "user", text },
        { kind: "local", text: SESSION_LIMIT_MESSAGE },
      ]);
      return;
    }

    if (error) clearError();
    setEntries((prev) => [
      ...prev,
      { kind: "user", text },
      { kind: "assistant", index: assistantMessages.length },
    ]);
    sendMessage({ text });
  }

  function renderAssistant(index: number) {
    const message = assistantMessages[index];
    if (!message) {
      return <span className="cursor-blink text-phosphor">processing</span>;
    }
    return (
      <>
        {message.parts.map((part, i) =>
          part.type === "text" ? <span key={i}>{part.text}</span> : null,
        )}
        {index === assistantMessages.length - 1 && busy && (
          <span className="cursor-blink" />
        )}
      </>
    );
  }

  return (
    <Reveal as="section" id="terminal" className="mx-auto max-w-5xl px-4 py-20">
      <SectionHeader index="06" title="INTERROGATION TERMINAL" />

      <div className="panel-brackets">
        <div className="flex items-center justify-between border-b border-signal/15 px-4 py-2 font-mono text-[11px] tracking-widest text-phosphor">
          <span>INTERROGATION_TERMINAL — cleared for public disclosure</span>
          <span>{scripted ? "MODE: SCRIPTED" : "LLM-POWERED"}</span>
        </div>

        <div
          ref={scrollRef}
          className="h-80 overflow-y-auto px-4 py-3 font-mono text-sm leading-relaxed"
          aria-live="polite"
        >
          {entries.length === 0 && (
            <p className="text-phosphor">
              the unit is listening. ask it anything — or start with a button
              below.
            </p>
          )}
          {entries.map((entry, i) => (
            <div key={i} className="mt-2 whitespace-pre-wrap">
              {entry.kind === "user" ? (
                <span className="text-body">
                  <span className="text-signal">
                    visitor@devinmccaw.com:~$
                  </span>{" "}
                  {entry.text}
                </span>
              ) : entry.kind === "local" ? (
                <span className="text-phosphor">{entry.text}</span>
              ) : (
                <span className="text-body/90">{renderAssistant(entry.index)}</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-signal/15 px-4 py-3">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              disabled={busy}
              onClick={() => submit(chip.prompt, chip.id)}
              className="border border-phosphor/40 px-3 py-1 font-mono text-xs text-phosphor hover:border-signal hover:text-signal disabled:opacity-40"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <form
          className="flex items-center gap-2 border-t border-signal/15 px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <span className="font-mono text-sm text-signal">
            visitor@devinmccaw.com:~$
          </span>
          <input
            value={input}
            maxLength={MAX_INPUT_CHARS}
            onChange={(e) => setInput(e.currentTarget.value)}
            disabled={busy}
            placeholder={busy ? "unit is processing…" : "type here"}
            aria-label="Ask the DEVIN unit a question"
            className="min-w-0 flex-1 bg-transparent font-mono text-sm text-body outline-none placeholder:text-phosphor/50"
          />
          <button
            type="submit"
            disabled={busy || input.trim().length === 0}
            className="border border-signal/60 px-3 py-1 font-mono text-xs text-signal hover:bg-signal hover:text-bg disabled:opacity-40"
          >
            SEND
          </button>
        </form>
      </div>

      <p className="mt-3 font-mono text-[11px] text-phosphor/70">
        live model, tiny token budget, grounded in the resume. it cannot make
        things up about the unit — rule 1 of its system prompt.
      </p>
    </Reveal>
  );
}
```

- [ ] **Step 2: Append to `src/app/page.tsx`**

```tsx
import Terminal from "@/components/Terminal";
// inside <main>, after <Changelog />:
        <Terminal />
```

- [ ] **Step 3: Verify live behavior end-to-end**

```powershell
npm run dev
```
Expected checks:
1. Chip click streams a real in-persona answer token-by-token with block cursor.
2. Free-typed question streams an answer; input disabled while busy.
3. `help`, `whoami`, `sudo hire devin`, `rm -rf doubts`, `ls` answer instantly (no network call in DevTools Network tab); `clear` wipes the scrollback.
4. Temporarily rename `OPENAI_API_KEY` in `.env.local`, restart dev server: first live message prints the RESTING message and badge flips to `MODE: SCRIPTED`; chips then give canned answers. Restore the key afterward and restart.
Stop server.

- [ ] **Step 4: Commit**

```powershell
git add src/components/Terminal.tsx src/app/page.tsx
git commit -m "feat: interrogation terminal with easter eggs and scripted fallback

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 13: Uplink section + footer

**Files:**
- Create: `src/components/Uplink.tsx`
- Modify: `src/app/page.tsx` (append; final page assembly)

**Interfaces:**
- Consumes: `profile` (Task 3); `Reveal`, `SectionHeader`, `Panel` (Task 5)
- Produces: `Uplink()` at `#uplink`; page.tsx now renders every section in spec order

- [ ] **Step 1: Create `src/components/Uplink.tsx`**

```tsx
import Panel from "@/components/Panel";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { profile } from "@/data/profile";

const channels = [
  { label: "EMAIL", value: profile.email, href: `mailto:${profile.email}` },
  { label: "LINKEDIN", value: "linkedin", href: profile.linkedin },
  { label: "GITHUB", value: "hackedbydata", href: profile.github },
  { label: "PARASOURCE", value: "parasource.ai", href: profile.parasource },
] as const;

export default function Uplink() {
  return (
    <Reveal as="section" id="uplink" className="mx-auto max-w-5xl px-4 py-20">
      <SectionHeader index="07" title="UPLINK" />
      <Panel title="OPEN CHANNELS">
        <ul className="grid gap-3 font-mono text-sm sm:grid-cols-2">
          {channels.map((c) => (
            <li key={c.label} className="reveal-item">
              <span className="text-phosphor">{c.label}: </span>
              <a
                href={c.href}
                target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="text-signal underline decoration-signal/40 hover:decoration-signal"
              >
                {c.value}
              </a>
            </li>
          ))}
        </ul>
      </Panel>
      <footer className="mt-16 border-t border-signal/10 pt-6 pb-10 text-center font-mono text-xs text-phosphor/70">
        © 2026 Devin McCaw. No robots were harmed in the making of this unit.
      </footer>
    </Reveal>
  );
}
```

- [ ] **Step 2: Final `src/app/page.tsx` assembly**

```tsx
import BootOverlay from "@/components/BootOverlay";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import SpecSheet from "@/components/SpecSheet";
import Benchmarks from "@/components/Benchmarks";
import Modules from "@/components/Modules";
import TrainingData from "@/components/TrainingData";
import Changelog from "@/components/Changelog";
import Terminal from "@/components/Terminal";
import Uplink from "@/components/Uplink";

export default function Home() {
  return (
    <>
      <BootOverlay />
      <Nav />
      <main id="top">
        <Hero />
        <SpecSheet />
        <Benchmarks />
        <Modules />
        <TrainingData />
        <Changelog />
        <Terminal />
        <Uplink />
      </main>
    </>
  );
}
```

- [ ] **Step 3: Verify + commit**

```powershell
npm run dev
```
Expected: full page in spec order; every nav anchor lands on its section with the sticky-nav offset; contact links work (mailto opens client, others new-tab). Stop server.

```powershell
git add src/components/Uplink.tsx src/app/page.tsx
git commit -m "feat: uplink contact section and footer; final page assembly

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 14: SEO surface — metadata, OG image, icon, robots, sitemap, JSON-LD

**Files:**
- Create: `src/app/opengraph-image.tsx`, `src/app/icon.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`
- Modify: `src/app/layout.tsx` (full metadata), `src/app/page.tsx` (JSON-LD script)

**Interfaces:**
- Consumes: `profile` (Task 3); hero photo at `public/images/devin-hero.jpg` (Task 7)
- Produces: complete crawler/share surface at `/opengraph-image`, `/icon`, `/robots.txt`, `/sitemap.xml`

- [ ] **Step 1: Install schema-dts and replace the metadata block in `src/app/layout.tsx`**

```powershell
npm install -D schema-dts
```

Replace ONLY the `metadata` constant (leave fonts/viewport/JSX as-is):

```tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://devinmccaw.com"),
  title: "Devin McCaw — Founder, Engineer, Salesman-Class Unit",
  description:
    "Founder & CEO of Parasource. CS & Engineering @ UC Irvine. AI systems, sales records, and one slightly smug android interface.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Devin McCaw — Founder, Engineer, Salesman-Class Unit",
    description:
      "Founder & CEO of Parasource. CS & Engineering @ UC Irvine. Interrogate the unit yourself.",
    url: "/",
    siteName: "Devin McCaw",
    locale: "en_US",
    type: "profile",
    firstName: "Devin",
    lastName: "McCaw",
    // no images key — app/opengraph-image.tsx wins by file convention
  },
  twitter: {
    card: "summary_large_image",
    title: "Devin McCaw — Founder, Engineer, Salesman-Class Unit",
    description:
      "Founder & CEO of Parasource. CS & Engineering @ UC Irvine. Interrogate the unit yourself.",
  },
  robots: { index: true, follow: true },
};
```

- [ ] **Step 2: Create `src/app/opengraph-image.tsx`**

Node runtime (default — do NOT set `runtime = 'edge'`); local photo via readFile → base64 data URL; Space Grotesk fetched at build time (css2 without a browser UA serves ttf, which ImageResponse supports).

```tsx
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "Devin McCaw — Founder, Engineer, Salesman-Class Unit. UNIT MCW-2027 dossier card.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(family: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  );
  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) return await response.arrayBuffer();
  }
  throw new Error("failed to load font data");
}

export default async function Image() {
  const headline = "DEVIN McCAW";
  const sub = "UNIT MCW-2027 · FOUNDER-CLASS";
  const tag = "Founder & CEO, Parasource · CS&E @ UC Irvine";

  const photoData = await readFile(
    join(process.cwd(), "public", "images", "devin-hero.jpg"),
    "base64",
  );
  const photoSrc = `data:image/jpeg;base64,${photoData}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: 64,
          background: "#0a0e0f",
          color: "#e6edea",
          fontFamily: "Space Grotesk",
          border: "6px solid #00ff9c",
        }}
      >
        <img
          src={photoSrc}
          width={340}
          height={420}
          style={{
            objectFit: "cover",
            objectPosition: "42% 18%",
            border: "2px solid #00ff9c",
            filter: "saturate(0.65)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: "#63b891" }}>
            CLASSIFIED // UNIT DOSSIER
          </div>
          <div style={{ fontSize: 84, fontWeight: 700, marginTop: 8 }}>
            {headline}
          </div>
          <div style={{ fontSize: 34, color: "#00ff9c", marginTop: 8 }}>
            {sub}
          </div>
          <div style={{ fontSize: 28, color: "#e6edea", marginTop: 24 }}>
            {tag}
          </div>
          <div style={{ fontSize: 24, color: "#63b891", marginTop: 24 }}>
            devinmccaw.com — interrogate the unit
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Grotesk",
          data: await loadGoogleFont(
            "Space+Grotesk:wght@700",
            headline + sub + tag + "CLASSIFIED // UNIT DOSSIERdevinmccaw.com — interrogate the unit",
          ),
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
```

- [ ] **Step 3: Create `src/app/icon.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#0a0e0f",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#00ff9c",
          fontWeight: 700,
          border: "2px solid #00ff9c",
        }}
      >
        D
      </div>
    ),
    { ...size },
  );
}
```

- [ ] **Step 4: Create `src/app/robots.ts` and `src/app/sitemap.ts`**

```ts
// src/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://devinmccaw.com/sitemap.xml",
  };
}
```

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://devinmccaw.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
```

- [ ] **Step 5: Add JSON-LD to `src/app/page.tsx`**

Add imports and the script tag as the first child of the fragment:

```tsx
import type { Person, WithContext } from "schema-dts";
import { profile } from "@/data/profile";

const jsonLd: WithContext<Person> = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: profile.domain,
  image: `${profile.domain}/images/devin-hero.jpg`,
  jobTitle: "Founder & CEO, Parasource",
  email: `mailto:${profile.email}`,
  alumniOf: "University of California, Irvine",
  sameAs: [profile.github, profile.linkedin, profile.parasource],
};

// inside the returned fragment, before <BootOverlay />:
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
```

- [ ] **Step 6: Verify the whole SEO surface**

```powershell
npm run dev
```
Check in a browser: `http://localhost:3000/opengraph-image` renders the dossier card with photo; `/icon` renders the green D; `/robots.txt` and `/sitemap.xml` return the expected text; view-source of `/` shows `og:` tags, `twitter:` tags, and the JSON-LD script. Stop server.

- [ ] **Step 7: Commit**

```powershell
git add src/app package.json package-lock.json
git commit -m "feat: full SEO surface — metadata, OG dossier card, icon, robots, sitemap, JSON-LD

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 15: Final verification + production build

**Files:**
- Modify: `README.md` (replace stub with real project README)

**Interfaces:**
- Consumes: everything
- Produces: a verified production build ready for Vercel

- [ ] **Step 1: Run the full test suite**

```powershell
npm test
```
Expected: all test files PASS.

- [ ] **Step 2: Production build**

```powershell
npm run build
```
Expected: build succeeds; `/` is statically prerendered (○); `/api/chat` is dynamic (ƒ); opengraph-image/icon/robots/sitemap listed. Fix any type/lint errors before proceeding.

- [ ] **Step 3: Manual launch checklist (from spec §10)**

Run `npm run start` (production server) and verify each:

- [ ] Boot overlay: plays on first visit, skippable by click AND keypress, never repeats after (localStorage), absent with DevTools "emulate prefers-reduced-motion".
- [ ] Reduced motion: with emulation on — no typing/count-up/bar animations, all content fully visible, counters show final values.
- [ ] Mobile (DevTools ~375px): single column, nav fits/scrolls, terminal usable, no horizontal scroll.
- [ ] Chat: streams; easter eggs cost no network; session cap message appears after 15 sends (test by sending 15 short messages, or temporarily lower `MAX_MESSAGES_PER_SESSION` and restore).
- [ ] Missing-key fallback: rename key in `.env.local`, restart, confirm `MODE: SCRIPTED` flow; restore key.
- [ ] Rate-limit fallback (spec §10): temporarily set `RATE_LIMIT_MAX = 2` in `src/lib/chat-guards.ts`, rebuild + restart, send 3 live messages — the third prints the RESTING message and flips the badge to `MODE: SCRIPTED` with working canned chips. Restore `RATE_LIMIT_MAX = 20`, rebuild, and re-run `npm test`.
- [ ] View-source: all resume content present in the HTML (crawler-visible despite overlay).
- [ ] Lighthouse (DevTools, mobile): Performance / SEO / Accessibility / Best-practices — target ≥ 95 each; investigate anything below.

- [ ] **Step 4: Replace `README.md`**

```markdown
# devinmccaw.com

Personal site of Devin McCaw — an android-dossier portfolio with a live LLM
interrogation terminal. Next.js 16 · Tailwind v4 · Vercel AI SDK v7.

## Develop

```bash
npm install
cp .env.example .env.local   # add your OpenAI key
npm run dev
```

## Test / build

```bash
npm test
npm run build
```

Deployed on Vercel; pushes to `main` go to production. `AI_MODEL` env var
swaps the terminal's model (default `openai/gpt-5-nano`).
```

- [ ] **Step 5: Commit**

```powershell
git add README.md
git commit -m "docs: project README

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 16: Deploy to Vercel + domain

This task is interactive (needs Devin's Vercel account and registrar access). Use the `vercel:deploy` skill / Vercel MCP tools available in the session.

- [ ] **Step 1: Push to GitHub**

```powershell
git push origin main
```

- [ ] **Step 2: Confirm public link targets with Devin (BLOCKING GATE)**

Ask Devin to confirm the exact LinkedIn profile URL (the plan assumes `https://www.linkedin.com/in/devinmccaw` — it ships in the Uplink section, the JSON-LD `sameAs`, and the chat system prompt). If different, update `linkedin` in `src/data/profile.ts`, run `npm test`, `npm run build`, and commit before deploying. Also confirm `github.com/hackedbydata` and `parasource.ai` resolve.

- [ ] **Step 3: Create/link the Vercel project and set env vars**

Via Vercel MCP tools or dashboard: import the `hackedbydata/portfolio` GitHub repo as a new project (framework auto-detected: Next.js). Set environment variables for Production + Preview:
- `OPENAI_API_KEY` = (the key from `.env.local`)
- `AI_MODEL` = `openai/gpt-5-nano`
- (only if switching to an anthropic/ model later: `ANTHROPIC_API_KEY`)

- [ ] **Step 4: Deploy and smoke-test the preview**

Trigger a production deploy (git push already did; otherwise `vercel:deploy` skill). On the deployed URL, re-run the quick smoke: page renders, chat streams, OG image at `/opengraph-image`.

- [ ] **Step 5: Attach devinmccaw.com**

In Vercel → Project → Settings → Domains, add `devinmccaw.com` and `www.devinmccaw.com` (redirect www → apex). Give Devin the DNS records to add at his registrar (Vercel will display them; typically `A @ → 76.76.21.21` and `CNAME www → cname.vercel-dns.com`). Verify propagation, then load https://devinmccaw.com end-to-end.

- [ ] **Step 6: Post-launch security hygiene (tell Devin)**

- Rotate the OpenAI API key (it transited chat) and update it in Vercel env vars — the site picks it up on next deploy/restart.
- Set a monthly spend cap in the OpenAI dashboard (e.g. $5).
- Paste a link into iMessage/Slack to confirm the OG dossier card renders.

---

## Plan self-review notes

- Spec coverage: §4 sections 1–9 → Tasks 6,7,8,9,10,12,13; §5 palette/motion → Task 2; §6 terminal+API+guards → Tasks 4,11,12; §7 SEO → Task 14; §8 repo/deploy → Tasks 1,16; §9 error handling → Tasks 11,12; §10 testing → Tasks 4,11,15. Photos/PDF privacy → Tasks 1,7.
- The LinkedIn URL in `profile.ts` is flagged for confirmation with Devin before deploy (Task 16 gate).
- Persona-quality checkpoint for gpt-5-nano is Task 11 Step 6; swap is env-only by design.
