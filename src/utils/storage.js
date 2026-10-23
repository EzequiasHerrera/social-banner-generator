// Gestor de persistencia en localStorage para configuraciones y marcas personalizadas

const SETTINGS_KEY = 'kt_banner_generator_settings_v1';
const BRANDS_KEY = 'kt_banner_generator_brands_v1';

import { DEFAULT_SETTINGS, INITIAL_BRAND_LOGOS } from './defaultSettings';

export const loadSavedSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(stored);
    let freeImages = Array.isArray(parsed.freeImages) ? parsed.freeImages : [];

    // Compatibilidad con la versión que admitía una sola imagen decorativa.
    if (freeImages.length === 0 && parsed.freeImageUrl) {
      const legacyScale = Number(parsed.freeImageScale) > 0 ? Number(parsed.freeImageScale) : 1;
      freeImages = [{
        id: 'free_image_migrated',
        name: 'Imagen libre',
        url: parsed.freeImageUrl,
        visible: parsed.showFreeImage !== false,
        scale_45: legacyScale,
        scale_FEED: legacyScale,
        scale_STORY: legacyScale,
        offsetX_45: Number(parsed.freeImageOffsetX_45) || 0,
        offsetY_45: Number(parsed.freeImageOffsetY_45) || 0,
        offsetX_FEED: Number(parsed.freeImageOffsetX_FEED) || 0,
        offsetY_FEED: Number(parsed.freeImageOffsetY_FEED) || 0,
        offsetX_STORY: Number(parsed.freeImageOffsetX_STORY) || 0,
        offsetY_STORY: Number(parsed.freeImageOffsetY_STORY) || 0
      }];
    }

    const selectedFreeImageId = freeImages.some(image => image.id === parsed.selectedFreeImageId)
      ? parsed.selectedFreeImageId
      : (freeImages[0]?.id || null);

    return { ...DEFAULT_SETTINGS, ...parsed, freeImages, selectedFreeImageId };
  } catch (err) {
    console.warn('Error leyendo localStorage:', err);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettingsToStorage = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Error guardando en localStorage:', err);
  }
};

export const loadCustomBrands = () => {
  try {
    const stored = localStorage.getItem(BRANDS_KEY);
    if (!stored) return INITIAL_BRAND_LOGOS;
    const customList = JSON.parse(stored);
    // Asegurar que las marcas iniciales por defecto sigan presentes
    const presetIds = new Set(INITIAL_BRAND_LOGOS.map(b => b.id));
    const merged = [...INITIAL_BRAND_LOGOS];
    
    customList.forEach(b => {
      if (!presetIds.has(b.id)) {
        merged.push(b);
      }
    });
    return merged;
  } catch (err) {
    console.warn('Error leyendo marcas de localStorage:', err);
    return INITIAL_BRAND_LOGOS;
  }
};

export const saveCustomBrand = (newBrand) => {
  try {
    const current = loadCustomBrands();
    const updated = [newBrand, ...current];
    localStorage.setItem(BRANDS_KEY, JSON.stringify(updated.filter(brand => !brand.isPreset)));
    return updated;
  } catch (err) {
    console.warn('Error guardando marca personalizada:', err);
    return loadCustomBrands();
  }
};

export const deleteCustomBrand = (brandId) => {
  try {
    const updated = loadCustomBrands().filter(
      brand => brand.isPreset || brand.id !== brandId
    );
    localStorage.setItem(BRANDS_KEY, JSON.stringify(updated.filter(brand => !brand.isPreset)));
    return updated;
  } catch (err) {
    console.warn('Error eliminando marca personalizada:', err);
    return loadCustomBrands();
  }
};

export const clearSavedSettings = () => {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (err) {
    console.warn('Error limpiando localStorage:', err);
  }
};
