import React from 'react';
import { Upload, Palette, Image as LucideImage, X } from 'lucide-react';

const BackgroundPanel = ({ wallImageInputRef, handleWallImageChange, wallImage, handleRemoveWallImage, wallColor, handleColorChange }) => (
  <div className="bg-surface border border-border rounded-lg shadow-md p-6 mb-6 transition-all hover:shadow-lg">
    <div className="flex items-center gap-2 mb-4">
      <LucideImage className="w-5 h-5 text-primary-dark" />
      <h3 className="text-primary-dark font-bold text-lg">Background</h3>
    </div>
    <div className="flex items-end gap-2 flex-wrap">
      <div className="flex flex-col gap-2">
        <label className="text-primary-dark font-bold text-base mb-1">Image</label>
        <button
          type="button"
          className="flex items-center gap-2 bg-primary text-secondary rounded-md px-4 py-2 font-semibold shadow-md hover:bg-primary-dark transition"
          onClick={() => wallImageInputRef.current && wallImageInputRef.current.click()}
        >
          <Upload className="w-4 h-4" />
          Upload Background
        </button>
        <input
          ref={wallImageInputRef}
          type="file"
          accept="image/*"
          id="bg-upload"
          className="hidden"
          onChange={handleWallImageChange}
        />
        {/* Background image preview */}
        {wallImage && (
          <div className="relative group rounded-lg overflow-hidden border border-primary shadow-sm mt-2 w-24 h-20">
            <img src={wallImage} alt="background preview" className="w-full h-full object-cover" />
            <button
              type="button"
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
              onClick={handleRemoveWallImage}
              aria-label="Remove background"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="text-primary-dark font-bold text-lg mx-2">OR</div>
      <div className="flex flex-col">
        <label className="text-primary-dark font-bold text-base mb-1">Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={wallColor}
            className="bg-secondary border border-primary rounded w-10 h-10 p-0"
            onChange={handleColorChange}
          />
          <Palette className="w-4 h-4 text-primary-dark" />
        </div>
      </div>
    </div>
  </div>
);

export default BackgroundPanel; 