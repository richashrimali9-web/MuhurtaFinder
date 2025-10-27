// Binary search to find exact Tithi/Nakshatra transition times
const { MhahPanchang } = require('mhah-panchang');

const panchang = new MhahPanchang();

function findTransitionTime(date, latitude, longitude, elementType = 'Tithi') {
  // Sample at midnight and end of day to see if there's a transition
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const startResult = panchang.calendar(startOfDay, latitude, longitude);
  const endResult = panchang.calendar(endOfDay, latitude, longitude);
  
  const startElement = startResult[elementType]?.name_en_IN || startResult[elementType]?.name;
  const endElement = endResult[elementType]?.name_en_IN || endResult[elementType]?.name;
  
  console.log(`${elementType} at start of day: ${startElement}`);
  console.log(`${elementType} at end of day: ${endElement}`);
  
  if (startElement === endElement) {
    console.log(`No ${elementType} transition during the day.`);
    return null;
  }
  
  // Binary search for transition time
  let left = startOfDay.getTime();
  let right = endOfDay.getTime();
  let transitionTime = null;
  
  console.log(`\nSearching for ${elementType} transition from ${startElement} to ${endElement}...`);
  
  while (right - left > 60000) { // Within 1 minute accuracy
    const mid = Math.floor((left + right) / 2);
    const midDate = new Date(mid);
    const midResult = panchang.calendar(midDate, latitude, longitude);
    const midElement = midResult[elementType]?.name_en_IN || midResult[elementType]?.name;
    
    if (midElement === startElement) {
      left = mid;
    } else {
      right = mid;
      transitionTime = midDate;
    }
  }
  
  if (transitionTime) {
    console.log(`\n✓ ${elementType} transition found at: ${transitionTime.toLocaleString('en-IN')}`);
    console.log(`  ${startElement} → ${endElement}`);
    return {
      time: transitionTime,
      from: startElement,
      to: endElement
    };
  }
  
  return null;
}

// Test for November 30, 2025 - Jodhpur
const date = new Date(2025, 10, 30);
const latitude = 26.2389;
const longitude = 73.0243;

console.log('=== Finding Transitions for Nov 30, 2025 - Jodhpur ===\n');

const tithiTransition = findTransitionTime(date, latitude, longitude, 'Tithi');
const nakshatraTransition = findTransitionTime(date, latitude, longitude, 'Nakshatra');
const yogaTransition = findTransitionTime(date, latitude, longitude, 'Yoga');

console.log('\n=== Summary ===');
if (tithiTransition) {
  console.log(`Tithi: ${tithiTransition.from} until ${tithiTransition.time.toLocaleTimeString('en-IN')}`);
  console.log(`       ${tithiTransition.to} from ${tithiTransition.time.toLocaleTimeString('en-IN')} onwards`);
}
if (nakshatraTransition) {
  console.log(`Nakshatra: ${nakshatraTransition.from} until ${nakshatraTransition.time.toLocaleTimeString('en-IN')}`);
  console.log(`           ${nakshatraTransition.to} from ${nakshatraTransition.time.toLocaleTimeString('en-IN')} onwards`);
}
