import React, { useEffect, useRef, useState } from 'react';
import { Upload, CheckSquare, Square, Image as ImageIcon, Plus, Tag, Move } from 'lucide-react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const isImageFile = (file) => Boolean(
  file && (
    file.type?.startsWith('image/') ||
    /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(file.name || '')
  )
);

const isBrandFile = (file) => Boolean(
  file && (
    ['image/png', 'image/svg+xml'].includes(file.type) ||
    /\.(png|svg)$/i.test(file.name || '')
  )
);

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
  const [draftValue, setDraftValue] = useState(String(value));
  const isEditingRef = useRef(false);

  useEffect(() => {
    if (!isEditingRef.current) setDraftValue(String(value));
  }, [value]);

  const commitValue = (rawValue) => {
    const numericValue = Number(rawValue);
    const normalizedValue = clamp(
      rawValue !== '' && Number.isFinite(numericValue) ? numericValue : Number(value),
      min,
      max
    );
    setDraftValue(String(normalizedValue));
    onChange(normalizedValue);
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
          onPointerDown={(event) => event.stopPropagation()}
        />
        <div className="number-input-wrap">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={draftValue}
            onFocus={() => { isEditingRef.current = true; }}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={(event) => {
              isEditingRef.current = false;
              commitValue(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commitValue(event.currentTarget.value);
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

const FORMAT_SUFFIX = { '4:5': '45', FEED: 'FEED', STORY: 'STORY' };

const BgPositionControls = ({ formatKey, label, settings, updateSettings }) => {
  const suffix = FORMAT_SUFFIX[formatKey];
  const offsetX = settings[`bgOffsetX_${suffix}`] ?? 0;
  const offsetY = settings[`bgOffsetY_${suffix}`] ?? 0;
  const scale = settings[`bgScale_${suffix}`] ?? 1;

  return (
    <div className="bg-position-controls">
      <span className="position-controls-label">{label}</span>
      <NumericRangeControl label="Posición X" value={offsetX} min={-500} max={500} unit=" px" onChange={(nextValue) => updateSettings({ [`bgOffsetX_${suffix}`]: nextValue })} />
      <NumericRangeControl label="Posición Y" value={offsetY} min={-500} max={500} unit=" px" className="mt-3" onChange={(nextValue) => updateSettings({ [`bgOffsetY_${suffix}`]: nextValue })} />
      <NumericRangeControl label="Escala" value={Math.max(1, scale)} min={1} max={3} step={0.01} unit="x" className="mt-3" onChange={(nextValue) => updateSettings({ [`bgScale_${suffix}`]: nextValue })} />
    </div>
  );
};

const BrandLogoPositionControls = ({ formatKey, label, settings, updateSettings }) => {
  const suffix = FORMAT_SUFFIX[formatKey];
  const offsetX = settings[`brandLogoOffsetX_${suffix}`] ?? 0;
  const offsetY = settings[`brandLogoOffsetY_${suffix}`] ?? 0;

  return (
    <div className="bg-position-controls">
      <span className="position-controls-label">{label}</span>
      <NumericRangeControl label="Posición X" value={offsetX} min={-1200} max={1200} unit=" px" onChange={(nextValue) => updateSettings({ [`brandLogoOffsetX_${suffix}`]: nextValue })} />
      <NumericRangeControl label="Posición Y" value={offsetY} min={-1800} max={1800} unit=" px" className="mt-3" onChange={(nextValue) => updateSettings({ [`brandLogoOffsetY_${suffix}`]: nextValue })} />
    </div>
  );
};

const CreativeStackPositionControls = ({ formatKey, label, settings, updateSettings }) => {
  const suffix = FORMAT_SUFFIX[formatKey];
  const offsetY = settings[`creativeStackOffsetY_${suffix}`] ?? 0;

  return (
    <div className="bg-position-controls">
      <span className="position-controls-label">{label}</span>
      <NumericRangeControl
        label="Mover conjunto arriba / abajo"
        value={offsetY}
        min={-1800}
        max={1800}
        unit=" px"
        onChange={(nextValue) => updateSettings({ [`creativeStackOffsetY_${suffix}`]: nextValue })}
      />
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
  const dragDepthRef = useRef({});
  const [activeDropZone, setActiveDropZone] = useState(null);

  // Manejador de carga de imagen de fondo por formato
  const handleBgUpload = (formatKey, file) => {
    if (!file) return;
    if (!isImageFile(file)) {
      alert('El archivo seleccionado no es una imagen compatible.');
      return;
    }

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
    if (!isBrandFile(file)) {
      alert('El logo debe ser un archivo PNG o SVG.');
      return;
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

  const getDropZoneProps = (zoneId, onFileDrop) => ({
    onDragEnter: (event) => {
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current[zoneId] = (dragDepthRef.current[zoneId] || 0) + 1;
      setActiveDropZone(zoneId);
    },
    onDragOver: (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'copy';
    },
    onDragLeave: (event) => {
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current[zoneId] = Math.max(
        0,
        (dragDepthRef.current[zoneId] || 1) - 1
      );
      if (dragDepthRef.current[zoneId] === 0) {
        setActiveDropZone((currentZone) => (
          currentZone === zoneId ? null : currentZone
        ));
      }
    },
    onDrop: (event) => {
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current[zoneId] = 0;
      setActiveDropZone(null);

      const droppedFile = Array.from(event.dataTransfer.files || []).find(isImageFile);
      if (!droppedFile) {
        alert('Soltá un archivo de imagen compatible.');
        return;
      }
      onFileDrop(droppedFile);
    }
  });

  return (
    <div className="uploader-section">
      {/* 1. SELECCIÓN Y CARGA DE MARCA */}
      <div className="control-group brand-control-group">
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
        <div
          className={`upload-drop-zone brand-upload-drop-zone mt-3 ${activeDropZone === 'brand' ? 'is-dragging' : ''}`}
          {...getDropZoneProps('brand', handleBrandUpload)}
        >
          <input
            type="file"
            ref={brandInputRef}
            accept="image/png,image/svg+xml"
            className="hidden"
            onChange={(event) => {
              handleBrandUpload(event.target.files[0]);
              event.target.value = '';
            }}
          />
          <button
            type="button"
            className="btn-upload-brand"
            onClick={() => brandInputRef.current?.click()}
          >
            <Plus size={16} />
            <span>Agregar nueva marca PNG</span>
          </button>
          <span className="drop-zone-hint">o arrastrá un PNG/SVG acá</span>
        </div>

        <div className="control-card mt-3">
          <div className="card-header">
            <Move size={16} className="text-emerald-400" />
            <h3>Posición Libre del Logo de Marca</h3>
          </div>
          <span className="helper-text">
            Mové el logo desde su ubicación automática. Cada formato conserva su propia posición; también podés escribir el valor exacto.
          </span>
          <BrandLogoPositionControls formatKey="4:5" label="Formato 4:5 · 1080 × 1350" settings={settings} updateSettings={updateSettings} />
          <BrandLogoPositionControls formatKey="FEED" label="Formato FEED · 1200 × 1200" settings={settings} updateSettings={updateSettings} />
          <BrandLogoPositionControls formatKey="STORY" label="Formato STORY · 1080 × 1920" settings={settings} updateSettings={updateSettings} />
        </div>

        <div className="control-card mt-3">
          <div className="card-header">
            <Move size={16} className="text-emerald-400" />
            <h3>Posición del Conjunto Creativo</h3>
          </div>
          <span className="helper-text">
            Mueve juntos el logo de marca, el título y la placa de precio. Cada formato conserva su propia altura.
          </span>
          <CreativeStackPositionControls formatKey="4:5" label="Formato 4:5 · 1080 × 1350" settings={settings} updateSettings={updateSettings} />
          <CreativeStackPositionControls formatKey="FEED" label="Formato FEED · 1200 × 1200" settings={settings} updateSettings={updateSettings} />
          <CreativeStackPositionControls formatKey="STORY" label="Formato STORY · 1080 × 1920" settings={settings} updateSettings={updateSettings} />
        </div>
      </div>

      <hr className="divider brand-background-divider" />

      {/* 2. GESTIÓN DE IMÁGENES DE FONDO */}
      <div className="control-group background-control-group">
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
            <div
              className={`bg-uploader-card upload-drop-zone mt-3 ${activeDropZone === 'background-global' ? 'is-dragging' : ''}`}
              {...getDropZoneProps('background-global', (file) => handleBgUpload('4:5', file))}
            >
              <input
                type="file"
                ref={fileInputRef45}
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  handleBgUpload('4:5', event.target.files[0]);
                  event.target.value = '';
                }}
              />
              <div className="uploader-info">
                <span className="uploader-title">Fondo Único Global</span>
                <span className="uploader-desc">Arrastrá una imagen acá · se aplicará a los 3 formatos</span>
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
                La imagen puede ser la misma, pero el encuadre se guarda de manera independiente en cada formato. El programa corrige automáticamente la posición para que nunca queden bordes vacíos.
              </span>
              <BgPositionControls formatKey="4:5" label="Formato 4:5 · 1080 × 1350" settings={settings} updateSettings={updateSettings} />
              <BgPositionControls formatKey="FEED" label="Formato FEED · 1200 × 1200" settings={settings} updateSettings={updateSettings} />
              <BgPositionControls formatKey="STORY" label="Formato STORY · 1080 × 1920" settings={settings} updateSettings={updateSettings} />
            </div>
          </>
        ) : (
          <div className="bg-uploader-grid mt-3">
            {/* 4:5 */}
            <div
              className={`bg-uploader-card upload-drop-zone ${activeDropZone === 'background-45' ? 'is-dragging' : ''}`}
              {...getDropZoneProps('background-45', (file) => handleBgUpload('4:5', file))}
            >
              <input
                type="file"
                ref={fileInputRef45}
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  handleBgUpload('4:5', event.target.files[0]);
                  event.target.value = '';
                }}
              />
              <div className="uploader-info">
                <span className="uploader-title">Fondo 4:5</span>
                <span className="uploader-desc">1080 x 1350 px · arrastrá acá</span>
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
              <BgPositionControls formatKey="4:5" label="Formato 4:5 · 1080 × 1350" settings={settings} updateSettings={updateSettings} />
            </div>

            {/* FEED */}
            <div
              className={`bg-uploader-card upload-drop-zone mt-3 ${activeDropZone === 'background-feed' ? 'is-dragging' : ''}`}
              {...getDropZoneProps('background-feed', (file) => handleBgUpload('FEED', file))}
            >
              <input
                type="file"
                ref={fileInputRefFeed}
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  handleBgUpload('FEED', event.target.files[0]);
                  event.target.value = '';
                }}
              />
              <div className="uploader-info">
                <span className="uploader-title">Fondo FEED</span>
                <span className="uploader-desc">1200 x 1200 px · arrastrá acá</span>
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
              <BgPositionControls formatKey="FEED" label="Formato FEED · 1200 × 1200" settings={settings} updateSettings={updateSettings} />
            </div>

            {/* STORY */}
            <div
              className={`bg-uploader-card upload-drop-zone mt-3 ${activeDropZone === 'background-story' ? 'is-dragging' : ''}`}
              {...getDropZoneProps('background-story', (file) => handleBgUpload('STORY', file))}
            >
              <input
                type="file"
                ref={fileInputRefStory}
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  handleBgUpload('STORY', event.target.files[0]);
                  event.target.value = '';
                }}
              />
              <div className="uploader-info">
                <span className="uploader-title">Fondo STORY</span>
                <span className="uploader-desc">1080 x 1920 px · arrastrá acá</span>
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
              <BgPositionControls formatKey="STORY" label="Formato STORY · 1080 × 1920" settings={settings} updateSettings={updateSettings} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
