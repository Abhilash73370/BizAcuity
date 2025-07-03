const frames = [
  { key: 'none', label: 'None' },
  { key: 'gold', label: 'Gold' },
  { key: 'wood', label: 'Wood' },
  { key: 'metal', label: 'Metal' },
]

function FrameSelector({ frame, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-2">
      {frames.map(f => (
        <button
          key={f.key}
          className={`px-3 py-2 rounded-md border-2 font-semibold text-xs uppercase tracking-wide transition shadow-sm
            ${frame === f.key
              ? 'bg-secondary text-primary-dark border-primary-dark shadow-md'
              : 'bg-primary text-secondary border-primary hover:bg-primary-dark hover:text-secondary'}
          `}
          onClick={() => onChange(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

export default FrameSelector