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
    fileName,
    width,
    height,
    scale = 2,
    backgroundColor = '#ffffff',
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
    // Create an iframe to render the card in complete isolation
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = `${actualWidth}px`;
    iframe.style.height = `${actualHeight}px`;
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      console.error('❌ Failed to get iframe document');
      document.body.removeChild(iframe);
      return null;
    }

    // Write minimal HTML with NO CSS variables
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: system-ui, -apple-system, sans-serif;
            background: ${backgroundColor};
          }
        </style>
      </head>
      <body>
        ${cardElement.outerHTML}
      </body>
      </html>
    `);
    iframeDoc.close();

    console.log('✅ Iframe created, waiting for content to load...');

    // Wait for iframe to load
    await new Promise(resolve => setTimeout(resolve, 300));

    const iframeCard = iframeDoc.getElementById(cardElementId);
    if (!iframeCard) {
      console.error('❌ Card element not found in iframe');
      document.body.removeChild(iframe);
      return null;
    }

    console.log('✅ Starting html2canvas capture...');

    // Capture the iframe content
    const canvas = await html2canvas(iframeCard, {
      backgroundColor,
      scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: actualWidth,
      height: actualHeight,
    });

    console.log('✅ Canvas created:', canvas.width, 'x', canvas.height);

    // Clean up
    document.body.removeChild(iframe);

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
