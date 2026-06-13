const MODEL_COLORS = {
  claude: 'bg-[#fef3c7] text-[#d97706]',
  gpt4o:  'bg-[#eff6ff] text-[#2563eb]',
  gemini: 'bg-[#f0fdf4] text-[#16a34a]',
}

const MODEL_LABELS = {
  claude: 'Claude',
  gpt4o:  'GPT-4o',
  gemini: 'Gemini',
}

function formatDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function HistoryPanel({ history, onRestore, onDelete, onClear, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-white border-l border-[var(--color-border)] flex flex-col shadow-xl"
        role="dialog"
        aria-label="Debate history"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-serif font-bold text-[var(--color-text)]">History</h2>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-[var(--color-text-faint)] hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors text-lg leading-none"
              aria-label="Close history"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <p className="text-[var(--color-text-faint)] text-sm">No debates yet.</p>
              <p className="text-[var(--color-text-faint)] text-xs mt-1">Your completed debates will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {history.map(session => (
                <li key={session.id} className="group px-5 py-4 hover:bg-[var(--color-bg)] transition-colors">
                  <button
                    className="w-full text-left"
                    onClick={() => onRestore(session)}
                  >
                    <p className="text-sm font-medium text-[var(--color-text)] line-clamp-2 leading-snug mb-2">
                      {session.prompt}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {session.selectedModels?.map(m => (
                        <span key={m} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${MODEL_COLORS[m] ?? 'bg-[var(--color-chip-inactive)] text-[var(--color-text-muted)]'}`}>
                          {MODEL_LABELS[m] ?? m}
                        </span>
                      ))}
                      <span className="text-[10px] text-[var(--color-text-faint)] ml-auto">
                        {formatDate(session.timestamp)}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => onDelete(session.id)}
                    className="mt-2 text-[10px] text-[var(--color-text-faint)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete this session"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
