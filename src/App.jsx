import { useState, useEffect } from 'react'
import { useCouncil } from './hooks/useCouncil.js'
import { useHistory } from './hooks/useHistory.js'
import NavBar from './components/NavBar.jsx'
import PromptInput from './components/PromptInput.jsx'
import ModelCard, { ModelCardSkeleton } from './components/ModelCard.jsx'
import SynthesisPanel from './components/SynthesisPanel.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)

function generateMarkdown(prompt, rounds, synthesis, consensus) {
  const date = new Date().toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })
  const lines = [`# Model Council: ${prompt}`, `*${date}*`, '']

  for (const round of rounds) {
    lines.push(`---`, ``, `## ${round.label ?? `Round ${round.round}`}`, '')
    for (const r of round.responses) {
      lines.push(`### ${r.model} (${r.provider})`, '')
      if (r.error) {
        lines.push(`*Error: ${r.error}*`, '')
      } else {
        lines.push(r.content, '')
      }
    }
  }

  if (synthesis) {
    lines.push('---', '', '## Synthesis', '', `*by ${synthesis.model}*`, '')
    lines.push(synthesis.error ? `*Error: ${synthesis.error}*` : synthesis.content, '')
  }

  if (consensus?.length) {
    lines.push('---', '', '## Consensus', '')
    const hasNewFormat = Array.isArray(consensus[0]?.rounds)
    if (hasNewFormat) {
      const numRounds = consensus[0].rounds.length
      const header = ['Model', 'Provider', ...Array.from({ length: numRounds }, (_, i) => `Round ${i + 1}`), 'Position']
      lines.push(`| ${header.join(' | ')} |`)
      lines.push(`| ${header.map(() => '---').join(' | ')} |`)
      for (const row of consensus) {
        const cols = [row.model, row.provider, ...row.rounds.map(ok => ok ? '✓' : '✗'), row.position]
        lines.push(`| ${cols.join(' | ')} |`)
      }
    } else {
      lines.push('| Model | Provider | Round 1 | Final | Position |')
      lines.push('| --- | --- | --- | --- | --- |')
      for (const row of consensus) {
        lines.push(`| ${row.model} | ${row.provider} | ${row.r1_ok ? '✓' : '✗'} | ${row.debate_ok ? '✓' : '✗'} | ${row.position} |`)
      }
    }
    lines.push('')
  }

  return lines.join('\n')
}

