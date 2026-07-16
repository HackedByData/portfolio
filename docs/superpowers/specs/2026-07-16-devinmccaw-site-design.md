# devinmccaw.com — Design Spec

**Date:** 2026-07-16
**Status:** Approved by Devin
**Domain:** devinmccaw.com (Vercel hosting, custom domain)

## 1. Overview & goals

A personal website for Devin McCaw that is entertaining first and scannable always.
The site presents Devin as a cutting-edge android — "the DEVIN unit, Model MCW-2027" —
in a classified robotics-lab dossier. Every themed section maps 1:1 to a real resume
section, so the two primary audiences (weighted equally) both win:

- **Recruiters / hiring managers:** understand Devin in 30 seconds of scrolling.
- **Investors / partners:** see Parasource founder credibility and taste.

The theme communicates the two core claims: **AI prowess** (the site contains a real,
working LLM feature and is itself well-built) and **sales prowess** (the site *sells*
— benchmark numbers, confident copy, a closer's CTA).

**Tone guardrail:** jokes live in labels and framing; facts stay literal. No number is
exaggerated for comedy. Anyone quoting the site quotes true facts.

## 2. Decisions log

| Decision | Choice |
|---|---|
| Audience | Recruiters and investors, equal weight |
| Concept | Android spec-sheet dossier ("UNIT MCW-2027") |
| Aesthetic | Lab terminal: near-black, signal green, mono + grotesk, scanlines |
| Live AI | Real streaming chat via Vercel AI SDK, provider-agnostic |
| Chat model | `openai/gpt-5-nano` by default (minimal reasoning); env-swappable |
| Contact published | Email, LinkedIn, GitHub, parasource.ai — **no phone number** |
| Photos | AILA conference photo, cropped solo, as hero; VenusHacks selfie not used |
| Stack | Next.js App Router + TypeScript + Tailwind CSS v4, static-first, one API route |
| Animation | CSS keyframes + small hooks only; no animation library |
| Hosting | Vercel Git integration; push to `main` = production |

## 3. Architecture

- **Next.js App Router** app, statically generated single page (`/`) plus one route
  handler (`POST /api/chat`).
- **Tailwind CSS v4** for styling; design tokens (colors, fonts) as CSS variables.
- **Fonts:** Space Grotesk (headlines) + IBM Plex Mono (data/terminal) via `next/font`
  (self-hosted, zero external requests, no layout shift).
- **Images:** hero photo optimized through `next/image`. Original photos stay in the
  repo; visual treatment (duotone, scanlines) is pure CSS over the image.
- **Content as data:** all resume content lives in typed data modules
  (`src/data/*.ts`) — sections render from data, and the chat system prompt is built
  from the same source so site and bot never disagree.
- **No database, no auth, no analytics** (can add later).

### Components (one purpose each)

| Unit | Purpose |
|---|---|
| `BootOverlay` | First-visit boot sequence; skippable; localStorage-gated; client-only |
| `Hero` | Unit dossier: photo, name, status lines, CTAs |
| `SpecSheet` | Skills as NEURAL / PERSUASION / RUNTIME / INFRASTRUCTURE panels |
| `Benchmarks` | Animated stat counters for sales/growth records |
| `Modules` | Venture/project cards (Parasource, DaisyHelps, ZotLabs) |
| `TrainingData` | Education section |
| `Changelog` | Version-numbered timeline |
| `Terminal` | Interrogation chat UI (streaming, chips, easter eggs, fallback mode) |
| `Uplink` | Contact links + footer |
| `api/chat` route | Guarded streaming LLM endpoint |

## 4. Page structure & content

One scrolling page; slim sticky nav with anchors styled
`[ SPECS ] [ BENCHMARKS ] [ MODULES ] [ TERMINAL ] [ UPLINK ]`.

1. **Boot sequence** — ~1.5s overlay of terminal lines
   (`INITIALIZING DEVIN.OS … LOADING SALES_ENGINE … CALIBRATING NEURAL CORE … UNIT READY`).
   Skippable by click/keypress; skipped for returning visitors (localStorage) and under
   `prefers-reduced-motion`. Overlay only — page content is always in the DOM for crawlers.
2. **Hero — UNIT DOSSIER** — AILA photo (solo crop) with scanline/HUD frame and fake
   readouts (`FOCUS: LOCKED`, `THREAT LEVEL: FRIENDLY`). Name, `UNIT MCW-2027 ·
   FOUNDER-CLASS`, `STATUS: OPERATIONAL · LOCATION: IRVINE, CA`, and a one-line
   true-but-funny summary — draft copy: "Founder & CEO of Parasource. CS & Engineering
   @ UC Irvine. Sold phones at a top-1-of-802 clip before switching to selling the
   future." (final wording tunable at implementation, must stay factually literal).
   CTAs: **Interrogate the unit** (scroll to terminal) and **Contact**.
3. **SPEC SHEET** (skills) — `NEURAL SYSTEMS` (RAG, LangChain, vector DBs, Claude API,
   prompt engineering, subagent-driven development), `PERSUASION SYSTEMS` (sales, GTM,
   customer discovery, stakeholder management), `RUNTIME` (Python, C/C++, TS/JS, React,
   Next.js, Node, SQL), `INFRASTRUCTURE` (AWS, Docker, PostgreSQL, CI/CD, Cloudflare).
   CompTIA Security+ as `FIRMWARE CERTIFICATION`. Animated capability bars/tags.
4. **BENCHMARKS** (sales record) — animated counters with plain-English captions:
   150–200% of quota (Verizon, 2024–25); #1 store nationwide of 802 (MarketSource);
   +600% YTD team sales productivity (MarketSource); 350% org growth in one quarter
   (Triangle Fraternity, fastest-growing chapter nationwide).
5. **INSTALLED MODULES** (ventures/projects) —
   - `PARASOURCE.EXE` (flagship): Founder & CEO; the firm brain for immigration
     practice — per-org knowledge core, multilingual intake (11 languages), lawyer-gated
     client responder, caseworker assistant. Link → https://www.parasource.ai. Copy
     respects Parasource's stated boundaries (legal *information*, never autonomous
     legal advice).
   - `DAISYHELPS.APP`: Lead dev & PM; AI overlay assistant guiding tech-illiterate
     users; ElevenLabs + Claude + Groq. Link → github.com/hackedbydata/daisyhelps.
   - `ZOTLABS.ORG`: Founder & VP; UCI incubator org, three flagship incubations,
     secured funding.
   Each card gets a fake process-status line (`RUNNING · uptime since Apr 2026`).
