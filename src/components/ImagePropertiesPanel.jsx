import { useState } from 'react'
import ShapeSelector from './ShapeSelector'
import FrameSelector from './FrameSelector'

function ImagePropertiesPanel({ imageState, onShapeChange, onFrameChange,  onDelete }) {
  const [showShapes, setShowShapes] = useState(false)
  if (!imageState) return null

  return (
    <div
      style={{
        width: 220,
        background: '#f7f7f7',
        borderLeft: '2px solid #ddd',
        padding: 20,
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        boxSizing: 'border-box',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <button
        style={{
          padding: '8px 16px',
          borderRadius: 4,
          border: '1px solid #1976d2',
          background: '#1976d2',
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
        onClick={() => setShowShapes(s => !s)}
      >
        Image Editor
      </button>
      {showShapes && (
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Shapes</div>
          <ShapeSelector
            shape={imageState.shape}
            onChange={onShapeChange}
            style={{ position: 'static', top: 0, left: 0 }}
          />
          <div style={{ margin: '16px 0 8px 0', fontWeight: 500 }}>Frames</div>
          <FrameSelector
            frame={imageState.frame}
            onChange={onFrameChange}
          />
          <button
            style={{
              marginTop: 16,
              padding: '8px 16px',
              borderRadius: 4,
              border: '1px solid #d32f2f',
              background: '#d32f2f',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
            onClick={onDelete}
          >
            Delete Image
          </button>
        </div>
      )}
    </div>
  )
}

export default ImagePropertiesPanel