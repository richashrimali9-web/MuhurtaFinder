import html2canvas from 'html2canvas';

export async function generateCardImage(cardElementId: string, fileName: string): Promise<Blob | null> {
  const cardElement = document.getElementById(cardElementId);
  if (!cardElement) return null;

  try {
    // Create an iframe to render the card in complete isolation
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = '700px';
    iframe.style.height = '1100px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
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
          body { font-family: system-ui, -apple-system, sans-serif; }
        </style>
      </head>
      <body>
        ${cardElement.outerHTML}
      </body>
      </html>
    `);
    iframeDoc.close();

    // Wait for iframe to load
    await new Promise(resolve => setTimeout(resolve, 100));

    const iframeCard = iframeDoc.getElementById(cardElementId);
    if (!iframeCard) {
      document.body.removeChild(iframe);
      return null;
    }

    // Capture the iframe content
    const canvas = await html2canvas(iframeCard, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: 700,
      height: 1100,
    });

    // Clean up
    document.body.removeChild(iframe);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  } catch (err) {
    console.error('Failed to generate card image:', err);
    return null;
  }
}

export async function shareCardViaWhatsApp(cardElementId: string, city: string): Promise<void> {
  const blob = await generateCardImage(cardElementId, 'panchang.png');
  if (!blob) {
    alert('Failed to generate card image');
    return;
  }

  // Try to use Web Share API to share the image directly
  const file = new File([blob], 'panchang.png', { type: 'image/png' });
  
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `Today's Panchang - ${city}`,
        text: `📅 Check out today's Panchang for ${city}! 🙏`,
      });
    } catch (err) {
      console.log('Share cancelled or failed:', err);
    }
  } else {
    // Fallback: Download the image first, then open WhatsApp
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Panchang-${city}-${new Date().toISOString().split('T')[0]}.png`;
    link.click();
    URL.revokeObjectURL(url);
    
    // Open WhatsApp with message
    setTimeout(() => {
      const message = encodeURIComponent(`📅 Check out today's Panchang for ${city}! 🙏`);
      const whatsappUrl = `https://wa.me/?text=${message}`;
      window.open(whatsappUrl, '_blank');
      alert('Image downloaded! Please attach it manually in WhatsApp.');
    }, 500);
  }
}

export async function shareCardViaTwitter(cardElementId: string, city: string): Promise<void> {
  // Twitter doesn't support direct image sharing from web
  // We'll open Twitter with a pre-filled message
  const message = encodeURIComponent(`📅 Today's Panchang for ${city}!\n\n✨ Astro Event Planner - Daily Panchang Guide\n🙏 #Panchang #Muhurta\n\nastroeventplanner.com`);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${message}`;
  window.open(twitterUrl, '_blank');
}

export async function shareCardViaFacebook(cardElementId: string): Promise<void> {
  // Facebook sharing requires page to be shared through their dialog
  const message = encodeURIComponent('Check out today\'s Panchang from Astro Event Planner! 📅 astroeventplanner.com');
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${message}`;
  window.open(facebookUrl, '_blank');
}

export async function shareCardViaInstagram(cardElementId: string, city: string): Promise<void> {
  const blob = await generateCardImage(cardElementId, 'panchang.png');
  if (!blob) {
    alert('Failed to generate card image');
    return;
  }

  // Instagram doesn't support direct sharing from web
  // We'll copy image to clipboard if supported
  try {
    if (navigator.clipboard?.write) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      alert('Card image copied to clipboard! Open Instagram and paste it. 🙏');
    } else {
      // Fallback: Open Instagram with message
      alert('Please save the card and share it on Instagram. Card image available in browser downloads. 🙏');
      const blob2 = await generateCardImage(cardElementId, `Panchang-${new Date().toISOString().split('T')[0]}.png`);
      if (blob2) {
        const url = URL.createObjectURL(blob2);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Panchang-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
      }
    }
  } catch (err) {
    console.error('Failed to share to clipboard:', err);
    alert('Please download and share the card on Instagram. 🙏');
  }
}

export async function downloadCardImage(cardElementId: string, fileName: string): Promise<void> {
  const blob = await generateCardImage(cardElementId, fileName);
  if (!blob) {
    alert('Failed to generate card image');
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
