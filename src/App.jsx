import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CanvasPreview } from './components/CanvasPreview';

import { DEFAULT_SETTINGS } from './utils/defaultSettings';
import { 
  loadSavedSettings, 
  saveSettingsToStorage, 
  loadCustomBrands, 
  saveCustomBrand,
  clearSavedSettings 
} from './utils/storage';

import { exportSingleBanner, exportAllBannersZip } from './utils/exportUtils';

export function App() {
  const [settings, setSettings] = useState(() => loadSavedSettings());
  const [brandLogos, setBrandLogos] = useState(() => loadCustomBrands());
  const [activeView, setActiveView] = useState('ALL'); // 'ALL', '4:5', 'FEED', 'STORY'
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  // Persistir cambios de settings en localStorage automáticamente
  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  // Actualizador parcial de configuración
  const updateSettings = (newPartialSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newPartialSettings
    }));
  };

  // Agregar nueva marca personalizada PNG
  const handleAddCustomBrand = (newBrand) => {
    const updatedList = saveCustomBrand(newBrand);
    setBrandLogos(updatedList);
  };

  // Botón "Restablecer a Default"
  const handleResetDefaults = () => {
    if (window.confirm('¿Deseas restablecer todas las configuraciones, fuentes y tamaños a los valores predeterminados?')) {
      clearSavedSettings();
      setSettings(DEFAULT_SETTINGS);
    }
  };

  // Exportar solo una placa (PNG)
  const handleExportSingle = async (formatKey) => {
    await exportSingleBanner(formatKey, settings, brandLogos);
  };

  // Exportar todas las placas (.ZIP)
  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      await exportAllBannersZip(settings, brandLogos, (msg) => {
        setExportMessage(msg);
      });
    } catch (err) {
      console.error('Error exportando ZIP:', err);
      alert('Ocurrió un problema al generar el archivo ZIP.');
    } finally {
      setIsExporting(false);
      setExportMessage('');
    }
  };

  return (
    <div className="app-container">
      {/* Barra de Encabezado Superior */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onExportAll={handleExportAll}
        onResetDefaults={handleResetDefaults}
        isExporting={isExporting}
      />

      {/* Notificación Modal de Exportación ZIP */}
      {isExporting && (
        <div className="fixed inset-0 bg-black-70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border-emerald-500-40 rounded-xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-white mb-2">Generando Placas HD</h3>
            <p className="text-sm text-emerald-400 font-medium">{exportMessage || 'Procesando imágenes en 1080p/1200p...'}</p>
          </div>
        </div>
      )}

      {/* Área Principal Layout (Sidebar + Workspace Canvases) */}
      <div className="main-layout">
        <Sidebar
          settings={settings}
          updateSettings={updateSettings}
          brandLogos={brandLogos}
          onAddCustomBrand={handleAddCustomBrand}
        />

        <CanvasPreview
          activeView={activeView}
          settings={settings}
          brandLogos={brandLogos}
          onExportSingle={handleExportSingle}
        />
      </div>
    </div>
  );
}

export default App;
