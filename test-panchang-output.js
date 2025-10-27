// Test script to examine mhah-panchang output structure
const { MhahPanchang } = require('mhah-panchang');

const panchang = new MhahPanchang();

// Test for Nov 30, 2025 - the problematic date
const date = new Date(2025, 10, 30); // Month is 0-indexed, so 10 = November
const latitude = 26.2389; // Jodhpur
const longitude = 73.0243;

console.log('=== Testing Nov 30, 2025 - Jodhpur ===\n');

// Test at different times throughout the day
const testTimes = [
  new Date(2025, 10, 30, 0, 0),   // Midnight
  new Date(2025, 10, 30, 6, 0),   // 6 AM
  new Date(2025, 10, 30, 7, 0),   // 7 AM (around sunrise)
  new Date(2025, 10, 30, 12, 0),  // Noon
  new Date(2025, 10, 30, 18, 0),  // 6 PM
  new Date(2025, 10, 30, 23, 59), // Just before midnight
];

testTimes.forEach(time => {
  console.log(`\n--- Time: ${time.toLocaleTimeString('en-IN')} ---`);
  const result = panchang.calendar(time, latitude, longitude);
  
  console.log('Full result object:', JSON.stringify(result, null, 2));
  
  if (result.Tithi) {
    console.log('Tithi:', result.Tithi);
  }
  if (result.Nakshatra) {
    console.log('Nakshatra:', result.Nakshatra);
  }
});

// Also test sunTimer
console.log('\n=== Sun Timer for Nov 30, 2025 ===');
const sun = panchang.sunTimer(date, latitude, longitude);
console.log('Sun object:', JSON.stringify(sun, null, 2));
if (sun.sunRise) {
  console.log('Sunrise:', sun.sunRise);
}
if (sun.sunSet) {
  console.log('Sunset:', sun.sunSet);
}
