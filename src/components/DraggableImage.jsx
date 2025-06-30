import '../Styles/Wall.css'
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
    border: '10px solid transparent',
    borderImage: 'url("http://gallery.yopriceville.com:8001/var/albums/Holidays-Frames/Beautiful_Gold_Christmas_PNG_Photo_Frame.png?m=1629822456") 60 stretch',
    borderRadius: borderRadius,
    
  };
} else if (imageState.frame === 'wood') {
  frameStyle = {
    border: '10px solid transparent',
    borderImage: 'url("/wood.jpg") 30% stretch',
    borderImageSlice: '30%',
    borderImageWidth: '10px',
    borderImageRepeat: 'stretch',
    
  };
} else if (imageState.frame === 'metal') {
  frameStyle = {
    border: '10px solid transparent',
    borderImage: 'url("/metal.jpg") 30% stretch',
    borderImageSlice: '30%',
    borderImageWidth: '10px',
    borderImageRepeat: 'stretch',

  }
}
  let styleOverrides = {} 

  // Special handling for circle shape with frame
  const isCircle = imageState.shape === 'circle' && (imageState.frame === 'wood' || imageState.frame === 'metal')
  const wrapperStyle = isCircle
   
   

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
        bottom: true,
        right: true,
        top: true,
        left: true,
        topLeft: true,
        topRight: true,
        bottomLeft: true,
      }}
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
        border: isSelected && !isCircle ? '3px solid #1976d2' : !isCircle ? '2px solid #333' : undefined,
        background: '#fff',
        zIndex: isSelected ? 10 : 1,
        borderRadius: !isCircle ? borderRadius : undefined,
        overflow: 'visible',
        ...(!isCircle ? frameStyle : {}),
        ...styleOverrides,
      }}
      onClick={() => setSelectedIdx(idx)}
    >
      {isCircle ? (
        <div style={wrapperStyle}>
          <img
            src={src}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              objectFit: '100% 100%',
              borderRadius: '50%',
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
            objectFit: '100% 100%',
            borderRadius,
          }}
          draggable={false}
        />
      )}
    </Rnd>
  )
}

export default DraggableImage