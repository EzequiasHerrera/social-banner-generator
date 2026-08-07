// Motor de renderizado en HTML5 Canvas para placas publicitarias
// Garantiza concordancia 100% entre vista previa y archivo PNG exportado en alta resolución

export const CANVAS_SPECIFICATIONS = {
  '4:5': { width: 1080, height: 1350, name: '4:5 (1080x1350)' },
  'FEED': { width: 1200, height: 1200, name: 'FEED (1200x1200)' },
  'STORY': { width: 1080, height: 1920, name: 'STORY (1080x1920)' }
};

// Carga asíncrona de imágenes para Canvas
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
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

// Algoritmo para envolver texto manteniendo estricta la restricción de ancho máximo (badgeWidth)
function wrapTextToFitWidth(ctx, text, maxWidth, initialFontSize, fontFamily) {
  let fontSize = initialFontSize;
  let lines = [];
  
  while (fontSize >= 16) {
    ctx.font = `900 ${fontSize}px '${fontFamily}', sans-serif`;
    const words = text.split(' ');
    lines = [];
    let currentLine = words[0] || '';

    let exceeds = false;
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width <= maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
        // Si una sola palabra sola ya supera el ancho máximo, debemos reducir la fuente
        if (ctx.measureText(word).width > maxWidth) {
          exceeds = true;
          break;
        }
      }
    }
    if (!exceeds) {
      lines.push(currentLine);
      if (lines.every(line => ctx.measureText(line).width <= maxWidth)) {
        break; // Éxito: todas las líneas caben dentro del ancho de la placa
      }
    }
    fontSize -= 2; // Reducir tamaño progresivamente
  }
  
  return { lines, fontSize };
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

