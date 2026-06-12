export default function NavBar({ onReset, showReset, onOpenHistory, historyCount }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white border-b border-[var(--color-border)]">
      <button
        onClick={onReset}
        className="font-serif font-bold text-[var(--color-text)] text-lg tracking-tight hover:opacity-70 transition-opacity"
      >
        Model Council
      </button>

      <div className="flex items-center gap-4">
        <button
          onClick={onOpenHistory}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-1.5"
          aria-label="Open debate history"
        >
          History
          {historyCount > 0 && (
            <span className="text-xs bg-[var(--color-chip-inactive)] text-[var(--color-text-faint)] rounded-full px-1.5 py-0.5 leading-none">
              {historyCount}
            </span>
          )}
        </button>

        {showReset && (
          <button
            onClick={onReset}
            className="text-sm text-[var(--color-accent)] hover:opacity-70 transition-opacity font-medium"
          >
            New prompt →
          </button>
        )}
      </div>
    </nav>
  )
}
