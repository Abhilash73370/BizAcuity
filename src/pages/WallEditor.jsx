import React, { useState, useEffect, useRef } from 'react';
import DraggableImage from '../components/DraggableImage';
import ImagePropertiesPanel from '../components/ImagePropertiesPanel';
import WallSizePanel from '../components/Sidebar/WallSizePanel';
import UploadImagesPanel from '../components/Sidebar/UploadImagesPanel';
import BackgroundPanel from '../components/Sidebar/BackgroundPanel';
import Header from '../components/Header';

const MIN_SIZE = 200;
const MAX_SIZE = 2000;

const TABS = [
  { key: 'background', label: 'Background' },
  { key: 'uploads', label: ' Uploads' },
  { key: 'editor', label: ' Editor' },
];

function WallEditor() {
  const [wallImage, setWallImage] = useState(null);
  const [images, setImages] = useState([]);
  const [wallColor, setWallColor] = useState('#fff');
  const [inputWidth, setInputWidth] = useState(800);
  const [inputHeight, setInputHeight] = useState(600);
  const [wallWidth, setWallWidth] = useState(800);
  const [wallHeight, setWallHeight] = useState(600);
  const [imageStates, setImageStates] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [activeTab, setActiveTab] = useState('background');

  const wallImageInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  useEffect(() => {
    setImageStates(prevStates => {
      if (images.length < prevStates.length) {
        return prevStates.slice(0, images.length);
      }
      if (images.length > prevStates.length) {
        const newStates = [...prevStates];
        for (let i = prevStates.length; i < images.length; i++) {
          newStates.push({
            x: 100,
            y: 100,
            width: 150,
            height: 150,
            shape: 'square',
          });
        }
        return newStates;
      }
      return prevStates;
    });
  }, [images]);

  useEffect(() => {
    setImageStates(states =>
      states.map(img => ({
        ...img,
        x: Math.max(0, Math.min(img.x, wallWidth - img.width)),
        y: Math.max(0, Math.min(img.y, wallHeight - img.height)),
        width: Math.min(img.width, wallWidth),
        height: Math.min(img.height, wallHeight),
      }))
    );
  }, [wallWidth, wallHeight]);

  const handleShapeChange = newShape => {
    setImageStates(states =>
      states.map((img, i) =>
        i === selectedIdx ? { ...img, shape: newShape } : img
      )
    );
  };

  const handleDelete = () => {
    setImageStates(states => states.filter((_, i) => i !== selectedIdx));
    setImages(images => images.filter((_, i) => i !== selectedIdx));
    setSelectedIdx(null);
    setActiveTab('uploads'); // Switch to uploads tab if image is deleted
  };

  const handleFrameChange = newFrame => {
    setImageStates(states =>
      states.map((img, i) =>
        i === selectedIdx ? { ...img, frame: newFrame } : img
      )
    );
  };

  const handleWallImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setWallImage(URL.createObjectURL(file));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveWallImage = () => setWallImage(null);
  const handleRemoveImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  const handleColorChange = (e) => setWallColor(e.target.value);

  const handleSetWallSize = () => {
    const width = Number(inputWidth);
    const height = Number(inputHeight);
    if (
      width < MIN_SIZE ||
      width > MAX_SIZE ||
      height < MIN_SIZE ||
      height > MAX_SIZE
    ) {
      alert(
        `Wall size must be between ${MIN_SIZE}px and ${MAX_SIZE}px`
      );
      return;
    }
    setWallWidth(width);
    setWallHeight(height);
  };

  // Tab content rendering
  let tabContent = null;
  if (activeTab === 'background') {
    tabContent = (
      <BackgroundPanel
        wallImageInputRef={wallImageInputRef}
        handleWallImageChange={handleWallImageChange}
        wallImage={wallImage}
        handleRemoveWallImage={handleRemoveWallImage}
        wallColor={wallColor}
        handleColorChange={handleColorChange}
      />
    );
  } else if (activeTab === 'uploads') {
    tabContent = (
      <UploadImagesPanel
        imagesInputRef={imagesInputRef}
        handleImageChange={handleImageChange}
        images={images}
        handleRemoveImage={handleRemoveImage}
      />
    );
  } else if (activeTab === 'editor') {
    tabContent = selectedIdx !== null && imageStates[selectedIdx] ? (
      <ImagePropertiesPanel
        imageState={imageStates[selectedIdx]}
        onShapeChange={handleShapeChange}
        onFrameChange={handleFrameChange}
        onDelete={handleDelete}
      />
    ) : (
      <div className="bg-surface rounded-xl shadow-xl border border-border p-6 text-center text-gray-400">Select an image to edit</div>
    );
  }

  return (
    <>
      <Header />
      <div className="grid grid-rows-[auto_1fr_auto] grid-cols-[320px_1fr] min-h-screen bg-secondary"
           style={{gridTemplateAreas: '"header header" "sidebar main" "footer footer"'}}>
        <aside className="bg-secondary p-8 rounded-xl shadow-lg flex flex-col gap-4 min-w-[260px] max-w-[340px]" style={{ gridArea: 'sidebar' }}>
          <WallSizePanel
            inputWidth={inputWidth}
            inputHeight={inputHeight}
            setInputWidth={setInputWidth}
            setInputHeight={setInputHeight}
            handleSetWallSize={handleSetWallSize}
            MIN_SIZE={MIN_SIZE}
            MAX_SIZE={MAX_SIZE}
          />
          {/* Tab bar */}
          <div className="flex mb-2 border-b border-border">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`flex-1 py-2 px-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab.key ? 'border-primary-dark text-primary-dark bg-surface' : 'border-transparent text-gray-400 hover:text-primary-dark'}`}
                onClick={() => setActiveTab(tab.key)}
                disabled={tab.key === 'editor' && selectedIdx === null}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Tab content */}
          <div className="flex-1">{tabContent}</div>
        </aside>
        <main className="bg-primary rounded-xl shadow-lg border-2 border-surface flex items-center justify-center min-h-[70vh] transition-all" style={{ gridArea: 'main' }}>
          <div
            className="relative border-4 border-border bg-cover bg-center bg-no-repeat overflow-hidden rounded-xl shadow-xl transition-all cursor-crosshair"
            style={{
              backgroundColor: wallColor,
              width: wallWidth,
              height: wallHeight,
              backgroundImage: wallImage ? `url(${wallImage})` : undefined,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedIdx(null);
              }
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
                setSelectedIdx={() => {
                  setSelectedIdx(idx);
                  setActiveTab('editor');
                }}
              />
            ))}
          </div>
        </main>
        <footer className="bg-secondary text-primary-dark text-center py-5 text-lg rounded-t-xl shadow-md col-span-2" style={{ gridArea: 'footer' }}>
          <div className="flex items-center justify-center gap-2">
            &copy; {new Date().getFullYear()} Picture Wall Designer
          </div>
        </footer>
      </div>
    </>
  );
}

export default WallEditor; 