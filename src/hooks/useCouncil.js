import { useState, useCallback } from 'react'

const COUNCIL_URL = import.meta.env.VITE_COUNCIL_URL ?? '/api/council'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export function useCouncil() {
  const [status, setStatus] = useState('idle')   // idle | streaming | complete | error
  const [rounds, setRounds] = useState([])        // [{round, label, responses[]}]
  const [synthesis, setSynthesis] = useState(null)
  const [consensus, setConsensus] = useState(null)
  const [error, setError] = useState(null)

  const run = useCallback(async (prompt, selectedModels, debateRounds) => {
    setStatus('streaming')
    setRounds([])
    setSynthesis(null)
    setConsensus(null)
    setError(null)

    const headers = { 'Content-Type': 'application/json' }
    if (SUPABASE_ANON_KEY) headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`

    try {
      const response = await fetch(COUNCIL_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt, models: selectedModels, debate_rounds: debateRounds }),
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          let event
          try {
            event = JSON.parse(line.slice(6))
          } catch {
            continue
          }

          if (event.type === 'round_start') {
            setRounds(prev => [...prev, { round: event.round, label: event.label, responses: [] }])
          } else if (event.type === 'model_response') {
            setRounds(prev => prev.map(r =>
              r.round === event.round ? { ...r, responses: [...r.responses, event] } : r
            ))
          } else if (event.type === 'synthesis') {
            setSynthesis(event)
          } else if (event.type === 'consensus') {
            setConsensus(event.rows)
          } else if (event.type === 'done') {
            setStatus('complete')
          } else if (event.type === 'error') {
            setError(event.message)
            setStatus('error')
          }
        }
      }
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }, [])

  const load = useCallback(({ rounds, synthesis, consensus }) => {
    setStatus('complete')
    setRounds(rounds)
    setSynthesis(synthesis)
    setConsensus(consensus)
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setRounds([])
    setSynthesis(null)
    setConsensus(null)
    setError(null)
  }, [])

  return { status, rounds, synthesis, consensus, error, run, load, reset }
}
