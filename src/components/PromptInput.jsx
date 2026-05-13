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
    <div className="relative group w-full max-w-2xl mx-auto">
      {/* Outer glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-glow-pulse" />

      {/* Input container */}
      <div className="relative bg-white rounded-2xl p-4 shadow-xl">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the council anything…"
          rows={3}
          disabled={loading}
          className="w-full border-none outline-none text-xl text-slate-900 resize-none placeholder:text-slate-400 font-sans leading-relaxed disabled:opacity-50"
        />

        {/* Bottom utility bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3 flex-wrap">
          <ModelSelector selected={selectedModels} onChange={setSelectedModels} />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Rounds</span>
              <select
                value={debateRounds}
                onChange={e => setDebateRounds(Number(e.target.value))}
                disabled={loading}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-700 bg-white outline-none focus:border-indigo-400 disabled:opacity-50"
              >
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <button
              onClick={onSubmit}
              disabled={loading || !prompt.trim()}
              className="w-9 h-9 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-md"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
