import React, { useState } from 'react';
import { Flower2 } from 'lucide-react';
import { authFetch } from '../../utils/auth';

const decorCategories = {
  clocks: {
    name: "Clocks",
    items: [
      {
        id: 'vintage-clock',
        name: 'Vintage Clock',
        src: '/decors/Vintage_Clock.png',
        size: { width: 150, height: 150 }
      }
    ]
  },
  tables: {
    name: "Tables",
    items: [
      {
        id: 'black-table',
        name: 'Black Table',
        src: '/decors/Black.png',
        size: { width: 200, height: 150 }
      },
      {
        id: 'black-table-2',
        name: 'Black Table 2',
        src: '/decors/Blackt.png',
        size: { width: 200, height: 150 }
      },
      {
        id: 'white-table',
        name: 'White Table',
        src: '/decors/White.png',
        size: { width: 200, height: 150 }
      },
      {
        id: 'table-4',
        name: 'Table 4',
        src: '/decors/table4.png',
        size: { width: 350, height: 200 }
      }
    ]
  },
  plants: {
    name: "Plants",
    items: [
      {
        id: 'indoor-plant-1',
        name: 'Indoor Plant 1',
        src: '/decors/Flowerplant.png',
        size: { width: 150, height: 200 }
      },
      {
        id: 'indoor-plant-2',
        name: 'Indoor Plant 2',
        src: '/decors/Flowerpot2.png',
        size: { width: 150, height: 200 }
      }
    ]
  },
  fruits: {
    name: "Fruits",
    items: [
      {
        id: 'fruit',
        name: 'Fruit',
        src: '/decors/Fruit.png',
        size: { width: 150, height: 150 }
      }
    ]
  },
  garlands: {
    name: "Garlands",
    items: [
      {
        id: 'flower-garland',
        name: 'Flower Garland',
        src: '/decors/Garland1.png',
        size: { width: 200, height: 200 }
      }
    ]
  }
};

const DecorsPanel = ({ onAddDecor }) => {
  const [loadError, setLoadError] = useState({});
  const [activeCategory, setActiveCategory] = useState('clocks');

  const handleDecorClick = async (decor) => {
    if (loadError[decor.id]) return;

    try {
      // Create a blob from the image URL
      const response = await fetch(decor.src);
      const blob = await response.blob();
      
      // Upload the blob
      const formData = new FormData();
      formData.append('image', blob, `decor-${decor.id}${decor.src.substring(decor.src.lastIndexOf('.'))}`);
      
      const uploadResponse = await authFetch('http://localhost:5001/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload decor image');
      }

      const data = await uploadResponse.json();
      
      onAddDecor({
        src: data.url,
        size: decor.size
      });
    } catch (error) {
      console.error(`Failed to process decor image for ${decor.id}:`, error);
      setLoadError(prev => ({ ...prev, [decor.id]: true }));
    }
  };

  const handleImageError = (decorId) => {
    setLoadError(prev => ({ ...prev, [decorId]: true }));
    console.error(`Failed to load decor image for ${decorId}`);
  };

  return (
    <div className="bg-surface border border-border rounded-lg shadow-md p-6 mb-6 transition-all hover:shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Flower2 className="w-5 h-5 text-primary-dark" />
        <h3 className="text-primary-dark font-bold text-lg">Decorative Items</h3>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(decorCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
              activeCategory === key
              ? 'bg-primary text-secondary shadow-md'
              : 'bg-secondary text-primary hover:bg-primary/10'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Active Category Items */}
      <div className="grid grid-cols-2 gap-3">
        {decorCategories[activeCategory].items.map((decor) => (
          <div
            key={decor.id}
            onClick={() => !loadError[decor.id] && handleDecorClick(decor)}
            className={`cursor-pointer group relative rounded-lg overflow-hidden border border-primary shadow-sm 
              ${loadError[decor.id] ? 'opacity-50' : 'hover:border-primary-dark transition-colors'}`}
          >
            <div className="aspect-square">
              <img
                src={decor.src}
                alt={decor.name}
                onError={() => handleImageError(decor.id)}
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
            </div>
            <div className="p-2 bg-surface/80 backdrop-blur-sm">
              <p className="text-sm font-medium text-primary-dark text-center">
                {decor.name}
                {loadError[decor.id] && (
                  <span className="text-red-500 block text-xs">Image not found</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DecorsPanel; 