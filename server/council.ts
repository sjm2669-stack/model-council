const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ---------------------------------------------------------------------------
// Model configuration
// ---------------------------------------------------------------------------

interface ModelConfig {
  id: string
  provider: 'Anthropic' | 'OpenAI' | 'Google'
  label: string
}

const MODELS: Record<string, ModelConfig> = {
  claude: { id: 'claude-sonnet-4-6',  provider: 'Anthropic', label: 'claude-sonnet-4-6' },
  gpt4o:  { id: 'gpt-4o',             provider: 'OpenAI',    label: 'gpt-4o'            },
  gemini: { id: 'gemini-1.5-pro',     provider: 'Google',    label: 'gemini-1.5-pro'    },
}

function getRoundLabel(roundNum: number, totalRounds: number): string {
  if (roundNum === 1 && totalRounds === 1) return 'Response'
  if (roundNum === 1) return 'Opening'
  if (roundNum === totalRounds) return 'Final'
  if (roundNum === 2 && totalRounds === 3) return 'Rebuttal'
  return `Round ${roundNum}`
}

// ---------------------------------------------------------------------------
// API callers
// ---------------------------------------------------------------------------

interface Message {
  role: 'user' | 'assistant'
  content: string
}

async function callClaude(
  messages: Message[],
  system: string,
  apiKey: string,
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODELS.claude.id,
      max_tokens: 1024,
      system,
      messages,
    }),
  })
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.content[0].text
}

async function callOpenAI(
  messages: Message[],
  system: string,
  apiKey: string,
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODELS.gpt4o.id,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: system },
        ...messages,
      ],
    }),
  })
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content
}

async function callGemini(
  messages: Message[],
  system: string,
  apiKey: string,
): Promise<string> {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELS.gemini.id}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: { maxOutputTokens: 1024 },
      }),
    },
  )
  if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  return data.candidates[0].content.parts[0].text
}

async function callModel(
  modelKey: string,
  messages: Message[],
  system: string,
  keys: { anthropic: string; openai: string; google: string },
): Promise<string> {
  if (modelKey === 'claude')  return callClaude(messages, system, keys.anthropic)
  if (modelKey === 'gpt4o')   return callOpenAI(messages, system, keys.openai)
  if (modelKey === 'gemini')  return callGemini(messages, system, keys.google)
  throw new Error(`Unknown model: ${modelKey}`)
}

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildRound1Messages(prompt: string): Message[] {
  return [{ role: 'user', content: prompt }]
}

function buildDebateMessages(
  prompt: string,
  modelKey: string,
  prevResponses: Array<{ modelKey: string; label: string; content: string }>,
): Message[] {
  const others = prevResponses.filter(r => r.modelKey !== modelKey)
  const own = prevResponses.find(r => r.modelKey === modelKey)

  const othersText = others
    .map(r => `**${r.label}:** ${r.content}`)
    .join('\n\n')

  const content = `Original question: ${prompt}

Other models' previous responses:
${othersText}

Your previous response:
${own?.content ?? '(no previous response)'}

Now refine your perspective. Acknowledge areas of genuine agreement, respectfully challenge disagreements with evidence and reasoning, and deepen your analysis.`

  return [{ role: 'user', content }]
}

const ROUND1_SYSTEM = `You are one of several frontier AI models in a council debate. \
The user asked a question; each model answers independently, and the answers appear \
side-by-side so the user can compare reasoning before they feed into later debate rounds.

Give your genuine, well-reasoned position. Be specific and substantive. \
Format in markdown. Aim for under 300 words — dense and useful beats long.`

const DEBATE_SYSTEM = `You are one of several frontier AI models in a council debate, \
now reviewing the other models' answers. Your refined position appears side-by-side \
with theirs and feeds a final synthesis, so make real disagreements explicit rather \
than diplomatically vague.

Acknowledge genuine agreement, challenge weak arguments with evidence, and update \
your position when another model's reasoning is better. Format in markdown. \
Aim for under 300 words.`

const SYNTHESIS_SYSTEM = `You are the synthesizer for a multi-model AI council debate. \
The user asked one question and wants a single answer they can trust more than any \
one model's take.

Lead with the answer itself, then note where the models genuinely agreed and any \
disagreement that should change the user's confidence. Format in markdown. \
No meta-commentary about the debate process.`

