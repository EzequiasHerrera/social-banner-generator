import React, { useEffect, useRef, useState } from 'react';
import { Upload, CheckSquare, Square, Image as ImageIcon, Plus, Tag, Move, RotateCcw, Trash2 } from 'lucide-react';
import { AccordionCard } from './AccordionCard';

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

const FreeLogoScaleControl = ({ value, onChange }) => {
  const safeScale = Number.isFinite(Number(value)) && Number(value) > 0
    ? Number(value)
    : 0.9;
  const percentage = safeScale * 100;
  const [draftValue, setDraftValue] = useState(String(Math.round(percentage)));
  const isEditingRef = useRef(false);

  useEffect(() => {
    if (!isEditingRef.current) setDraftValue(String(Math.round(percentage)));
  }, [percentage]);

  const commitValue = (rawValue) => {
    const numericValue = Number(rawValue);
    const normalizedPercentage = Number.isFinite(numericValue) && numericValue > 0
      ? numericValue
      : percentage;
    setDraftValue(String(normalizedPercentage));
    onChange(normalizedPercentage / 100);
  };

  return (
    <div className="slider-field mt-3">
      <div className="slider-header">
        <label>Tamaño del Logo de Marca</label>
        <span className="slider-value">{Math.round(percentage)}%</span>
      </div>
      <div className="range-number-row">
        <input
          type="range"
          min="10"
          max="500"
          step="5"
          value={Math.min(500, Math.max(10, percentage))}
          onChange={(event) => onChange(Number(event.target.value) / 100)}
          onPointerDown={(event) => event.stopPropagation()}
        />
        <div className="number-input-wrap logo-scale-input-wrap">
          <input
            type="number"
            min="1"
            step="1"
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
            aria-label="Tamaño libre del logo de marca en porcentaje"
          />
          <span>%</span>
        </div>
      </div>
      <span className="helper-text">
        El campo es libre: podés escribir 600%, 1000% o el valor que necesites.
      </span>
    </div>
  );
};

const FreeImageScaleControl = ({ value, onChange }) => {
  const safeScale = Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : 1;
  const percentage = safeScale * 100;
  const [draftValue, setDraftValue] = useState(String(Math.round(percentage)));
  const isEditingRef = useRef(false);

  useEffect(() => {
    if (!isEditingRef.current) setDraftValue(String(Math.round(percentage)));
  }, [percentage]);

  const commitValue = (rawValue) => {
    const numericValue = Number(rawValue);
    const normalized = Number.isFinite(numericValue) && numericValue > 0 ? numericValue : percentage;
    setDraftValue(String(normalized));
    onChange(normalized / 100);
  };

  return (
    <div className="slider-field mt-3">
      <div className="slider-header">
        <label>Tamaño de la imagen libre</label>
        <span className="slider-value">{Math.round(percentage)}%</span>
      </div>
      <div className="range-number-row">
        <input type="range" min="1" max="500" step="1" value={Math.min(500, Math.max(1, percentage))} onChange={(event) => onChange(Number(event.target.value) / 100)} />
        <div className="number-input-wrap logo-scale-input-wrap">
          <input
            type="number"
            min="0.01"
            step="1"
            value={draftValue}
            onFocus={() => { isEditingRef.current = true; }}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={(event) => { isEditingRef.current = false; commitValue(event.target.value); }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commitValue(event.currentTarget.value);
                event.currentTarget.blur();
              }
            }}
            aria-label="Tamaño libre de la imagen decorativa en porcentaje"
          />
          <span>%</span>
        </div>
      </div>
      <span className="helper-text">Sin límite máximo: escribí el porcentaje que necesites.</span>
    </div>
  );
};

const FORMAT_SUFFIX = { '4:5': '45', FEED: 'FEED', STORY: 'STORY' };
const BG_POSITION_PAD_LIMIT = 3000;

