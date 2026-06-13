---
name: fable-prompting
description: Prompting guide for Claude Fable 5 / Mythos-class models, distilled from Anthropic's official docs. ALWAYS consult this BEFORE composing or refining any prompt — user prompts, system prompts, agent instructions, skills, or the Model Council debate prompts in server/council.ts — and before reviewing prompt-related code changes.
---

# Prompting Claude Fable 5

Source of truth: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5
(Last synced 2026-06-12. If guidance here conflicts with the live doc, the doc wins — re-sync this file.)

## Identity, briefly

Claude Fable 5 and Claude Mythos 5 share the same underlying model. Fable 5 is
generally available and includes additional safety measures for dual-use
capabilities; Mythos 5 is available only to approved organizations. They are
not interchangeable names for one product.

## The optimal prompt structure

Every substantial prompt should carry four parts:

```
I'm working on [the larger task] for [who it's for].
They need [what the output enables].

Request: [the specific ask, one clear sentence]

Output format: [exactly how the result should be structured and delivered]

Constraints: [what must NOT happen on the way to the result]
```

The first two lines are the most commonly skipped and the most important:
Fable 5 performs better when it understands intent, because context lets it
connect the task to relevant information instead of inferring intent.

## Core principles

1. **Match effort to the task.** Effort is the primary intelligence/latency/cost
   control. `high` is the default; `xhigh` for capability-sensitive work;
   `medium`/`low` for routine or conversational work (still strong — often
   better than `xhigh` on prior models). Reduce effort if tasks complete but
   take too long. (Note: "ultracode" is a Claude Code harness keyword for
   multi-agent orchestration, not an API effort level.)

2. **Keep instructions short.** Instruction-following is strong enough that a
   brief instruction beats enumerating every case. Over-engineered prompts
   constrain a model that would have found the right approach on its own.

3. **Start at the top of your difficulty range.** Assign harder tasks than you
   would to prior models; have it scope, ask clarifying questions, and execute.
   Testing only simple workloads undersells the model.

4. **Don't ask it to echo its reasoning.** Instructions to transcribe or
   explain internal reasoning as response text can trigger the
   `reasoning_extraction` refusal category. Read structured `thinking` blocks
   instead.

5. **Old prompts may work against you.** Skills and instructions written for
   Opus 4.8 or earlier are often too prescriptive and can degrade Fable 5
   output. Prefer starting fresh; remove instructions whose default behavior
   is now better.

## Copy-paste instruction blocks (Anthropic's exact recommended phrasings)

**Checkpoints — stop only where it matters:**
```
Pause for the user only when the work genuinely requires them: a destructive or
irreversible action, a real scope change, or input that only they can provide. If you
hit one of these, ask and end the turn, rather than ending on a promise.
```

**Anti-overplanning (ambiguous tasks):**
```
When you have enough information to act, act. Do not re-derive facts already established
in the conversation, re-litigate a decision the user has already made, or narrate
options you will not pursue in user-facing messages. If you are weighing a choice, give
a recommendation, not an exhaustive survey.
```

**Anti-overengineering (higher effort settings):**
```
Don't add features, refactor, or introduce abstractions beyond what the task requires.
Do the simplest thing that works well. Only validate at system boundaries (user input,
external APIs). Don't use feature flags or backwards-compatibility shims when you can
just change the code.
```

**Grounded progress claims (long autonomous runs — near-eliminates fabricated status):**
```
Before reporting progress, audit each claim against a tool result from this session.
Only report work you can point to evidence for; if something is not yet verified, say so
explicitly. Report outcomes faithfully: if tests fail, say so with the output; if a step
was skipped, say that; when something is done and verified, state it plainly.
```

**Boundaries (prevent unrequested actions):**
```
When the user is describing a problem, asking a question, or thinking out loud rather
than requesting a change, the deliverable is your assessment. Report your findings and
stop. Don't apply a fix until they ask for one.
```

**Memory system (give it a notes directory, e.g. notes/ or memory/):**
```
Store one lesson per file with a one-line summary at the top. Record corrections and
confirmed approaches alike, including why they mattered. Don't save what the repo or
chat history already records; update an existing note rather than creating a duplicate;
delete notes that turn out to be wrong.
```

**Self-verification (long builds):**
```
Establish a method for checking your own work at an interval of [X] as you build. Run
this every [X interval], verifying your work with subagents against the specification.
```
Fresh-context verifier subagents outperform self-critique.

**Subagent delegation:**
```
Delegate independent subtasks to subagents and keep working while they run. Intervene
if a subagent goes off track or is missing relevant context.
```

## Caveats

- **Longer turns by default.** Hard tasks run many minutes at higher effort;
  autonomous runs extend for hours. Adjust timeouts and progress UX first.
- **Proactive by design.** Can take unrequested actions; state boundaries
  explicitly (block above).
- **Occasional early stops.** Deep in long sessions it may state intent
  without acting, or ask permission it doesn't need. "Go ahead and do it
  end-to-end" restarts it.
- **Context-budget anxiety.** If a harness shows remaining-token counts, it
  may offer to wrap up early. Reassure: "You have ample context remaining.
  Continue the work."
- **Safety classifiers.** Offensive cybersecurity (exploits, malware, attack
  tooling) and biology/life-sciences content can return
  `stop_reason: "refusal"` — and benign work in those domains can
  occasionally trigger them too. For APIs, configure fallback to Claude
  Opus 4.8. This is *not* "decline all security work": authorized defensive
  and research work proceeds with clear authorization context.

## Corrections vs. the Medium summary this skill was requested from

The article (medium.com/@warrioraashuu, "Fable 5 Mythos Prompting Masterclass")
is a decent intro but diverges from the official doc on these points — trust
the doc:
- Fable 5 is **not** "also known as Mythos" (distinct offerings, above).
- "Fable cannot perform solely on instructions" overstates it: it performs
  *better* with intent/context, it doesn't fail without it.
- "Decline cybersecurity and life sciences requests" conflates safety
  classifiers with hallucination; see Caveats above for the accurate version.
- "Ultracode" is not an effort level in the API.
- The article omits: grounded progress claims, verifier subagents,
  reasoning-extraction refusals, the send-to-user tool pattern, and the
  readability addendum — all of which are in the official doc and this skill.

## Checklist before sending any prompt

1. Did I say **why** (larger task, who for, what it enables)?
2. Is the request **one clear sentence**?
3. Did I specify **output format**?
4. Did I state **constraints** (what must not happen)?
5. Is the instruction **short** — am I enumerating cases the model would
   handle itself?
6. For autonomous work: checkpoint, progress-grounding, and memory
   instructions included?
7. Am I accidentally asking it to **echo its reasoning**? (Remove that.)
