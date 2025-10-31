/**
 * Generic Card Image Generator
 * Handles image generation for any card component
 */

import { toPng } from 'html-to-image';

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
    // Use html-to-image to generate PNG from the card element
    const dataUrl = await toPng(cardElement, {
      backgroundColor: backgroundColor ?? undefined,
      width: width,
      height: height,
      cacheBust: true,
      pixelRatio: scale,
    });
    // Convert dataURL to Blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return blob;
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
