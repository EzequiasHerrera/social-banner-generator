import React from 'react';
import { Download, RotateCcw, Sparkles, Eye, PackageCheck } from 'lucide-react';

const FORMAT_OPTIONS = [
  { key: '4:5', label: '4:5' },
  { key: 'FEED', label: 'FEED' },
  { key: 'STORY', label: 'STORY' }
];

const FormatSelector = ({ title, icon, values, onChange }) => (
  <div className="format-selector-group">
    <span className="format-selector-label">{icon}{title}</span>
    <div className="format-selector-buttons" role="group" aria-label={title}>
      {FORMAT_OPTIONS.map(({ key, label }) => {
        const selected = values?.[key] !== false;
        return (
          <button
            key={key}
            type="button"
            className={`view-btn ${selected ? 'active' : ''}`}
            onClick={() => onChange({ ...values, [key]: !selected })}
            aria-pressed={selected}
          >
            {label}
          </button>
        );
      })}
    </div>
  </div>
);

export const Header = ({ settings, updateSettings, onExportAll, onResetDefaults, isExporting }) => {
  const exportCount = Object.values(settings.exportFormats || {}).filter(Boolean).length;

  return (
    <header className="header-bar">
      <div className="header-brand">
        <div className="header-logo-icon">
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="header-title">KITCHENTOOLS</h1>
          <p className="header-subtitle">Generador de Placas Publicitarias HD</p>
        </div>
      </div>

      <div className="header-view-selector independent-format-selectors">
        <FormatSelector
          title="Ver"
          icon={<Eye size={14} />}
          values={settings.visibleFormats}
          onChange={(visibleFormats) => updateSettings({ visibleFormats })}
        />
        <FormatSelector
          title="Exportar"
          icon={<PackageCheck size={14} />}
          values={settings.exportFormats}
          onChange={(exportFormats) => updateSettings({ exportFormats })}
        />
      </div>

      <div className="header-actions">
        <button className="btn-secondary" onClick={onResetDefaults} title="Restablecer configuraciones">
          <RotateCcw size={16} />
          <span>Restablecer</span>
        </button>
        <button className="btn-primary" onClick={onExportAll} disabled={isExporting || exportCount === 0}>
          <Download size={16} />
          <span>{isExporting ? 'Exportando ZIP...' : `Exportar seleccionados (${exportCount})`}</span>
        </button>
      </div>
    </header>
  );
};