const BackgroundPositionPad = ({ offsetX, offsetY, onChange, onReset }) => {
  const padRef = useRef(null);
  const activePointerRef = useRef(null);
  const normalizedX = clamp(offsetX / BG_POSITION_PAD_LIMIT, -1, 1);
  const normalizedY = clamp(offsetY / BG_POSITION_PAD_LIMIT, -1, 1);

  const updateFromPointer = (event) => {
    const bounds = padRef.current?.getBoundingClientRect();
    if (!bounds?.width || !bounds?.height) return;
    const xRatio = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
    const yRatio = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
    onChange({
      x: Math.round(((xRatio * 2) - 1) * BG_POSITION_PAD_LIMIT),
      y: Math.round(((yRatio * 2) - 1) * BG_POSITION_PAD_LIMIT)
    });
  };

  const finishDrag = (event) => {
    if (activePointerRef.current !== event.pointerId) return;
    if (padRef.current?.hasPointerCapture(event.pointerId)) {
      padRef.current.releasePointerCapture(event.pointerId);
    }
    activePointerRef.current = null;
  };

  return (
    <div className="background-position-pad-wrap">
      <div
        ref={padRef}
        className="background-position-pad"
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          activePointerRef.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (activePointerRef.current !== event.pointerId) return;
          event.preventDefault();
          updateFromPointer(event);
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        role="application"
        aria-label="Control bidimensional de posición de la imagen"
      >
        <span className="position-pad-axis position-pad-axis-x" aria-hidden="true" />
        <span className="position-pad-axis position-pad-axis-y" aria-hidden="true" />
        <span
          className="position-pad-dot"
          style={{
            left: `${50 + (normalizedX * 50)}%`,
            top: `${50 + (normalizedY * 50)}%`
          }}
          aria-hidden="true"
        />
      </div>
      <div className="position-pad-footer">
        <span>X {offsetX} · Y {offsetY}</span>
        <button type="button" className="position-reset-button" onClick={onReset}>
          <RotateCcw size={13} />
          Centrar
        </button>
      </div>
    </div>
  );
};

const BgPositionControls = ({ formatKey, label, settings, updateSettings }) => {
  const suffix = FORMAT_SUFFIX[formatKey];
  const offsetX = settings[`bgOffsetX_${suffix}`] ?? 0;
  const offsetY = settings[`bgOffsetY_${suffix}`] ?? 0;
  const scale = settings[`bgScale_${suffix}`] ?? 1;

  return (
    <div className="bg-position-controls">
      <span className="position-controls-label">{label}</span>
      <BackgroundPositionPad
        offsetX={offsetX}
        offsetY={offsetY}
        onChange={({ x, y }) => updateSettings({
          [`bgOffsetX_${suffix}`]: x,
          [`bgOffsetY_${suffix}`]: y
        })}
        onReset={() => updateSettings({
          [`bgOffsetX_${suffix}`]: 0,
          [`bgOffsetY_${suffix}`]: 0
        })}
      />
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
      <NumericRangeControl label="Posición X" value={offsetX} min={-10000} max={10000} unit=" px" onChange={(nextValue) => updateSettings({ [`brandLogoOffsetX_${suffix}`]: nextValue })} />
      <NumericRangeControl label="Posición Y" value={offsetY} min={-10000} max={10000} unit=" px" className="mt-3" onChange={(nextValue) => updateSettings({ [`brandLogoOffsetY_${suffix}`]: nextValue })} />
    </div>
  );
};

