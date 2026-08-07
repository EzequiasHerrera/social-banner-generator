import React, { useRef, useEffect, useState } from 'react';
import { Download, Monitor } from 'lucide-react';
import { renderBannerToCanvas, CANVAS_SPECIFICATIONS } from '../utils/canvasRenderer';

export const BannerCanvas = ({
  formatKey,
  settings,
  brandLogos,
  onExportSingle,
  zoomScale = 1.0,
  updateSettings
}) => {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const frameRef = useRef(null);
  const pendingOffsetsRef = useRef(null);
  const [isDraggingBackground, setIsDraggingBackground] = useState(false);
const spec = CANVAS_SPECIFICATIONS[formatKey] || CANVAS_SPECIFICATIONS['4:5'];
  const suffix = { '4:5': '45', FEED: 'FEED', STORY: 'STORY' }[formatKey];
  const offsetXKey = `bgOffsetX_${suffix}`;
  const offsetYKey = `bgOffsetY_${suffix}`;

  useEffect(() => {
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
  }, [formatKey, settings, brandLogos]);

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  const flushPendingOffsets = () => {
    frameRef.current = null;
    if (!pendingOffsetsRef.current) return;
    updateSettings(pendingOffsetsRef.current);
    pendingOffsetsRef.current = null;
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0 || !settings.backgrounds?.[formatKey]) return;

    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    if (!canvas || !bounds?.width || !bounds?.height) return;

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startOffsetX: Number(settings[offsetXKey]) || 0,
      startOffsetY: Number(settings[offsetYKey]) || 0,
      canvasPixelsPerClientX: canvas.width / bounds.width,
      canvasPixelsPerClientY: canvas.height / bounds.height
    };
    setIsDraggingBackground(true);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();
    pendingOffsetsRef.current = {
      [offsetXKey]: Math.max(-500, Math.min(500, Math.round(
        drag.startOffsetX +
        (event.clientX - drag.startClientX) * drag.canvasPixelsPerClientX
      ))),
      [offsetYKey]: Math.max(-500, Math.min(500, Math.round(
        drag.startOffsetY +
        (event.clientY - drag.startClientY) * drag.canvasPixelsPerClientY
      )))
    };

    if (!frameRef.current) {
      frameRef.current = requestAnimationFrame(flushPendingOffsets);
    }
  };

  const finishBackgroundDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      flushPendingOffsets();
    }
    if (canvasRef.current?.hasPointerCapture(event.pointerId)) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setIsDraggingBackground(false);
  };

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
          className={`rendered-banner-canvas background-draggable ${isDraggingBackground ? 'is-dragging-background' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishBackgroundDrag}
          onPointerCancel={finishBackgroundDrag}
          title="Arrastrá para reubicar la imagen de fondo"
        />
      </div>

      <div className="canvas-card-footer">
        <span className="resolution-tag">Resolución Exacta: {spec.width} × {spec.height} px · Arrastrá la imagen para reencuadrarla</span>
      </div>
    </div>
  );
};
