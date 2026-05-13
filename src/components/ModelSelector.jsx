const MODELS = [
  { key: 'claude',  label: 'Claude',  activeClass: 'bg-[#fef3c7] text-[#d97706]' },
  { key: 'gpt4o',  label: 'GPT-4o',  activeClass: 'bg-[#eff6ff] text-[#2563eb]' },
  { key: 'gemini', label: 'Gemini',  activeClass: 'bg-[#f0fdf4] text-[#16a34a]' },
]

export default function ModelSelector({ selected, onChange }) {
  const toggle = (key) => {
    if (selected.includes(key)) {
      if (selected.length > 2) onChange(selected.filter(k => k !== key))
    } else {
      onChange([...selected, key])
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-[var(--color-text-faint)] uppercase tracking-wide mr-1">Models</span>
      {MODELS.map(({ key, label, activeClass }) => {
        const active = selected.includes(key)
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors duration-150 border ${
              active
                ? `${activeClass} border-transparent`
                : 'bg-[var(--color-chip-inactive)] text-[var(--color-text-muted)] border-transparent hover:bg-[var(--color-border)]'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
