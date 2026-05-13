export default function SynthesisPanel({ synthesis }) {
  if (!synthesis) return null

  return (
    <div className="relative animate-fade-in-up" style={{ opacity: 0 }}>
      {/* Glow backdrop */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl" />

      <div className="relative glass-strong rounded-2xl p-6 border border-emerald-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-sm">
            ✦
          </div>
          <div>
            <h3 className="font-display font-semibold text-white">Council Consensus</h3>
            <p className="text-xs text-slate-400">Synthesised by {synthesis.model}</p>
          </div>
        </div>

        {synthesis.error
          ? <p className="text-red-400 text-sm">{synthesis.error}</p>
          : <p className="text-slate-100 leading-relaxed whitespace-pre-wrap">{synthesis.content}</p>
        }
      </div>
    </div>
  )
}
