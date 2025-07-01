import { Rnd } from 'react-rnd'

function DraggableImage({
  src,
  idx,
  imageState,
  setImageStates,
  wallWidth,
  wallHeight,
  isSelected,
  setSelectedIdx,
}) {
  if (!imageState) return null

 
  let borderRadius = '0'
  if (imageState.shape === 'circle') {
    borderRadius = '50%'
  } else if (imageState.shape === 'rounded') {
    borderRadius = '20px'
  } else if (imageState.shape === 'oval') {
    borderRadius = '50% / 30%'
  }

let frameStyle = {}
if (imageState.frame === 'gold') {
  frameStyle = {
    border: '8px solid #FFD700',
    borderRadius: borderRadius,
    boxSizing: 'border-box',
    boxShadow: '0 0 10px rgba(255, 215, 0, 0.5), inset 0 0 10px rgba(255, 215, 0, 0.3)',
  };
} else if (imageState.frame === 'wood') {
  frameStyle = {
    border: '8px solid #8B4513',
    borderRadius: borderRadius,
    boxSizing: 'border-box',
    background: 'linear-gradient(45deg, #8B4513, #A0522D, #8B4513)',
    boxShadow: '0 0 8px rgba(139, 69, 19, 0.4)',
  };
} else if (imageState.frame === 'metal') {
  frameStyle = {
    border: '8px solid #C0C0C0',
    borderRadius: borderRadius,
    boxSizing: 'border-box',
    background: 'linear-gradient(45deg, #C0C0C0, #E5E5E5, #C0C0C0)',
    boxShadow: '0 0 8px rgba(192, 192, 192, 0.4)',
  }
}
  let styleOverrides = {} 

  // Apply frame to all shapes
  const hasFrame = imageState.frame && imageState.frame !== 'none'
  const wrapperStyle = hasFrame ? {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius,
    overflow: 'hidden',
    boxSizing: 'border-box',
    position: 'relative',
    ...frameStyle
  } : {}

  return (
    <Rnd
      size={{
        width: styleOverrides.width || imageState.width,
        height: styleOverrides.height || imageState.height,
      }}
      position={{ x: imageState.x, y: imageState.y }}
      bounds="parent"
      minWidth={50}
      minHeight={50}
      maxWidth={wallWidth}
      maxHeight={wallHeight}
      enableResizing={{
        bottomRight: true,
        bottom: false,
        right: false,
        top: false,
        left: false,
        topLeft: false,
        topRight: false,
        bottomLeft: false,
      }}
      resizeHandleComponent={
        isSelected
          ? {
              bottomRight: (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-8px',
                    right: '-8px',
                    width: '16px',
                    height: '16px',
                    background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
                    border: '2px solid white',
                    borderRadius: '50%',
                    cursor: 'nw-resize',
                    zIndex: 20,
                    pointerEvents: 'auto',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.2)';
                    e.target.style.boxShadow = 'var(--shadow-lg)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'var(--shadow-md)';
                  }}
                />
              ),
            }
          : undefined
      }
      onDragStart={() => setSelectedIdx(idx)}
      onDragStop={(e, d) => {
        setImageStates(states =>
          states.map((img, i) =>
            i === idx ? { ...img, x: d.x, y: d.y } : img
          )
        )
      }}
      onResizeStart={() => setSelectedIdx(idx)}
      onResizeStop={(e, direction, ref, delta, position) => {
        const width = parseInt(ref.style.width, 10)
        const height = parseInt(ref.style.height, 10)
        setImageStates(states =>
          states.map((img, i) =>
            i === idx
              ? {
                  ...img,
                  width: width,
                  height: height,
                  x: position.x,
                  y: position.y,
                }
              : img
          )
        )
      }}
      style={{
        border: isSelected ? '2px dotted #1976d2' : 'none',
        background: 'transparent',
        zIndex: isSelected ? 10 : 1,
        borderRadius: borderRadius,
        overflow: 'visible',
        cursor: 'move',
        ...styleOverrides,
      }}
      onClick={() => setSelectedIdx(idx)}
    >
      {hasFrame ? (
        <div style={wrapperStyle}>
          <img
            src={src}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              // objectFit: 'cover',
              borderRadius: borderRadius,
            }}
            draggable={false}
          />
        </div>
      ) : (
        <img
          src={src}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            objectFit: 'cover',
            borderRadius,
          }}
          draggable={false}
        />
      )}
    </Rnd>
  )
}

export default DraggableImage