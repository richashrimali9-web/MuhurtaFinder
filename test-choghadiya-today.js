// Test current Choghadiya output for today
const { calculateChoghadiya } = require('./src/utils/choghadiyaData');

const date = new Date(2025, 9, 27); // October 27, 2025 (Sunday)
const sunrise = '06:30';
const sunset = '17:41';

console.log('=== Current Choghadiya for Oct 27, 2025 (Sunday) ===\n');
console.log(`Sunrise: ${sunrise}, Sunset: ${sunset}\n`);

const result = calculateChoghadiya(date, sunrise, sunset);

console.log('Day Choghadiya Periods:');
result.day.forEach((period, idx) => {
  console.log(`${idx + 1}. ${period.name} (${period.ruler}) - ${period.startTime} to ${period.endTime} - ${period.type}`);
});

console.log('\n=== Expected from mPanchang (Sunday starts with Sun) ===');
console.log('1. Udveg (Sun) - inauspicious');
console.log('2. Char (Venus) - auspicious');
console.log('3. Labh (Mercury) - auspicious');
console.log('4. Amrit (Moon) - auspicious');
console.log('5. Kaal (Saturn) - inauspicious');
console.log('6. Shubh (Jupiter) - auspicious');
console.log('7. Rog (Mars) - inauspicious');
console.log('8. Udveg (Sun) - inauspicious [REPEATS]');
