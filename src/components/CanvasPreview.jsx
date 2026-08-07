import React, { useState } from 'react';
import { BannerCanvas } from './BannerCanvas';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export const CanvasPreview = ({
  activeView,
  settings,
  brandLogos,
  onExportSingle
}) => {
  const [zoomLevel, setZoomLevel] = useState(0.28); // Zoom inicial optimizado para pantallas

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.05, 0.6));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.05, 0.15));
  const handleZoomReset = () => setZoomLevel(0.28);

  const formatsToDisplay = activeView === 'ALL' 
    ? ['4:5', 'FEED', 'STORY'] 
    : [activeView];

  return (
    <main className="workspace-container">
      {/* Barra de Herramientas del Area de Trabajo / Zoom */}
      <div className="workspace-toolbar">
        <div className="workspace-info">
          <span className="info-badge">
            {activeView === 'ALL' ? 'Vista Multicanvas (3 Formatos)' : `Formato ${activeView}`}
          </span>
        </div>

        <div className="zoom-controls">
          <button onClick={handleZoomOut} title="Alejar vista">
            <ZoomOut size={16} />
          </button>
          <span className="zoom-percentage">{Math.round(zoomLevel * 100)}%</span>
          <button onClick={handleZoomIn} title="Acercar vista">
            <ZoomIn size={16} />
          </button>
          <button onClick={handleZoomReset} title="Restablecer zoom">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Grid o Canvas Individual */}
      <div className={`workspace-grid ${activeView === 'ALL' ? 'grid-mode-all' : 'grid-mode-single'}`}>
        {formatsToDisplay.map((formatKey) => (
          <BannerCanvas
            key={formatKey}
            formatKey={formatKey}
            settings={settings}
            brandLogos={brandLogos}
            onExportSingle={onExportSingle}
            zoomScale={zoomLevel}
          />
        ))}
      </div>
    </main>
  );
};
