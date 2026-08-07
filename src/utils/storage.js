// Gestor de persistencia en localStorage para configuraciones y marcas personalizadas

const SETTINGS_KEY = 'kt_banner_generator_settings_v1';
const BRANDS_KEY = 'kt_banner_generator_brands_v1';

import { DEFAULT_SETTINGS, INITIAL_BRAND_LOGOS } from './defaultSettings';

export const loadSavedSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_SETTINGS, ...parsed };
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
    localStorage.setItem(BRANDS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Error guardando marca personalizada:', err);
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
