const PROVIDER_COLORS = {
  Anthropic: { text: '#d97706', bg: '#fef3c7' },
  OpenAI:    { text: '#2563eb', bg: '#eff6ff' },
  Google:    { text: '#16a34a', bg: '#f0fdf4' },
}

export default function ModelCard({ response, index }) {
  const colors = PROVIDER_COLORS[response.provider] ?? { text: '#b45309', bg: '#fef2ee' }
  const hasError = Boolean(response.error)

  return (
    <div
      className="bg-white border border-[var(--color-border)] rounded-xl p-5 animate-fade-in"
      style={{
        animationDelay: `${index * 60}ms`,
        opacity: 0,
        borderLeftColor: hasError ? '#dc2626' : undefined,
        borderLeftWidth: hasError ? '3px' : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-sans"
          style={{ background: colors.bg, color: colors.text }}
        >
          {response.model.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-[var(--color-text)] text-sm" style={{ color: colors.text }}>
            {response.model}
          </div>
          <div className="text-xs text-[var(--color-text-faint)]">{response.provider}</div>
        </div>
        {hasError
          ? <span className="ml-auto text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">Failed</span>
          : <span className="ml-auto text-xs bg-[#f0fdf4] text-[#16a34a] px-2 py-0.5 rounded-full border border-[#dcfce7]">Responded</span>
        }
      </div>

      {/* Content */}
      {hasError
        ? <p className="text-red-600 text-sm">{response.error}</p>
        : <p className="text-[var(--color-text-muted)] text-sm leading-relaxed whitespace-pre-wrap">{response.content}</p>
      }
    </div>
  )
}

export function ModelCardSkeleton() {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-border)]" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-[var(--color-border)] rounded" />
          <div className="h-2.5 w-16 bg-[#f5f0e8] rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-[#f5f0e8] rounded w-full" />
        <div className="h-3 bg-[#f5f0e8] rounded w-5/6" />
        <div className="h-3 bg-[#f5f0e8] rounded w-4/6" />
      </div>
    </div>
  )
}
