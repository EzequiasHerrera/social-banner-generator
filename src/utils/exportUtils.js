// Utilidades de exportación individual y masiva (ZIP) de placas publicitarias

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import confetti from 'canvas-confetti';
import { renderBannerToCanvas, CANVAS_SPECIFICATIONS } from './canvasRenderer';

// Descarga una sola placa en formato PNG
export const exportSingleBanner = async (formatKey, settings, brandLogosList) => {
  const spec = CANVAS_SPECIFICATIONS[formatKey];
  if (!spec) return;

  const offscreenCanvas = document.createElement('canvas');
  await renderBannerToCanvas(offscreenCanvas, formatKey, settings, brandLogosList);

  offscreenCanvas.toBlob((blob) => {
    if (!blob) return;
    const cleanProductName = (settings.productName || 'PRODUCTO')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 20);
    const fileName = `PLACA_${formatKey}_${cleanProductName}_${spec.width}x${spec.height}.png`;
    saveAs(blob, fileName);
  }, 'image/png', 1.0);
};

// Exportación masiva de los formatos elegidos en un archivo .ZIP
export const exportAllBannersZip = async (settings, brandLogosList, onProgress) => {
  const zip = new JSZip();
  const formats = Object.keys(CANVAS_SPECIFICATIONS).filter(
    key => settings.exportFormats?.[key] !== false
  );
  if (formats.length === 0) throw new Error('No hay formatos seleccionados para exportar.');
  
  const cleanProductName = (settings.productName || 'PRODUCTO')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 20);

  for (let i = 0; i < formats.length; i++) {
    const key = formats[i];
    const spec = CANVAS_SPECIFICATIONS[key];
    if (onProgress) onProgress(`Generando formato ${key} (${i + 1}/${formats.length})...`);

    const offscreenCanvas = document.createElement('canvas');
    await renderBannerToCanvas(offscreenCanvas, key, settings, brandLogosList);

    const dataUrl = offscreenCanvas.toDataURL('image/png', 1.0);
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    
    zip.file(`PLACA_${key}_${spec.width}x${spec.height}.png`, base64Data, { base64: true });
  }

  if (onProgress) onProgress('Empaquetando archivo ZIP...');
  const content = await zip.generateAsync({ type: 'blob' });
  const zipFileName = `PLACAS_KITCHENTOOLS_${cleanProductName}_${Date.now()}.zip`;
  saveAs(content, zipFileName);

  // Efecto de celebración con confetti
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch {
    // Ignorar si confetti falla
  }
};