const CONSENSUS_SYSTEM = `You are an impartial judge evaluating whether each model's final response \
aligns with a synthesis. Respond with a single JSON object and no other text.`

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function handleCouncil(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS })
  }

  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
  const OPENAI_API_KEY    = Deno.env.get('OPENAI_API_KEY')    ?? ''
  const GOOGLE_API_KEY    = Deno.env.get('GOOGLE_API_KEY')    ?? ''

  if (!ANTHROPIC_API_KEY || !OPENAI_API_KEY || !GOOGLE_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing API keys. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY in the Deno Deploy dashboard (Settings → Environment Variables).' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }

  const keys = { anthropic: ANTHROPIC_API_KEY, openai: OPENAI_API_KEY, google: GOOGLE_API_KEY }

  let body: { prompt: string; models: string[]; debate_rounds: number }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: CORS })
  }

  const { prompt, models, debate_rounds } = body
  if (!prompt || !models?.length || !debate_rounds) {
    return new Response('Missing required fields', { status: 400, headers: CORS })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      // roundHistory[roundNum] = array of { modelKey, label, provider, content }
      const roundHistory: Record<number, Array<{ modelKey: string; label: string; provider: string; content: string }>> = {}

      try {
        for (let roundNum = 1; roundNum <= debate_rounds; roundNum++) {
          const label = getRoundLabel(roundNum, debate_rounds)
          send({ type: 'round_start', round: roundNum, label })

          const roundResults = await Promise.all(
            models.map(async (modelKey: string) => {
              const cfg = MODELS[modelKey]
              if (!cfg) return { modelKey, label: modelKey, provider: 'Unknown', content: '', error: 'Unknown model' }

              try {
                const messages = roundNum === 1
                  ? buildRound1Messages(prompt)
                  : buildDebateMessages(prompt, modelKey, roundHistory[roundNum - 1] ?? [])

                const system = roundNum === 1 ? ROUND1_SYSTEM : DEBATE_SYSTEM
                const content = await callModel(modelKey, messages, system, keys)

                const response = { modelKey, label: cfg.label, provider: cfg.provider, content }
                send({ type: 'model_response', round: roundNum, model: cfg.label, provider: cfg.provider, content })
                return response
              } catch (err) {
                const error = err instanceof Error ? err.message : String(err)
                send({ type: 'model_response', round: roundNum, model: cfg.label, provider: cfg.provider, content: '', error })
                return { modelKey, label: cfg.label, provider: cfg.provider, content: '', error }
              }
            }),
          )

          roundHistory[roundNum] = roundResults.filter(r => !('error' in r && r.error))
        }

        // Synthesis — use Claude
        const allRoundsText = Object.entries(roundHistory)
          .map(([rNum, responses]) => {
            const roundLabel = getRoundLabel(Number(rNum), debate_rounds)
            const responseText = responses.map(r => `**${r.label}:** ${r.content}`).join('\n\n')
            return `## ${roundLabel}\n\n${responseText}`
          })
          .join('\n\n---\n\n')

        const synthesisMessages: Message[] = [{
          role: 'user',
          content: `Question: ${prompt}\n\nFull debate transcript:\n\n${allRoundsText}\n\nSynthesize the key insights into a comprehensive, balanced answer.`,
        }]

        let synthesisContent: string
        try {
          synthesisContent = await callClaude(synthesisMessages, SYNTHESIS_SYSTEM, keys.anthropic)
          send({ type: 'synthesis', model: MODELS.claude.label, provider: 'Anthropic', content: synthesisContent })
        } catch (err) {
          const error = err instanceof Error ? err.message : String(err)
          synthesisContent = ''
          send({ type: 'synthesis', model: MODELS.claude.label, provider: 'Anthropic', content: '', error })
        }

        // Consensus analysis
        const finalRound = roundHistory[debate_rounds] ?? roundHistory[Math.max(...Object.keys(roundHistory).map(Number))] ?? []
        const perRoundStatus: Record<string, boolean[]> = {}
        for (const modelKey of models) {
          perRoundStatus[modelKey] = Array.from({ length: debate_rounds }, (_, i) => {
            const rnd = roundHistory[i + 1] ?? []
            return rnd.some(r => r.modelKey === modelKey)
          })
        }

        let positions: Record<string, string> = {}
        if (synthesisContent && finalRound.length > 0) {
          const modelResponses = finalRound.map(r => `**${r.label}:** ${r.content}`).join('\n\n')
          const consensusMessages: Message[] = [{
            role: 'user',
            content: `Synthesis:\n${synthesisContent}\n\nModel final responses:\n${modelResponses}\n\nClassify each model's alignment with the synthesis as "Agrees", "Partially agrees", or "Disagrees". Reply only with a JSON object like: {"claude-sonnet-4-6": "Agrees", "gpt-4o": "Partially agrees", "gemini-1.5-pro": "Disagrees"}`,
          }]

          try {
            const raw = await callClaude(consensusMessages, CONSENSUS_SYSTEM, keys.anthropic)
            const jsonMatch = raw.match(/\{[\s\S]*\}/)
            if (jsonMatch) positions = JSON.parse(jsonMatch[0])
          } catch {
            // Fallback: mark all as N/A
          }
        }

        const consensusRows = models.map((modelKey: string) => {
          const cfg = MODELS[modelKey]
          const rounds = perRoundStatus[modelKey] ?? []
          const position = positions[cfg?.label ?? modelKey] ?? 'N/A'
          return {
            model:    cfg?.label    ?? modelKey,
            provider: cfg?.provider ?? 'Unknown',
            rounds,
            position,
          }
        })

        send({ type: 'consensus', rows: consensusRows })
        send({ type: 'done' })
      } catch (err) {
        send({ type: 'error', message: err instanceof Error ? err.message : String(err) })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      ...CORS,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
