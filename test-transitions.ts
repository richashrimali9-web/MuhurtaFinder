// Test the new transition time feature
import { calculatePanchang, getCurrentTithi, getCurrentNakshatra } from './src/utils/panchangData';

async function testTransitions() {
  console.log('=== Testing Transition Time Feature ===\n');
  
  // Test Nov 30, 2025 - Jodhpur (the problematic date)
  const date = new Date(2025, 10, 30); // November 30, 2025
  const location = 'Jodhpur';
  const latitude = 26.2389;
  const longitude = 73.0243;
  
  console.log(`Date: ${date.toLocaleDateString('en-IN')}`);
  console.log(`Location: ${location}\n`);
  
  const panchang = await calculatePanchang(date, location, latitude, longitude);
  
  console.log('Panchang Data:');
  console.log('---------------');
  console.log('Sunrise:', panchang.sunrise);
  console.log('Sunset:', panchang.sunset);
  console.log('\nTithi:', getCurrentTithi(panchang));
  console.log('Nakshatra:', getCurrentNakshatra(panchang));
  
  console.log('\nDetailed Tithi Information:');
  panchang.tithis.forEach((tithi, idx) => {
    console.log(`  ${idx + 1}. ${tithi.name}`);
    if (tithi.startTime && tithi.endTime) {
      console.log(`     Duration: ${tithi.startTime} to ${tithi.endTime}`);
    }
  });
  
  console.log('\nDetailed Nakshatra Information:');
  panchang.nakshatras.forEach((nakshatra, idx) => {
    console.log(`  ${idx + 1}. ${nakshatra.name}`);
    if (nakshatra.startTime && nakshatra.endTime) {
      console.log(`     Duration: ${nakshatra.startTime} to ${nakshatra.endTime}`);
    }
  });
  
  console.log('\n✓ Transition detection complete!');
  console.log('\nExpected results (based on DrikPanchang):');
  console.log('- Navami should end around 12:39 AM');
  console.log('- Dasami should be the predominant Tithi');
  console.log('- Uttara Bhadrapada should be the predominant Nakshatra');
}

testTransitions().catch(console.error);
