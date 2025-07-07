import { useState } from 'react'
import ShapeSelector from './ShapeSelector'
import FrameSelector from './FrameSelector'
import { Square, Circle, Image } from 'lucide-react'

function ImagePropertiesPanel({ imageState, onShapeChange, onFrameChange }) {
  if (!imageState) return null;

  return (
    <div className="bg-surface rounded-xl shadow-xl border border-border p-6 w-full">
      <h3 className="text-primary-dark text-xl font-bold mb-6 pb-3 border-b-2 border-border flex items-center gap-2">
        <Image className="w-5 h-5" />
        Image Editor
      </h3>
      <div className="mb-6">
        <label className="block font-semibold text-primary-dark mb-2 uppercase text-sm tracking-wider text-primary flex items-center gap-2">
          <Square className="w-4 h-4" />
          Shape
        </label>
        <ShapeSelector
          shape={imageState.shape}
          onChange={onShapeChange}
        />
      </div>
      <div className="mb-6">
        <label className="block font-semibold text-primary-dark mb-2 uppercase text-sm tracking-wider text-primary flex items-center gap-2">
          <Circle className="w-4 h-4" />
          Frame
        </label>
        <FrameSelector
          frame={imageState.frame}
          onChange={onFrameChange}
        />
      </div>
    </div>
  )
}

export default ImagePropertiesPanel