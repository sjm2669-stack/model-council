const PROVIDER_COLORS = {
  Anthropic: 'from-orange-500 to-amber-400',
  OpenAI: 'from-emerald-500 to-teal-400',
  Google: 'from-blue-500 to-indigo-400',
}

export default function ModelCard({ response, index }) {
  const gradient = PROVIDER_COLORS[response.provider] || 'from-indigo-500 to-purple-400'

  return (
    <div
      className="glass-strong rounded-2xl p-5 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold font-display`}>
          {response.model.charAt(0)}
        </div>
        <div>
          <div className="font-display font-semibold text-white text-sm">{response.model}</div>
          <div className="text-xs text-slate-400">{response.provider}</div>
        </div>
        {response.error
          ? <span className="ml-auto text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">Failed</span>
          : <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">Responded</span>
        }
      </div>

      {/* Content */}
      {response.error
        ? <p className="text-red-400 text-sm">{response.error}</p>
        : <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{response.content}</p>
      }
    </div>
  )
}

export function ModelCardSkeleton() {
  return (
    <div className="glass-strong rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-700" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-slate-700 rounded" />
          <div className="h-2.5 w-16 bg-slate-700/60 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-700/60 rounded w-full" />
        <div className="h-3 bg-slate-700/60 rounded w-5/6" />
        <div className="h-3 bg-slate-700/60 rounded w-4/6" />
      </div>
    </div>
  )
}
