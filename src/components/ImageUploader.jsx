import React, { useRef } from 'react';
import { Upload, CheckSquare, Square, Image as ImageIcon, Plus, Tag, Move } from 'lucide-react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const NumericRangeControl = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  className = ''
}) => {
  const commitValue = (rawValue) => {
    if (rawValue === '') return;

    const numericValue = Number(rawValue);
    if (Number.isFinite(numericValue)) {
      onChange(numericValue);
    }
  };

  const normalizeValue = (rawValue) => {
    const numericValue = Number(rawValue);
    onChange(clamp(Number.isFinite(numericValue) ? numericValue : value, min, max));
  };

  return (
    <div className={`slider-field ${className}`.trim()}>
      <div className="slider-header">
        <label>{label}</label>
        <span className="slider-value">
          {step < 1 ? Number(value).toFixed(2) : value}{unit}
        </span>
      </div>
      <div className="range-number-row">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <div className="number-input-wrap">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => commitValue(event.target.value)}
            onBlur={(event) => normalizeValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                normalizeValue(event.currentTarget.value);
                event.currentTarget.blur();
              }
            }}
            aria-label={`${label}: valor manual`}
          />
          <span>{unit}</span>
        </div>
      </div>
    </div>
  );
};

export const ImageUploader = ({
  settings,
  updateSettings,
  brandLogos,
  onAddCustomBrand
}) => {
  const fileInputRef45 = useRef(null);
  const fileInputRefFeed = useRef(null);
  const fileInputRefStory = useRef(null);
  const brandInputRef = useRef(null);

  // Manejador de carga de imagen de fondo por formato
  const handleBgUpload = (formatKey, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (settings.syncBackgrounds) {
        updateSettings({
          backgrounds: {
            '4:5': dataUrl,
            'FEED': dataUrl,
            'STORY': dataUrl
          }
        });
      } else {
        updateSettings({
          backgrounds: {
            ...settings.backgrounds,
            [formatKey]: dataUrl
          }
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Manejador de carga de nuevo logo de marca en PNG
  const handleBrandUpload = (file) => {
    if (!file) return;
    if (file.type !== 'image/png' && !file.type.includes('png') && !file.type.includes('svg')) {
      alert('Se recomienda subir archivos PNG con fondo transparente.');
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const brandName = file.name.replace(/\.[^/.]+$/, "").toUpperCase();
      const newBrand = {
        id: `custom_${Date.now()}`,
        name: brandName || 'Marca Personalizada',
        url: dataUrl,
        isPreset: false
      };
      onAddCustomBrand(newBrand);
      updateSettings({ selectedBrandId: newBrand.id });
    };
    reader.readAsDataURL(file);
  };

  // Helper para renderizar controles de posición/escala de imagen
  const BgPositionControls = ({ formatKey, label }) => {
    const keyMap = { '4:5': '45', 'FEED': 'FEED', 'STORY': 'STORY' };
    const suffix = keyMap[formatKey];
    const offsetX = settings[`bgOffsetX_${suffix}`] || 0;
    const offsetY = settings[`bgOffsetY_${suffix}`] || 0;
    const scale = settings[`bgScale_${suffix}`] || 1.0;

    return (
      <div className="bg-position-controls">
        <span className="position-controls-label">{label}</span>
        <NumericRangeControl
          label="Posición X"
          value={offsetX}
          min={-500}
          max={500}
          unit=" px"
          onChange={(value) => updateSettings({ [`bgOffsetX_${suffix}`]: value })}
        />
        <NumericRangeControl
          label="Posición Y"
          value={offsetY}
          min={-500}
          max={500}
          unit=" px"
          className="mt-3"
          onChange={(value) => updateSettings({ [`bgOffsetY_${suffix}`]: value })}
        />
        <NumericRangeControl
          label="Escala"
          value={scale}
          min={0.5}
          max={3}
          step={0.01}
          unit="x"
          className="mt-3"
          onChange={(value) => updateSettings({ [`bgScale_${suffix}`]: value })}
        />
      </div>
    );
  };

  return (
    <div className="uploader-section">
      {/* 1. SELECCIÓN Y CARGA DE MARCA */}
      <div className="control-group">
        <div className="control-header">
          <label className="control-label">
            <Tag size={16} className="text-emerald-400" />
            <span>Logo de Marca (Catálogo / PNG)</span>
          </label>
        </div>

        {/* Lista de Selección de Marcas */}
        <div className="brand-grid">
          {brandLogos.map((brand) => {
            const isSelected = settings.selectedBrandId === brand.id;
            return (
              <button
                key={brand.id}
                type="button"
                className={`brand-card ${isSelected ? 'selected' : ''}`}
                onClick={() => updateSettings({ selectedBrandId: brand.id })}
              >
                <div className="brand-card-preview">
                  <img src={brand.url} alt={brand.name} />
                </div>
                <span className="brand-card-name">{brand.name}</span>
              </button>
            );
          })}
        </div>

        {/* Botón para subir nueva marca PNG */}
        <div className="mt-3">
          <input
            type="file"
            ref={brandInputRef}
            accept="image/png,image/svg+xml"
            className="hidden"
            onChange={(e) => handleBrandUpload(e.target.files[0])}
          />
          <button
            type="button"
            className="btn-upload-brand"
            onClick={() => brandInputRef.current?.click()}
          >
            <Plus size={16} />
            <span>Agregar nueva marca PNG</span>
          </button>
        </div>
      </div>

      <hr className="divider" />

      {/* 2. GESTIÓN DE IMÁGENES DE FONDO */}
      <div className="control-group">
        <div className="control-header">
          <label className="control-label">
            <ImageIcon size={16} className="text-emerald-400" />
            <span>Imágenes de Fondo por Formato</span>
          </label>
        </div>

        {/* Checkbox Sincronización Global de Imagen de Fondo */}
        <label className="checkbox-label" onClick={() => updateSettings({ syncBackgrounds: !settings.syncBackgrounds })}>
          {settings.syncBackgrounds ? (
            <CheckSquare size={18} className="text-emerald-400" />
          ) : (
            <Square size={18} className="text-gray-500" />
          )}
          <span className="font-medium text-sm">
            Usar la misma imagen para todos los formatos
          </span>
        </label>

        {/* Carga de Fondos Independientes o Sincronizados */}
        {settings.syncBackgrounds ? (
          <>
            <div className="bg-uploader-card mt-3">
              <input
                type="file"
                ref={fileInputRef45}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleBgUpload('4:5', e.target.files[0])}
              />
              <div className="uploader-info">
                <span className="uploader-title">Fondo Único Global</span>
                <span className="uploader-desc">Se aplicará automáticamente a 4:5, FEED y STORY</span>
              </div>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => fileInputRef45.current?.click()}
              >
                <Upload size={14} />
                <span>Cargar Imagen</span>
              </button>
            </div>

            {/* Controles de posición/escala globales */}
            <div className="control-card mt-3">
              <div className="card-header">
                <Move size={16} className="text-emerald-400" />
                <h3>Posición y Escala de Imagen</h3>
              </div>
              <span className="helper-text">
                La imagen puede ser la misma, pero el encuadre se guarda de manera independiente en cada formato.
              </span>
              <BgPositionControls formatKey="4:5" label="Formato 4:5 · 1080 × 1350" />
              <BgPositionControls formatKey="FEED" label="Formato FEED · 1200 × 1200" />
              <BgPositionControls formatKey="STORY" label="Formato STORY · 1080 × 1920" />
            </div>
          </>
        ) : (
          <div className="bg-uploader-grid mt-3">
            {/* 4:5 */}
            <div className="bg-uploader-card">
              <input
                type="file"
                ref={fileInputRef45}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleBgUpload('4:5', e.target.files[0])}
              />
              <div className="uploader-info">
                <span className="uploader-title">Fondo 4:5</span>
                <span className="uploader-desc">1080 x 1350 px</span>
              </div>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => fileInputRef45.current?.click()}
              >
                <Upload size={14} />
                <span>Cargar</span>
              </button>
            </div>
            <div className="control-card mt-2">
              <BgPositionControls formatKey="4:5" label="Formato 4:5 · 1080 × 1350" />
            </div>

            {/* FEED */}
            <div className="bg-uploader-card mt-3">
              <input
                type="file"
                ref={fileInputRefFeed}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleBgUpload('FEED', e.target.files[0])}
              />
              <div className="uploader-info">
                <span className="uploader-title">Fondo FEED</span>
                <span className="uploader-desc">1200 x 1200 px</span>
              </div>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => fileInputRefFeed.current?.click()}
              >
                <Upload size={14} />
                <span>Cargar</span>
              </button>
            </div>
            <div className="control-card mt-2">
              <BgPositionControls formatKey="FEED" label="Formato FEED · 1200 × 1200" />
            </div>

            {/* STORY */}
            <div className="bg-uploader-card mt-3">
              <input
                type="file"
                ref={fileInputRefStory}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleBgUpload('STORY', e.target.files[0])}
              />
              <div className="uploader-info">
                <span className="uploader-title">Fondo STORY</span>
                <span className="uploader-desc">1080 x 1920 px</span>
              </div>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => fileInputRefStory.current?.click()}
              >
                <Upload size={14} />
                <span>Cargar</span>
              </button>
            </div>
            <div className="control-card mt-2">
              <BgPositionControls formatKey="STORY" label="Formato STORY · 1080 × 1920" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
