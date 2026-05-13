export default function NavBar({ onReset, showReset }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white border-b border-[var(--color-border)]">
      <button
        onClick={onReset}
        className="font-serif font-bold text-[var(--color-text)] text-lg tracking-tight hover:opacity-70 transition-opacity"
      >
        Model Council
      </button>

      {showReset && (
        <button
          onClick={onReset}
          className="text-sm text-[var(--color-accent)] hover:opacity-70 transition-opacity font-medium"
        >
          New prompt →
        </button>
      )}
    </nav>
  )
}
