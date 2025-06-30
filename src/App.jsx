import { useState } from 'react'
import Wall from './components/Wall'
import './Styles/App.css'

function App() {
  const [wallImage, setWallImage] = useState(null)
  const [images, setImages] = useState([])
  const [wallColor, setWallColor] = useState('#fff')
  const [inputWidth, setInputWidth] = useState(800)
  const [inputHeight, setInputHeight] = useState(600)
  const [wallWidth, setWallWidth] = useState(800)
  const [wallHeight, setWallHeight] = useState(600)

  const handleWallImageChange = (e) => {
    const file = e.target.files[0]
    if (file) setWallImage(URL.createObjectURL(file))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map(file => URL.createObjectURL(file))
    setImages(prev => [...prev, ...newImages])
  }

  const handleColorChange = (e) => setWallColor(e.target.value)

  const MIN_SIZE = 200
  const MAX_SIZE = 2000

  const handleSetWallSize = () => {
    const width = Number(inputWidth)
    const height = Number(inputHeight)
    if (
      width < MIN_SIZE ||
      width > MAX_SIZE ||
      height < MIN_SIZE ||
      height > MAX_SIZE
    ) {
      alert(
        `Wall size must be between ${MIN_SIZE}px and ${MAX_SIZE}px`
      )
      return
    }
    setWallWidth(width)
    setWallHeight(height)
  }

  return (
    <div className="main-container">
      <header className="header">
        <h1>Picture Wall Designer</h1>
        <p>Create your own wall with custom background and draggable images!</p>
      </header>
      <section className="controls">
        <div className="control-group">
          <label className="label-header">Wall Width (px)</label>
          <input
            type="number"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={inputWidth}
            onChange={e => setInputWidth(e.target.value)}
            className="file-input"
            style={{ width: 100 }}
          />
        </div>
        <div className="control-group">
          <label className="label-header">Wall Height (px)</label>
          <input
            type="number"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={inputHeight}
            onChange={e => setInputHeight(e.target.value)}
            className="file-input"
            style={{ width: 100 }}
          />
        </div>
        <button
          className="set-wall-btn"
          style={{
            marginLeft: '1em',
            padding: '0.5em 1.5em',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '1em',
          }}
          onClick={handleSetWallSize}
        >
          Set Wall Size
        </button>
      </section>
      <section className="controls">
        <div className="control-group">
          <label className="label-header">Background Image</label>
          <input
            type="file"
            accept="image/*"
            id="bg-upload"
            className="file-input"
            onChange={handleWallImageChange}
          />
        </div>
        <div className="or-divider">OR</div>
        <div className="control-group">
          <label className="label-header">Background Color</label>
          <input
            type="color"
            value={wallColor}
            className="color-input"
            onChange={handleColorChange}
          />
        </div>
      </section>
      <section className="controls">
        <div className="control-group">
          <label className="label-header">Upload Images to Wall</label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="file-input"
            onChange={handleImageChange}
          />
        </div>
      </section>
      <Wall
        wallImage={wallImage}
        images={images}
        setImages={setImages}
        wallColor={wallColor}
        wallWidth={wallWidth}
        wallHeight={wallHeight}
      />
    </div>
  )
}

export default App