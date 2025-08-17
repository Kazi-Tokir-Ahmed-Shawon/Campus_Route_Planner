// Test script to verify mode-specific calculations
const { calculateTime, SPEEDS, DISTANCE_MULTIPLIERS } = require('./dist/graph');

// Test distances (in meters)
const testDistances = [100, 500, 1000, 2000];

console.log('🚶‍♂️ Testing Mode-Specific Calculations\n');

console.log('Speed Constants (m/s):');
Object.entries(SPEEDS).forEach(([mode, speed]) => {
  const kmh = (speed * 3.6).toFixed(1);
  console.log(`  ${mode}: ${speed} m/s (${kmh} km/h)`);
});

console.log('\nDistance Multipliers:');
Object.entries(DISTANCE_MULTIPLIERS).forEach(([mode, multiplier]) => {
  console.log(`  ${mode}: ${multiplier}x`);
});

console.log('\nTime Calculations:');
testDistances.forEach(distance => {
  console.log(`\nDistance: ${distance}m`);
  console.log('  ┌─────────────┬─────────────┬─────────────┬─────────────┐');
  console.log('  │ Mode        │ Distance    │ Time (s)    │ Time (min)  │');
  console.log('  ├─────────────┼─────────────┼─────────────┼─────────────┤');
  
  ['walk', 'cycle', 'disabled'].forEach(mode => {
    const adjustedDistance = distance * DISTANCE_MULTIPLIERS[mode];
    const timeInSeconds = calculateTime(adjustedDistance, mode);
    const timeInMinutes = (timeInSeconds / 60).toFixed(1);
    
    console.log(`  │ ${mode.padEnd(11)} │ ${adjustedDistance.toFixed(0).padStart(11)}m │ ${timeInSeconds.toFixed(1).padStart(11)}s │ ${timeInMinutes.padStart(11)}m │`);
  });
  
  console.log('  └─────────────┴─────────────┴─────────────┴─────────────┘');
});

console.log('\n✅ Verification:');
console.log('- Walking should be slower than cycling');
console.log('- Accessibility mode should be the slowest');
console.log('- Cycling should show the shortest time for the same distance');
console.log('- Distance multipliers should make sense for each mode');
