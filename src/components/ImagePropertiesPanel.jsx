import { useState } from 'react'
import ShapeSelector from './ShapeSelector'
import FrameSelector from './FrameSelector'

function ImagePropertiesPanel({ imageState, onShapeChange, onFrameChange, onDelete }) {
  const [showShapes, setShowShapes] = useState(false)
  if (!imageState) return null

  return (
    <div className="properties-panel">
      <h3>Image Editor</h3>
      
      <div className="property-group">
        <label>Shape</label>
        <ShapeSelector
          shape={imageState.shape}
          onChange={onShapeChange}
        />
      </div>
      
      <div className="property-group">
        <label>Frame</label>
        <FrameSelector
          frame={imageState.frame}
          onChange={onFrameChange}
        />
      </div>
      
      <button className="delete-btn" onClick={onDelete}>
        Delete Image
      </button>
    </div>
  )
}

export default ImagePropertiesPanel