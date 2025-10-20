export type TimeSlot = {
  start: string; // ISO
  end: string; // ISO
  score: number; // 0..100
  reasons?: string[];
};

type TimeSlotInput = {
  date: Date | string;
  sunrise?: string; // HH:mm
  sunset?: string; // HH:mm
  tithi?: string;
  nakshatra?: string;
  quality?: number;
  title?: string;
};

function parseHM(hm: string, baseDate: Date): Date {
  const [hStr, mStr] = hm.split(':');
  const h = Number(hStr || 0);
  const m = Number(mStr || 0);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
}

export function generateTimeSlots(input: TimeSlotInput, slotMinutes = 60, stepMinutes = 30): TimeSlot[] {
  const date = typeof input.date === 'string' ? new Date(input.date) : new Date(input.date || Date.now());
  const sunrise = input.sunrise ? parseHM(input.sunrise, date) : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 6, 0);
  const sunset = input.sunset ? parseHM(input.sunset, date) : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0);
  if (sunset.getTime() <= sunrise.getTime()) return [];

  const slots: TimeSlot[] = [];
  const preferredTithis = ['Ekadashi', 'Panchami', 'Tritiya'];
  const preferredNaks = ['Revati', 'Pushya', 'Ashwini'];

  for (let s = sunrise.getTime(); s + slotMinutes * 60_000 <= sunset.getTime(); s += stepMinutes * 60_000) {
    const start = new Date(s);
    const end = new Date(s + slotMinutes * 60_000);
    let score = Math.round((input.quality ?? 50));
    const reasons: string[] = [];

    // Morning bonus
    const morningEnd = new Date(sunrise.getTime() + 3 * 60 * 60_000);
    if (start.getTime() >= sunrise.getTime() && end.getTime() <= morningEnd.getTime()) {
      score += 10; reasons.push('Morning slot');
    }

    // Tithi/Nakshatra bonuses
    if (input.tithi && preferredTithis.includes(input.tithi)) { score += 8; reasons.push(`Tithi ${input.tithi}`); }
    if (input.nakshatra && preferredNaks.includes(input.nakshatra)) { score += 8; reasons.push(`Nakshatra ${input.nakshatra}`); }

    // Weekend penalty
    const dow = start.getDay();
    if (dow === 0 || dow === 6) { score -= 5; reasons.push('Weekend'); }

    // Clamp
    score = Math.max(0, Math.min(100, score));

    slots.push({ start: start.toISOString(), end: end.toISOString(), score, reasons });
  }

  slots.sort((a, b) => b.score - a.score);
  return slots;
}

export function icsForSlot(title: string | undefined, slot: TimeSlot): string {
  const dtStart = new Date(slot.start).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dtEnd = new Date(slot.end).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title ?? 'Auspicious Time'}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');
}
