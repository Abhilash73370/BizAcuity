

function ShapeSelector({ shape, onChange }) {
  const shapes = [
    { key: 'square', label: 'Square' },
    { key: 'circle', label: 'Circle' },
    { key: 'rounded', label: 'Rounded' },
    { key: 'oval', label: 'Oval' },
  ]

  return (
    <div className="shape-buttons">
      {shapes.map(s => (
        <button
          key={s.key}
          className={`shape-btn ${shape === s.key ? 'active' : ''}`}
          onClick={() => onChange(s.key)}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}

export default ShapeSelector