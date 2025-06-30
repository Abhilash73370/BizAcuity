import '../FrameSelector.css'

const frames = [
  { key: 'none', label: 'None' },
  { key: 'gold', label: 'Gold Frame' },
  { key: 'wood', label: 'Wood Frame' },
  { key: 'metal', label: 'Metal Frame' },

]

function FrameSelector({ frame, onChange, style }) {
  return (
    <div className="frame-selector" style={style}>
      {frames.map(f => (
        <button
          key={f.key}
          className={`frame-btn${frame === f.key ? ' selected' : ''}`}
          onClick={e => {
            e.stopPropagation()
            onChange(f.key)
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

export default FrameSelector