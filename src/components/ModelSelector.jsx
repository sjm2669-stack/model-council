const MODELS = [
  { key: 'claude', label: 'Claude Sonnet', provider: 'Anthropic', color: 'from-orange-500 to-amber-500' },
  { key: 'gpt4o', label: 'GPT-4o', provider: 'OpenAI', color: 'from-emerald-500 to-teal-500' },
  { key: 'gemini', label: 'Gemini 1.5 Pro', provider: 'Google', color: 'from-blue-500 to-indigo-500' },
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
      <span className="text-xs text-slate-500 mr-1">Models:</span>
      {MODELS.map(({ key, label, color }) => {
        const active = selected.includes(key)
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 ${
              active
                ? `bg-gradient-to-r ${color} text-white shadow-sm`
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