const FreeImagePositionControls = ({ formatKey, label, settings, updateSettings }) => {
  const suffix = FORMAT_SUFFIX[formatKey];
  const offsetX = settings[`freeImageOffsetX_${suffix}`] ?? 0;
  const offsetY = settings[`freeImageOffsetY_${suffix}`] ?? 0;

  return (
    <div className="bg-position-controls">
      <span className="position-controls-label">{label}</span>
      <NumericRangeControl label="Posición X" value={offsetX} min={-10000} max={10000} unit=" px" onChange={(nextValue) => updateSettings({ [`freeImageOffsetX_${suffix}`]: nextValue })} />
      <NumericRangeControl label="Posición Y" value={offsetY} min={-10000} max={10000} unit=" px" className="mt-3" onChange={(nextValue) => updateSettings({ [`freeImageOffsetY_${suffix}`]: nextValue })} />
      <button type="button" className="position-reset-button mt-2" onClick={() => updateSettings({ [`freeImageOffsetX_${suffix}`]: 0, [`freeImageOffsetY_${suffix}`]: 0 })}>
        <RotateCcw size={13} /> Centrar
      </button>
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
  onAddCustomBrand,
  onDeleteCustomBrand
}) => {
  const fileInputRef45 = useRef(null);
  const fileInputRefFeed = useRef(null);
  const fileInputRefStory = useRef(null);
  const brandInputRef = useRef(null);
  const freeImageInputRef = useRef(null);
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

  const handleFreeImageUpload = (file) => {
    if (!file) return;
    if (!isImageFile(file)) {
      alert('El archivo seleccionado no es una imagen compatible.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => updateSettings({
      freeImageUrl: event.target.result,
      showFreeImage: true,
      freeImageScale: 1,
      freeImageOffsetX_45: 0,
      freeImageOffsetY_45: 0,
      freeImageOffsetX_FEED: 0,
      freeImageOffsetY_FEED: 0,
      freeImageOffsetX_STORY: 0,
      freeImageOffsetY_STORY: 0
    });
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
      <AccordionCard
        title="Logo de Marca (Catálogo / PNG)"
        icon={<Tag size={16} className="text-emerald-400" />}
        className="control-group brand-control-group"
      >

        <label className="checkbox-label" onClick={() => updateSettings({ showBrandLogo: settings.showBrandLogo === false })}>
          {settings.showBrandLogo !== false ? (
            <CheckSquare size={18} className="text-emerald-400" />
          ) : (
            <Square size={18} className="text-gray-500" />
          )}
          <span className="font-medium text-sm">Mostrar Logo de Marca</span>
        </label>

        {/* Lista de Selección de Marcas */}
        <div className="brand-grid">
          {brandLogos.map((brand) => {
            const isSelected = settings.selectedBrandId === brand.id;
            return (
              <div key={brand.id} className={`brand-card ${isSelected ? 'selected' : ''}`}>
                <button type="button" className="brand-card-select" onClick={() => updateSettings({ selectedBrandId: brand.id })}>
                  <div className="brand-card-preview"><img src={brand.url} alt={brand.name} /></div>
                  <span className="brand-card-name">{brand.name}</span>
                </button>
                {!brand.isPreset && (
                  <button type="button" className="brand-card-delete" onClick={() => onDeleteCustomBrand(brand.id)} title={`Eliminar ${brand.name}`} aria-label={`Eliminar ${brand.name}`}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
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

        <div className="brand-settings-block">
          <FreeLogoScaleControl
            value={settings.brandLogoScale}
            onChange={(nextValue) => updateSettings({ brandLogoScale: nextValue })}
          />

          <NumericRangeControl
            label="Espacio / Gap sobre el Producto"
            value={settings.brandLogoGap ?? 8}
            min={0}
            max={500}
            unit=" px"
            className="mt-3"
            onChange={(nextValue) => updateSettings({ brandLogoGap: nextValue })}
          />
        </div>

        <AccordionCard
          title="Posición Libre del Logo de Marca"
          icon={<Move size={16} className="text-emerald-400" />}
          className="mt-3"
        >
          <span className="helper-text">
            Arrastrá directamente el logo en cada vista para moverlo libremente en X/Y. Cada formato conserva su propia posición; también podés escribir el valor exacto.
          </span>
          <BrandLogoPositionControls formatKey="4:5" label="Formato 4:5 · 1080 × 1350" settings={settings} updateSettings={updateSettings} />
          <BrandLogoPositionControls formatKey="FEED" label="Formato FEED · 1200 × 1200" settings={settings} updateSettings={updateSettings} />
          <BrandLogoPositionControls formatKey="STORY" label="Formato STORY · 1080 × 1920" settings={settings} updateSettings={updateSettings} />
        </AccordionCard>

      </AccordionCard>

      <AccordionCard
        title="Imagen Libre / Detalle"
        icon={<ImageIcon size={16} className="text-emerald-400" />}
        className="control-group free-image-control-group mt-3"
      >
        <span className="helper-text">Cargá un sticker, sello o detalle y arrastralo directamente en cada formato. La posición se guarda por formato.</span>
        <div className={`upload-drop-zone brand-upload-drop-zone mt-3 ${activeDropZone === 'free-image' ? 'is-dragging' : ''}`} {...getDropZoneProps('free-image', handleFreeImageUpload)}>
          <input
            type="file"
            ref={freeImageInputRef}
            accept="image/*"
            className="hidden"
            onChange={(event) => { handleFreeImageUpload(event.target.files[0]); event.target.value = ''; }}
          />
          <button type="button" className="btn-upload-brand" onClick={() => freeImageInputRef.current?.click()}>
            <Plus size={16} /><span>{settings.freeImageUrl ? 'Reemplazar imagen libre' : 'Agregar imagen libre'}</span>
          </button>
          <span className="drop-zone-hint">o arrastrá una imagen acá</span>
        </div>

        {settings.freeImageUrl && (
          <>
            <div className="free-image-preview-row">
              <img src={settings.freeImageUrl} alt="Detalle cargado" />
              <label className="checkbox-label" onClick={() => updateSettings({ showFreeImage: settings.showFreeImage === false })}>
                {settings.showFreeImage !== false ? <CheckSquare size={18} className="text-emerald-400" /> : <Square size={18} className="text-gray-500" />}
                <span>Mostrar</span>
              </label>
              <button type="button" className="btn-danger-compact" onClick={() => updateSettings({ freeImageUrl: null })}><Trash2 size={14} /> Quitar</button>
            </div>
            <FreeImageScaleControl value={settings.freeImageScale} onChange={(freeImageScale) => updateSettings({ freeImageScale })} />
            <AccordionCard title="Posición de la Imagen Libre" icon={<Move size={16} className="text-emerald-400" />} className="mt-3">
              <FreeImagePositionControls formatKey="4:5" label="Formato 4:5 · 1080 × 1350" settings={settings} updateSettings={updateSettings} />
              <FreeImagePositionControls formatKey="FEED" label="Formato FEED · 1200 × 1200" settings={settings} updateSettings={updateSettings} />
              <FreeImagePositionControls formatKey="STORY" label="Formato STORY · 1080 × 1920" settings={settings} updateSettings={updateSettings} />
            </AccordionCard>
          </>
        )}
      </AccordionCard>

      <AccordionCard
        title="Posición del Conjunto Creativo"
        icon={<Move size={16} className="text-emerald-400" />}
        className="control-group creative-stack-control-group mt-3"
      >
        <span className="helper-text">
          Mové juntos el logo de marca, el título y la placa de precio. También podés arrastrar directamente el título o la placa; el movimiento queda limitado al eje Y.
        </span>
        <CreativeStackPositionControls formatKey="4:5" label="Formato 4:5 · 1080 × 1350" settings={settings} updateSettings={updateSettings} />
        <CreativeStackPositionControls formatKey="FEED" label="Formato FEED · 1200 × 1200" settings={settings} updateSettings={updateSettings} />
        <CreativeStackPositionControls formatKey="STORY" label="Formato STORY · 1080 × 1920" settings={settings} updateSettings={updateSettings} />
      </AccordionCard>

      <hr className="divider brand-background-divider" />

      {/* 2. GESTIÓN DE IMÁGENES DE FONDO */}
      <AccordionCard
        title="Imágenes de Fondo por Formato"
        icon={<ImageIcon size={16} className="text-emerald-400" />}
        className="control-group background-control-group"
        defaultOpen
      >

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
            <AccordionCard
              title="Posición y Escala de Imagen"
              icon={<Move size={16} className="text-emerald-400" />}
              className="mt-3"
            >
              <span className="helper-text">
                La imagen puede ser la misma, pero el encuadre se guarda de manera independiente en cada formato. El programa corrige automáticamente la posición para que nunca queden bordes vacíos.
              </span>
              <BgPositionControls formatKey="4:5" label="Formato 4:5 · 1080 × 1350" settings={settings} updateSettings={updateSettings} />
              <BgPositionControls formatKey="FEED" label="Formato FEED · 1200 × 1200" settings={settings} updateSettings={updateSettings} />
              <BgPositionControls formatKey="STORY" label="Formato STORY · 1080 × 1920" settings={settings} updateSettings={updateSettings} />
            </AccordionCard>
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
            <AccordionCard title="Encuadre 4:5" icon={<Move size={16} className="text-emerald-400" />} className="mt-2">
              <BgPositionControls formatKey="4:5" label="Formato 4:5 · 1080 × 1350" settings={settings} updateSettings={updateSettings} />
            </AccordionCard>

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
            <AccordionCard title="Encuadre FEED" icon={<Move size={16} className="text-emerald-400" />} className="mt-2">
              <BgPositionControls formatKey="FEED" label="Formato FEED · 1200 × 1200" settings={settings} updateSettings={updateSettings} />
            </AccordionCard>

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
            <AccordionCard title="Encuadre STORY" icon={<Move size={16} className="text-emerald-400" />} className="mt-2">
              <BgPositionControls formatKey="STORY" label="Formato STORY · 1080 × 1920" settings={settings} updateSettings={updateSettings} />
            </AccordionCard>
          </div>
        )}
      </AccordionCard>
    </div>
  );
};
