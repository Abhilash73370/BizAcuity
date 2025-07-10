import React, { useState, useEffect, useRef, useContext } from 'react';
import html2canvas from 'html2canvas';
import DraggableImage from '../components/DraggableImage';
import ImagePropertiesPanel from '../components/ImagePropertiesPanel';
import WallSizePanel from '../components/Sidebar/WallSizePanel';
import UploadImagesPanel from '../components/Sidebar/UploadImagesPanel';
import BackgroundPanel from '../components/Sidebar/BackgroundPanel';
import ExportButton from '../components/ExportButton';
import Header from '../components/Header';
import { UserContext } from '../App';
import { useNavigate, useLocation } from 'react-router-dom';
import SaveDraftModal from '../components/SaveDraftModal';
import ShareModal from '../components/ShareModal';
import DecorsPanel from '../components/Sidebar/DecorsPanel';
import { authFetch } from '../utils/auth';

const MIN_SIZE = 200;
const MAX_SIZE = 2000;

const TABS = [
  { key: 'background', label: 'Background' },
  { key: 'uploads', label: ' Uploads' },
  { key: 'editor', label: ' Editor' },
  { key: 'decors', label: 'Decors' },
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
  const [activeTab, setActiveTab] = useState('editor');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [isCollaborating, setIsCollaborating] = useState(false);

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
      authFetch(`http://localhost:5001/wall/${registeredUser.id}`)
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
      authFetch('http://localhost:5001/wall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wall }),
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

        const response = await authFetch('http://localhost:5001/upload', {
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

        const response = await authFetch('http://localhost:5001/upload', {
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

  // Load existing draft if draftId is present
      // Check if this is a shared view
      useEffect(() => {
    const sharedParam = searchParams.get('shared');
    const collaborateParam = searchParams.get('collaborate');
    setIsSharedView(sharedParam === 'true');
    setIsCollaborating(collaborateParam === 'true');
      }, [searchParams]);

  // Load draft data and set up real-time updates
  useEffect(() => {
    const loadDraft = async () => {
      if (!draftId) return;

      try {
        setLoading(true);
        const response = await authFetch(`http://localhost:5001/drafts/single/${draftId}`);
        if (!response.ok) throw new Error('Failed to load draft');
        
        const draft = await response.json();
        setDraftName(draft.name);
        
        // Load wall data
        const { wallData } = draft;
        if (wallData) {
          setWallColor(wallData.wallColor || '#FFFFFF');
          setWallWidth(wallData.wallWidth || 800);
          setWallHeight(wallData.wallHeight || 600);
          setWallImage(wallData.wallImage);
          setImages(wallData.images || []);
          setImageStates(wallData.imageStates || []);
        }

        // Set up real-time updates if collaborating
        if (isCollaborating) {
          // Set up WebSocket connection for real-time updates
          const ws = new WebSocket(`ws://localhost:5001/drafts/${draftId}/collaborate`);
          
          ws.onmessage = (event) => {
            const update = JSON.parse(event.data);
            
            // Apply updates from other users
            if (update.type === 'wall_update') {
              const { wallData } = update;
              setWallColor(wallData.wallColor);
              setWallWidth(wallData.wallWidth);
              setWallHeight(wallData.wallHeight);
              setWallImage(wallData.wallImage);
              setImages(wallData.images);
              setImageStates(wallData.imageStates);
            }
          };

          // Clean up WebSocket on unmount
          return () => ws.close();
        }
      } catch (error) {
        console.error('Load draft error:', error);
        alert('Failed to load draft. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDraft();
  }, [draftId, isCollaborating]);

  // Send updates to server when wall data changes in collaboration mode
  useEffect(() => {
    if (isCollaborating && draftId) {
      const wallData = {
        wallColor,
        wallWidth,
        wallHeight,
        wallImage,
        images,
        imageStates
      };

      authFetch(`http://localhost:5001/drafts/${draftId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallData }),
      }).catch(error => {
        console.error('Error updating shared wall:', error);
      });
    }
  }, [wallColor, wallWidth, wallHeight, wallImage, images, imageStates, isCollaborating, draftId]);

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
      
      const response = await authFetch('http://localhost:5001/upload', {
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

  // Function to handle wall sharing
  const handleShareWall = async () => {
    try {
      setShowShareModal(true);
      // The ShareModal component will handle its own state and URL updates
    } catch (error) {
      console.error('Error sharing wall:', error);
      alert('Failed to create shareable link. Please try again.');
      setShowShareModal(false);
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
          
          {/* Header with buttons */}
          <div className="flex justify-between items-center px-8 py-4 bg-surface shadow-md" style={{ gridArea: 'header' }}>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-dark">Wall Designer</h1>
              {isSharedView && (
                <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {isCollaborating ? 'Collaborative Mode' : 'Shared View'}
                </span>
              )}
            </div>
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
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-primary-dark text-secondary px-4 py-2 rounded-lg text-base font-semibold shadow-md hover:bg-primary transition flex items-center gap-2"
              >
                <span>Share</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
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

        {/* Modals */}
        <SaveDraftModal
          showModal={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          wallRef={wallRef}
          draftId={draftId}
          registeredUser={registeredUser}
          wallData={{
            wallColor,
            wallWidth,
            wallHeight,
            wallImage,
            images,
            imageStates
          }}
          initialDraftName={draftName}
        />

        <ShareModal
          showModal={showShareModal}
          onClose={() => setShowShareModal(false)}
          wallRef={wallRef}
          draftId={draftId}
          registeredUser={registeredUser}
          wallData={{
            wallColor,
            wallWidth,
            wallHeight,
            wallImage,
            images,
            imageStates
          }}
          onDraftCreated={(newDraftId) => {
            // Update URL with new draft ID if one was created
            if (newDraftId && !draftId) {
              window.history.replaceState(null, '', `/wall?draftId=${newDraftId}&shared=true&collaborate=true`);
            }
          }}
        />
      </main>
    </div>
  );
}

export default WallEditor; 