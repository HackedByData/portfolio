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
