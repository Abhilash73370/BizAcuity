import React from 'react';
import { Settings, Ruler } from 'lucide-react';

const WallSizePanel = ({ inputWidth, inputHeight, setInputWidth, setInputHeight, handleSetWallSize, MIN_SIZE, MAX_SIZE }) => (
  <div className="bg-surface border border-border rounded-lg shadow-md p-6 mb-6 transition-all hover:shadow-lg">
    <div className="flex items-center gap-2 mb-4">
      <Ruler className="w-5 h-5 text-primary-dark" />
      <h3 className="text-primary-dark font-bold text-lg">Wall Size</h3>
    </div>
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-end flex-wrap">
        <div className="flex flex-col">
          <label className="text-primary-dark font-bold text-base mb-1">Width (px)</label>
          <input
            type="number"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={inputWidth}
            onChange={e => setInputWidth(e.target.value)}
            className="bg-secondary border border-primary rounded px-2 py-1 w-16"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-primary-dark font-bold text-base mb-1">Height (px)</label>
          <input
            type="number"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={inputHeight}
            onChange={e => setInputHeight(e.target.value)}
            className="bg-secondary border border-primary rounded px-2 py-1 w-16"
          />
        </div>
        <button
          className="bg-primary text-secondary rounded-md shadow-md font-semibold px-4 py-2 transition hover:bg-primary-dark min-w-[90px] text-sm flex items-center gap-1"
          onClick={handleSetWallSize}
        >
          <Settings className="w-4 h-4" />
          Set Size
        </button>
      </div>
    </div>
  </div>
);

export default WallSizePanel; 