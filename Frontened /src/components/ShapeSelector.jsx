function ShapeSelector({ shape, onChange }) {
  const shapes = [
    { key: 'square', label: 'Square' },
    { key: 'circle', label: 'Circle' },
    { key: 'rounded', label: 'Rounded' },
    { key: 'oval', label: 'Oval' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 mb-2">
      {shapes.map(s => (
        <button
          key={s.key}
          className={`px-3 py-2 rounded-md border-2 font-semibold text-xs uppercase tracking-wide transition shadow-sm
            ${shape === s.key
              ? 'bg-secondary text-primary-dark border-primary-dark shadow-md'
              : 'bg-primary text-secondary border-primary hover:bg-primary-dark hover:text-secondary'}
          `}
          onClick={() => onChange(s.key)}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}

export default ShapeSelector