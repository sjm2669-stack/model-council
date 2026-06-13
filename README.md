# Model Council

The AI debate engine — pit Claude, GPT-4o, and Gemini against each other across
multiple debate rounds, then get a synthesised answer and a consensus analysis.

**Live site:** https://model-council.sjm2669-stack.deno.net

## How it works

1. You ask a question and pick at least two models.
2. **Round 1** — each model answers independently, in parallel.
3. **Later rounds** — each model sees the others' previous answers and refines
   its position.
4. **Synthesis** — Claude merges the debate into one balanced answer.
5. **Consensus table** — each model's final stance is classified as
   *Agrees / Partially agrees / Disagrees* with the synthesis.

Results stream live over SSE, are saved to browser history (localStorage),
and can be exported as Markdown.

## Architecture

```
src/                 React 18 + Vite + Tailwind frontend
server/main.ts       Deno entrypoint: serves dist/ + routes /api/council
server/council.ts    Debate engine: parallel model calls, synthesis, consensus
.github/workflows/   Builds the frontend and deploys to Deno Deploy on push to main
```

One Deno Deploy project serves both the static frontend and the API from the
same origin.

## Local development

```sh
npm install
npm run dev          # http://localhost:5173
```

By default the dev server proxies `/api` to `localhost:8000`. Either:

- **Use the deployed API** — copy `.env.example` to `.env.local` and set
  `VITE_COUNCIL_URL` to the deployed `/api/council` URL, or
- **Run the API locally**:

  ```sh
  export ANTHROPIC_API_KEY=... OPENAI_API_KEY=... GOOGLE_API_KEY=...
  deno task serve    # API + built frontend on http://localhost:8000
  ```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
frontend (`npm run build`) and deploys `server/main.ts` + `dist/` to the
`model-council` project on Deno Deploy via OIDC.

One-time setup in the [Deno Deploy dashboard](https://dash.deno.com):

1. Link the GitHub repository to the project and select **GitHub Actions**
   as the deployment mode.
2. Set the server-side secrets under **Settings → Environment Variables**:
   `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`.
