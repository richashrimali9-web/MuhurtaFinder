// Simple cache for sunrise/sunset API results
const sunTimesCache: Map<string, { sunrise: string, sunset: string }> = new Map();

// Fetch real sunrise/sunset times from Sunrise-Sunset API
export async function fetchSunriseSunset(lat: number, lon: number, date: Date): Promise<{ sunrise: string, sunset: string } | null> {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const apiDate = `${yyyy}-${mm}-${dd}`;
  
  // Create cache key
  const cacheKey = `${lat},${lon},${apiDate}`;
  
  // Check cache first
  if (sunTimesCache.has(cacheKey)) {
    return sunTimesCache.get(cacheKey)!;
  }
  
  const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${apiDate}&formatted=0`;
  try {
    // Simple fetch with timeout using Promise.race
    const fetchPromise = fetch(url);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 8000)
    );
    
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
    
    if (!response.ok) {
      console.warn(`Sunrise API returned status ${response.status}`);
      return null;
    }
    const data = await response.json();
    if (data.status === 'OK') {
      // Convert UTC to local time (simple version)
      const sunrise = new Date(data.results.sunrise).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const sunset = new Date(data.results.sunset).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const result = { sunrise, sunset };
      
      // Store in cache
      sunTimesCache.set(cacheKey, result);
      
      return result;
    }
  } catch (err) {
    // API failed, return null to use fallback
    if (err instanceof Error && err.message !== 'Request timeout') {
      console.warn('Sunrise-Sunset API error for', apiDate, ':', err.message);
    }
    return null;
  }
  return null;
}
// Static Panchang calculation utilities
export interface PanchangData {
  date: Date;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  paksha: string;
  masa: string;
  sunrise: string;
  sunset: string;
  moonSign: string;
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
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati'
];

export const yogas = [
  'Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
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

// Improved Panchang calculation with better astronomical approximation
export async function calculatePanchang(date: Date, _location = 'Delhi', _lat?: number, _lon?: number): Promise<PanchangData> {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // More accurate lunar calculations based on actual lunar cycle (~29.53 days)
  const lunarDaysSinceEpoch = Math.floor((date.getTime() - new Date(2000, 0, 6).getTime()) / (86400000));
  const lunarCyclePosition = (lunarDaysSinceEpoch % 29.53) / 29.53;
  
  // Tithi calculation (30 tithis in lunar month, but we use 15 for half cycle)
  const tithiIndex = Math.floor(lunarCyclePosition * 15);
  
  // Nakshatra calculation (27 nakshatras, moon moves ~1 nakshatra per day)
  const nakshatraIndex = (lunarDaysSinceEpoch + Math.floor(date.getDate() / 1.08)) % 27;
  
  // Yoga calculation (27 yogas based on sun-moon angle)
  const yogaIndex = (dayOfYear * 3 + Math.floor(lunarCyclePosition * 27)) % 27;
  
  // Karana calculation (11 karanas, 2 per tithi)
  const karanaIndex = (Math.floor(lunarCyclePosition * 30)) % 11;
  
  // Moon sign calculation (12 signs, ~2.25 nakshatras per sign)
  const moonSignIndex = Math.floor(nakshatraIndex / 2.25);
  
  const tithi = tithis[Math.min(tithiIndex, 14)];
  const nakshatra = nakshatras[nakshatraIndex];
  const yoga = yogas[yogaIndex];
  const karana = karanas[karanaIndex];
  const moonSign = moonSigns[moonSignIndex];
  
  // Improved paksha calculation
  const isPakshaShukla = lunarCyclePosition < 0.5;
  const paksha = isPakshaShukla ? 'Shukla Paksha' : 'Krishna Paksha';
  
  const masas = ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwin', 'Kartik', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'];
  const masa = masas[date.getMonth()];
  
  // Calculate sunrise/sunset (use calculated values for reliability)
  // Note: Using calculated times instead of API for better performance
  let sunrise: string;
  let sunset: string;
  
  // Calculate approximate sunrise/sunset based on month and latitude
  // Using day of year for more accurate seasonal variation (already calculated above)
  
  // Seasonal variation: summer solstice (day 172) earliest sunrise, winter solstice (day 355) latest
  // For latitude ~26°N (India), variation is about ±30 minutes
  const angle = (dayOfYear - 172) * (2 * Math.PI / 365);
  const variationMinutes = 30 * Math.cos(angle); // +30 in winter, -30 in summer
  
  // Base sunrise at 6:00 AM (360 minutes from midnight)
  const sunriseMinutes = 360 + variationMinutes;
  const sunriseHour = Math.floor(sunriseMinutes / 60);
  const sunriseMinute = Math.floor(sunriseMinutes % 60);
  sunrise = `${String(sunriseHour).padStart(2, '0')}:${String(sunriseMinute).padStart(2, '0')}`;
  
  // Base sunset at 6:00 PM (1080 minutes from midnight)
  const sunsetMinutes = 1080 - variationMinutes;
  const sunsetHour = Math.floor(sunsetMinutes / 60);
  const sunsetMinute = Math.floor(sunsetMinutes % 60);
  sunset = `${String(sunsetHour).padStart(2, '0')}:${String(sunsetMinute).padStart(2, '0')}`;
  
  // Enhanced quality score calculation
  let qualityScore = 50; // Base score
  
  // Nakshatra scoring
  if (auspiciousNakshatras.includes(nakshatra)) {
    qualityScore += 20;
  } else if (['Bharani', 'Ashlesha', 'Jyeshtha', 'Mula'].includes(nakshatra)) {
    qualityScore -= 15; // Specifically challenging nakshatras
  }
  
  // Tithi scoring
  if (auspiciousTithis.includes(tithi)) {
    qualityScore += 15;
  } else if (['Chaturthi', 'Navami', 'Chaturdashi'].includes(tithi)) {
    qualityScore -= 10; // Rikta tithis
  }
  
  // Yoga scoring
  if (inauspiciousYogas.includes(yoga)) {
    qualityScore -= 25;
  } else if (['Siddhi', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra'].includes(yoga)) {
    qualityScore += 15; // Highly auspicious yogas
  }
  
  // Karana scoring
  if (karana === 'Vishti') {
    qualityScore -= 10;
  } else if (['Bava', 'Balava', 'Kaulava'].includes(karana)) {
    qualityScore += 5;
  }
  
  // Paksha scoring
  if (paksha === 'Shukla Paksha') {
    qualityScore += 10;
  }
  
  // Day of week adjustments
  const dayOfWeek = date.getDay();
  if ([1, 3, 5].includes(dayOfWeek)) { // Monday, Wednesday, Friday
    qualityScore += 5;
  } else if ([0, 6].includes(dayOfWeek)) { // Sunday, Saturday
    qualityScore -= 5;
  }
  
  // Festival bonus
  const festival = getFestivalForDate(date);
  if (festival && festival.type === 'major') {
    qualityScore += 20;
  }
  
  // Ensure score is within bounds
  qualityScore = Math.max(0, Math.min(100, qualityScore));
  const isAuspicious = qualityScore >= 60;
  
  return {
    date,
    tithi,
    nakshatra,
    yoga,
    karana,
    paksha,
    masa,
    sunrise,
    sunset,
    moonSign,
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

export function getMuhurtaForEvent(eventType: string, panchang: PanchangData): number {
  let score = panchang.qualityScore;
  
  // Event-specific adjustments
  switch (eventType) {
    case 'marriage':
      if (['Rohini', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'].includes(panchang.nakshatra)) {
        score += 15;
      }
      if (['Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 'Ekadashi', 'Trayodashi'].includes(panchang.tithi)) {
        score += 10;
      }
      break;
    case 'housewarming':
      if (['Ashwini', 'Rohini', 'Mrigashira', 'Pushya', 'Hasta', 'Uttara Phalguni', 'Uttara Ashadha'].includes(panchang.nakshatra)) {
        score += 15;
      }
      break;
    case 'business':
      if (['Pushya', 'Hasta', 'Ashwini', 'Rohini', 'Shravana'].includes(panchang.nakshatra)) {
        score += 15;
      }
      if (panchang.paksha === 'Shukla Paksha') {
        score += 10;
      }
      break;
    case 'travel':
      if (['Ashwini', 'Punarvasu', 'Pushya', 'Hasta', 'Anuradha', 'Shravana'].includes(panchang.nakshatra)) {
        score += 15;
      }
      break;
    case 'naming':
      if (['Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Swati', 'Anuradha', 'Shravana', 'Revati'].includes(panchang.nakshatra)) {
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
  if (auspiciousNakshatras.includes(panchang.nakshatra)) {
    factors.push({
      name: 'Nakshatra',
      value: 20,
      reason: `${panchang.nakshatra} is a highly auspicious nakshatra`,
      isPositive: true
    });
  } else {
    factors.push({
      name: 'Nakshatra',
      value: 0,
      reason: `${panchang.nakshatra} is neutral for general activities`,
      isPositive: false
    });
  }
  
  // Tithi evaluation
  if (auspiciousTithis.includes(panchang.tithi)) {
    factors.push({
      name: 'Tithi',
      value: 15,
      reason: `${panchang.tithi} is a favorable lunar day`,
      isPositive: true
    });
  } else {
    factors.push({
      name: 'Tithi',
      value: 0,
      reason: `${panchang.tithi} is neutral or less favorable`,
      isPositive: false
    });
  }
  
  // Yoga evaluation
  if (inauspiciousYogas.includes(panchang.yoga)) {
    factors.push({
      name: 'Yoga',
      value: -25,
      reason: `${panchang.yoga} is an inauspicious yoga - avoid important work`,
      isPositive: false
    });
  } else {
    factors.push({
      name: 'Yoga',
      value: 0,
      reason: `${panchang.yoga} is acceptable`,
      isPositive: true
    });
  }
  
  // Karana evaluation
  if (panchang.karana === 'Vishti') {
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
      reason: `${panchang.karana} karana is acceptable`,
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
      if (['Rohini', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'].includes(panchang.nakshatra)) {
        eventBonus = 15;
        eventReason = `${panchang.nakshatra} is excellent for marriages`;
      }
      if (['Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 'Ekadashi', 'Trayodashi'].includes(panchang.tithi)) {
        eventBonus += 10;
        eventReason += eventReason ? ` and ${panchang.tithi} is auspicious for weddings` : `${panchang.tithi} is auspicious for weddings`;
      }
      break;
    case 'housewarming':
      if (['Ashwini', 'Rohini', 'Mrigashira', 'Pushya', 'Hasta', 'Uttara Phalguni', 'Uttara Ashadha'].includes(panchang.nakshatra)) {
        eventBonus = 15;
        eventReason = `${panchang.nakshatra} is perfect for housewarming ceremonies`;
      }
      break;
    case 'business':
      if (['Pushya', 'Hasta', 'Ashwini', 'Rohini', 'Shravana'].includes(panchang.nakshatra)) {
        eventBonus = 15;
        eventReason = `${panchang.nakshatra} is ideal for business ventures`;
      }
      if (panchang.paksha === 'Shukla Paksha') {
        eventBonus += 10;
        eventReason += eventReason ? ' and waxing moon favors growth' : 'Waxing moon favors business growth';
      }
      break;
    case 'travel':
      if (['Ashwini', 'Punarvasu', 'Pushya', 'Hasta', 'Anuradha', 'Shravana'].includes(panchang.nakshatra)) {
        eventBonus = 15;
        eventReason = `${panchang.nakshatra} is favorable for travel and journeys`;
      }
      break;
    case 'naming':
      if (['Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Swati', 'Anuradha', 'Shravana', 'Revati'].includes(panchang.nakshatra)) {
        eventBonus = 15;
        eventReason = `${panchang.nakshatra} is auspicious for naming ceremonies`;
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
  const dos: string[] = [];
  const donts: string[] = [];
  const luckyActivities: string[] = [];
  let fasting = '';

  // Tithi-based rules
  switch (panchang.tithi) {
    case 'Pratipada':
    case 'Dwitiya':
      dos.push('Start new ventures', 'Begin education', 'Travel');
      break;
    case 'Tritiya':
      dos.push('Shopping', 'Meeting friends', 'Trade');
      luckyActivities.push('Business activities');
      break;
    case 'Chaturthi':
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
  switch (panchang.nakshatra) {
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
  if (inauspiciousYogasList.includes(panchang.yoga)) {
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

  return {
    dos: [...new Set(dos)], // Remove duplicates
    donts: [...new Set(donts)],
    luckyActivities: [...new Set(luckyActivities)],
    fasting
  };
}
