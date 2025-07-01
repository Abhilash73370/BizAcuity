import { useState } from 'react'
import Wall from './components/Wall'
import './Styles/modern.css'
import './Styles/modern-components.css'

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
    <div className="app-grid">
      <header className="header">
        <h1>Picture Wall Designer</h1>
        <p>Create your own wall with custom background and draggable images!</p>
      </header>
      <aside className="sidebar">
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="control-group">
                <label className="label-header">Wall Width (px)</label>
                <input
                  type="number"
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  value={inputWidth}
                  onChange={e => setInputWidth(e.target.value)}
                  className="file-input"
                  style={{ width: 70 }}
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
                  style={{ width: 70 }}
                />
              </div>
              <button
                className="set-wall-btn"
                onClick={handleSetWallSize}
                style={{ marginBottom: 0, minWidth: 90, fontSize: '0.95rem', padding: '0.4rem 0.8rem' }}
              >
                Set Wall Size
              </button>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="control-group">
            <label className="label-header">Upload Images to Wall</label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="file-upload-input"
              style={{ maxWidth: 180 }}
              onChange={handleImageChange}
            />
          </div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div className="control-group">
              <label className="label-header">Background Image</label>
              <input
                type="file"
                accept="image/*"
                id="bg-upload"
                className="file-upload-input"
                style={{ maxWidth: 180 }}
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
                style={{ width: 40, height: 40, padding: 0 }}
                onChange={handleColorChange}
              />
            </div>
          </div>
        </div>
      </aside>
      <main className="main-wall">
        <Wall
          wallImage={wallImage}
          images={images}
          setImages={setImages}
          wallColor={wallColor}
          wallWidth={wallWidth}
          wallHeight={wallHeight}
        />
      </main>
      <footer className="footer">
        &copy; {new Date().getFullYear()} Picture Wall Designer
      </footer>
    </div>
  )
}

export default App