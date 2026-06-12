# Model Council — project notes for Claude

React + Vite + Tailwind frontend (`src/`) and a Deno debate-engine backend
(`server/`), deployed together to one Deno Deploy project. See README.md for
architecture and deployment.

## Prompting rule

Before composing or refining ANY prompt — user-facing prompts, system prompts,
agent instructions, skills, or the debate/synthesis/consensus prompts in
`server/council.ts` — invoke the `fable-prompting` skill
(`.claude/skills/fable-prompting/SKILL.md`) first and apply its structure and
checklist. This applies to prompt reviews as well as new prompts.
