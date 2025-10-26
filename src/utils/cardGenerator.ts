/**
 * Generic Card Image Generator
 * Handles image generation for any card component
 */

import html2canvas from 'html2canvas';

export interface CardGeneratorOptions {
  cardElementId: string;
  fileName: string;
  width?: number;
  height?: number;
  scale?: number;
  backgroundColor?: string;
}

export async function generateCardImage(options: CardGeneratorOptions): Promise<Blob | null> {
  const {
    cardElementId,
    width,
    height,
    scale = 2,
    backgroundColor,
  } = options;

  console.log('🎨 Generating card image for:', cardElementId);

  const cardElement = document.getElementById(cardElementId);
  if (!cardElement) {
    console.error(`❌ Card element with id "${cardElementId}" not found`);
    console.log('Available elements:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
    return null;
  }

  // Get actual dimensions from element if not specified
  const actualWidth = width || cardElement.offsetWidth;
  const actualHeight = height || cardElement.offsetHeight;

  console.log('✅ Card element found, dimensions:', actualWidth, 'x', actualHeight);

  try {
    // Clone the element and render it off-screen in the main document so styles apply
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.pointerEvents = 'none';
  if (backgroundColor) container.style.background = backgroundColor;
    document.body.appendChild(container);

    const clone = cardElement.cloneNode(true) as HTMLElement;
  if (backgroundColor) clone.style.background = backgroundColor;
    container.appendChild(clone);

    // Inline computed styles to resolve CSS variables and modern color functions (oklch) into concrete values
    // Cache resolved property values to avoid repeated computation
    const resolvedCache: Record<string, string> = {};
    const colorFunctionRegex = /oklch\(|lab\(|lch\(|color\(/i;
    const colorPropNameRegex = /color|background|border|fill|stroke/i;

    const resolvePropertyValue = (prop: string, rawValue: string) => {
      if (!rawValue) return rawValue;
      const cacheKey = prop + '|' + rawValue;
      if (resolvedCache[cacheKey]) return resolvedCache[cacheKey];

      // If the value contains newer color functions or the property name is color-like,
      // attempt to resolve it by setting it on a temporary element and reading computed style.
      if (colorFunctionRegex.test(rawValue) || colorPropNameRegex.test(prop)) {
        try {
          const temp = document.createElement('div');
          temp.style.position = 'fixed';
          temp.style.left = '-9999px';
          temp.style.top = '0';
          temp.style.pointerEvents = 'none';
          document.body.appendChild(temp);
          try {
            // Choose a reasonable style property to set so the browser computes a resolved color value
            const lower = prop.toLowerCase();
            if (lower.includes('background')) {
              (temp.style as any).backgroundColor = rawValue;
            } else if (lower.includes('border') || lower.includes('outline')) {
              (temp.style as any).borderColor = rawValue;
            } else if (lower.includes('fill') || lower.includes('stroke')) {
              // SVG fill/stroke map to color for resolution
              (temp.style as any).color = rawValue;
            } else {
              (temp.style as any).color = rawValue;
            }
          } catch (e) {
            // ignore
          }
          const computedStyle = window.getComputedStyle(temp);
          const computed = computedStyle.getPropertyValue(prop) || computedStyle.color || computedStyle.backgroundColor;
          document.body.removeChild(temp);
          resolvedCache[cacheKey] = computed || rawValue;
          return resolvedCache[cacheKey];
        } catch (e) {
          // fallback to the raw value
          resolvedCache[cacheKey] = rawValue;
          return rawValue;
        }
      }

      // otherwise return raw value
      resolvedCache[cacheKey] = rawValue;
      return rawValue;
    };

    // Replace color function tokens inside a complex CSS value string by resolving each token
    const replaceColorTokensInValue = (prop: string, value: string) => {
      if (!value || !colorFunctionRegex.test(value)) return value;
      // Find all color function tokens
      const tokenRegex = /(oklch\([^)]*\)|lch\([^)]*\)|lab\([^)]*\)|color\([^)]*\))/gi;
      return value.replace(tokenRegex, (match) => {
        try {
          // fast-path: if this is an oklch token, convert directly to rgb string
          if (/^oklch\(/i.test(match)) {
            try {
              const rgb = oklchToRgbString(match);
              if (rgb) return rgb;
            } catch (e) {
              // fall back to computed-resolution
            }
          }
          const resolved = resolvePropertyValue(prop, match);
          return resolved || match;
        } catch (e) {
          return match;
        }
      });
    };

    // Parse an oklch(...) token and convert to an sRGB 'rgb(r,g,b)' string.
    // Supports values like: oklch(63% 0.12 200) or oklch(0.63 0.12 200deg)
    const oklchToRgbString = (token: string): string | null => {
      // strip prefix and parentheses
      const inner = token.replace(/^[^(]*\(/, '').replace(/\)$/, '').trim();
      if (!inner) return null;
      // split on whitespace (handles commas too)
      const parts = inner.split(/\s+/).map(p => p.replace(/,$/, ''));
      if (parts.length < 3) return null;
      // parse L
      const parseNumber = (s: string) => {
        if (s.endsWith('%')) return parseFloat(s) / 100;
        return parseFloat(s);
      };
      const L = parseNumber(parts[0]);
      const C = parseFloat(parts[1]);
      let h = parts[2];
      // handle deg unit
      if (h.endsWith('deg')) h = h.slice(0, -3);
      const H = parseFloat(h);

      // Convert OKLCH to OKLab
      const a = C * Math.cos((H * Math.PI) / 180);
      const b = C * Math.sin((H * Math.PI) / 180);

      // Now convert OKLab -> linear sRGB -> srgb
      // Using formulas from OKLab specification
      const Lval = L;
      const aVal = a;
      const bVal = b;

      const l_ = Lval + 0.3963377774 * aVal + 0.2158037573 * bVal;
      const m_ = Lval - 0.1055613458 * aVal - 0.0638541728 * bVal;
      const s_ = Lval - 0.0894841775 * aVal - 1.2914855480 * bVal;

      const l = l_ * l_ * l_;
      const m = m_ * m_ * m_;
      const s = s_ * s_ * s_;

      let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      let bRgb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

      // Gamma encode linear sRGB to sRGB
      const linearToSrgb = (v: number) => {
        // clamp
        v = Math.max(0, Math.min(1, v));
        return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
      };

      r = linearToSrgb(r);
      g = linearToSrgb(g);
      bRgb = linearToSrgb(bRgb);

      const to255 = (x: number) => Math.round(Math.max(0, Math.min(255, Math.round(x * 255))));
      return `rgb(${to255(r)}, ${to255(g)}, ${to255(bRgb)})`;
    };

    const inlineStyles = (el: Element) => {
      if (!(el instanceof HTMLElement)) return;
      const cs = window.getComputedStyle(el as HTMLElement);
      // copy all computed properties
      for (let i = 0; i < cs.length; i++) {
        const prop = cs[i];
        try {
          let value = cs.getPropertyValue(prop);
          const priority = cs.getPropertyPriority(prop);
          // First, replace any embedded color function tokens inside the value
          value = replaceColorTokensInValue(prop, value);
          // resolve modern color functions to computed values the browser can parse
          value = resolvePropertyValue(prop, value);
          (el as HTMLElement).style.setProperty(prop, value, priority);
        } catch (e) {
          // ignore properties that can't be set
        }
      }
      // recurse
      Array.from(el.children).forEach(child => inlineStyles(child));
    };

    inlineStyles(clone);

    console.log('✅ Inlined computed styles, starting html2canvas capture...');

    // Use onclone to remove any cloned stylesheet/style nodes (which may contain oklch)
    // and copy computed styles from our original clone into the cloned document before html2canvas parses it.
    let canvas: HTMLCanvasElement | null = null;
    try {
  canvas = await html2canvas(clone, {
  backgroundColor: backgroundColor ?? null,
      scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: actualWidth,
      height: actualHeight,
      onclone: (clonedDoc: Document) => {
        try {
          // Remove style/link tags from cloned head so html2canvas won't parse CSS functions from them
          const toRemove = clonedDoc.querySelectorAll('link[rel="stylesheet"], style');
          toRemove.forEach(n => n.remove());

          // Copy computed styles from our original clone into the cloned document's elements
          const copyComputed = (orig: Element, dest: Element) => {
            if (!(orig instanceof HTMLElement) || !(dest instanceof HTMLElement)) return;
            const cs = window.getComputedStyle(orig as HTMLElement);
            for (let i = 0; i < cs.length; i++) {
              const prop = cs[i];
              try {
                let rawValue = cs.getPropertyValue(prop);
                const priority = cs.getPropertyPriority(prop);
                rawValue = replaceColorTokensInValue(prop, rawValue);
                const resolved = resolvePropertyValue(prop, rawValue);
                (dest as HTMLElement).style.setProperty(prop, resolved, priority);
              } catch (e) {
                // ignore
              }
            }
            const origChildren = Array.from(orig.children);
            const destChildren = Array.from(dest.children);
            for (let i = 0; i < origChildren.length; i++) {
              if (destChildren[i]) copyComputed(origChildren[i], destChildren[i]);
            }
          };

          const clonedCard = clonedDoc.getElementById(cardElementId);
          if (clonedCard) {
            copyComputed(clone, clonedCard);
          }
        } catch (err) {
          console.warn('onclone handler failed to sanitize cloned document:', err);
        }
      }
      });
    } catch (htmlErr) {
      console.warn('html2canvas failed, attempting SVG foreignObject fallback:', htmlErr);

      // Attempt SVG/foreignObject fallback using the already-inlined clone HTML
      try {
        // Use the clone's innerHTML and wrap it with an XHTML namespace so the foreignObject is parsed as HTML markup
        const innerHTML = `<div xmlns='http://www.w3.org/1999/xhtml' style='width:${actualWidth}px;height:${actualHeight}px'>${clone.innerHTML}</div>`;
        const svg = `<?xml version="1.0" encoding="utf-8"?>\n` +
          `<svg xmlns='http://www.w3.org/2000/svg' width='${actualWidth}' height='${actualHeight}'>` +
          `<foreignObject width='100%' height='100%'>` +
          `${innerHTML}` +
          `</foreignObject></svg>`;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        const svgSrc = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = (e) => reject(e);
          img.src = svgSrc;
        });

        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = actualWidth * (scale || 1);
        fallbackCanvas.height = actualHeight * (scale || 1);
        const ctx = fallbackCanvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context for SVG fallback');
        // Draw the SVG image onto the canvas
        ctx.drawImage(img, 0, 0, fallbackCanvas.width, fallbackCanvas.height);
        canvas = fallbackCanvas;
      } catch (svgErr) {
        console.error('SVG fallback also failed:', svgErr);
        // rethrow original html2canvas error to be handled by outer catch
        throw htmlErr;
      }
    }

    // Clean up
    document.body.removeChild(container);

    console.log('✅ Canvas created:', canvas.width, 'x', canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          console.log('✅ Blob created:', blob.size, 'bytes');
        } else {
          console.error('❌ Failed to create blob');
        }
        resolve(blob);
      }, 'image/png');
    });
  } catch (err) {
    console.error('❌ Failed to generate card image:', err);
    return null;
  }
}

export async function downloadCardImage(options: CardGeneratorOptions): Promise<boolean> {
  const blob = await generateCardImage(options);
  if (!blob) {
    return false;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = options.fileName;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

export async function shareCardImage(
  options: CardGeneratorOptions,
  shareData: {
    title?: string;
    text?: string;
  }
): Promise<boolean> {
  const blob = await generateCardImage(options);
  if (!blob) {
    return false;
  }

  const file = new File([blob], options.fileName, { type: 'image/png' });

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: shareData.title || 'Share',
        text: shareData.text || '',
      });
      return true;
    } catch (err) {
      console.log('Share cancelled or failed:', err);
      return false;
    }
  } else {
    // Fallback to download
    return downloadCardImage(options);
  }
}
