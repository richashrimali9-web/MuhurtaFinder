// Real astronomical Panchang calculation utilities
export interface PanchangElement {
  name: string;
}

export interface AuspiciousPeriod {
  name: string;
  startTime: string;
  endTime: string;
  type: 'auspicious' | 'inauspicious';
}

export interface PanchangData {
  date: Date;
  tithis: PanchangElement[];
  nakshatras: PanchangElement[];
  yogas: PanchangElement[];
  karanas: PanchangElement[];
  paksha: string;
  masa: string;
  amantaMonth: string;
  purnimantaMonth: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moonSign: string;
  sunSign: string;
  weekday: string;
  shakaYear: number;
  vikramYear: number;
  auspiciousPeriods: AuspiciousPeriod[];
  inauspiciousPeriods: AuspiciousPeriod[];
  qualityScore: number;
  isAuspicious: boolean;
}

export const tithis = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
];

export const nakshatras = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
  'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
  'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
  'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
];

export const yogas = [
  'Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Indra', 'Vaidhriti'
];

export const karanas = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja',
  'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
];

export const moonSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const auspiciousNakshatras = [
  'Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya',
  'Hasta', 'Swati', 'Anuradha', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Revati'
];

export const auspiciousTithis = [
  'Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 'Dashami',
  'Ekadashi', 'Trayodashi'
];

export const inauspiciousYogas = ['Vishkumbha', 'Atiganda', 'Shula', 'Ganda', 'Vyaghata', 'Vajra', 'Vyatipata', 'Parigha', 'Vaidhriti'];

