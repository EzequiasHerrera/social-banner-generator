// Motor de renderizado en HTML5 Canvas para placas publicitarias
// Garantiza concordancia 100% entre vista previa y archivo PNG exportado en alta resolución

export const CANVAS_SPECIFICATIONS = {
  '4:5': { width: 1080, height: 1350, name: '4:5 (1080x1350)' },
  'FEED': { width: 1200, height: 1200, name: 'FEED (1200x1200)' },
  'STORY': { width: 1080, height: 1920, name: 'STORY (1080x1920)' }
};

// Carga asíncrona de imágenes para Canvas
const loadImage = (src) => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn('Error cargando imagen:', src);
      resolve(null);
    };
    img.src = src;
  });
};

const PRODUCT_TEXT_FONT = 'CocoSharp Trial Extrabold';
const PRODUCT_NUMBER_FONT = 'Montserrat';

// 78 px de texto equivalen a 83 px de números.
const PRODUCT_NUMBER_SCALE = 83 / 78;

// Tracking VA -85: -0.085 em respecto del tamaño base del título.
const PRODUCT_TRACKING_EM = -85 / 1000;

const PRICE_FONT = 'Inter';
const HEADER_FONT = 'CocoSharp Trial Extrabold';

const PRODUCT_GRADIENT_TOP = '#FEFEFE';
const PRODUCT_GRADIENT_BOTTOM = '#D0EEF6';
const PRICE_GRADIENT_TOP = '#FEFEFE';
const PRICE_GRADIENT_BOTTOM = '#DAE4E7';

// El signo + usa los mismos verdes de la placa GASTRO, pero aplicados a la
// propia silueta del carácter (sin caja ni contorno exterior).
const GASTRO_BADGE_BASE = '#00a900';
const GASTRO_BADGE_BEVEL = '#00dc55';

// El + necesita más presencia visual que las letras de CocoSharp. Se amplía
// junto con el espacio que ocupa y se eleva levemente respecto de la línea.
const PRODUCT_PLUS_SCALE = 1.18;
const PRODUCT_PLUS_RAISE_EM = 0.08;

// El primer origen corresponde a public/assets/brands/kitchentools.png.
// El segundo permite usar el mismo archivo directamente dentro de public/assets.
const HEADER_LOGO_SOURCES = [
  '/assets/brands/kitchentools.png',
  '/assets/kitchentools.png',
  '/kitchentools.png',
  '/assets/brands/kitchentools.svg'
];

// Tracking -80 en programas de diseño equivale a -0.08 em.
const PRICE_TRACKING_EM = -80 / 1000;

function applyProductRunFont(ctx, run, baseFontSize) {
  const fontSize = run.isPlus
    ? baseFontSize * PRODUCT_PLUS_SCALE
    : run.isNumber
      ? baseFontSize * PRODUCT_NUMBER_SCALE
      : baseFontSize;

  const fontFamily = run.isNumber
    ? PRODUCT_NUMBER_FONT
    : PRODUCT_TEXT_FONT;

  ctx.font = `800 ${fontSize}px '${fontFamily}', sans-serif`;
}

function drawBeveledPlus(ctx, x, y, baseFontSize) {
  const metrics = ctx.measureText('+');
  const bevelWidth = Math.max(2, Math.round(baseFontSize * 0.055));
  const padding = bevelWidth * 3;
  const ascent = Math.ceil(metrics.actualBoundingBoxAscent || baseFontSize);
  const descent = Math.ceil(metrics.actualBoundingBoxDescent || baseFontSize * 0.2);
  const glyphWidth = Math.max(1, Math.ceil(metrics.width));

  const glyphCanvas = document.createElement('canvas');
  glyphCanvas.width = glyphWidth + (padding * 2);
  glyphCanvas.height = ascent + descent + (padding * 2);

  const glyphCtx = glyphCanvas.getContext('2d');
  glyphCtx.font = ctx.font;
  glyphCtx.textAlign = 'left';
  glyphCtx.textBaseline = 'alphabetic';

  const localX = padding;
  const localY = padding + ascent;

  // Primero se crea la silueta sólida del signo.
  glyphCtx.fillStyle = GASTRO_BADGE_BASE;
  glyphCtx.fillText('+', localX, localY);

  // source-atop recorta el trazo al interior de la silueta ya creada. Así el
  // bisel ilumina el borde del carácter sin convertirse en borde exterior.
  glyphCtx.globalCompositeOperation = 'source-atop';
  glyphCtx.strokeStyle = GASTRO_BADGE_BEVEL;
  glyphCtx.lineWidth = bevelWidth * 2;
  glyphCtx.lineJoin = 'round';
  glyphCtx.strokeText('+', localX, localY);

  const raisedY = y - (baseFontSize * PRODUCT_PLUS_RAISE_EM);
  const targetTop = raisedY - ascent - descent - padding;
  ctx.drawImage(glyphCanvas, x - padding, targetTop);
}

