import ModelCard, { ModelCardSkeleton } from './ModelCard.jsx'

export default function RoundPanel({ round, totalModels, isActive }) {
  const pending = totalModels - round.responses.length
  const isRound1 = round.round === 1

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0 }}>
      {/* Round header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-display ${
            isActive ? 'bg-indigo-500 text-white animate-pulse' : 'bg-indigo-500/20 text-indigo-300'
          }`}>
            {round.round}
          </div>
          <h3 className="font-display font-semibold text-white">
            {isRound1 ? 'Independent Answers' : round.label}
          </h3>
        </div>
        {isActive && (
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
            Waiting for {pending} model{pending !== 1 ? 's' : ''}…
          </span>
        )}
        {!isActive && (
          <span className="text-xs text-slate-500">{round.responses.length} response{round.responses.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {round.responses.map((r, i) => (
          <ModelCard key={`${r.model}-${round.round}`} response={r} index={i} />
        ))}
        {isActive && Array.from({ length: pending }).map((_, i) => (
          <ModelCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    </div>
  )
}