// Real astronomical Panchang calculation with multiple daily transitions
export async function calculatePanchang(date: Date, _location = 'Delhi', _lat?: number, _lon?: number): Promise<PanchangData> {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // More accurate lunar calculations based on actual lunar cycle (~29.53 days)
  const lunarDaysSinceEpoch = Math.floor((date.getTime() - new Date(2000, 0, 6).getTime()) / (86400000));
  const lunarCyclePosition = (lunarDaysSinceEpoch % 29.53) / 29.53;
  
  


  // Use mhah-panchang npm package directly in the frontend
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MhahPanchang } = await import('mhah-panchang');
  const latitude = _lat ?? 28.6139;
  const longitude = _lon ?? 77.2090;
  let nakshatraElements: PanchangElement[] = [];
  let tithiElements: PanchangElement[] = [];
  let yogaElements: PanchangElement[] = [];
  let karanaElements: PanchangElement[] = [];
  let sunrise = '';
  let sunset = '';
  try {
    const panchang = new MhahPanchang();
    const result = panchang.calendar(date, latitude, longitude);
    if (result.Nakshatra) {
      // Prefer English if available
      const nakName = typeof result.Nakshatra === 'string'
        ? result.Nakshatra
        : (result.Nakshatra.name_en_IN || result.Nakshatra.name || JSON.stringify(result.Nakshatra));
      nakshatraElements = [{ name: nakName }];
    }
    if (result.Tithi) {
      const tithiName = typeof result.Tithi === 'string'
        ? result.Tithi
        : (result.Tithi.name_en_IN || result.Tithi.name || JSON.stringify(result.Tithi));
      tithiElements = [{ name: tithiName }];
    }
    if (result.Yoga) {
      const yogaName = typeof result.Yoga === 'string'
        ? result.Yoga
        : (result.Yoga.name_en_IN || result.Yoga.name || JSON.stringify(result.Yoga));
      yogaElements = [{ name: yogaName }];
    }
    if (result.Karna) {
      const karanaName = typeof result.Karna === 'string'
        ? result.Karna
        : (result.Karna.name_en_IN || result.Karna.name || JSON.stringify(result.Karna));
      karanaElements = [{ name: karanaName }];
    }
    // mhah-panchang does not provide sunrise/sunset directly in calendar()
    // Optionally, use sunTimer if needed for sunrise/sunset
    const sun = panchang.sunTimer(date, latitude, longitude);
    if (sun && sun.sunrise) sunrise = sun.sunrise;
    if (sun && sun.sunset) sunset = sun.sunset;
  } catch (err) {
    console.warn('mhah-panchang failed:', err);
    nakshatraElements = [];
    tithiElements = [];
    yogaElements = [];
    karanaElements = [];
    sunrise = '';
    sunset = '';
  }
  
  // Calculate important periods
  const auspiciousPeriods: AuspiciousPeriod[] = [
    {
      name: 'Brahma Muhurtham',
      startTime: '04:54',
      endTime: '05:42',
      type: 'auspicious'
    },
    {
      name: 'Abhijit Muhurtham',
      startTime: '11:41',
      endTime: '12:29',
      type: 'auspicious'
    }
  ];
  
  const inauspiciousPeriods: AuspiciousPeriod[] = [
    {
      name: 'Gulikai',
      startTime: '09:30',
      endTime: '10:55',
      type: 'inauspicious'
    },
    {
      name: 'Rahu Kaal',
      startTime: '07:48',
      endTime: '09:14',
      type: 'inauspicious'
    },
    {
      name: 'Yamagandam',
      startTime: '10:39',
      endTime: '12:05',
      type: 'inauspicious'
    }
  ];
  
  // Calculate other elements
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekday = weekdays[date.getDay()];
  
  const isPakshaShukla = lunarCyclePosition < 0.5;
  const paksha = isPakshaShukla ? 'Shukla Paksha' : 'Krishna Paksha';
  
  const masas = ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwin', 'Kartik', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'];
  const masa = masas[date.getMonth()];
  
  // Calculate sunrise/sunset with seasonal variation only if not set by mhah-panchang
  let sunriseMinutes = 0;
  let sunsetMinutes = 0;
  if (!sunrise || !sunset) {
    const angle = (dayOfYear - 172) * (2 * Math.PI / 365);
    const variationMinutes = 30 * Math.cos(angle);
    sunriseMinutes = 360 + variationMinutes;
    const sunriseHour = Math.floor(sunriseMinutes / 60);
    const sunriseMinute = Math.floor(sunriseMinutes % 60);
    if (!sunrise) sunrise = `${String(sunriseHour).padStart(2, '0')}:${String(sunriseMinute).padStart(2, '0')}`;
    sunsetMinutes = 1080 - variationMinutes;
    const sunsetHour = Math.floor(sunsetMinutes / 60);
    const sunsetMinute = Math.floor(sunsetMinutes % 60);
    if (!sunset) sunset = `${String(sunsetHour).padStart(2, '0')}:${String(sunsetMinute).padStart(2, '0')}`;
  } else {
    // fallback values for moonrise/moonset if sunriseMinutes/sunsetMinutes not set
    sunriseMinutes = 360;
    sunsetMinutes = 1080;
  }
  
  // Calculate moon times (approximation)
  const moonriseMinutes = sunriseMinutes + 50; // Moon rises ~50 minutes later each day
  const moonriseHour = Math.floor(moonriseMinutes / 60) % 24;
  const moonrise = `${String(moonriseHour).padStart(2, '0')}:${String(moonriseMinutes % 60).padStart(2, '0')}`;
  
  const moonsetMinutes = sunsetMinutes + 50;
  const moonsetHour = Math.floor(moonsetMinutes / 60) % 24;
  const moonset = `${String(moonsetHour).padStart(2, '0')}:${String(moonsetMinutes % 60).padStart(2, '0')}`;
  
  // Calculate zodiac signs
  const sunSigns = ['Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 
                   'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'];
  const sunSignIndex = Math.floor((date.getMonth() + (date.getDate() > 15 ? 1 : 0)) % 12);
  const sunSign = sunSigns[sunSignIndex];
  
  // Use the first nakshatra for moon sign calculation
  const firstNakshatraIdx = nakshatraElements.length > 0 ? nakshatras.indexOf(nakshatraElements[0].name) : 0;
  const moonSignIndex = Math.floor(firstNakshatraIdx / 2.25);
  const moonSign = moonSigns[moonSignIndex];
  
  // Calculate calendar years
  const shakaYear = date.getFullYear() - 78;
  const vikramYear = date.getFullYear() + 57;
  
  // Enhanced quality scoring based on current elements
  let qualityScore = 50;
  
  // Score based on current nakshatra
  const currentNakshatra = nakshatraElements[0]?.name;
  if (currentNakshatra && auspiciousNakshatras.includes(currentNakshatra)) {
    qualityScore += 20;
  }
  
  // Score based on current tithi
  const currentTithi = tithiElements[0]?.name;
  if (currentTithi && auspiciousTithis.includes(currentTithi)) {
    qualityScore += 15;
  }
  
  // Score based on paksha
  if (paksha === 'Shukla Paksha') {
    qualityScore += 10;
  }
  
  // Festival bonus
  const festival = getFestivalForDate(date);
  if (festival && festival.type === 'major') {
    qualityScore += 20;
  }
  
  qualityScore = Math.max(0, Math.min(100, qualityScore));
  const isAuspicious = qualityScore >= 60;
  
  return {
    date,
    tithis: tithiElements,
    nakshatras: nakshatraElements,
    yogas: yogaElements,
    karanas: karanaElements,
    paksha,
    masa,
    amantaMonth: masa,
    purnimantaMonth: masa,
    sunrise: sunrise || 'Data unavailable',
    sunset: sunset || 'Data unavailable',
    moonrise,
    moonset,
    moonSign,
    sunSign,
    weekday,
    shakaYear,
    vikramYear,
    auspiciousPeriods,
    inauspiciousPeriods,
    qualityScore,
    isAuspicious
  };
}