6. **TRAINING DATA** (education) — UCI: BS CS&E, minor Innovation & Entrepreneurship,
   GPA 3.846, Dean's Honor List every quarter, expected June 2027. Chaffey College:
   four AS degrees (CS, Math, Physics, Physical Science) with honors. Wink line:
   `CURRENT LOAD: 24 units (summer) — unit is overclocked` (amber accent).
7. **CHANGELOG** (timeline, newest first) — Parasource founded (Apr 2026); ZotLabs
   founded (Jan 2026); Handshake AI cybersecurity fellowship (Nov–Dec 2025); Triangle
   founding father (Sep 2025); transferred to UCI (Sep 2025); Verizon top performer
   (2024–25); MarketSource #1 ranking (2023–24).
8. **INTERROGATION TERMINAL** — the live chat (see §6).
9. **UPLINK** (contact) — email `devin.mccaw@outlook.com`, LinkedIn, GitHub
   (`hackedbydata`), parasource.ai. Footer: `© 2026 Devin McCaw. No robots were harmed
   in the making of this unit.`

**Never published:** phone number, street-level location, resume PDF, transcript.

## 5. Visual & interaction design

- **Palette:** background `#0A0E0F`; accent signal green `#00FF9C`; dim phosphor green
  for secondary text; off-white body text; warning amber used at most twice.
- **Texture:** faint full-page scanline overlay (repeating CSS gradient, ~3% opacity),
  blueprint grid lines in section backgrounds, corner-bracket panel framing. No images
  except the hero photo.
- **Motion** (all CSS-driven; all disabled under `prefers-reduced-motion`):
  boot overlay; section headers type themselves in on scroll (IntersectionObserver +
  steps animation); benchmark counters count up / capability bars fill on first reveal;
  blinking block cursor `█` after key headings.
