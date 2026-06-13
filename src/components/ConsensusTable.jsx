const POSITION_STYLE = {
  'Agrees':           'bg-[#f0fdf4] text-[#16a34a] border border-[#dcfce7]',
  'Partially agrees': 'bg-[#fef3c7] text-[#d97706] border border-[#fde68a]',
  'Disagrees':        'bg-red-50 text-red-600 border border-red-100',
  'N/A':              'bg-[var(--color-chip-inactive)] text-[var(--color-text-faint)] border border-[var(--color-border)]',
}

function getRoundLabel(i, total) {
  if (i === 0) return 'Round 1'
  if (i === total - 1) return 'Final'
  return `Round ${i + 1}`
}

export default function ConsensusTable({ rows }) {
  if (!rows?.length) return null

  // Support both new format (rounds: boolean[]) and old format (r1_ok, debate_ok)
  const hasNewFormat = Array.isArray(rows[0]?.rounds)
  const numRounds = hasNewFormat ? rows[0].rounds.length : 2

  return (
    <div className="mt-6">
      <h4 className="text-xs uppercase tracking-widest text-[var(--color-text-faint)] mb-3">Consensus Table</h4>
      <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-[var(--color-text-faint)] font-medium">Model</th>
              <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-[var(--color-text-faint)] font-medium">Provider</th>
              {hasNewFormat
                ? Array.from({ length: numRounds }).map((_, i) => (
                    <th key={i} className="text-center px-4 py-3 text-xs uppercase tracking-wide text-[var(--color-text-faint)] font-medium">
                      {getRoundLabel(i, numRounds)}
                    </th>
                  ))
                : (
                  <>
                    <th className="text-center px-4 py-3 text-xs uppercase tracking-wide text-[var(--color-text-faint)] font-medium">Round 1</th>
                    <th className="text-center px-4 py-3 text-xs uppercase tracking-wide text-[var(--color-text-faint)] font-medium">Final</th>
                  </>
                )
              }
              <th className="text-center px-5 py-3 text-xs uppercase tracking-wide text-[var(--color-text-faint)] font-medium">Position</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.model} className={i < rows.length - 1 ? 'border-b border-[var(--color-border)]' : ''}>
                <td className="px-5 py-4 font-semibold text-[var(--color-text)]">{row.model}</td>
                <td className="px-5 py-4 text-[var(--color-text-muted)]">{row.provider}</td>
                {hasNewFormat
                  ? row.rounds.map((ok, ri) => (
                      <td key={ri} className="px-4 py-4 text-center">
                        <StatusBadge ok={ok} />
                      </td>
                    ))
                  : (
                    <>
                      <td className="px-4 py-4 text-center"><StatusBadge ok={row.r1_ok} /></td>
                      <td className="px-4 py-4 text-center"><StatusBadge ok={row.debate_ok} /></td>
                    </>
                  )
                }
                <td className="px-5 py-4 text-center">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${POSITION_STYLE[row.position] ?? POSITION_STYLE['N/A']}`}>
                    {row.position}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ ok }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${ok
      ? 'bg-[#f0fdf4] text-[#16a34a] border border-[#dcfce7]'
      : 'bg-red-50 text-red-600 border border-red-100'
    }`}>
      {ok ? 'OK' : 'Failed'}
    </span>
  )
}