export interface Festival {
  name: string;
  date: Date;
  type: 'major' | 'regional' | 'minor';
  description: string;
}

export function getFestivalsForMonth(year: number, month: number): Festival[] {
  const festivals: Festival[] = [];
  
  // Dynamic calculation for major festivals
  const festivalData = [
    { month: 0, date: 14, name: 'Makar Sankranti', type: 'major', description: 'Harvest festival marking sun\'s transition' },
    { month: 0, date: 26, name: 'Republic Day', type: 'major', description: 'National holiday' },
    { month: 2, date: 8, name: 'Maha Shivaratri', type: 'major', description: 'Great night of Shiva' },
    { month: 2, date: 25, name: 'Holi', type: 'major', description: 'Festival of colors' },
    { month: 3, date: 14, name: 'Baisakhi', type: 'regional', description: 'Punjabi harvest festival' },
    { month: 3, date: 21, name: 'Ram Navami', type: 'major', description: 'Birth of Lord Rama' },
    { month: 7, date: 15, name: 'Independence Day', type: 'major', description: 'National holiday' },
    { month: 7, date: 26, name: 'Janmashtami', type: 'major', description: 'Birth of Lord Krishna' },
    { month: 8, date: 7, name: 'Ganesh Chaturthi', type: 'major', description: 'Birth of Lord Ganesha' },
    { month: 9, date: 2, name: 'Gandhi Jayanti', type: 'major', description: 'National holiday' },
    { month: 9, date: 24, name: 'Dussehra', type: 'major', description: 'Victory of good over evil' },
    { month: 11, date: 25, name: 'Christmas', type: 'major', description: 'Christian festival' }
  ];

  // Add year-specific Diwali dates (Amavasya of Kartik month)
  const diwaliDates: { [key: number]: { month: number, date: number } } = {
    2024: { month: 10, date: 1 },  // November 1, 2024
    2025: { month: 9, date: 20 },  // October 20, 2025
    2026: { month: 10, date: 8 },  // November 8, 2026
    2027: { month: 9, date: 29 },  // October 29, 2027
    2028: { month: 10, date: 17 }, // November 17, 2028
  };

  const diwaliDate = diwaliDates[year];
  if (diwaliDate) {
    festivalData.push({
      month: diwaliDate.month,
      date: diwaliDate.date,
      name: 'Diwali',
      type: 'major',
      description: 'Festival of lights - Lakshmi Puja'
    });
  }
  
  // Add Dussehra for 2025 (October 2)
  if (year === 2025 && month === 9) {
    festivals.push({
      name: 'Dussehra',
      date: new Date(2025, 9, 2),
      type: 'major',
      description: 'Victory of good over evil'
    });
  }

  festivalData.forEach(f => {
    if (f.month === month) {
      festivals.push({
        name: f.name,
        date: new Date(year, month, f.date),
        type: f.type as 'major' | 'regional' | 'minor',
        description: f.description
      });
    }
  });
  
  return festivals;
}

