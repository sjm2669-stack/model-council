import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const PROVIDER_COLORS = {
  Anthropic: { text: '#d97706', bg: '#fef3c7' },
  OpenAI:    { text: '#2563eb', bg: '#eff6ff' },
  Google:    { text: '#16a34a', bg: '#f0fdf4' },
}

const SHOW_MORE_THRESHOLD = 500

const mdComponents = {
  p:          ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul:         ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
  ol:         ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
  li:         ({ children }) => <li>{children}</li>,
  strong:     ({ children }) => <strong className="font-semibold text-[var(--color-text)]">{children}</strong>,
  em:         ({ children }) => <em className="italic">{children}</em>,
  h1:         ({ children }) => <h1 className="font-semibold text-base mb-1 mt-2">{children}</h1>,
  h2:         ({ children }) => <h2 className="font-semibold text-sm mb-1 mt-2">{children}</h2>,
  h3:         ({ children }) => <h3 className="font-medium text-sm mb-1 mt-2">{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[var(--color-border)] pl-3 italic text-[var(--color-text-muted)] mb-2">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="text-[var(--color-accent)] underline underline-offset-2 hover:opacity-75">
      {children}
    </a>
  ),
  code: ({ inline, children }) => inline
    ? <code className="bg-[var(--color-chip-inactive)] text-[var(--color-accent)] px-1 py-0.5 rounded text-xs font-mono">{children}</code>
    : (
      <pre className="bg-[var(--color-chip-inactive)] rounded-lg p-3 mb-2 overflow-x-auto">
        <code className="text-xs font-mono whitespace-pre">{children}</code>
      </pre>
    ),
}

export default function ModelCard({ response, index }) {
  const [expanded, setExpanded] = useState(false)
  const colors = PROVIDER_COLORS[response.provider] ?? { text: '#b45309', bg: '#fef2ee' }
  const hasError = Boolean(response.error)
  const isLong = !hasError && response.content?.length > SHOW_MORE_THRESHOLD

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
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-sans shrink-0"
          style={{ background: colors.bg, color: colors.text }}
        >
          {response.model.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate" style={{ color: colors.text }}>
            {response.model}
          </div>
          <div className="text-xs text-[var(--color-text-faint)]">{response.provider}</div>
        </div>
        {hasError
          ? <span className="ml-auto shrink-0 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">Failed</span>
          : <span className="ml-auto shrink-0 text-xs bg-[#f0fdf4] text-[#16a34a] px-2 py-0.5 rounded-full border border-[#dcfce7]">Responded</span>
        }
      </div>

      {hasError ? (
        <p className="text-red-600 text-sm">{response.error}</p>
      ) : (
        <div>
          <div
            className="relative text-[var(--color-text-muted)] text-sm leading-relaxed overflow-hidden transition-[max-height] duration-300 ease-in-out"
            style={{ maxHeight: expanded ? '9999px' : isLong ? '200px' : undefined }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {response.content}
            </ReactMarkdown>
            {isLong && !expanded && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            )}
          </div>
          {isLong && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-2 text-xs text-[var(--color-accent)] hover:opacity-70 transition-opacity font-medium"
            >
              {expanded ? 'Show less ↑' : 'Show more ↓'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function ModelCardSkeleton() {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-border)] shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-[var(--color-border)] rounded" />
          <div className="h-2.5 w-16 bg-[var(--color-chip-inactive)] rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-[var(--color-chip-inactive)] rounded w-full" />
        <div className="h-3 bg-[var(--color-chip-inactive)] rounded w-5/6" />
        <div className="h-3 bg-[var(--color-chip-inactive)] rounded w-4/6" />
      </div>
    </div>
  )
}
