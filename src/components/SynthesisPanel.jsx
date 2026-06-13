import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ConsensusTable from './ConsensusTable.jsx'

const mdComponents = {
  p:          ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
  ul:         ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
  ol:         ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
  li:         ({ children }) => <li>{children}</li>,
  strong:     ({ children }) => <strong className="font-semibold text-[var(--color-text)]">{children}</strong>,
  em:         ({ children }) => <em className="italic">{children}</em>,
  h1:         ({ children }) => <h1 className="font-serif font-bold text-lg mb-2 mt-4 first:mt-0">{children}</h1>,
  h2:         ({ children }) => <h2 className="font-serif font-semibold text-base mb-2 mt-4 first:mt-0">{children}</h2>,
  h3:         ({ children }) => <h3 className="font-semibold text-sm mb-1 mt-3 first:mt-0">{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[var(--color-border)] pl-4 italic text-[var(--color-text-muted)] mb-3">
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
      <pre className="bg-[var(--color-chip-inactive)] rounded-lg p-3 mb-3 overflow-x-auto">
        <code className="text-xs font-mono whitespace-pre">{children}</code>
      </pre>
    ),
  hr: () => <hr className="border-[var(--color-border)] my-4" />,
}

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
          : (
            <div className="text-[var(--color-text)] text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {synthesis.content}
              </ReactMarkdown>
            </div>
          )
        }
      </div>

      <ConsensusTable rows={consensus} />
    </div>
  )
}