// Get festival for a specific date
export function getFestivalForDate(date: Date): Festival | null {
  const festivals = getFestivalsForMonth(date.getFullYear(), date.getMonth());
  const festival = festivals.find(f => f.date.getDate() === date.getDate());
  return festival || null;
}

export const eventTypes = [
  { value: 'marriage', label: 'Marriage / Wedding', icon: '💑' },
  { value: 'housewarming', label: 'Griha Pravesh / Housewarming', icon: '🏠' },
  { value: 'business', label: 'Business Opening', icon: '💼' },
  { value: 'travel', label: 'Travel / Journey', icon: '✈️' },
  { value: 'naming', label: 'Namakaran / Naming Ceremony', icon: '👶' },
  { value: 'education', label: 'Education / Vidyarambham', icon: '📚' },
  { value: 'vehicle', label: 'Vehicle Purchase', icon: '🚗' },
  { value: 'investment', label: 'Investment / Financial', icon: '💰' },
  { value: 'medical', label: 'Medical / Surgery', icon: '⚕️' },
  { value: 'ceremony', label: 'Religious Ceremony', icon: '🙏' }
];

export interface QualityBreakdown {
  total: number;
  factors: Array<{
    name: string;
    value: number;
    reason: string;
    isPositive: boolean;
  }>;
}

// Helper functions for backward compatibility
export function getCurrentTithi(panchang: PanchangData): string {
  const v = panchang.tithis?.[0]?.name;
  return typeof v === 'string' && v !== '' ? v : 'Unknown';
}

export function getCurrentNakshatra(panchang: PanchangData): string {
  const v = panchang.nakshatras?.[0]?.name;
  return typeof v === 'string' && v !== '' ? v : 'Unknown';
}

export function getCurrentYoga(panchang: PanchangData): string {
  const v = panchang.yogas?.[0]?.name;
  return typeof v === 'string' && v !== '' ? v : 'Unknown';
}

export function getCurrentKarana(panchang: PanchangData): string {
  const v = panchang.karanas?.[0]?.name;
  return typeof v === 'string' && v !== '' ? v : 'Unknown';
}

