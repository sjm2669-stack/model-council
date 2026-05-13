import { useRef } from 'react'
import ModelSelector from './ModelSelector.jsx'

export default function PromptInput({ prompt, setPrompt, selectedModels, setSelectedModels, debateRounds, setDebateRounds, onSubmit, loading }) {
  const textareaRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="w-full">
      <label className="block text-xs uppercase tracking-widest text-[var(--color-text-faint)] mb-2">
        Your question
      </label>

      <div className="bg-white border-[1.5px] border-[var(--color-border)] rounded-xl shadow-sm">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the council anything…"
          rows={3}
          disabled={loading}
          className="w-full border-none outline-none text-lg text-[var(--color-text)] resize-none placeholder:text-[var(--color-text-faint)] font-sans leading-relaxed disabled:opacity-50 p-4 bg-transparent rounded-xl"
        />

        <div className="flex items-center justify-between px-4 pb-3 pt-2 border-t border-[var(--color-border)] gap-3 flex-wrap">
          <ModelSelector selected={selectedModels} onChange={setSelectedModels} />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--color-text-faint)] uppercase tracking-wide">Rounds</span>
              <select
                value={debateRounds}
                onChange={e => setDebateRounds(Number(e.target.value))}
                disabled={loading}
                className="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1 text-[var(--color-text-muted)] bg-white outline-none focus:border-[var(--color-accent)] disabled:opacity-50"
              >
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <button
              onClick={onSubmit}
              disabled={loading || !prompt.trim()}
              className="px-4 h-9 rounded-lg bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-opacity text-white text-sm font-medium"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : 'Ask →'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
