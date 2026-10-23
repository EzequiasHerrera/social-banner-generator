import React, { useRef, useEffect, useState } from 'react';
import { Download, Monitor } from 'lucide-react';
import { renderBannerToCanvas, CANVAS_SPECIFICATIONS } from '../utils/canvasRenderer';

// El Canvas determina el límite visual real para no dejar píxeles vacíos.
// Este valor solo evita que el control numérico crezca indefinidamente y debe
// ser suficientemente amplio para recorrer imágenes escaladas hasta 3x.
const BG_OFFSET_CONTROL_LIMIT = 10000;
// Distancia visual (en píxeles de pantalla) dentro de la que el centro del
// elemento se pega magnéticamente al eje del formato. Al convertirla a píxeles
// reales del Canvas, la sensación se mantiene igual con cualquier zoom.
const CENTER_SNAP_THRESHOLD_CLIENT_PX = 14;

export const BannerCanvas = ({
  formatKey,
  settings,
  brandLogos,
  onExportSingle,
  zoomScale = 1.0,
  updateSettings
}) => {
  const canvasRef = useRef(null);
  const renderRequestRef = useRef(0);
  const dragRef = useRef(null);
  const renderMetadataRef = useRef(null);
  const frameRef = useRef(null);
  const pendingOffsetsRef = useRef(null);
  const [dragMode, setDragMode] = useState(null);
  const [snapGuides, setSnapGuides] = useState({ vertical: false, horizontal: false });
  const spec = CANVAS_SPECIFICATIONS[formatKey] || CANVAS_SPECIFICATIONS['4:5'];
  const suffix = { '4:5': '45', FEED: 'FEED', STORY: 'STORY' }[formatKey];
  const offsetXKey = `bgOffsetX_${suffix}`;
  const offsetYKey = `bgOffsetY_${suffix}`;
  const creativeStackOffsetYKey = `creativeStackOffsetY_${suffix}`;
  const brandLogoOffsetXKey = `brandLogoOffsetX_${suffix}`;
  const brandLogoOffsetYKey = `brandLogoOffsetY_${suffix}`;

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    // Cada estado se renderiza primero en un Canvas aislado. Solo la solicitud
    // más reciente se copia a la vista. Esto evita que renders asincrónicos
    // anteriores terminen tarde y dejen “copias” o rastros durante un drag.
    const requestId = ++renderRequestRef.current;
    const renderCanvas = document.createElement('canvas');
    let cancelled = false;

    renderBannerToCanvas(
      renderCanvas,
      formatKey,
      settings,
      brandLogos
    ).then((metadata) => {
      if (cancelled || requestId !== renderRequestRef.current || !canvasRef.current) return;

      const visibleCanvas = canvasRef.current;
      visibleCanvas.width = renderCanvas.width;
      visibleCanvas.height = renderCanvas.height;
      const visibleContext = visibleCanvas.getContext('2d');
      visibleContext.clearRect(0, 0, visibleCanvas.width, visibleCanvas.height);
      visibleContext.drawImage(renderCanvas, 0, 0);
      renderMetadataRef.current = metadata;
    });

    return () => {
      cancelled = true;
    };
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
    const freeImageBounds = renderMetadataRef.current?.freeImageBounds || [];
    // Se busca desde el final porque la última capa se dibuja encima.
    const hitFreeImage = [...freeImageBounds].reverse().find(imageBounds => (
      canvasX >= imageBounds.x && canvasX <= imageBounds.x + imageBounds.width &&
      canvasY >= imageBounds.y && canvasY <= imageBounds.y + imageBounds.height
    ));
    const isInsideFreeImage = Boolean(hitFreeImage);
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

    if (!isInsideFreeImage && !isInsideLogo && !isInsideStack && !settings.backgrounds?.[formatKey]) return;

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
      startBrandLogoCenterX: logoBounds ? logoBounds.x + (logoBounds.width / 2) : null,
      startBrandLogoCenterY: logoBounds ? logoBounds.y + (logoBounds.height / 2) : null,
      freeImageId: hitFreeImage?.id || null,
      startFreeImages: Array.isArray(settings.freeImages)
        ? settings.freeImages.map(image => ({ ...image }))
        : [],
      startFreeImageOffsetX: hitFreeImage
        ? Number(settings.freeImages?.find(image => image.id === hitFreeImage.id)?.[`offsetX_${suffix}`]) || 0
        : 0,
      startFreeImageOffsetY: hitFreeImage
        ? Number(settings.freeImages?.find(image => image.id === hitFreeImage.id)?.[`offsetY_${suffix}`]) || 0
        : 0,
      startFreeImageCenterX: hitFreeImage ? hitFreeImage.x + (hitFreeImage.width / 2) : null,
      startFreeImageCenterY: hitFreeImage ? hitFreeImage.y + (hitFreeImage.height / 2) : null,
      canvasPixelsPerClientX: canvas.width / bounds.width,
      canvasPixelsPerClientY: canvas.height / bounds.height,
      mode: isInsideFreeImage ? 'FREE_IMAGE' : (isInsideLogo ? 'LOGO' : (isInsideStack ? 'STACK' : 'BACKGROUND'))
    };
    if (hitFreeImage && settings.selectedFreeImageId !== hitFreeImage.id) {
      updateSettings({ selectedFreeImageId: hitFreeImage.id });
    }
    setDragMode(isInsideFreeImage ? 'FREE_IMAGE' : (isInsideLogo ? 'LOGO' : (isInsideStack ? 'STACK' : 'BACKGROUND')));
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();
    if (drag.mode === 'FREE_IMAGE') {
      let deltaX = (event.clientX - drag.startClientX) * drag.canvasPixelsPerClientX;
      let deltaY = (event.clientY - drag.startClientY) * drag.canvasPixelsPerClientY;
      const verticalThreshold = CENTER_SNAP_THRESHOLD_CLIENT_PX * drag.canvasPixelsPerClientX;
      const horizontalThreshold = CENTER_SNAP_THRESHOLD_CLIENT_PX * drag.canvasPixelsPerClientY;
      const shouldSnapVertical = Math.abs(
        (drag.startFreeImageCenterX + deltaX) - (canvasRef.current.width / 2)
      ) <= verticalThreshold;
      const shouldSnapHorizontal = Math.abs(
        (drag.startFreeImageCenterY + deltaY) - (canvasRef.current.height / 2)
      ) <= horizontalThreshold;

      if (shouldSnapVertical) {
        deltaX = (canvasRef.current.width / 2) - drag.startFreeImageCenterX;
      }
      if (shouldSnapHorizontal) {
        deltaY = (canvasRef.current.height / 2) - drag.startFreeImageCenterY;
      }

      setSnapGuides((currentGuides) => (
        currentGuides.vertical === shouldSnapVertical &&
        currentGuides.horizontal === shouldSnapHorizontal
          ? currentGuides
          : { vertical: shouldSnapVertical, horizontal: shouldSnapHorizontal }
      ));

      pendingOffsetsRef.current = {
        freeImages: drag.startFreeImages.map(image => (
          image.id === drag.freeImageId
            ? {
                ...image,
                [`offsetX_${suffix}`]: Math.round(drag.startFreeImageOffsetX + deltaX),
                [`offsetY_${suffix}`]: Math.round(drag.startFreeImageOffsetY + deltaY)
              }
            : image
        )),
        selectedFreeImageId: drag.freeImageId
      };
    } else if (drag.mode === 'LOGO') {
      let deltaX = (event.clientX - drag.startClientX) * drag.canvasPixelsPerClientX;
      let deltaY = (event.clientY - drag.startClientY) * drag.canvasPixelsPerClientY;
      const verticalThreshold = CENTER_SNAP_THRESHOLD_CLIENT_PX * drag.canvasPixelsPerClientX;
      const horizontalThreshold = CENTER_SNAP_THRESHOLD_CLIENT_PX * drag.canvasPixelsPerClientY;
      const shouldSnapVertical = Math.abs(
        (drag.startBrandLogoCenterX + deltaX) - (canvasRef.current.width / 2)
      ) <= verticalThreshold;
      const shouldSnapHorizontal = Math.abs(
        (drag.startBrandLogoCenterY + deltaY) - (canvasRef.current.height / 2)
      ) <= horizontalThreshold;

      if (shouldSnapVertical) {
        deltaX = (canvasRef.current.width / 2) - drag.startBrandLogoCenterX;
      }
      if (shouldSnapHorizontal) {
        deltaY = (canvasRef.current.height / 2) - drag.startBrandLogoCenterY;
      }

      setSnapGuides((currentGuides) => (
        currentGuides.vertical === shouldSnapVertical &&
        currentGuides.horizontal === shouldSnapHorizontal
          ? currentGuides
          : { vertical: shouldSnapVertical, horizontal: shouldSnapHorizontal }
      ));

      pendingOffsetsRef.current = {
        [brandLogoOffsetXKey]: Math.round(
          drag.startBrandLogoOffsetX + deltaX
        ),
        [brandLogoOffsetYKey]: Math.round(
          drag.startBrandLogoOffsetY + deltaY
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
    setSnapGuides({ vertical: false, horizontal: false });
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
        <div className="canvas-stage">
          <canvas
            ref={canvasRef}
            width={spec.width}
            height={spec.height}
            className={`rendered-banner-canvas background-draggable ${dragMode === 'BACKGROUND' ? 'is-dragging-background' : ''} ${dragMode === 'STACK' ? 'is-dragging-stack' : ''} ${dragMode === 'LOGO' ? 'is-dragging-logo' : ''} ${dragMode === 'FREE_IMAGE' ? 'is-dragging-free-image' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishBackgroundDrag}
            onPointerCancel={finishBackgroundDrag}
            title="Arrastrá la imagen libre, el logo, el conjunto creativo o el fondo para reencuadrarlo"
          />
          {snapGuides.vertical && (
            <span className="logo-snap-guide logo-snap-guide-vertical" aria-hidden="true" />
          )}
          {snapGuides.horizontal && (
            <span className="logo-snap-guide logo-snap-guide-horizontal" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="canvas-card-footer">
        <span className="resolution-tag">Resolución Exacta: {spec.width} × {spec.height} px · Imagen libre y logo: arrastre X/Y · Título/placa: arrastre vertical · Fondo: reencuadre libre</span>
      </div>
    </div>
  );
};