function downloadMarkdown(content, prompt) {
  const slug = prompt.slice(0, 40).replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `model-council-${slug}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [selectedModels, setSelectedModels] = useState(['claude', 'gpt4o', 'gemini'])
  const [debateRounds, setDebateRounds] = useState(3)
  const [activeTab, setActiveTab] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const { status, rounds, synthesis, consensus, error, run, load, reset } = useCouncil()
  const { history, saveSession, deleteSession, clearHistory } = useHistory()

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

  const handleRetry = () => {
    run(prompt, selectedModels, debateRounds)
  }

  const handleRestoreSession = (session) => {
    setPrompt(session.prompt)
    setSelectedModels(session.selectedModels ?? selectedModels)
    load({ rounds: session.rounds, synthesis: session.synthesis, consensus: session.consensus })
    setShowHistory(false)
  }

  const handleExport = () => {
    const md = generateMarkdown(prompt, rounds, synthesis, consensus)
    downloadMarkdown(md, prompt)
  }

  useEffect(() => {
    if (rounds.length > 0) {
      setActiveTab(rounds[rounds.length - 1].round)
    }
  }, [rounds.length])

  useEffect(() => {
    if (synthesis) setActiveTab('synthesis')
  }, [synthesis])

  // Auto-save completed debates to history
  useEffect(() => {
    if (status === 'complete' && synthesis) {
      saveSession({ prompt, selectedModels, debateRounds, rounds, synthesis, consensus })
    }
  }, [status])

  const isStreaming = status === 'streaming'
  const hasResults = rounds.length > 0

  // Progress text while streaming
  const currentRound = rounds[rounds.length - 1]
  const progressText = isStreaming && currentRound
    ? `Round ${currentRound.round} of ${debateRounds} · ${currentRound.responses.length}/${selectedModels.length} models responded`
    : null

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <NavBar
        onReset={handleReset}
        showReset={hasResults}
        onOpenHistory={() => setShowHistory(true)}
        historyCount={history.length}
      />

      {showHistory && (
        <HistoryPanel
          history={history}
          onRestore={handleRestoreSession}
          onDelete={deleteSession}
          onClear={clearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Hero — idle state */}
      {!hasResults && (
        <div className="flex items-center justify-center min-h-screen px-6 pt-20 pb-12">
          <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-medium mb-4">
                Model Council
              </p>
              <h1 className="font-serif text-3xl font-bold text-[var(--color-text)] leading-snug mb-4">
                The AI debate engine
              </h1>
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6">
                Pit Claude, GPT-4o, and Gemini against each other. Get a synthesised answer you can trust.
              </p>
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                <span className="w-2 h-2 rounded-full bg-[var(--color-border)]" />
                <span className="w-2 h-2 rounded-full bg-[var(--color-border)]" />
              </div>
            </div>
            <div className="md:col-span-3">
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
              <p className="text-xs text-[var(--color-text-faint)] mt-2 text-right">
                {isMac ? '⌘' : 'Ctrl'} + Enter to submit
              </p>
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
            <div className="flex items-center gap-3 shrink-0">
              {status === 'complete' && (
                <>
                  <button
                    onClick={handleExport}
                    className="text-xs text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] transition-colors font-medium"
                    title="Export as Markdown"
                  >
                    Export ↓
                  </button>
                  <button onClick={handleReset} className="text-xs text-[var(--color-accent)] hover:opacity-70 transition-opacity font-medium">
                    New prompt →
                  </button>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm mb-6 flex items-center justify-between gap-4">
              <span>{error}</span>
              <button
                onClick={handleRetry}
                className="shrink-0 text-xs font-medium border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors"
              >
                Retry →
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mb-1">
            {progressText && (
              <p className="text-xs text-[var(--color-text-faint)] animate-pulse" aria-live="polite">
                {progressText}
              </p>
            )}
          </div>

          <div role="tablist" className="flex gap-0 border-b border-[var(--color-border)] mb-6">
            {rounds.map((round) => {
              const isActive = activeTab === round.round
              const isCurrentlyStreaming = isStreaming && round.round === rounds[rounds.length - 1].round
              return (
                <button
                  key={round.round}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(round.round)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors mr-1 ${
                    isActive
                      ? 'border-[var(--color-accent)] text-[var(--color-text)]'
                      : 'border-transparent text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]'
                  }`}
                >
                  {round.label ?? `Round ${round.round}`}
                  {isCurrentlyStreaming && (
                    <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" aria-hidden="true" />
                  )}
                  {!isCurrentlyStreaming && !isActive && (
                    <span className="ml-1.5 text-[var(--color-text-faint)] text-xs" aria-hidden="true">✓</span>
                  )}
                </button>
              )
            })}
            <button
              role="tab"
              aria-selected={activeTab === 'synthesis'}
              onClick={() => synthesis && setActiveTab('synthesis')}
              disabled={!synthesis && !isStreaming}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ml-auto flex items-center gap-1.5 ${
                activeTab === 'synthesis'
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                  : synthesis
                    ? 'border-transparent text-[var(--color-text-faint)] hover:text-[var(--color-accent)]'
                    : 'border-transparent text-[var(--color-border)] cursor-not-allowed'
              }`}
            >
              Synthesis ✦
              {isStreaming && !synthesis && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)] animate-pulse" aria-hidden="true" />
              )}
            </button>
          </div>

          {typeof activeTab === 'number' && (() => {
            const round = rounds.find(r => r.round === activeTab)
            if (!round) return null
            const isActive = isStreaming && activeTab === rounds[rounds.length - 1].round
            const pending = Math.max(0, selectedModels.length - round.responses.length)
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
