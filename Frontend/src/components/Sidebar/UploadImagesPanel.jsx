import React from 'react';
import { Upload, X } from 'lucide-react';

const UploadImagesPanel = ({ imagesInputRef, handleImageChange, images, handleRemoveImage }) => (
  <div className="bg-surface border border-border rounded-lg shadow-md p-6 mb-6 transition-all hover:shadow-lg">
    <div className="flex items-center gap-2 mb-4">
      <Upload className="w-5 h-5 text-primary-dark" />
      <h3 className="text-primary-dark font-bold text-lg">Upload Images</h3>
    </div>
    <div className="flex flex-col gap-2">
      <label className="text-primary-dark font-bold text-base mb-1">Images to Wall</label>
      <button
        type="button"
        className="flex items-center gap-2 bg-primary text-secondary rounded-md px-4 py-2 font-semibold shadow-md hover:bg-primary-dark transition"
        onClick={() => imagesInputRef.current && imagesInputRef.current.click()}
      >
        <Upload className="w-4 h-4" />
        Upload Images
      </button>
      <input
        ref={imagesInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageChange}
      />
      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {images.map((src, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-primary shadow-sm">
              <img src={src} alt={`preview ${idx + 1}`} className="w-full h-20 object-cover" />
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                onClick={() => handleRemoveImage(idx)}
                aria-label={`Remove image ${idx + 1}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default UploadImagesPanel; 