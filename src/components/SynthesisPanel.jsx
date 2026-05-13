import ConsensusTable from './ConsensusTable.jsx'

export default function SynthesisPanel({ synthesis, consensus }) {
  if (!synthesis) return null

  return (
    <div className="animate-fade-in" style={{ opacity: 0 }}>
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 border-l-[3px] border-l-[var(--color-accent)]">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-serif font-bold text-[var(--color-accent)] text-xl">Synthesis</h3>
          <span className="text-xs text-[var(--color-text-faint)]">by {synthesis.model}</span>
        </div>

        {synthesis.error
          ? <p className="text-red-600 text-sm">{synthesis.error}</p>
          : <p className="text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">{synthesis.content}</p>
        }
      </div>

      <ConsensusTable rows={consensus} />
    </div>
  )
}
