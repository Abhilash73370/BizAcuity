

function ShapeSelector({ shape, onChange, style }) {
  const shapes = [
    { key: 'square', label: 'Square' },
    { key: 'circle', label: 'Circle' },
    { key: 'rounded', label: 'Rounded' },
    { key: 'oval', label: 'Oval' },
  ]

  return (
    <div
      style={{
        position: 'absolute',
        top: -38,
        left: 0,
        display: 'flex',
        gap: 8,
        zIndex: 20,
        ...style,
      }}
    >
      {shapes.map(s => (
        <button
          key={s.key}
          style={{
            padding: '2px 8px',
            borderRadius: 4,
            border: shape === s.key ? '2px solid #1976d2' : '1px solid #bbb',
            background: '#fff',
            cursor: 'pointer',
            fontWeight: shape === s.key ? 600 : 400,
          }}
          onClick={e => {
            e.stopPropagation()
            onChange(s.key)
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}

export default ShapeSelector