function drawProductText(ctx, text, x, y, baseFontSize, trackingPx) {
  const characters = Array.from(text);
  let cursorX = x;

  characters.forEach((character, index) => {
    const run = {
      value: character,
      isNumber: /^\d$/.test(character),
      isPlus: character === '+'
    };

    applyProductRunFont(ctx, run, baseFontSize);
    if (character === '+') {
      drawBeveledPlus(ctx, cursorX, y, baseFontSize);
    } else {
      ctx.fillText(character, cursorX, y);
    }
    cursorX += ctx.measureText(character).width;

    if (index < characters.length - 1) {
      cursorX += trackingPx;
    }
  });
}

const clampPercentage = (value, fallback) => {
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : fallback;
  return Math.min(100, Math.max(0, safeValue)) / 100;
};

const loadFirstAvailableImage = async (sources) => {
  for (const source of sources) {
    const image = await loadImage(source);
    if (image) return image;
  }

  return null;
};

// Respeta únicamente los saltos de línea escritos por el usuario.
// No divide palabras ni reduce la fuente según el ancho de la placa.
function getManualProductLines(text) {
  return String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n');
}

// Helpers para obtener offsets/escala de fondo según formato
function getBgOffset(settings, formatKey, axis) {
  const keyMap = { '4:5': '45', 'FEED': 'FEED', 'STORY': 'STORY' };
  const suffix = keyMap[formatKey] || '45';
  return settings[`bgOffset${axis}_${suffix}`] || 0;
}

function getBgScale(settings, formatKey) {
  const keyMap = { '4:5': '45', 'FEED': 'FEED', 'STORY': 'STORY' };
  const suffix = keyMap[formatKey] || '45';
  return settings[`bgScale_${suffix}`] || 1.0;
}

function getBrandLogoOffset(settings, formatKey, axis) {
  const keyMap = { '4:5': '45', 'FEED': 'FEED', 'STORY': 'STORY' };
  const suffix = keyMap[formatKey] || '45';
  const value = Number(settings[`brandLogoOffset${axis}_${suffix}`]);
  return Number.isFinite(value) ? value : 0;
}

function getCreativeStackOffsetY(settings, formatKey) {
  const keyMap = { '4:5': '45', 'FEED': 'FEED', 'STORY': 'STORY' };
  const suffix = keyMap[formatKey] || '45';
  const value = Number(settings[`creativeStackOffsetY_${suffix}`]);
  return Number.isFinite(value) ? value : 0;
}

// Calcula un Aspect Fill y limita la posición para que ningún borde del
// Canvas quede sin imagen. Se trabaja con píxeles enteros para evitar líneas
// transparentes de 1 px causadas por redondeos subpíxel.
export function getCoveredBackgroundLayout(
  imageWidth,
  imageHeight,
  canvasWidth,
  canvasHeight,
  userScale = 1,
  userOffsetX = 0,
  userOffsetY = 0
) {
  const safeImageWidth = Math.max(1, Number(imageWidth) || 1);
  const safeImageHeight = Math.max(1, Number(imageHeight) || 1);
  const coverScale = Math.max(
    canvasWidth / safeImageWidth,
    canvasHeight / safeImageHeight
  );
  const safeUserScale = Math.max(1, Number(userScale) || 1);

  const drawW = Math.max(canvasWidth, Math.ceil(safeImageWidth * coverScale * safeUserScale));
  const drawH = Math.max(canvasHeight, Math.ceil(safeImageHeight * coverScale * safeUserScale));
  const desiredX = ((canvasWidth - drawW) / 2) + (Number(userOffsetX) || 0);
  const desiredY = ((canvasHeight - drawH) / 2) + (Number(userOffsetY) || 0);

  return {
    drawW,
    drawH,
    drawX: Math.min(0, Math.max(canvasWidth - drawW, Math.round(desiredX))),
    drawY: Math.min(0, Math.max(canvasHeight - drawH, Math.round(desiredY)))
  };
}

