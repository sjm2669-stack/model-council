const POSITION_STYLE = {
  'Agrees': 'bg-emerald-500/20 text-emerald-300',
  'Partially agrees': 'bg-amber-500/20 text-amber-300',
  'Disagrees': 'bg-red-500/20 text-red-300',
  'N/A': 'bg-slate-500/20 text-slate-400',
}

export default function ConsensusTable({ rows }) {
  if (!rows?.length) return null

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0 }}>
      <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs">≡</span>
        Consensus Table
      </h3>

      <div className="glass-strong rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-5 py-3 text-slate-400 font-medium font-display">Model</th>
              <th className="text-left px-5 py-3 text-slate-400 font-medium font-display">Provider</th>
              <th className="text-center px-5 py-3 text-slate-400 font-medium font-display">Round 1</th>
              <th className="text-center px-5 py-3 text-slate-400 font-medium font-display">Final Debate</th>
              <th className="text-center px-5 py-3 text-slate-400 font-medium font-display">Position Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.model} className={i < rows.length - 1 ? 'border-b border-white/5' : ''}>
                <td className="px-5 py-4 font-display font-semibold text-white">{row.model}</td>
                <td className="px-5 py-4 text-slate-400">{row.provider}</td>
                <td className="px-5 py-4 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${row.r1_ok ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    {row.r1_ok ? 'OK' : 'Failed'}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${row.debate_ok ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    {row.debate_ok ? 'OK' : 'Failed'}
                  </span>
                </td>
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
