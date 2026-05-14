import { useState, useEffect } from 'react'
import { useCouncil } from './hooks/useCouncil.js'
import NavBar from './components/NavBar.jsx'
import PromptInput from './components/PromptInput.jsx'
import ModelCard, { ModelCardSkeleton } from './components/ModelCard.jsx'
import SynthesisPanel from './components/SynthesisPanel.jsx'

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [selectedModels, setSelectedModels] = useState(['claude', 'gpt4o', 'gemini'])
  const [debateRounds, setDebateRounds] = useState(3)
  const [activeTab, setActiveTab] = useState(null)
  const { status, rounds, synthesis, consensus, error, run, reset } = useCouncil()

  const handleSubmit = () => {
    if (!prompt.trim() || status === 'streaming') return
    setActiveTab(null)
    run(prompt, selectedModels, debateRounds)
  }

  const handleReset = () => {
    reset()
    setPrompt('')
    setActiveTab(null)
  }

  useEffect(() => {
    if (rounds.length > 0) {
      setActiveTab(rounds[rounds.length - 1].round)
    }
  }, [rounds.length])

  useEffect(() => {
    if (synthesis) setActiveTab('synthesis')
  }, [synthesis])

  const isStreaming = status === 'streaming'
  const hasResults = rounds.length > 0

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <NavBar onReset={handleReset} showReset={hasResults} />

      {/* Hero — idle state */}
      {!hasResults && (
        <div className="flex items-center justify-center min-h-screen px-6 pt-20 pb-12">
          <div className="w-full max-w-3xl grid grid-cols-5 gap-10 items-center">
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-medium mb-4">
                Model Council
              </p>
              <h1 className="font-serif text-3xl font-bold text-[var(--color-text)] leading-snug mb-4">
                The AI debate engine
              </h1>
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6">
                Pit Claude, GPT-4o, and Gemini against each other. Get a synthesised answer you can trust.
              </p>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                <span className="w-2 h-2 rounded-full bg-[var(--color-border)]" />
                <span className="w-2 h-2 rounded-full bg-[var(--color-border)]" />
              </div>
            </div>
            <div className="col-span-3">
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
              <p className="text-xs text-[var(--color-text-faint)] mt-2 text-right">⌘ + Enter to submit</p>
            </div>
          </div>
        </div>
      )}

      {/* Results state — tabbed rounds */}
      {hasResults && (
        <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-4 flex items-start gap-4 mb-6">
            <span className="text-xs uppercase tracking-widest text-[var(--color-text-faint)] mt-0.5 shrink-0">Prompt</span>
            <p className="text-[var(--color-text)] font-medium flex-1 leading-snug text-sm">{prompt}</p>
            {status === 'complete' && (
              <button onClick={handleReset} className="shrink-0 text-xs text-[var(--color-accent)] hover:opacity-70 transition-opacity font-medium">
                New prompt →
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm mb-6">
              {error}
            </div>
          )}

          <div className="flex gap-0 border-b border-[var(--color-border)] mb-6">
            {rounds.map((round) => {
              const isActive = activeTab === round.round
              const isCurrentlyStreaming = isStreaming && round.round === rounds[rounds.length - 1].round
              return (
                <button
                  key={round.round}
                  onClick={() => setActiveTab(round.round)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors mr-1 ${
                    isActive
                      ? 'border-[var(--color-accent)] text-[var(--color-text)]'
                      : 'border-transparent text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]'
                  }`}
                >
                  {round.round === 1 ? 'Round 1' : round.label ?? `Round ${round.round}`}
                  {isCurrentlyStreaming && (
                    <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                  )}
                </button>
              )
            })}
            <button
              onClick={() => synthesis && setActiveTab('synthesis')}
              disabled={!synthesis}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ml-auto ${
                activeTab === 'synthesis'
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                  : synthesis
                    ? 'border-transparent text-[var(--color-text-faint)] hover:text-[var(--color-accent)]'
                    : 'border-transparent text-[var(--color-border)] cursor-not-allowed'
              }`}
            >
              Synthesis ✦
            </button>
          </div>

          {typeof activeTab === 'number' && (() => {
            const round = rounds.find(r => r.round === activeTab)
            if (!round) return null
            const isActive = isStreaming && activeTab === rounds[rounds.length - 1].round
            const pending = selectedModels.length - round.responses.length
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {round.responses.map((r, idx) => (
                  <ModelCard key={`${r.model}-${round.round}`} response={r} index={idx} />
                ))}
                {isActive && Array.from({ length: pending }).map((_, idx) => (
                  <ModelCardSkeleton key={`sk-${idx}`} />
                ))}
              </div>
            )
          })()}

          {activeTab === 'synthesis' && (
            <SynthesisPanel synthesis={synthesis} consensus={consensus} />
          )}
        </div>
      )}
    </div>
  )
}
