import React, { useState } from 'react';
import { Type, DollarSign, Sliders, Image as ImageIcon, Sparkles, Layers, MoveHorizontal, CheckSquare, Square } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { AccordionCard } from './AccordionCard';

export const Sidebar = ({
  settings,
  updateSettings,
  brandLogos,
  onAddCustomBrand
}) => {
  const [activeTab, setActiveTab] = useState('CONTENT'); // 'CONTENT', 'BRAND_BG', 'STYLE'

  // Helper para renderizar checkbox toggle
  const CheckToggle = ({ checked, onChange, label }) => (
    <label className="checkbox-label" onClick={onChange}>
      {checked ? (
        <CheckSquare size={18} className="text-emerald-400" />
      ) : (
        <Square size={18} className="text-gray-500" />
      )}
      <span className="font-medium text-sm">{label}</span>
    </label>
  );

  return (
    <aside className="sidebar-container">
      {/* Pestañas de Navegación del Panel */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'CONTENT' ? 'active' : ''}`}
          onClick={() => setActiveTab('CONTENT')}
        >
          <Type size={16} />
          <span>Textos & Precio</span>
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'BRAND_BG' ? 'active' : ''}`}
          onClick={() => setActiveTab('BRAND_BG')}
        >
          <ImageIcon size={16} />
          <span>Marcas & Fondos</span>
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'STYLE' ? 'active' : ''}`}
          onClick={() => setActiveTab('STYLE')}
        >
          <Sliders size={16} />
          <span>Ajustes & Medidas</span>
        </button>
      </div>

      <div className="sidebar-content">
        {/* TAB 1: TEXTOS Y PRECIO */}
        {activeTab === 'CONTENT' && (
          <div className="tab-pane">
            {/* 1. Encabezado Superior */}
            <AccordionCard
              title="Encabezado Superior"
              icon={<Sparkles size={16} className="text-emerald-400" />}
              defaultOpen
            >
              
              <div className="input-field">
                <label>Variante de Encabezado</label>
                <select
                  value={settings.headerVariant}
                  onChange={(e) => updateSettings({ headerVariant: e.target.value })}
                >
                  <option value="GASTRO">KITCHENTOOLS | GASTRONOMÍA</option>
                  <option value="HOGAR">KITCHENTOOLS | HOGAR</option>
                </select>
              </div>

              <div className="input-field">
                <label>Posición del Encabezado</label>
                <select
                  value={settings.headerPosition}
                  onChange={(e) => updateSettings({ headerPosition: e.target.value })}
                >
                  <option value="TOP">Superior (centrado)</option>
                  <option value="BOTTOM">Inferior (debajo de placa)</option>
                </select>
              </div>

              <div className="slider-field">
                <div className="slider-header">
                  <label>Tamaño de Fuente Encabezado</label>
                  <span className="slider-value">{settings.headerFontSize} px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="144"
                  value={settings.headerFontSize}
                  onChange={(e) => updateSettings({ headerFontSize: Number(e.target.value) })}
                />
              </div>

              <div className="slider-field mt-3">
                <div className="slider-header">
                  <label>Margen al Borde</label>
                  <span className="slider-value">{settings.headerMargin} px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={settings.headerMargin}
                  onChange={(e) => updateSettings({ headerMargin: Number(e.target.value) })}
                />
              </div>

              <span className="helper-text">
                * El encabezado usa siempre CocoSharp ExtraBold.
              </span>

              <CheckToggle
                checked={settings.showHeader}
                onChange={() => updateSettings({ showHeader: !settings.showHeader })}
                label="Mostrar Encabezado"
              />

              <CheckToggle
                checked={settings.headerShadow !== false}
                onChange={() => updateSettings({ headerShadow: settings.headerShadow === false })}
                label="Encabezado con sombra"
              />
            </AccordionCard>

            {/* 2. Nombre del Producto */}
            <AccordionCard
              title="Nombre del Producto"
              icon={<Type size={16} className="text-emerald-400" />}
              className="mt-4"
            >

              <div className="input-field">
                <label>Texto del Producto</label>
                <textarea
                  rows="4"
                  value={settings.productName}
                  onChange={(e) => updateSettings({ productName: e.target.value })}
                  placeholder={'Freidora de Aire\nIndustrial 10L'}
                />
                <span className="helper-text">
                  * Presioná ENTER para definir cada línea. El programa no dividirá el texto ni reducirá su tamaño automáticamente.
                  El carácter + adopta automáticamente el relleno y bisel verde de la placa GASTRO.
                  Para aplicar ese estilo a un texto sin cambiar su tipografía, escribilo entre arrobas: @INCREÍBLE@.
                </span>
              </div>

              <div className="slider-field">
                <div className="slider-header">
                  <label>Tamaño de Fuente Producto</label>
                  <span className="slider-value">{settings.productFontSize} px</span>
                </div>
                <input
                  type="range"
                  min="28"
                  max="180"
                  value={settings.productFontSize}
                  onChange={(e) => updateSettings({ productFontSize: Number(e.target.value) })}
                />
              </div>

              <div className="slider-field mt-3">
                <div className="slider-header">
                  <label>Espaciado de Línea</label>
                  <span className="slider-value">{settings.productLineHeight?.toFixed(2) || '0.80'}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.0"
                  step="0.05"
                  value={settings.productLineHeight || 0.80}
                  onChange={(e) => updateSettings({ productLineHeight: Number(e.target.value) })}
                />
              </div>

            </AccordionCard>

            {/* 3. Valor de Precio */}
            <AccordionCard
              title="Texto de Precio"
              icon={<DollarSign size={16} className="text-emerald-400" />}
              className="mt-4"
            >

              <div className="input-field">
                <label>Precio del Producto</label>
                <input
                  type="text"
                  value={settings.priceText}
                  onChange={(e) => updateSettings({ priceText: e.target.value })}
                  placeholder="$ 249.990"
                />
              </div>

              <div className="slider-field">
                <div className="slider-header">
                  <label>Tamaño de Fuente Precio</label>
                  <span className="slider-value">{settings.priceFontSize} px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="140"
                  value={settings.priceFontSize}
                  onChange={(e) => updateSettings({ priceFontSize: Number(e.target.value) })}
                />
              </div>

            </AccordionCard>
          </div>
        )}

        {/* TAB 2: MARCAS Y FONDOS */}
        {activeTab === 'BRAND_BG' && (
          <div className="tab-pane">
            <ImageUploader
              settings={settings}
              updateSettings={updateSettings}
              brandLogos={brandLogos}
              onAddCustomBrand={onAddCustomBrand}
            />
          </div>
        )}

        {/* TAB 3: AJUSTES & MEDIDAS */}
        {activeTab === 'STYLE' && (
          <div className="tab-pane">
            {/* Placa de Precio */}
            <AccordionCard
              title="Placa de Precio"
              icon={<MoveHorizontal size={16} className="text-emerald-400" />}
            >

              <div className="input-field">
                <label>Variante de Placa</label>
                <select
                  value={settings.badgeVariant}
                  onChange={(e) => updateSettings({ badgeVariant: e.target.value })}
                >
                  <option value="GASTRO">GASTRO (Verde #00a900 + bisel #00dc55)</option>
                  <option value="HOGAR">HOGAR (Naranja #fd7d00 + bisel #f8bc8b)</option>
                </select>
              </div>

              <CheckToggle
                checked={settings.showDesde}
                onChange={() => updateSettings({ showDesde: !settings.showDesde })}
                label='Mostrar texto "DESDE" en la placa'
              />

              <div className="slider-field mt-3">
                <div className="slider-header">
                  <label>Ancho de la Placa (Max. Texto)</label>
                  <span className="slider-value">{settings.badgeWidth} px</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="1200"
                  value={settings.badgeWidth}
                  onChange={(e) => updateSettings({ badgeWidth: Number(e.target.value) })}
                />
              </div>

              <div className="slider-field mt-3">
                <div className="slider-header">
                  <label>Alto de la Placa</label>
                  <span className="slider-value">{settings.badgeHeight} px</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="360"
                  value={settings.badgeHeight}
                  onChange={(e) => updateSettings({ badgeHeight: Number(e.target.value) })}
                />
              </div>

              <div className="slider-field mt-3">
                <div className="slider-header">
                  <label>Intensidad de Sombra de la Placa</label>
                  <span className="slider-value">{settings.badgeShadowIntensity ?? 70}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.badgeShadowIntensity ?? 70}
                  onChange={(e) => updateSettings({ badgeShadowIntensity: Number(e.target.value) })}
                />
              </div>
            </AccordionCard>

            {/* Gradient y Escala Global */}
            <AccordionCard
              title="Efectos y Escala"
              icon={<Layers size={16} className="text-emerald-400" />}
              className="mt-4"
            >

              <CheckToggle
                checked={settings.showDarkGradient !== false}
                onChange={() => updateSettings({ showDarkGradient: !settings.showDarkGradient })}
                label="Gradient Negro Inferior sobre imagen"
              />

              <div className="slider-field mt-3">
                <div className="slider-header">
                  <label>Intensidad de Sombra del Producto</label>
                  <span className="slider-value">{settings.textShadowIntensity ?? 80}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.textShadowIntensity ?? 80}
                  onChange={(e) => updateSettings({ textShadowIntensity: Number(e.target.value) })}
                />
              </div>

              <div className="slider-field mt-3">
                <div className="slider-header">
                  <label>Escala Global (Textos + Placa)</label>
                  <span className="slider-value">{(settings.globalScale || 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.0"
                  step="0.1"
                  value={settings.globalScale || 1.0}
                  onChange={(e) => updateSettings({ globalScale: Number(e.target.value) })}
                />
              </div>
            </AccordionCard>
          </div>
        )}
      </div>
    </aside>
  );
};
