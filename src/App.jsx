import { useState } from 'react'
import { useCouncil } from './hooks/useCouncil.js'
import NavBar from './components/NavBar.jsx'
import PromptInput from './components/PromptInput.jsx'
import RoundPanel from './components/RoundPanel.jsx'
import SynthesisPanel from './components/SynthesisPanel.jsx'
import ConsensusTable from './components/ConsensusTable.jsx'

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [selectedModels, setSelectedModels] = useState(['claude', 'gpt4o', 'gemini'])
  const [debateRounds, setDebateRounds] = useState(3)
  const { status, rounds, synthesis, consensus, error, run, reset } = useCouncil()

  const handleSubmit = () => {
    if (!prompt.trim() || status === 'streaming') return
    run(prompt, selectedModels, debateRounds)
  }

  const handleReset = () => {
    reset()
    setPrompt('')
  }

  const isStreaming = status === 'streaming'
  const hasResults = rounds.length > 0

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <NavBar onReset={handleReset} showReset={hasResults} />

      {/* Hero / idle state */}
      {!hasResults && (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-12">
          {/* Badge */}
          <div className="mb-6 flex items-center gap-2 glass-soft rounded-full px-4 py-1.5 text-sm text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Multi-model debate engine
          </div>

          {/* Headline */}
          <h1 className="font-serif text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] text-center mb-4 max-w-2xl">
            Ask the{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Council
            </span>
          </h1>

          {/* Subheading with typing cursor */}
          <p className="text-slate-400 text-lg text-center mb-10 max-w-md cursor-blink">
            Three AI models debate your question and reach consensus
          </p>

          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            selectedModels={selectedModels}
            setSelectedModels={setSelectedModels}
            debateRounds={debateRounds}
            setDebateRounds={setDebateRounds}
            onSubmit={handleSubmit}
            loading={isStreaming}
          />

          {/* Integration bar */}
          <div className="mt-8 glass-soft rounded-2xl px-6 py-4 flex items-center gap-8 max-w-lg w-full">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Powered by</span>
              <div className="flex gap-2">
                {['Anthropic', 'OpenAI', 'Google'].map(p => (
                  <span key={p} className="text-xs text-slate-400 glass-soft rounded px-2 py-0.5">{p}</span>
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-600 ml-auto">⌘ + Enter to submit</div>
          </div>
        </div>
      )}

      {/* Results state */}
      {hasResults && (
        <div className="max-w-5xl mx-auto px-4 pt-28 pb-20 space-y-10">
          {/* Compact prompt recap + input */}
          <div className="glass-soft rounded-2xl p-4 flex items-start gap-4">
            <span className="text-slate-500 text-sm mt-0.5 shrink-0">Prompt</span>
            <p className="text-white font-medium flex-1 leading-snug">{prompt}</p>
            {status === 'complete' && (
              <button
                onClick={handleReset}
                className="shrink-0 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                New prompt →
              </button>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Rounds */}
          {rounds.map((round, i) => {
            const isActive = isStreaming && i === rounds.length - 1
            return (
              <RoundPanel
                key={round.round}
                round={round}
                totalModels={selectedModels.length}
                isActive={isActive}
              />
            )
          })}

          {/* Synthesis */}
          {synthesis && <SynthesisPanel synthesis={synthesis} />}

          {/* Consensus table */}
          {consensus && <ConsensusTable rows={consensus} />}

          {/* Streaming indicator */}
          {isStreaming && !synthesis && (
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <span className="w-4 h-4 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin" />
              Council deliberating…
            </div>
          )}
        </div>
      )}
    </div>
  )
}