export const renderBannerToCanvas = async (canvas, formatKey, settings, brandLogosList) => {
  if (document.fonts) {
    await Promise.allSettled([
      document.fonts.load(`800 78px "${PRODUCT_TEXT_FONT}"`),
      document.fonts.load(`800 83px "${PRODUCT_NUMBER_FONT}"`),
      document.fonts.load(`700 46px "${PRICE_FONT}"`),
      document.fonts.load(`800 36px "${HEADER_FONT}"`)
    ]);
  }

  const spec = CANVAS_SPECIFICATIONS[formatKey] || CANVAS_SPECIFICATIONS['4:5'];
  canvas.width = spec.width;
  canvas.height = spec.height;
  const ctx = canvas.getContext('2d');

  // Escala global (1.0 – 2.0)
  const gScale = settings.globalScale || 1.0;

  // Limpiar lienzo
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // -------------------------------------------------------------
  // CAPA 1: Imagen de Fondo (Cover / Aspect Fill con offsets por formato)
  // -------------------------------------------------------------
  const bgSrc = settings.syncBackgrounds
    ? (settings.backgrounds['4:5'] || settings.backgrounds[formatKey])
    : (settings.backgrounds[formatKey] || settings.backgrounds['4:5']);

  if (bgSrc) {
    const bgImg = await loadImage(bgSrc);
    if (bgImg) {
      const userScale = getBgScale(settings, formatKey);
      const userOffsetX = getBgOffset(settings, formatKey, 'X');
      const userOffsetY = getBgOffset(settings, formatKey, 'Y');

      const { drawW, drawH, drawX, drawY } = getCoveredBackgroundLayout(
        bgImg.width,
        bgImg.height,
        canvas.width,
        canvas.height,
        userScale,
        userOffsetX,
        userOffsetY
      );

      ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
    }
  } else {
    // Fondo oscuro por defecto si no hay imagen cargada
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // -------------------------------------------------------------
  // CAPA 1.5: Gradiente negro inferior (condicional)
  // -------------------------------------------------------------
  if (settings.showDarkGradient !== false) {
    const darkGradient = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height);
    darkGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    darkGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
    darkGradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    ctx.fillStyle = darkGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Determinar variante de placa y encabezado
  const isHogar = settings.badgeVariant === 'HOGAR';
  const isHeaderHogar = settings.headerVariant === 'HOGAR';

  // -------------------------------------------------------------
  // CAPA 2: Encabezado (KITCHENTOOLS | GASTRONOMÍA / HOGAR)
  // Se renderiza en TOP o BOTTOM. Si BOTTOM, se calcula después de la placa.
  // -------------------------------------------------------------
  const headerMargin = (settings.headerMargin || 40) * gScale;
  const headerFontSize = Math.round((settings.headerFontSize || 36) * gScale);

  // Pre-cargar logo de KitchenTools para el encabezado
  const headerLogoImg = await loadFirstAvailableImage(HEADER_LOGO_SOURCES);

  // Función para dibujar el encabezado en una posición Y dada
  const drawHeader = (headerY) => {
    if (!settings.showHeader) return;

    ctx.save();

    // La sombra del encabezado se puede activar o desactivar desde el panel.
    if (settings.headerShadow !== false) {
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 12 * gScale;
      ctx.shadowOffsetY = 4 * gScale;
    }

    const textKT = 'KITCHENTOOLS';
    const textSuffix = isHeaderHogar ? ' | HOGAR' : ' | GASTRONOMÍA';
    const suffixColor = isHeaderHogar ? '#FF870C' : '#62A200';

    // El encabezado usa siempre CocoSharp, incluso si localStorage conserva
    // una configuración tipográfica anterior.
    ctx.font = `800 ${headerFontSize}px '${HEADER_FONT}', sans-serif`;
    ctx.textBaseline = 'top';

    const ktWidth = ctx.measureText(textKT).width;
    const suffixWidth = ctx.measureText(textSuffix).width;
    const totalTextWidth = ktWidth + suffixWidth;

    // El logo se ajusta proporcionalmente al alto de la tipografía
    let logoW = 0;
    let logoH = headerFontSize * 0.92;
    const logoGap = Math.round(8 * gScale);

    if (headerLogoImg) {
      const logoAspect = headerLogoImg.width / headerLogoImg.height;
      logoW = logoH * logoAspect;
    }

    const totalWidth = logoW + (logoW > 0 ? logoGap : 0) + totalTextWidth;
    const startX = (canvas.width - totalWidth) / 2;

    // Dibujar logo
    if (headerLogoImg && logoW > 0) {
      // Limpiar sombra para el logo (la sombra del ctx.save aplica)
      const logoY = headerY + ((headerFontSize - logoH) / 2);
      ctx.drawImage(headerLogoImg, startX, logoY, logoW, logoH);
    }

    const textStartX = startX + logoW + (logoW > 0 ? logoGap : 0);

    // "KITCHENTOOLS" en blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText(textKT, textStartX, headerY);

    // "| GASTRONOMÍA" o "| HOGAR" en color
    ctx.fillStyle = suffixColor;
    ctx.fillText(textSuffix, textStartX + ktWidth, headerY);

    ctx.restore();
  };

  // Dibujar encabezado en posición TOP
  if (settings.headerPosition !== 'BOTTOM') {
    const headerY = headerMargin;
    drawHeader(headerY);
  }

  // -------------------------------------------------------------
  // CAPA 3: Pila Inferior Izquierda (Placa, Precio, Título, Logo Marca)
  // -------------------------------------------------------------
  const marginX = Math.round(canvas.width * 0.06); // 6% margen izquierdo
  const bottomMargin = Math.round(canvas.height * (formatKey === 'STORY' ? 0.06 : 0.05));
  const creativeStackOffsetY = getCreativeStackOffsetY(settings, formatKey);

  const badgeW = Math.round((settings.badgeWidth || 420) * gScale);
  const badgeH = Math.round((settings.badgeHeight || 120) * gScale);
  const badgeY = canvas.height - bottomMargin - badgeH + creativeStackOffsetY;
  const badgeX = marginX;
  const rad = Math.round((settings.badgeBorderRadius || 16) * gScale);

  // A) Renderizado de la Placa de Precio con bisel
  ctx.save();

  // Colores según variante
  const badgeBgColor = isHogar ? '#fd7d00' : GASTRO_BADGE_BASE;
  const bevelColor = isHogar ? '#f8bc8b' : GASTRO_BADGE_BEVEL;

  // Sombra exterior regulable de la placa (lado izquierdo e inferior)
  const badgeShadowIntensity = clampPercentage(settings.badgeShadowIntensity, 70);
  ctx.shadowColor = `rgba(0, 0, 0, ${0.85 * badgeShadowIntensity})`;
  ctx.shadowBlur = (4 + (14 * badgeShadowIntensity)) * gScale;
  ctx.shadowOffsetX = -2 * badgeShadowIntensity * gScale;
  ctx.shadowOffsetY = (2 + (6 * badgeShadowIntensity)) * gScale;

  // Dibujar fondo sólido de la placa
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, rad);
  ctx.fillStyle = badgeBgColor;
  ctx.fill();
  ctx.restore();

  // Bisel de iluminación superior: 4 px base (2 px más que antes).
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, rad);
  ctx.clip();

  const bevelHeight = Math.max(1, Math.round(4 * gScale));

  if (isHogar) {
    // Bisel levemente inclinado a la izquierda para HOGAR
    const bevelGrad = ctx.createLinearGradient(
      badgeX,
      badgeY,
      badgeX + badgeW * 0.7,
      badgeY + bevelHeight
    );
    bevelGrad.addColorStop(0, bevelColor);
    bevelGrad.addColorStop(0.6, bevelColor);
    bevelGrad.addColorStop(1, 'rgba(248, 188, 139, 0)');
    ctx.fillStyle = bevelGrad;
    ctx.fillRect(badgeX, badgeY, badgeW, bevelHeight);
  } else {
    // Bisel superior uniforme para GASTRO
    const bevelGrad = ctx.createLinearGradient(
      badgeX,
      badgeY,
      badgeX,
      badgeY + bevelHeight
    );
    bevelGrad.addColorStop(0, bevelColor);
    bevelGrad.addColorStop(1, 'rgba(0, 220, 85, 0.2)');
    ctx.fillStyle = bevelGrad;
    ctx.fillRect(badgeX, badgeY, badgeW, bevelHeight);
  }

  // Sombra sutil interior en el lado izquierdo
  const leftShadowGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + 3, badgeY);
  leftShadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
  leftShadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = leftShadowGrad;
  ctx.fillRect(badgeX, badgeY, 3, badgeH);

  // Sombra sutil interior en el borde inferior
  const bottomShadowGrad = ctx.createLinearGradient(badgeX, badgeY + badgeH - 3, badgeX, badgeY + badgeH);
  bottomShadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  bottomShadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  ctx.fillStyle = bottomShadowGrad;
  ctx.fillRect(badgeX, badgeY + badgeH - 3, badgeW, 3);

  ctx.restore();

  // B) Texto "DESDE" (opcional, dentro de la placa)
  const priceFontSize = Math.round((settings.priceFontSize || 46) * gScale);
  const priceCenterX = badgeX + (badgeW / 2);
  const priceCenterY = badgeY + (badgeH / 2) + 2;

  if (settings.showDesde) {
    ctx.save();
    const desdeFontSize = Math.round(priceFontSize * 0.38);
    ctx.font = `700 ${desdeFontSize}px '${PRICE_FONT}', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // Color según variante
    ctx.fillStyle = isHogar ? '#7f340c' : '#004b00';

    // Apoyado sobre el borde superior de la tipografía del precio
    // El precio está centrado verticalmente; "DESDE" va justo arriba
    const desdeY = priceCenterY - Math.round(priceFontSize * 0.45);
    ctx.fillText('DESDE', priceCenterX, desdeY);
    ctx.restore();
  }

  // C) Renderizado del Texto de Precio (Perfectamente Centrado en la Placa)
  if (settings.priceText) {
    ctx.save();
    ctx.font = `700 ${priceFontSize}px '${PRICE_FONT}', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Si DESDE está activo, bajar un poco el precio para dar espacio
    const priceOffsetY = settings.showDesde ? Math.round(priceFontSize * 0.12) : 0;
    const priceY = priceCenterY + priceOffsetY;
    const priceTrackingPx = priceFontSize * PRICE_TRACKING_EM;

    // Gradiente vertical del precio. No se aplica ninguna sombra al precio.
    const priceGradient = ctx.createLinearGradient(
      0,
      priceY - (priceFontSize * 0.55),
      0,
      priceY + (priceFontSize * 0.55)
    );
    priceGradient.addColorStop(0, PRICE_GRADIENT_TOP);
    priceGradient.addColorStop(1, PRICE_GRADIENT_BOTTOM);
    ctx.fillStyle = priceGradient;

    drawTrackedTextCentered(
      ctx,
      settings.priceText,
      priceCenterX,
      priceY,
      priceTrackingPx
    );
    ctx.restore();
  }

  // D) Renderizado del Nombre del Producto (Sobre la Placa)
  // Las líneas se definen exclusivamente con ENTER en el campo de texto.
  const productFontSize = Math.round((settings.productFontSize || 52) * gScale);
  const productGapToBadge = Math.round(18 * gScale); // px arriba de la placa
  const productLines = getManualProductLines(settings.productName);
  const fittedFontSize = productFontSize;
  const productTrackingPx = fittedFontSize * PRODUCT_TRACKING_EM;

  const lineHeight = Math.round(
    fittedFontSize *
    PRODUCT_NUMBER_SCALE *
    (settings.productLineHeight || 1.15)
  );
  const totalProductTextHeight = productLines.length * lineHeight;
  const productTextBottomY = badgeY - productGapToBadge;

  const drawProductLines = (targetCtx) => {
    productLines.forEach((line, index) => {
      const lineY = productTextBottomY - ((productLines.length - 1 - index) * lineHeight);

      drawProductText(
        targetCtx,
        line,
        badgeX,
        lineY,
        fittedFontSize,
        productTrackingPx
      );
    });
  };

  // Crear una única silueta del bloque completo antes de generar su sombra.
  // De este modo, la sombra queda detrás de todo el título y nunca se dibuja
  // carácter por carácter sobre los caracteres vecinos.
  if (settings.productShadow) {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    maskCtx.textAlign = 'left';
    maskCtx.textBaseline = 'bottom';
    maskCtx.fillStyle = '#FFFFFF';
    drawProductLines(maskCtx);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = canvas.width;
    shadowCanvas.height = canvas.height;
    const shadowCtx = shadowCanvas.getContext('2d');
    const textShadowIntensity = clampPercentage(settings.textShadowIntensity, 80);

    shadowCtx.shadowColor = `rgba(0, 0, 0, ${0.95 * textShadowIntensity})`;
    shadowCtx.shadowBlur = (2 + (14 * textShadowIntensity)) * gScale;
    shadowCtx.shadowOffsetY = (1 + (5 * textShadowIntensity)) * gScale;
    shadowCtx.drawImage(maskCanvas, 0, 0);

    // Quitar la silueta blanca y conservar únicamente la sombra exterior.
    shadowCtx.globalCompositeOperation = 'destination-out';
    shadowCtx.shadowColor = 'transparent';
    shadowCtx.shadowBlur = 0;
    shadowCtx.shadowOffsetX = 0;
    shadowCtx.shadowOffsetY = 0;
    shadowCtx.drawImage(maskCanvas, 0, 0);

    ctx.drawImage(shadowCanvas, 0, 0);
  }

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Un solo gradiente vertical atraviesa todas las líneas: blanco arriba y
  // celeste en la línea inferior.
  const productGradientTopY = productTextBottomY
    - ((productLines.length - 1) * lineHeight)
    - (fittedFontSize * PRODUCT_NUMBER_SCALE);
  const productGradient = ctx.createLinearGradient(
    0,
    productGradientTopY,
    0,
    productTextBottomY
  );
  productGradient.addColorStop(0, PRODUCT_GRADIENT_TOP);
  productGradient.addColorStop(1, PRODUCT_GRADIENT_BOTTOM);
  ctx.fillStyle = productGradient;
  drawProductLines(ctx);
  ctx.restore();

  // E) Renderizado del Logo de Marca (Sobre el Nombre del Producto)
  const brandLogoGap = (settings.brandLogoGap || 24) * gScale;
  const productTopY = productTextBottomY - totalProductTextHeight;
  const logoBottomY = productTopY - brandLogoGap;

  const currentBrand = brandLogosList?.find(b => b.id === settings.selectedBrandId) || brandLogosList?.[0];
  if (currentBrand?.url) {
    const logoImg = await loadImage(currentBrand.url);
    if (logoImg) {
      ctx.save();
      const baseMaxHeight = 70; // px
      const scale = (settings.brandLogoScale || 1.0) * gScale;
      const targetH = baseMaxHeight * scale;
      const targetW = (logoImg.width / logoImg.height) * targetH;

      // Asegurar que el logo tampoco sobrepase desmedidamente el margen
      const logoW = Math.min(targetW, badgeW * 0.9);
      const logoH = (logoImg.height / logoImg.width) * logoW;

      // Posición independiente por formato. Los valores son offsets en píxeles
      // respecto de la ubicación automática original del logo.
      const logoX = badgeX + getBrandLogoOffset(settings, formatKey, 'X');
      const logoY = logoBottomY - logoH + getBrandLogoOffset(settings, formatKey, 'Y');

      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;

      ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
      ctx.restore();
    }
  }

  // -------------------------------------------------------------
  // CAPA 4: Encabezado en posición BOTTOM (debajo de la placa de precio)
  // -------------------------------------------------------------
  if (settings.headerPosition === 'BOTTOM') {
    const headerY = canvas.height - headerMargin - headerFontSize;
    // Solo dibujamos si no se superpone con la placa
    const safeHeaderY = Math.max(headerY, badgeY + badgeH + Math.round(10 * gScale));
    drawHeader(safeHeaderY);
  }
};

function measureTrackedText(ctx, text, trackingPx) {
  const characters = Array.from(text);

  const glyphWidth = characters.reduce(
    (total, character) => total + ctx.measureText(character).width,
    0
  );

  return glyphWidth + Math.max(0, characters.length - 1) * trackingPx;
}

function drawTrackedTextCentered(
  ctx,
  text,
  centerX,
  y,
  trackingPx
) {
  const characters = Array.from(text);
  const totalWidth = measureTrackedText(ctx, text, trackingPx);

  let cursorX = centerX - totalWidth / 2;

  ctx.textAlign = 'left';

  for (const character of characters) {
    ctx.fillText(character, cursorX, y);
    cursorX += ctx.measureText(character).width + trackingPx;
  }
}