export const renderBannerToCanvas = async (canvas, formatKey, settings, brandLogosList) => {
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

      const imgRatio = bgImg.width / bgImg.height;
      const canvasRatio = canvas.width / canvas.height;
      let drawW, drawH, drawX, drawY;

      if (imgRatio > canvasRatio) {
        drawH = canvas.height;
        drawW = canvas.height * imgRatio;
        drawX = (canvas.width - drawW) / 2;
        drawY = 0;
      } else {
        drawW = canvas.width;
        drawH = canvas.width / imgRatio;
        drawX = 0;
        drawY = (canvas.height - drawH) / 2;
      }

      // Aplicar escala y offsets del usuario
      drawW *= userScale;
      drawH *= userScale;
      drawX = drawX - (drawW - (imgRatio > canvasRatio ? canvas.height * imgRatio : canvas.width)) / 2 + userOffsetX;
      drawY = drawY - (drawH - (imgRatio > canvasRatio ? canvas.height : canvas.width / imgRatio)) / 2 + userOffsetY;

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
  const headerFontFamily = settings.headerFontFamily || 'Montserrat';

  // Pre-cargar logo de KitchenTools para el encabezado
  const headerLogoImg = await loadImage('/assets/brands/kitchentools.svg');

  // Función para dibujar el encabezado en una posición Y dada
  const drawHeader = (headerY) => {
    if (!settings.showHeader) return;

    ctx.save();

    // Sombra para legibilidad
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    const textKT = 'KITCHENTOOLS';
    const textSuffix = isHeaderHogar ? ' | HOGAR' : ' | GASTRONOMÍA';
    const suffixColor = isHeaderHogar ? '#FF870C' : '#62A200';

    ctx.font = `800 ${headerFontSize}px '${headerFontFamily}', sans-serif`;
    ctx.textBaseline = 'top';

    const ktWidth = ctx.measureText(textKT).width;
    const suffixWidth = ctx.measureText(textSuffix).width;
    const totalTextWidth = ktWidth + suffixWidth;

    // El logo se ajusta proporcionalmente al alto de la tipografía
    let logoW = 0;
    let logoH = headerFontSize;
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
      ctx.drawImage(headerLogoImg, startX, headerY, logoW, logoH);
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
  
  const badgeW = Math.round((settings.badgeWidth || 420) * gScale);
  const badgeH = Math.round((settings.badgeHeight || 120) * gScale);
  const badgeY = canvas.height - bottomMargin - badgeH;
  const badgeX = marginX;
  const rad = Math.round((settings.badgeBorderRadius || 16) * gScale);

  // A) Renderizado de la Placa de Precio con bisel
  ctx.save();

  // Colores según variante
  const badgeBgColor = isHogar ? '#fd7d00' : '#00a900';
  const bevelColor = isHogar ? '#f8bc8b' : '#00dc55';

  // Sombra exterior de la placa (lado izquierdo e inferior)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = -2;
  ctx.shadowOffsetY = 4;

  // Dibujar fondo sólido de la placa
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, rad);
  ctx.fillStyle = badgeBgColor;
  ctx.fill();
  ctx.restore();

  // Bisel fino superior (1-2px)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, rad);
  ctx.clip();

  if (isHogar) {
    // Bisel levemente inclinado a la izquierda para HOGAR
    const bevelGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW * 0.7, badgeY + 3);
    bevelGrad.addColorStop(0, bevelColor);
    bevelGrad.addColorStop(0.6, bevelColor);
    bevelGrad.addColorStop(1, 'rgba(248, 188, 139, 0)');
    ctx.fillStyle = bevelGrad;
    ctx.fillRect(badgeX, badgeY, badgeW, 2);
  } else {
    // Bisel superior uniforme para GASTRO
    const bevelGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + 2);
    bevelGrad.addColorStop(0, bevelColor);
    bevelGrad.addColorStop(1, 'rgba(0, 220, 85, 0.2)');
    ctx.fillStyle = bevelGrad;
    ctx.fillRect(badgeX, badgeY, badgeW, 2);
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
    ctx.font = `800 ${desdeFontSize}px '${settings.priceFontFamily || 'Montserrat'}', sans-serif`;
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
    ctx.font = `900 ${priceFontSize}px '${settings.priceFontFamily || 'Montserrat'}', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Sombrita interna suave
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = settings.priceTextColor || '#FFFFFF';
    
    // Si DESDE está activo, bajar un poco el precio para dar espacio
    const priceOffsetY = settings.showDesde ? Math.round(priceFontSize * 0.12) : 0;
    ctx.fillText(settings.priceText, priceCenterX, priceCenterY + priceOffsetY);
    ctx.restore();
  }

  // D) Renderizado del Nombre del Producto (Sobre la Placa)
  // Restricción Estricta: Su ancho NUNCA debe sobrepasar el ancho de la placa (badgeW)
  const productFontSize = Math.round((settings.productFontSize || 52) * gScale);
  const productGapToBadge = Math.round(18 * gScale); // px arriba de la placa
  const maxProductWidth = badgeW;

  const { lines: productLines, fontSize: fittedFontSize } = wrapTextToFitWidth(
    ctx,
    settings.productName || '',
    maxProductWidth,
    productFontSize,
    settings.productFontFamily || 'Montserrat'
  );

  const lineHeight = Math.round(fittedFontSize * (settings.productLineHeight || 1.15));
  const totalProductTextHeight = productLines.length * lineHeight;
  const productTextBottomY = badgeY - productGapToBadge;

  ctx.save();
  ctx.font = `900 ${fittedFontSize}px '${settings.productFontFamily}', sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';

  // Degradado y sombra en el texto del producto
  productLines.forEach((line, index) => {
    // Calculamos Y para cada línea (de abajo hacia arriba)
    const lineY = productTextBottomY - ((productLines.length - 1 - index) * lineHeight);

    if (settings.productShadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
    }

    // Degradado en texto (de blanco a gris claro)
    const textGradient = ctx.createLinearGradient(
      badgeX, 
      lineY - fittedFontSize, 
      badgeX + maxProductWidth, 
      lineY
    );
    textGradient.addColorStop(0, settings.productColorStart || '#FFFFFF');
    textGradient.addColorStop(1, settings.productColorEnd || '#CBD5E1');

    ctx.fillStyle = textGradient;
    ctx.fillText(line, badgeX, lineY);
  });
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
      
      const logoX = badgeX;
      const logoY = logoBottomY - logoH;

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
