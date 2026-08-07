import React from 'react';
import { Layers, Download, RotateCcw, Sparkles, LayoutGrid } from 'lucide-react';

export const Header = ({ activeView, setActiveView, onExportAll, onResetDefaults, isExporting }) => {
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

      {/* Selector de Vista (Grid vs Formato Individual) */}
      <div className="header-view-selector">
        <button
          className={`view-btn ${activeView === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveView('ALL')}
          title="Ver los 3 formatos simultáneamente"
        >
          <LayoutGrid size={16} />
          <span>Todos (3)</span>
        </button>
        <button
          className={`view-btn ${activeView === '4:5' ? 'active' : ''}`}
          onClick={() => setActiveView('4:5')}
        >
          <span>4:5</span>
        </button>
        <button
          className={`view-btn ${activeView === 'FEED' ? 'active' : ''}`}
          onClick={() => setActiveView('FEED')}
        >
          <span>FEED (1:1)</span>
        </button>
        <button
          className={`view-btn ${activeView === 'STORY' ? 'active' : ''}`}
          onClick={() => setActiveView('STORY')}
        >
          <span>STORY</span>
        </button>
      </div>

      {/* Botones de Acción Global */}
      <div className="header-actions">
        <button 
          className="btn-secondary" 
          onClick={onResetDefaults}
          title="Restablecer configuraciones, espacados y fuentes a valores predeterminados"
        >
          <RotateCcw size={16} />
          <span>Restablecer a Default</span>
        </button>

        <button 
          className="btn-primary" 
          onClick={onExportAll} 
          disabled={isExporting}
        >
          <Download size={16} />
          <span>{isExporting ? 'Exportando ZIP...' : 'Exportar Todo (.ZIP)'}</span>
        </button>
      </div>
    </header>
  );
};
