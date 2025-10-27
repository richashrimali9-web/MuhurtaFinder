// Quick debug test - paste this in browser console on localhost:3000
// Test Nov 30, 2025 to see if transition times are being calculated

async function testNov30() {
  const { calculatePanchang, getCurrentTithi, getCurrentNakshatra } = await import('./src/utils/panchangData.js');
  
  const date = new Date(2025, 10, 30); // Nov 30, 2025
  const panchang = await calculatePanchang(date, 'Jodhpur', 26.2389, 73.0243);
  
  console.log('=== Nov 30, 2025 Debug ===');
  console.log('Panchang object:', panchang);
  console.log('Tithis array:', panchang.tithis);
  console.log('Nakshatras array:', panchang.nakshatras);
  console.log('\nFormatted Tithi:', getCurrentTithi(panchang));
  console.log('Formatted Nakshatra:', getCurrentNakshatra(panchang));
  
  console.log('\nExpected: Transition times should be shown');
  console.log('Navami (12:00 AM - 12:39 AM), Dasami (12:39 AM - 11:59 PM)');
}

testNov30();
