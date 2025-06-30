import React, { useState, useEffect } from 'react'
import DraggableImage from './DraggableImage'
import ImagePropertiesPanel from './ImagePropertiesPanel'
import '../Styles/Wall.css'

function Wall({ wallImage, setImages, images, wallColor, wallWidth, wallHeight }) {
  const [imageStates, setImageStates] = useState([])
  const [selectedIdx, setSelectedIdx] = useState(null)

  useEffect(() => {
    setImageStates(prevStates => {
      if (images.length < prevStates.length) {
        return prevStates.slice(0, images.length)
      }
      if (images.length > prevStates.length) {
        const newStates = [...prevStates]
        for (let i = prevStates.length; i < images.length; i++) {
          newStates.push({
            x: 100,
            y: 100,
            width: 150,
            height: 150,
            shape: 'square',
          })
        }
        return newStates
      }
      return prevStates
    })
  }, [images])

  useEffect(() => {
    setImageStates(states =>
      states.map(img => ({
        ...img,
        x: Math.max(0, Math.min(img.x, wallWidth - img.width)),
        y: Math.max(0, Math.min(img.y, wallHeight - img.height)),
        width: Math.min(img.width, wallWidth),
        height: Math.min(img.height, wallHeight),
      }))
    )
  }, [wallWidth, wallHeight])

  const handleShapeChange = newShape => {
    setImageStates(states =>
      states.map((img, i) =>
        i === selectedIdx ? { ...img, shape: newShape } : img
      )
    )
  }

  const handleDelete = () => {
    setImageStates(states => states.filter((_, i) => i !== selectedIdx))
    setImages(images => images.filter((_, i) => i !== selectedIdx))
    setSelectedIdx(null)
  }

  const handleFrameChange = newFrame => {
    setImageStates(states =>
      states.map((img, i) =>
        i === selectedIdx ? { ...img, frame: newFrame } : img
      )
    )
  }

  return (
    <div className="wall-root">
      <div
        className="wall-background"
        style={{
          backgroundColor: wallColor,
          width: wallWidth,
          height: wallHeight,
          backgroundImage: wallImage ? `url(${wallImage})` : undefined,
        }}
      >
        {images.map((src, idx) => (
          <DraggableImage
            key={idx}
            src={src}
            idx={idx}
            imageState={imageStates[idx]}
            setImageStates={setImageStates}
            wallWidth={wallWidth}
            wallHeight={wallHeight}
            isSelected={selectedIdx === idx}
            setSelectedIdx={setSelectedIdx}
          />
        ))}
      </div>
      {/* Properties panel on the right */}
      {selectedIdx !== null && imageStates[selectedIdx] && (
        <ImagePropertiesPanel
          imageState={imageStates[selectedIdx]}
          onShapeChange={handleShapeChange}
          onFrameChange={handleFrameChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default Wall