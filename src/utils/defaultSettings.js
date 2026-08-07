// Configuración predeterminada inicial para el generador de placas

export const INITIAL_BRAND_LOGOS = [
  {
    id: 'silcook',
    name: 'Silcook Gastronomía',
    url: '/assets/brands/silcook.svg',
    isPreset: true
  },
  {
    id: 'kitchentools',
    name: 'KitchenTools Professional',
    url: '/assets/brands/kitchentools.svg',
    isPreset: true
  },
  {
    id: 'thermopro',
    name: 'ThermoPro Industrial',
    url: '/assets/brands/thermopro.svg',
    isPreset: true
  }
];

// Fondos oscuros de gastronomía por defecto (SVG Data URIs limpios y elegantes)
export const DEFAULT_BACKGROUND_DARK = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="50%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="overlayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.6"/>
      <stop offset="30%" stop-color="#000000" stop-opacity="0.1"/>
      <stop offset="70%" stop-color="#000000" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.85"/>
    </linearGradient>
    <pattern id="gridPattern" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#FFFFFF" stroke-opacity="0.02" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1080" height="1920" fill="url(#bgGrad)" />
  <rect width="1080" height="1920" fill="url(#gridPattern)" />
  <!-- Ambient Culinary Spotlights -->
  <circle cx="200" cy="400" r="350" fill="#10B981" opacity="0.08" filter="blur(60px)"/>
  <circle cx="880" cy="1100" r="400" fill="#0EA5E9" opacity="0.06" filter="blur(80px)"/>
  <rect width="1080" height="1920" fill="url(#overlayGrad)" />
</svg>
`)}`;

export const DEFAULT_BACKGROUND_WARM = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <radialGradient id="bgWarm" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#2A1B18"/>
      <stop offset="60%" stop-color="#140D0C"/>
      <stop offset="100%" stop-color="#080404"/>
    </radialGradient>
    <linearGradient id="warmOverlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.6"/>
      <stop offset="40%" stop-color="#000000" stop-opacity="0.0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bgWarm)" />
  <circle cx="540" cy="650" r="450" fill="#F59E0B" opacity="0.07" filter="blur(90px)"/>
  <rect width="1080" height="1920" fill="url(#warmOverlay)" />
</svg>
`)}`;

// Familias tipográficas disponibles (cargadas en index.html)
export const AVAILABLE_FONTS = [
  { id: 'Montserrat', name: 'Montserrat' },
  { id: 'Inter', name: 'Inter' },
  { id: 'Oswald', name: 'Oswald' },
  { id: 'Teko', name: 'Teko' }
];

export const DEFAULT_SETTINGS = {
  // Configuración de Encabezado
  headerVariant: 'GASTRO',       // 'GASTRO' o 'HOGAR'
  headerFontSize: 36,            // px base en canvas
  headerFontFamily: 'CocoSharp Trial Extrabold',
  showHeader: true,
  headerShadow: true,           // Permite activar/desactivar la sombra del encabezado
  headerMargin: 40,              // gap/margen al borde de la imagen (px)
  headerPosition: 'TOP',         // 'TOP' o 'BOTTOM'

  // Nombre del Producto
  productName: 'Freidora de Aire Industrial 10L',
  productFontSize: 52,
  productFontFamily: 'CocoSharp Trial Extrabold',
  productColorStart: '#FEFEFE',
  productColorEnd: '#D0EEF6',
  productShadow: true,
  textShadowIntensity: 80,       // 0 a 100; aplica únicamente al nombre del producto
  productLineHeight: 1.15,       // Espaciado de línea del nombre de producto

  // Precio
  priceText: '$ 249.990',
  priceFontSize: 46,
  priceFontFamily: 'Inter',
  priceTextColor: '#FEFEFE',

  // Marca y Logos
  selectedBrandId: 'silcook',
  brandLogoGap: 24,              // Espaciado entre el logo de marca y el texto del producto
  brandLogoScale: 1.0,

  // Placa de Precio
  badgeVariant: 'GASTRO',        // 'GASTRO' o 'HOGAR'
  badgeWidth: 420,
  badgeHeight: 120,
  badgeBorderRadius: 16,
  badgeShadowIntensity: 70,      // 0 a 100; intensidad de sombra exterior
  showDesde: false,              // Mostrar texto "DESDE" dentro de la placa

  // Gradient negro inferior
  showDarkGradient: true,

  // Posición y escala de imagen de fondo por formato
  bgOffsetX_45: 0,
  bgOffsetY_45: 0,
  bgScale_45: 1.0,
  bgOffsetX_FEED: 0,
  bgOffsetY_FEED: 0,
  bgScale_FEED: 1.0,
  bgOffsetX_STORY: 0,
  bgOffsetY_STORY: 0,
  bgScale_STORY: 1.0,

  // Escala global de textos y placa (1.0 normal, hasta 2.0 doble)
  globalScale: 1.0,

  // Imágenes de Fondo y Sincronización
  syncBackgrounds: true,
  backgrounds: {
    '4:5': DEFAULT_BACKGROUND_DARK,
    'FEED': DEFAULT_BACKGROUND_DARK,
    'STORY': DEFAULT_BACKGROUND_DARK
  }
};
