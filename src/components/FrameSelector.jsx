const frames = [
  { key: 'none', label: 'None' },
  { key: 'gold', label: 'Gold' },
  { key: 'wood', label: 'Wood' },
  { key: 'metal', label: 'Metal' },
]

function FrameSelector({ frame, onChange }) {
  return (
    <div className="frame-buttons">
      {frames.map(f => (
        <button
          key={f.key}
          className={`frame-btn ${frame === f.key ? 'active' : ''}`}
          onClick={() => onChange(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

export default FrameSelector