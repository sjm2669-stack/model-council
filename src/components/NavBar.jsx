export default function NavBar({ onReset, showReset }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4">
      <button
        onClick={onReset}
        className="flex items-center gap-2 font-display font-bold text-white tracking-tight text-lg hover:opacity-80 transition-opacity"
      >
        <span className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-sm">⚖</span>
        model council
      </button>

      <div className="glass-soft rounded-full px-6 py-2 hidden md:flex items-center gap-6 text-sm text-slate-300">
        <span className="hover:text-white transition-colors cursor-pointer">How it works</span>
        <span className="hover:text-white transition-colors cursor-pointer">Models</span>
        <span className="hover:text-white transition-colors cursor-pointer">Docs</span>
      </div>

      {showReset && (
        <button
          onClick={onReset}
          className="glass-soft text-sm text-white px-4 py-2 rounded-full hover:bg-white/10 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          New prompt
        </button>
      )}
    </nav>
  )
}
