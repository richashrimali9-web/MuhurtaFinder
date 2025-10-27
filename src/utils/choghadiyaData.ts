// Choghadiya calculation utilities
export interface ChoghadiyaPeriod {
  name: string;
  type: 'auspicious' | 'inauspicious' | 'neutral';
  startTime: string;
  endTime: string;
  description: string;
  ruler: string;
  activities: string[];
}

const dayChoghadiyaSequence = [
  { name: 'Udveg', type: 'inauspicious' as const, ruler: 'Sun', description: 'Anxiety and obstacles' },
  { name: 'Char', type: 'auspicious' as const, ruler: 'Venus', description: 'Movement and travel' },
  { name: 'Labh', type: 'auspicious' as const, ruler: 'Mercury', description: 'Profit and gains' },
  { name: 'Amrit', type: 'auspicious' as const, ruler: 'Moon', description: 'Nectar - highly auspicious' },
  { name: 'Kaal', type: 'inauspicious' as const, ruler: 'Saturn', description: 'Death - avoid important work' },
  { name: 'Shubh', type: 'auspicious' as const, ruler: 'Jupiter', description: 'Auspicious for all' },
  { name: 'Rog', type: 'inauspicious' as const, ruler: 'Mars', description: 'Disease - avoid health matters' },
  { name: 'Udveg', type: 'inauspicious' as const, ruler: 'Sun', description: 'Anxiety and obstacles' }
];

const nightChoghadiyaSequence = [
  { name: 'Shubh', type: 'auspicious' as const, ruler: 'Jupiter', description: 'Auspicious for all' },
  { name: 'Amrit', type: 'auspicious' as const, ruler: 'Moon', description: 'Nectar - highly auspicious' },
  { name: 'Char', type: 'auspicious' as const, ruler: 'Venus', description: 'Movement and travel' },
  { name: 'Rog', type: 'inauspicious' as const, ruler: 'Mars', description: 'Disease - avoid health matters' },
  { name: 'Kaal', type: 'inauspicious' as const, ruler: 'Saturn', description: 'Death - avoid important work' },
  { name: 'Labh', type: 'auspicious' as const, ruler: 'Mercury', description: 'Profit and gains' },
  { name: 'Udveg', type: 'inauspicious' as const, ruler: 'Sun', description: 'Anxiety and obstacles' },
  { name: 'Shubh', type: 'auspicious' as const, ruler: 'Jupiter', description: 'Auspicious for all' }
];

const activityRecommendations: Record<string, string[]> = {
  'Amrit': ['Marriages', 'Housewarming', 'Business opening', 'Starting education', 'Buying property', 'Religious ceremonies'],
  'Shubh': ['All activities', 'Important meetings', 'Signing contracts', 'Job interviews', 'Travel'],
  'Labh': ['Financial investments', 'Business deals', 'Shopping', 'Buying vehicles', 'Stock trading'],
  'Char': ['Travel', 'Journeys', 'Moving house', 'Vehicle purchase', 'Starting projects'],
  'Udveg': ['Routine work only', 'Avoid new beginnings', 'Avoid important decisions'],
  'Rog': ['Avoid medical procedures', 'Avoid health-related decisions', 'Routine work only'],
  'Kaal': ['Avoid all important activities', 'Emergency work only', 'Not for new ventures']
};

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function calculateChoghadiya(date: Date, sunrise: string, sunset: string): {
  day: ChoghadiyaPeriod[];
  night: ChoghadiyaPeriod[];
} {
  const sunriseMinutes = parseTime(sunrise);
  const sunsetMinutes = parseTime(sunset);
  
  // Calculate day duration
  const dayDuration = sunsetMinutes - sunriseMinutes;
  const choghadiyaDuration = dayDuration / 8; // 8 periods during day
  
  // Calculate night duration (from sunset to next sunrise)
  const nightDuration = (24 * 60) - dayDuration;
  const nightChoghadiyaDuration = nightDuration / 8;
  
  // Adjust sequence based on weekday using traditional Choghadiya rotation
  // According to mPanchang and traditional Vedic astrology:
  // The day Choghadiya sequence rotates based on the ruling planet of the weekday
  // Base sequence: Udveg(Sun), Char(Venus), Labh(Mercury), Amrit(Moon), Kaal(Saturn), Shubh(Jupiter), Rog(Mars), Udveg(Sun)
  // Each weekday starts with its ruling lord's Choghadiya
  const weekday = date.getDay();
  const daySequence = [...dayChoghadiyaSequence];
  const nightSequence = [...nightChoghadiyaSequence];
  
  // Map weekday to the starting Choghadiya based on mPanchang verified data
  // The pattern is: each day starts with the Choghadiya ruled by that day's lord
  const weekdayToStartIndex: Record<number, number> = {
    0: 0, // Sunday starts with Udveg (ruled by Sun)
    1: 3, // Monday starts with Amrit (ruled by Moon) - VERIFIED with mPanchang Oct 27, 2025
    2: 6, // Tuesday starts with Rog (ruled by Mars)
    3: 2, // Wednesday starts with Labh (ruled by Mercury)
    4: 5, // Thursday starts with Shubh (ruled by Jupiter)
    5: 1, // Friday starts with Char (ruled by Venus)
    6: 4  // Saturday starts with Kaal (ruled by Saturn)
  };
  
  const startIndex = weekdayToStartIndex[weekday];
  
  // Rotate day sequence to start with the correct lord for the weekday
  for (let i = 0; i < startIndex; i++) {
    const first = daySequence.shift();
    if (first) daySequence.push(first);
  }
  
  // Night sequence also rotates similarly
  // Night starts 4 positions ahead in the cycle from where day started
  const nightStartIndex = (startIndex + 4) % 8;
  for (let i = 0; i < nightStartIndex; i++) {
    const first = nightSequence.shift();
    if (first) nightSequence.push(first);
  }
  
  // Calculate day Choghadiya periods
  const dayPeriods: ChoghadiyaPeriod[] = daySequence.map((period, idx) => {
    const startMinutes = sunriseMinutes + (idx * choghadiyaDuration);
    const endMinutes = sunriseMinutes + ((idx + 1) * choghadiyaDuration);
    
    return {
      name: period.name,
      type: period.type,
      startTime: formatTime(Math.round(startMinutes)),
      endTime: formatTime(Math.round(endMinutes)),
      description: period.description,
      ruler: period.ruler,
      activities: activityRecommendations[period.name] || []
    };
  });
  
  // Calculate night Choghadiya periods
  const nightPeriods: ChoghadiyaPeriod[] = nightSequence.map((period, idx) => {
    const startMinutes = sunsetMinutes + (idx * nightChoghadiyaDuration);
    const endMinutes = sunsetMinutes + ((idx + 1) * nightChoghadiyaDuration);
    
    return {
      name: period.name,
      type: period.type,
      startTime: formatTime(Math.round(startMinutes % (24 * 60))),
      endTime: formatTime(Math.round(endMinutes % (24 * 60))),
      description: period.description,
      ruler: period.ruler,
      activities: activityRecommendations[period.name] || []
    };
  });
  
  return {
    day: dayPeriods,
    night: nightPeriods
  };
}

export function getCurrentChoghadiya(periods: ChoghadiyaPeriod[], currentTime: Date): ChoghadiyaPeriod | null {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  for (const period of periods) {
    const startMinutes = parseTime(period.startTime);
    const endMinutes = parseTime(period.endTime);
    
    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return period;
    }
  }
  
  return null;
}