- **Hero photo treatment:** slight desaturation + green duotone + scanlines + HUD
  corner brackets, via CSS filters over `next/image`.
- **Responsive:** single column on mobile; columns stack; terminal fully usable on
  phones; sticky nav collapses gracefully.

## 6. Interrogation terminal

### UI
- Terminal window: title bar `INTERROGATION_TERMINAL — cleared for public disclosure`,
  scrollback, prompt `visitor@devinmccaw.com:~$`.
- Three quick-start chips: `give me the 30-second pitch`, `why should I hire this
  unit?`, `what is parasource?`.
- Streaming responses with block cursor.
- Client-side easter eggs intercepted before the API (`sudo hire devin`,
  `rm -rf doubts`, `whoami`, …) — canned responses, zero cost.
- Provider-neutral badge: `LLM-POWERED` (no provider name hard-coded in UI copy).

### API route (`POST /api/chat`)
- Vercel AI SDK `streamText`; model from `AI_MODEL` env (default `openai/gpt-5-nano`,
  minimal reasoning effort), `maxOutputTokens` ≈ 300.
- System prompt: constant in repo, built from the same data modules as the site.
  Persona: deadpan, slightly smug android whose entire training data is one human's
  career. Hard rules: never invent facts; no phone/address (not in prompt anyway);
  redirect off-topic to Devin; short, terminal-flavored answers.

### Abuse & cost control (defense in depth)
1. Client caps: 15 messages/session, 500-char input limit (cosmetic).
2. Server re-enforces both caps; history truncated to last 8 turns.
3. Per-IP fixed-window rate limit in module memory (accepted imperfection across
   serverless instances; upgrade path: Vercel Firewall rules or KV).
4. Monthly spend cap set in OpenAI dashboard (manual step for Devin).
5. Graceful degradation: missing key or rate-limited → scripted mode (canned chip
   responses + `UNIT IS RESTING — try the buttons`). Site never looks broken.

## 7. SEO & sharing

- Metadata: title `Devin McCaw — Founder, Engineer, Salesman-Class Unit`; description;
  canonical `https://devinmccaw.com`.
- Open Graph + Twitter card with a dossier-styled OG image (name, photo, unit label).
- `robots.txt`, `sitemap.xml`, JSON-LD `Person` (name, UCI affiliation, Parasource
  founder, sameAs links).
- All content server-rendered; boot overlay is client-side only.

## 8. Repo, environments & deployment

- This repo (`portfolio`, GitHub remote) becomes the Next.js app.
- Secrets: `.env.local` (gitignored) locally; Vercel dashboard env vars
  (`OPENAI_API_KEY`, `AI_MODEL`) in production. `.env.example` documents them.
- The resume PDF (contains phone number) was never committed and stays untracked via
  .gitignore rules; the transcript is never added.
- Deploy: Vercel Git integration — push to `main` → production; PRs → preview URLs.
- Domain: `devinmccaw.com` attached in Vercel; DNS records provided to Devin at
  deploy time.

## 9. Error handling summary

| Failure | Behavior |
|---|---|
| Missing/invalid API key | Terminal enters scripted mode; rest of site unaffected |
| Rate limit exceeded | 429 → terminal shows `UNIT IS RESTING` + scripted chips |
| LLM/provider outage | Stream error → friendly terminal error line, retry allowed |
| JS disabled / crawler | Full content server-rendered; boot overlay never blocks |
| Reduced motion | All animations disabled; content fully visible immediately |

## 10. Testing & verification

- Vitest unit tests for API route guards: input length, message cap, history
  truncation, rate limiter.
- Manual checklist before launch: boot skip + no-repeat, reduced-motion pass, mobile
  layout, chat streaming end-to-end, rate-limit fallback, missing-key fallback,
  OG image render, Lighthouse (target ≥95 performance/SEO/accessibility/best-practices).

## 11. Non-goals

- No blog, CMS, analytics, dark/light toggle (site is dark by design), i18n, or
  multi-page routing in v1.
- No autonomous claims about Parasource beyond its published positioning.
- Chat persona quality on `gpt-5-nano` is evaluated during implementation; if the
  voice is flat, model is swapped via env var (e.g. Claude Haiku) — no code change.
