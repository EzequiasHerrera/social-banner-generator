import React, { useRef, useEffect } from 'react';
import { Download, Monitor } from 'lucide-react';
import { renderBannerToCanvas, CANVAS_SPECIFICATIONS } from '../utils/canvasRenderer';

export const BannerCanvas = ({
  formatKey,
  settings,
  brandLogos,
  onExportSingle,
  zoomScale = 1.0
}) => {
  const canvasRef = useRef(null);
  const spec = CANVAS_SPECIFICATIONS[formatKey] || CANVAS_SPECIFICATIONS['4:5'];

  useEffect(() => {
    let isSubscribed = true;
    if (canvasRef.current) {
      renderBannerToCanvas(
        canvasRef.current,
        formatKey,
        settings,
        brandLogos
      ).then(() => {
        // Renderizado completado exitosamente
      });
    }
    return () => { isSubscribed = false; };
  }, [formatKey, settings, brandLogos]);

  return (
    <div className="canvas-wrapper-card">
      <div className="canvas-card-header">
        <div className="canvas-card-title">
          <Monitor size={16} className="text-emerald-400" />
          <span className="font-bold">{spec.name}</span>
        </div>

        <button
          className="btn-download-single"
          onClick={() => onExportSingle(formatKey)}
          title={`Descargar ${formatKey} PNG (1080p/1200p HD)`}
        >
          <Download size={14} />
          <span>PNG HD</span>
        </button>
      </div>

      <div className="canvas-viewport" style={{ zoom: zoomScale }}>
        <canvas
          ref={canvasRef}
          width={spec.width}
          height={spec.height}
          className="rendered-banner-canvas"
        />
      </div>

      <div className="canvas-card-footer">
        <span className="resolution-tag">Resolución Exacta: {spec.width} × {spec.height} px</span>
      </div>
    </div>
  );
};
