import React, { useState, useEffect, useRef, useContext } from 'react';
import DraggableImage from '../components/DraggableImage';
import ImagePropertiesPanel from '../components/ImagePropertiesPanel';
import WallSizePanel from '../components/Sidebar/WallSizePanel';
import UploadImagesPanel from '../components/Sidebar/UploadImagesPanel';
import BackgroundPanel from '../components/Sidebar/BackgroundPanel';
import ExportButton from '../components/ExportButton';
import Header from '../components/Header';
import { UserContext } from '../App';
import { useNavigate, useLocation } from 'react-router-dom';
import FrameSelector from '../components/FrameSelector';
import ShapeSelector from '../components/ShapeSelector';
import html2canvas from 'html2canvas';
import DecorsPanel from '../components/Sidebar/DecorsPanel';

const MIN_SIZE = 200;
const MAX_SIZE = 2000;

const TABS = [
  { key: 'background', label: 'Background' },
  { key: 'uploads', label: ' Uploads' },
  { key: 'editor', label: ' Editor' },
  { key: 'decors', label: 'Decors' },
];

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Helper function to convert URL to base64
const urlToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await fileToBase64(blob);
  } catch (error) {
    console.error('Error converting URL to base64:', error);
    return null;
  }
};

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
  const [activeTab, setActiveTab] = useState('editor');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(false);

  const wallImageInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const wallRef = useRef(null);

  const { registeredUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const draftId = searchParams.get('draftId');

  useEffect(() => {
    if (registeredUser && registeredUser.isLoggedIn) {
      fetch(`http://localhost:5001/wall/${registeredUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.wall) {
            setWallColor(data.wall.wallColor || '#fff');
            setWallWidth(data.wall.wallWidth || 800);
            setWallHeight(data.wall.wallHeight || 600);
            setWallImage(data.wall.wallImage || null);
            setImages(data.wall.images || []);
            setImageStates(data.wall.imageStates || []);
          }
        });
    }
  }, [registeredUser]);

  useEffect(() => {
    if (registeredUser && registeredUser.isLoggedIn) {
      const wall = { wallColor, wallWidth, wallHeight, wallImage, images, imageStates };
      fetch('http://localhost:5001/wall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: registeredUser.id, wall }),
      });
    }
  }, [wallColor, wallWidth, wallHeight, wallImage, images, imageStates, registeredUser]);

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

  // Helper function to ensure image states are properly synced with images
  const syncImageStates = (imgs, states) => {
    return imgs.map((img, idx) => {
      // If there's an existing state for this index, preserve all its properties
      if (states[idx]) {
        return {
          ...states[idx],
          zIndex: states[idx].zIndex || Date.now() + idx // Ensure zIndex exists
        };
      }
      // Otherwise create a new state with default values
      return {
        x: 100 + (idx * 20), // Offset each new image slightly
        y: 100 + (idx * 20),
        width: 150,
        height: 150,
        shape: 'square',
        isDecor: false,
        frame: 'none',
        zIndex: Date.now() + idx
      };
    });
  };

  const handleDelete = () => {
    if (selectedIdx === null) return;

    // Store the states we want to keep with their original positions
    const preservedStates = imageStates
      .filter((_, idx) => idx !== selectedIdx)
      .map(state => ({
        ...state,
        // Preserve exact position and dimensions
        x: state.x,
        y: state.y,
        width: state.width,
        height: state.height,
        shape: state.shape,
        frame: state.frame,
        isDecor: state.isDecor,
        // Keep original zIndex to maintain layering
        zIndex: state.zIndex
      }));

    // Store the images we want to keep
    const preservedImages = images.filter((_, idx) => idx !== selectedIdx);

    // Update both arrays atomically
    setImages(preservedImages);
    setImageStates(preservedStates);

    // Reset selection and switch to uploads tab
    setSelectedIdx(null);
    setActiveTab('uploads');
  };

  // Add effect to ensure image states stay synchronized
  useEffect(() => {
    if (images.length !== imageStates.length) {
      const syncedStates = syncImageStates(images, imageStates);
      setImageStates(syncedStates);
    }
  }, [images.length]);

  const handleFrameChange = newFrame => {
    setImageStates(states =>
      states.map((img, i) =>
        i === selectedIdx ? { ...img, frame: newFrame } : img
      )
    );
  };

  const handleWallImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:5001/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await response.json();
        setWallImage(data.url);
      } catch (error) {
        console.error('Error uploading wall image:', error);
        alert('Failed to upload the image. Please try again.');
      }
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:5001/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Create new states for the added images with unique positions and z-indices
      const newStates = uploadedUrls.map((_, index) => {
        const baseX = 100;
        const baseY = 100;
        const offset = 20;
        
        return {
          x: baseX + (offset * index),
          y: baseY + (offset * index),
          width: 150,
          height: 150,
          shape: 'square',
          frame: 'none',
          isDecor: false,
          zIndex: Date.now() + index
        };
      });

      // Update both arrays atomically
      setImages(prevImages => [...prevImages, ...uploadedUrls]);
      setImageStates(prevStates => [...prevStates, ...newStates]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload one or more images. Please try again.');
    }
  };

  const handleRemoveWallImage = () => setWallImage(null);
  const handleRemoveImage = (idx) => {
    // Store the states we want to keep with their original positions
    const preservedStates = imageStates
      .filter((_, i) => i !== idx)
      .map(state => ({
        ...state,
        // Preserve exact position and dimensions
        x: state.x,
        y: state.y,
        width: state.width,
        height: state.height,
        shape: state.shape,
        frame: state.frame,
        isDecor: state.isDecor,
        // Keep original zIndex to maintain layering
        zIndex: state.zIndex
      }));

    // Store the images we want to keep
    const preservedImages = images.filter((_, i) => i !== idx);

    // Update both arrays atomically
    setImages(preservedImages);
    setImageStates(preservedStates);

    // Reset selection if the deleted image was selected
    if (selectedIdx === idx) {
      setSelectedIdx(null);
    } else if (selectedIdx > idx) {
      // Adjust selectedIdx if we deleted an image before it
      setSelectedIdx(selectedIdx - 1);
    }
  };

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

  const handleExport = () => {
    // Create an object with all the wall design data
    const designData = {
      wallColor,
      wallWidth,
      wallHeight,
      wallImage,
      images,
      imageStates
    };

    // Convert to JSON and create blob
    const jsonData = JSON.stringify(designData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wall-design.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load existing draft if draftId is present
  useEffect(() => {
    const loadDraft = async () => {
      if (!draftId) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/drafts/single/${draftId}`);
        if (!response.ok) throw new Error('Failed to load draft');
        
        const draft = await response.json();
        setDraftName(draft.name);
        
        // Load wall data
        const { wallData } = draft;
        if (wallData) {
          // Set wall color and dimensions
          setWallColor(wallData.wallColor || '#FFFFFF');
          setWallWidth(wallData.wallWidth || 800);
          setWallHeight(wallData.wallHeight || 600);
          
          // Set wall background image if it exists
          if (wallData.wallImage) {
            setWallImage(wallData.wallImage);
          }
          
          // Set uploaded images if they exist
          if (wallData.images && Array.isArray(wallData.images)) {
            setImages(wallData.images);
          }
          
          // Set image states if they exist
          if (wallData.imageStates && Array.isArray(wallData.imageStates)) {
            setImageStates(wallData.imageStates);
          }
        }
      } catch (error) {
        console.error('Load draft error:', error);
        alert('Failed to load draft. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDraft();
  }, [draftId]);

  const captureWallPreview = async () => {
    if (!wallRef.current) return null;
    
    try {
      // Wait for images to load
      await Promise.all(
        Array.from(wallRef.current.getElementsByTagName('img')).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Handle error case as well
          });
        })
      );

      const canvas = await html2canvas(wallRef.current, {
        useCORS: true,
        scale: 0.25, // Reduce size more aggressively
        backgroundColor: null,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: true
      });
      
      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.5));
      
      // Upload preview image
      const formData = new FormData();
      formData.append('image', blob, 'preview.jpg');
      
      const response = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload preview image');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Failed to capture wall preview:', error);
      return null;
    }
  };

  const handleSaveDraft = async () => {
    if (!draftName.trim()) {
      setSaveError('Please enter a name for your draft');
      return;
    }

    if (!registeredUser?.isLoggedIn) {
      setSaveError('Please log in to save drafts');
      return;
    }

    try {
      setLoading(true);
      setSaveError('');

      // Capture wall preview
      const previewImage = await captureWallPreview();
      if (!previewImage) {
        throw new Error('Failed to capture wall preview');
      }

      // Prepare wall data - no need to optimize images as they're now URLs
      const wallData = {
        wallColor,
        wallWidth,
        wallHeight,
        wallImage,
        images,
        imageStates
      };

      const url = draftId 
        ? `http://localhost:5001/drafts/${draftId}`
        : 'http://localhost:5001/drafts';
      
      const method = draftId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: draftName,
          userId: registeredUser.id,
          wallData,
          previewImage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save draft');
      }

      const result = await response.json();
      
      setShowSaveModal(false);
      
      // If this was a new draft, update the URL with the new draft ID
      if (!draftId && result.draft._id) {
        window.history.replaceState(null, '', `/wall?draftId=${result.draft._id}`);
      }
      
      // Show success message and navigate
      alert('Design saved successfully!');
      navigate('/landing');
    } catch (error) {
      console.error('Save draft error:', error);
      setSaveError(error.message || 'Failed to save draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to add decor to the wall
  const handleAddDecor = async (decorImage) => {
    try {
      // Add the decor image and its state atomically
      const newIndex = images.length;
      
      setImages(prevImages => [...prevImages, decorImage.src]);
      setImageStates(prevStates => [
        ...prevStates,
        {
          x: Math.random() * (wallWidth - decorImage.size.width),
          y: Math.random() * (wallHeight - decorImage.size.height),
          width: decorImage.size.width,
          height: decorImage.size.height,
          shape: 'square',
          frame: 'none',
          isDecor: true,
          zIndex: Date.now() + newIndex
        }
      ]);

      // Select the new decor
      setSelectedIdx(newIndex);
      setActiveTab('editor');
    } catch (error) {
      console.error('Error adding decor:', error);
      alert('Failed to add decor item. Please try again.');
    }
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
      imageStates[selectedIdx].isDecor ? (
        // Simple editor for decor items - only delete option
        <div className="bg-surface rounded-xl shadow-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Decor Item</h3>
          <button
            onClick={handleDelete}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Remove Decor
          </button>
        </div>
      ) : (
        // Full editor for regular images
        <ImagePropertiesPanel
          imageState={imageStates[selectedIdx]}
          onShapeChange={handleShapeChange}
          onFrameChange={handleFrameChange}
          onDelete={handleDelete}
        />
      )
    ) : (
      <div className="bg-surface rounded-xl shadow-xl border border-border p-6 text-center text-gray-400">Select an image to edit</div>
    );
  } else if (activeTab === 'decors') {
    tabContent = <DecorsPanel onAddDecor={handleAddDecor} />;
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-rows-[auto_1fr_auto] grid-cols-[320px_1fr] min-h-screen bg-secondary"
             style={{gridTemplateAreas: '"header header" "sidebar main" "footer footer"'}}>
          
          {/* Header with export button */}
          <div className="flex justify-between items-center px-8 py-4 bg-surface shadow-md" style={{ gridArea: 'header' }}>
            <h1 className="text-2xl font-bold text-primary-dark">Wall Designer</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSaveModal(true)}
                className="bg-primary-dark text-secondary px-4 py-2 rounded-lg text-base font-semibold shadow-md hover:bg-primary transition flex items-center gap-2"
              >
                <span>Save Draft</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h-2v5.586l-1.293-1.293z" />
                  <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
              </button>
              <ExportButton wallRef={wallRef} />
            </div>
          </div>

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
          <main className="bg-primary rounded-xl shadow-lg border-2 border-surface flex items-center justify-center min-h-[70vh] transition-all p-8" style={{ gridArea: 'main' }}>
            <div
              ref={wallRef}
              className="relative border-4 border-border bg-cover bg-center bg-no-repeat overflow-hidden rounded-xl shadow-xl transition-all"
              style={{
                backgroundColor: wallColor,
                width: wallWidth,
                height: wallHeight,
                backgroundImage: wallImage ? `url(${wallImage})` : undefined,
                position: 'relative',
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedIdx(null);
                  setActiveTab('uploads');
                }
              }}
            >
              {images.map((src, idx) => (
                <DraggableImage
                  key={`${idx}-${src.substring(0, 20)}`}
                  src={src}
                  idx={idx}
                  imageState={imageStates[idx]}
                  setImageStates={setImageStates}
                  wallWidth={wallWidth}
                  wallHeight={wallHeight}
                  isSelected={selectedIdx === idx}
                  setSelectedIdx={(index) => {
                    setSelectedIdx(index);
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

        {/* Save Draft Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 1000 }}>
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 transform transition-all">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {draftId ? 'Update Design' : 'Save Design'}
              </h2>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Enter a name for your design"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {saveError && (
                <p className="text-red-600 mb-4">{saveError}</p>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="bg-primary-dark text-secondary px-4 py-2 rounded-lg text-base font-semibold shadow-md hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : draftId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default WallEditor; 