import React, { useState } from 'react';
import { BannerCanvas } from './BannerCanvas';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export const CanvasPreview = ({
  settings,
  brandLogos,
  onExportSingle,
  updateSettings
}) => {
  const [zoomLevel, setZoomLevel] = useState(0.28); // Zoom inicial optimizado para pantallas

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.05, 0.6));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.05, 0.15));
  const handleZoomReset = () => setZoomLevel(0.28);

  const formatsToDisplay = ['4:5', 'FEED', 'STORY'].filter(
    formatKey => settings.visibleFormats?.[formatKey] !== false
  );

  return (
    <main className="workspace-container">
      {/* Barra de Herramientas del Area de Trabajo / Zoom */}
      <div className="workspace-toolbar">
        <div className="workspace-info">
          <span className="info-badge">
            {formatsToDisplay.length > 0
              ? `Vista: ${formatsToDisplay.join(' · ')}`
              : 'No hay formatos seleccionados para ver'}
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
      <div className={`workspace-grid ${formatsToDisplay.length > 1 ? 'grid-mode-all' : 'grid-mode-single'}`}>
        {formatsToDisplay.length === 0 && (
          <div className="empty-format-state">Activá al menos un formato en “Ver” para mostrar su vista previa.</div>
        )}
        {formatsToDisplay.map((formatKey) => (
          <BannerCanvas
            key={formatKey}
            formatKey={formatKey}
            settings={settings}
            brandLogos={brandLogos}
            onExportSingle={onExportSingle}
            zoomScale={zoomLevel}
            updateSettings={updateSettings}
          />
        ))}
      </div>
    </main>
  );
};
