import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ExportButton = ({ wallRef }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [exporting, setExporting] = useState(false);
  const dropdownRef = useRef(null);

  const handleExport = async (format) => {
    if (!wallRef.current || exporting) return;

    setExporting(true);
    try {
      // Capture the wall as a canvas
      const wallCanvas = await html2canvas(wallRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#fff',
        scale: 2,
      });

      // Add padding around the wall
      const padding = 40;
      const paddedCanvas = document.createElement('canvas');
      paddedCanvas.width = wallCanvas.width + padding * 2;
      paddedCanvas.height = wallCanvas.height + padding * 2;
      const ctx = paddedCanvas.getContext('2d');

      // Fill background with white
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);

      // Draw the wall canvas onto the padded canvas
      ctx.drawImage(wallCanvas, padding, padding);

      switch (format) {
        case 'png':
          downloadImage(paddedCanvas.toDataURL('image/png'), 'wall-design.png');
          break;

        case 'jpeg':
          downloadImage(paddedCanvas.toDataURL('image/jpeg', 0.9), 'wall-design.jpg');
          break;

        case 'pdf':
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [paddedCanvas.width, paddedCanvas.height]
          });

          pdf.addImage(
            paddedCanvas.toDataURL('image/png'),
            'PNG',
            0,
            0,
            paddedCanvas.width,
            paddedCanvas.height
          );
          pdf.save('wall-design.pdf');
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
      setShowDropdown(false);
    }
  };

  const downloadImage = (dataUrl, fileName) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={exporting}
        className="bg-primary-dark text-secondary px-4 py-2 rounded-lg text-base font-semibold shadow-md hover:bg-primary transition flex items-center gap-2"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
        {exporting ? 'Exporting...' : 'Export Design'}
      </button>

      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
        >
          <div className="py-1" role="menu">
            {['PNG', 'JPEG', 'PDF'].map((format) => (
              <button
                key={format}
                onClick={() => handleExport(format.toLowerCase())}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                Export as {format}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;