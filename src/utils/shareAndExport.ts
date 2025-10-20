import { PanchangData } from './panchangData';
import jsPDF from 'jspdf';

export interface ShareOptions {
  title: string;
  date: Date;
  city: string;
  panchang: PanchangData;
}

/**
 * Generate a formatted text summary of the Panchang for sharing
 */
export function generatePanchangSummary(options: ShareOptions): string {
  const { date, city, panchang } = options;
  const dateStr = date.toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `🕉️ *TODAY'S PANCHANG* 🕉️

📅 *Date:* ${dateStr}
📍 *Location:* ${city}

*⏰ Timings:*
🌅 Sunrise: ${panchang.sunrise}
🌄 Sunset: ${panchang.sunset}

*📚 Panchang Elements:*
🌙 Tithi: ${panchang.tithi}
⭐ Nakshatra: ${panchang.nakshatra}
✨ Yoga: ${panchang.yoga}
🔄 Karana: ${panchang.karana}

*📊 Lunar Information:*
🌗 Moon Sign: ${panchang.moonSign}
🌓 Paksha: ${panchang.paksha}
📆 Masa: ${panchang.masa}

✅ *Auspiciousness Score:* ${panchang.qualityScore}%

Shared via Astro Event Planner 🙏
Visit: astroeventplanner.com`;
}

/**
 * Share via WhatsApp Web
 */
export function shareViaWhatsApp(message: string): void {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}

/**
 * Share via Twitter/X
 */
export function shareViaTwitter(message: string): void {
  const encodedMessage = encodeURIComponent(message);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
  window.open(twitterUrl, '_blank');
}

/**
 * Share via Facebook
 */
export function shareViaFacebook(): void {
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
  window.open(facebookShareUrl, '_blank');
}

/**
 * Use Web Share API if available (mobile/modern browsers)
 */
export async function shareViaWebShare(options: {
  title: string;
  text: string;
  url?: string;
}): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: options.title,
      text: options.text,
      url: options.url || window.location.href,
    });
    return true;
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Share failed:', err);
    }
    return false;
  }
}

/**
 * Generate PDF of the Panchang
 */
export function generatePanchangPDF(options: ShareOptions): void {
  const { date, city, panchang } = options;
  
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  
  let yPosition = margin;
  const lineHeight = 8;
  const sectionSpacing = 12;

  // Title
  pdf.setFontSize(20);
  pdf.setTextColor(88, 28, 135); // Purple
  pdf.text('🕉️ Daily Panchang 🕉️', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += sectionSpacing;

  // Date and Location
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  const dateStr = date.toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.text(`Date: ${dateStr}`, margin, yPosition);
  yPosition += lineHeight;
  pdf.text(`Location: ${city}`, margin, yPosition);
  yPosition += sectionSpacing;

  // Timings Section
  pdf.setFontSize(12);
  pdf.setTextColor(88, 28, 135);
  pdf.text('⏰ Timings', margin, yPosition);
  yPosition += lineHeight;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Sunrise: ${panchang.sunrise}`, margin + 5, yPosition);
  yPosition += lineHeight;
  pdf.text(`Sunset: ${panchang.sunset}`, margin + 5, yPosition);
  yPosition += sectionSpacing;

  // Panchang Elements Section
  pdf.setFontSize(12);
  pdf.setTextColor(88, 28, 135);
  pdf.text('📚 Panchang Elements', margin, yPosition);
  yPosition += lineHeight;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const elements = [
    `Tithi (Lunar Day): ${panchang.tithi}`,
    `Nakshatra (Constellation): ${panchang.nakshatra}`,
    `Yoga (Auspicious Combination): ${panchang.yoga}`,
    `Karana (Half Tithi): ${panchang.karana}`,
  ];

  for (const element of elements) {
    pdf.text(element, margin + 5, yPosition);
    yPosition += lineHeight;
  }
  yPosition += sectionSpacing - lineHeight;

  // Lunar Information Section
  pdf.setFontSize(12);
  pdf.setTextColor(88, 28, 135);
  pdf.text('🌙 Lunar Information', margin, yPosition);
  yPosition += lineHeight;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Moon Sign: ${panchang.moonSign}`, margin + 5, yPosition);
  yPosition += lineHeight;
  pdf.text(`Paksha (Lunar Phase): ${panchang.paksha}`, margin + 5, yPosition);
  yPosition += lineHeight;
  pdf.text(`Masa (Month): ${panchang.masa}`, margin + 5, yPosition);
  yPosition += sectionSpacing;

  // Quality Score Section
  pdf.setFontSize(12);
  pdf.setTextColor(88, 28, 135);
  pdf.text('✅ Auspiciousness', margin, yPosition);
  yPosition += lineHeight;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Quality Score: ${panchang.qualityScore}%`, margin + 5, yPosition);
  yPosition += lineHeight;
  
  // Quality level description
  let qualityLevel = '';
  if (panchang.qualityScore >= 75) qualityLevel = 'Highly Auspicious';
  else if (panchang.qualityScore >= 50) qualityLevel = 'Moderately Auspicious';
  else qualityLevel = 'Less Auspicious';
  
  pdf.text(`Assessment: ${qualityLevel}`, margin + 5, yPosition);
  yPosition += sectionSpacing;

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text('Generated by Astro Event Planner | astroeventplanner.com', margin, pageHeight - margin, { align: 'left' });
  pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, pageHeight - margin, { align: 'right' });

  // Save PDF
  const fileName = `Panchang-${dateStr.replace(/\s+/g, '-')}-${city}.pdf`;
  pdf.save(fileName);
}

/**
 * Generate iCalendar (.ics) file for adding to calendar
 */
export function generatePanchangICS(options: ShareOptions): void {
  const { date, city, panchang } = options;

  // Format date for iCalendar (YYYYMMDD format)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dtstart = `${year}${month}${day}`;

  // Event title and description
  const title = `Daily Panchang - ${city}`;
  const description = `
Tithi: ${panchang.tithi}
Nakshatra: ${panchang.nakshatra}
Yoga: ${panchang.yoga}
Karana: ${panchang.karana}
Sunrise: ${panchang.sunrise}
Sunset: ${panchang.sunset}
Moon Sign: ${panchang.moonSign}
Paksha: ${panchang.paksha}
Masa: ${panchang.masa}
Quality Score: ${panchang.qualityScore}%
  `.trim().replace(/\n/g, '\\n');

  // Create iCalendar format
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AstroEventPlanner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Panchang Calendar
X-WR-TIMEZONE:UTC
BEGIN:VEVENT
UID:panchang-${dtstart}-${city}@astroeventplanner.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART;VALUE=DATE:${dtstart}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${city}
CATEGORIES:Panchang,Hindu Calendar
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  // Create blob and download
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const fileName = `Panchang-${dtstart}-${city}.ics`;
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