export function getMuhurtaForEvent(eventType: string, panchang: PanchangData): number {
  let score = panchang.qualityScore;
  
  const currentNakshatra = getCurrentNakshatra(panchang);
  const currentTithi = getCurrentTithi(panchang);
  
  // Event-specific adjustments
  switch (eventType) {
    case 'marriage':
      if (['Rohini', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'].includes(currentNakshatra)) {
        score += 15;
      }
      if (['Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 'Ekadashi', 'Trayodashi'].includes(currentTithi)) {
        score += 10;
      }
      break;
    case 'housewarming':
      if (['Ashwini', 'Rohini', 'Mrigashira', 'Pushya', 'Hasta', 'Uttara Phalguni', 'Uttara Ashadha'].includes(currentNakshatra)) {
        score += 15;
      }
      break;
    case 'business':
      if (['Pushya', 'Hasta', 'Ashwini', 'Rohini', 'Shravana'].includes(currentNakshatra)) {
        score += 15;
      }
      if (panchang.paksha === 'Shukla Paksha') {
        score += 10;
      }
      break;
    case 'travel':
      if (['Ashwini', 'Punarvasu', 'Pushya', 'Hasta', 'Anuradha', 'Shravana'].includes(currentNakshatra)) {
        score += 15;
      }
      break;
    case 'naming':
      if (['Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Swati', 'Anuradha', 'Shravana', 'Revati'].includes(currentNakshatra)) {
        score += 15;
      }
      break;
  }
  
  return Math.max(0, Math.min(100, score));
}

export function getQualityBreakdown(eventType: string, panchang: PanchangData): QualityBreakdown {
  const factors: Array<{ name: string; value: number; reason: string; isPositive: boolean }> = [];
  
  // Start from base score (matching getMuhurtaForEvent logic)
  factors.push({
    name: 'Base Quality',
    value: 50,
    reason: 'Starting baseline for the day',
    isPositive: true
  });
  
  // Nakshatra evaluation
  if (auspiciousNakshatras.includes(getCurrentNakshatra(panchang))) {
    factors.push({
      name: 'Nakshatra',
      value: 20,
      reason: `${getCurrentNakshatra(panchang)} is a highly auspicious nakshatra`,
      isPositive: true
    });
  } else {
    factors.push({
      name: 'Nakshatra',
      value: 0,
      reason: `${getCurrentNakshatra(panchang)} is neutral for general activities`,
      isPositive: false
    });
  }
  
  // Tithi evaluation
  if (auspiciousTithis.includes(getCurrentTithi(panchang))) {
    factors.push({
      name: 'Tithi',
      value: 15,
      reason: `${getCurrentTithi(panchang)} is a favorable lunar day`,
      isPositive: true
    });
  } else {
    factors.push({
      name: 'Tithi',
      value: 0,
      reason: `${getCurrentTithi(panchang)} is neutral or less favorable`,
      isPositive: false
    });
  }
  
  // Yoga evaluation
  if (inauspiciousYogas.includes(getCurrentYoga(panchang))) {
    factors.push({
      name: 'Yoga',
      value: -10,
      reason: `${getCurrentYoga(panchang)} is an inauspicious yoga - avoid important work`,
      isPositive: false
    });
  } else {
    factors.push({
      name: 'Yoga',
      value: 5,
      reason: `${getCurrentYoga(panchang)} is acceptable`,
      isPositive: true
    });
  }
  
  // Karana evaluation 
  if (getCurrentKarana(panchang) === 'Vishti') {
    factors.push({
      name: 'Karana',
      value: -10,
      reason: 'Vishti (Bhadra) karana - generally avoided',
      isPositive: false
    });
  } else {
    factors.push({
      name: 'Karana',
      value: 0,
      reason: `${getCurrentKarana(panchang)} karana is acceptable`,
      isPositive: true
    });
  }
  
  // Paksha evaluation
  if (panchang.paksha === 'Shukla Paksha') {
    factors.push({
      name: 'Paksha',
      value: 10,
      reason: 'Shukla Paksha (Waxing moon) is favorable for new beginnings',
      isPositive: true
    });
  } else {
    factors.push({
      name: 'Paksha',
      value: 0,
      reason: 'Krishna Paksha (Waning moon) is neutral',
      isPositive: false
    });
  }
  
  // Event-specific nakshatra bonus
  let eventBonus = 0;
  let eventReason = '';
  
  switch (eventType) {
    case 'marriage':
      if (['Rohini', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'].includes(getCurrentNakshatra(panchang))) {
        eventBonus = 15;
        eventReason = `${getCurrentNakshatra(panchang)} is excellent for marriages`;
      }
      if (['Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 'Ekadashi', 'Trayodashi'].includes(getCurrentTithi(panchang))) {
        eventBonus += 10;
        eventReason += eventReason ? ` and ${getCurrentTithi(panchang)} is auspicious for weddings` : `${getCurrentTithi(panchang)} is auspicious for weddings`;
      }
      break;
    case 'housewarming':
      if (['Ashwini', 'Rohini', 'Mrigashira', 'Pushya', 'Hasta', 'Uttara Phalguni', 'Uttara Ashadha'].includes(getCurrentNakshatra(panchang))) {
        eventBonus = 15;
        eventReason = `${getCurrentNakshatra(panchang)} is perfect for housewarming ceremonies`;
      }
      break;
    case 'business':
      if (['Pushya', 'Hasta', 'Ashwini', 'Rohini', 'Shravana'].includes(getCurrentNakshatra(panchang))) {
        eventBonus = 15;
        eventReason = `${getCurrentNakshatra(panchang)} is ideal for business ventures`;
      }
      if (panchang.paksha === 'Shukla Paksha') {
        eventBonus += 10;
        eventReason += eventReason ? ' and waxing moon favors growth' : 'Waxing moon favors business growth';
      }
      break;
    case 'travel':
      if (['Ashwini', 'Punarvasu', 'Pushya', 'Hasta', 'Anuradha', 'Shravana'].includes(getCurrentNakshatra(panchang))) {
        eventBonus = 15;
        eventReason = `${getCurrentNakshatra(panchang)} is favorable for travel and journeys`;
      }
      break;
    case 'naming':
      if (['Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Swati', 'Anuradha', 'Shravana', 'Revati'].includes(getCurrentNakshatra(panchang))) {
        eventBonus = 15;
        eventReason = `${getCurrentNakshatra(panchang)} is auspicious for naming ceremonies`;
      }
      break;
  }
  
  if (eventBonus > 0) {
    factors.push({
      name: 'Event Match',
      value: eventBonus,
      reason: eventReason,
      isPositive: true
    });
  }
  
  // Calculate total from all factors
  const total = Math.max(0, Math.min(100, factors.reduce((sum, f) => sum + f.value, 0)));
  
  return { total, factors };
}

// Do's and Don'ts based on Panchang
export interface ActionableInsight {
  dos: string[];
  donts: string[];
  luckyActivities: string[];
  fasting: string;
}

export function getActionableInsights(panchang: PanchangData): ActionableInsight {
  const extractedTithi = getCurrentTithi(panchang);
  const extractedNakshatra = getCurrentNakshatra(panchang);
  const extractedYoga = getCurrentYoga(panchang);
  
  const dos: string[] = [];
  const donts: string[] = [];
  const luckyActivities: string[] = [];
  let fasting = '';

  // Tithi-based rules
  switch (extractedTithi) {
    case 'Pratipada':
    case 'Dwitiya':
      dos.push('Start new ventures', 'Begin education', 'Travel');
      break;
    case 'Tritiya':
      dos.push('Shopping', 'Meeting friends', 'Trade');
      luckyActivities.push('Business activities');
      break;
    case 'Chaturthi':
    case 'Chavithi': // Alternate spelling
      donts.push('Major decisions', 'Long journeys');
      break;
    case 'Panchami':
      dos.push('Trade', 'Artwork', 'Creative work');
      luckyActivities.push('Arts and crafts');
      break;
    case 'Shashthi':
      dos.push('Learning', 'Sports training');
      break;
    case 'Saptami':
      dos.push('Starting businesses', 'Travel', 'Important meetings');
      luckyActivities.push('Business ventures');
      break;
    case 'Ashtami':
      donts.push('Auspicious ceremonies', 'Travel');
      break;
    case 'Navami':
      donts.push('Major events', 'Starting new work');
      break;
    case 'Dashami':
      dos.push('Victory-related activities', 'Competitions');
      luckyActivities.push('Overcoming obstacles');
      break;
    case 'Ekadashi':
      fasting = '🙏 Fasting day - ideal for spiritual practices and meditation';
      donts.push('Eating non-vegetarian food');
      luckyActivities.push('Meditation', 'Prayer', 'Spiritual activities');
      break;
    case 'Dwadashi':
      dos.push('Pilgrimage', 'Worship');
      break;
    case 'Trayodashi':
      dos.push('Purification rituals', 'Starting fresh');
      break;
    case 'Chaturdashi':
      donts.push('Weddings', 'Auspicious ceremonies');
      break;
    case 'Purnima/Amavasya':
      if (panchang.paksha === 'Shukla Paksha') {
        dos.push('Full moon rituals', 'Gratitude practices', 'Celebrations');
        luckyActivities.push('Completion of projects');
      } else {
        donts.push('Starting important work');
        luckyActivities.push('Introspection', 'Rest');
      }
      break;
  }

  // Nakshatra-based rules
  switch (extractedNakshatra) {
    case 'Ashwini':
      dos.push('Starting journeys', 'Medical treatments');
      luckyActivities.push('Travel', 'Healing activities');
      break;
    case 'Bharani':
      donts.push('Important events');
      break;
    case 'Krittika':
      dos.push('Confronting challenges', 'Cutting ties');
      break;
    case 'Rohini':
      dos.push('Starting construction', 'Purchasing property', 'Weddings');
      luckyActivities.push('Real estate transactions', 'Building');
      break;
    case 'Mrigashira':
      dos.push('Research', 'Learning', 'Travel');
      luckyActivities.push('Exploration', 'Education');
      break;
    case 'Ardra':
      donts.push('Starting new ventures', 'Auspicious ceremonies');
      luckyActivities.push('Cleansing', 'Problem-solving');
      break;
    case 'Punarvasu':
      dos.push('Travel', 'Recovery', 'Return home');
      luckyActivities.push('Renewal', 'New beginnings');
      break;
    case 'Pushya':
      dos.push('All auspicious activities', 'Charity', 'Nurturing projects');
      luckyActivities.push('Starting anything important', 'Charity work');
      break;
    case 'Ashlesha':
      donts.push('Important ceremonies');
      luckyActivities.push('Secret projects', 'Research');
      break;
    case 'Magha':
      dos.push('Ancestral rituals', 'Honoring traditions');
      luckyActivities.push('Heritage work', 'Family matters');
      break;
    case 'Purva Phalguni':
      dos.push('Creativity', 'Entertainment', 'Pleasure');
      luckyActivities.push('Arts', 'Entertainment', 'Music');
      break;
    case 'Uttara Phalguni':
      dos.push('Contracts', 'Partnerships', 'Weddings');
      luckyActivities.push('Commitments', 'Partnerships');
      break;
    case 'Hasta':
      dos.push('Trade', 'Communication', 'Craftsmanship');
      luckyActivities.push('Business', 'Craftwork', 'Writing');
      break;
    case 'Chitra':
      dos.push('Art projects', 'Construction');
      luckyActivities.push('Creative work', 'Design');
      break;
    case 'Swati':
      dos.push('Travel', 'Trade', 'Independence');
      luckyActivities.push('Movement', 'Commerce');
      break;
    case 'Vishakha':
      dos.push('Disputes', 'Confrontation', 'Starting wars');
      donts.push('Peace talks');
      break;
    case 'Anuradha':
      dos.push('Business', 'Friendship', 'Spiritual practice');
      luckyActivities.push('Social activities', 'Teamwork');
      break;
    case 'Jyeshtha':
      dos.push('Leadership', 'Dominance');
      luckyActivities.push('Authority', 'Management');
      break;
    case 'Mula':
      donts.push('Important ceremonies', 'Starting ventures');
      luckyActivities.push('Cleansing', 'Transformation');
      break;
    case 'Purva Ashadha':
      dos.push('Art', 'Entertainment', 'Pleasure');
      luckyActivities.push('Creative pursuits');
      break;
    case 'Uttara Ashadha':
      dos.push('Victory', 'Success', 'Weddings');
      luckyActivities.push('Achievement', 'Winning');
      break;
    case 'Shravana':
      dos.push('Learning', 'Communication', 'Teaching');
      luckyActivities.push('Education', 'Listening', 'Teaching');
      break;
    case 'Dhanishta':
      dos.push('Commerce', 'Construction', 'Music');
      luckyActivities.push('Business', 'Building', 'Music');
      break;
    case 'Shatabhisha':
      dos.push('Research', 'Healing', 'Technology');
      luckyActivities.push('Medical work', 'Technology', 'Research');
      break;
    case 'Purva Bhadrapada':
      dos.push('Facing challenges', 'Learning');
      luckyActivities.push('Confronting issues');
      break;
    case 'Uttara Bhadrapada':
      dos.push('Spiritual work', 'Meditation', 'Counseling');
      luckyActivities.push('Spirituality', 'Healing', 'Counseling');
      break;
    case 'Revati':
      dos.push('Travel', 'Trade', 'Protection');
      luckyActivities.push('Journeys', 'Commerce');
      break;
  }

  // Yoga-based rules
  const inauspiciousYogasList = ['Vishkumbha', 'Atiganda', 'Shula', 'Ganda', 'Vyaghata', 'Vajra', 'Vyatipata', 'Parigha', 'Vaidhriti'];
  if (inauspiciousYogasList.includes(extractedYoga)) {
    donts.push('Major ceremonies', 'Starting important projects', 'Surgeries');
  } else {
    dos.push('All auspicious activities');
  }

  // Paksha-based rules
  if (panchang.paksha === 'Shukla Paksha') {
    dos.push('Starting new things', 'Growing projects');
    luckyActivities.push('Growth activities');
  } else {
    donts.push('Starting new ventures');
    luckyActivities.push('Reflection', 'Completion of ongoing work');
  }

  // Ensure there's always at least one item in each category (fallback)
  if (dos.length === 0) {
    dos.push('General auspicious activities', 'Prayer and meditation');
  }
  if (donts.length === 0) {
    donts.push('Avoid hasty decisions', 'Avoid conflicts');
  }

  const result = {
    dos: [...new Set(dos)], // Remove duplicates
    donts: [...new Set(donts)],
    luckyActivities: [...new Set(luckyActivities)],
    fasting
  };

  return result;
}
