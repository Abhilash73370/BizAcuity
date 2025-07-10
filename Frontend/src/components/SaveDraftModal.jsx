import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { authFetch } from '../utils/auth';

const SaveDraftModal = ({ 
  showModal, 
  onClose, 
  wallRef, 
  draftId, 
  registeredUser,
  wallData,
  initialDraftName = ''
}) => {
  const [draftName, setDraftName] = useState(initialDraftName);
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      const url = draftId 
        ? `http://localhost:5001/drafts/${draftId}`
        : 'http://localhost:5001/drafts';
      
      const method = draftId ? 'PUT' : 'POST';
      
      const response = await authFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: draftName,
          wallData,
          previewImage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save draft');
      }

      const result = await response.json();
      
      onClose();
      
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

  if (!showModal) return null;

  return (
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
            onClick={onClose}
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
  );
};

export default SaveDraftModal; 