import React, { useRef, useEffect, useState } from 'react';
import { Download, Monitor } from 'lucide-react';
import { renderBannerToCanvas, CANVAS_SPECIFICATIONS } from '../utils/canvasRenderer';

// El Canvas determina el límite visual real para no dejar píxeles vacíos.
// Este valor solo evita que el control numérico crezca indefinidamente y debe
// ser suficientemente amplio para recorrer imágenes escaladas hasta 3x.
const BG_OFFSET_CONTROL_LIMIT = 10000;

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
  const renderMetadataRef = useRef(null);
  const frameRef = useRef(null);
  const pendingOffsetsRef = useRef(null);
  const [dragMode, setDragMode] = useState(null);
  const spec = CANVAS_SPECIFICATIONS[formatKey] || CANVAS_SPECIFICATIONS['4:5'];
  const suffix = { '4:5': '45', FEED: 'FEED', STORY: 'STORY' }[formatKey];
  const offsetXKey = `bgOffsetX_${suffix}`;
  const offsetYKey = `bgOffsetY_${suffix}`;
  const creativeStackOffsetYKey = `creativeStackOffsetY_${suffix}`;
  const brandLogoOffsetXKey = `brandLogoOffsetX_${suffix}`;
  const brandLogoOffsetYKey = `brandLogoOffsetY_${suffix}`;

  useEffect(() => {
    if (canvasRef.current) {
      renderBannerToCanvas(
        canvasRef.current,
        formatKey,
        settings,
        brandLogos
      ).then((metadata) => {
        renderMetadataRef.current = metadata;
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
    if (event.button !== 0) return;

    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    if (!canvas || !bounds?.width || !bounds?.height) return;

    const canvasX = (event.clientX - bounds.left) * (canvas.width / bounds.width);
    const canvasY = (event.clientY - bounds.top) * (canvas.height / bounds.height);
    const stackBounds = renderMetadataRef.current?.creativeStackBounds;
    const logoBounds = renderMetadataRef.current?.brandLogoBounds;
    const isInsideLogo = Boolean(
      settings.showBrandLogo !== false &&
      logoBounds &&
      canvasX >= logoBounds.x &&
      canvasX <= logoBounds.x + logoBounds.width &&
      canvasY >= logoBounds.y &&
      canvasY <= logoBounds.y + logoBounds.height
    );
    const isInsideStack = Boolean(
      stackBounds &&
      canvasX >= stackBounds.x &&
      canvasX <= stackBounds.x + stackBounds.width &&
      canvasY >= stackBounds.y &&
      canvasY <= stackBounds.y + stackBounds.height
    );

    if (!isInsideLogo && !isInsideStack && !settings.backgrounds?.[formatKey]) return;

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startOffsetX: Number(settings[offsetXKey]) || 0,
      startOffsetY: Number(settings[offsetYKey]) || 0,
      startCreativeStackOffsetY: Number(settings[creativeStackOffsetYKey]) || 0,
      startBrandLogoOffsetX: Number(settings[brandLogoOffsetXKey]) || 0,
      startBrandLogoOffsetY: Number(settings[brandLogoOffsetYKey]) || 0,
      canvasPixelsPerClientX: canvas.width / bounds.width,
      canvasPixelsPerClientY: canvas.height / bounds.height,
      mode: isInsideLogo ? 'LOGO' : (isInsideStack ? 'STACK' : 'BACKGROUND')
    };
    setDragMode(isInsideLogo ? 'LOGO' : (isInsideStack ? 'STACK' : 'BACKGROUND'));
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();
    if (drag.mode === 'LOGO') {
      pendingOffsetsRef.current = {
        [brandLogoOffsetXKey]: Math.round(
          drag.startBrandLogoOffsetX +
          (event.clientX - drag.startClientX) * drag.canvasPixelsPerClientX
        ),
        [brandLogoOffsetYKey]: Math.round(
          drag.startBrandLogoOffsetY +
          (event.clientY - drag.startClientY) * drag.canvasPixelsPerClientY
        )
      };
    } else if (drag.mode === 'STACK') {
      pendingOffsetsRef.current = {
        [creativeStackOffsetYKey]: Math.max(-1800, Math.min(1800, Math.round(
          drag.startCreativeStackOffsetY +
          (event.clientY - drag.startClientY) * drag.canvasPixelsPerClientY
        )))
      };
    } else {
      pendingOffsetsRef.current = {
        [offsetXKey]: Math.max(-BG_OFFSET_CONTROL_LIMIT, Math.min(BG_OFFSET_CONTROL_LIMIT, Math.round(
          drag.startOffsetX +
          (event.clientX - drag.startClientX) * drag.canvasPixelsPerClientX
        ))),
        [offsetYKey]: Math.max(-BG_OFFSET_CONTROL_LIMIT, Math.min(BG_OFFSET_CONTROL_LIMIT, Math.round(
          drag.startOffsetY +
          (event.clientY - drag.startClientY) * drag.canvasPixelsPerClientY
        )))
      };
    }

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
    setDragMode(null);
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
          className={`rendered-banner-canvas background-draggable ${dragMode === 'BACKGROUND' ? 'is-dragging-background' : ''} ${dragMode === 'STACK' ? 'is-dragging-stack' : ''} ${dragMode === 'LOGO' ? 'is-dragging-logo' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishBackgroundDrag}
          onPointerCancel={finishBackgroundDrag}
          title="Arrastrá el logo libremente, el conjunto creativo en vertical o el fondo para reencuadrarlo"
        />
      </div>

      <div className="canvas-card-footer">
        <span className="resolution-tag">Resolución Exacta: {spec.width} × {spec.height} px · Logo: arrastre libre X/Y · Título/placa: arrastre vertical · Fondo: reencuadre libre</span>
      </div>
    </div>
  );
};
