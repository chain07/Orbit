
import { MetricEngine } from '../src/engine/MetricEngine.js';

const ITERATIONS = 1000;
const LOG_COUNT = 10000;

// Mock data: 10,000 logs distributed over the last year
const logs = [];
const baseTime = new Date('2023-01-01T00:00:00Z').getTime();
for (let i = 0; i < LOG_COUNT; i++) {
  // Random time in the last year
  const offset = Math.floor(Math.random() * 365 * 24 * 3600000);
  logs.push({
    timestamp: new Date(baseTime + offset).toISOString(),
    value: 1
  });
}

const targetDateStr = '2023-06-15T12:00:00Z'; // Some date in the middle

// OLD IMPLEMENTATION (Simulated)
function getValueForDateOld(logs, date) {
    const target = new Date(date);
    target.setHours(0,0,0,0);
    const targetTime = target.getTime();

    return logs.filter(l => {
        const d = new Date(l.timestamp);
        d.setHours(0,0,0,0);
        return d.getTime() === targetTime;
    }).reduce((acc, l) => acc + (parseFloat(l.value) || 0), 0);
}


console.log(`Running Benchmark: ${LOG_COUNT} logs, ${ITERATIONS} iterations`);

// Benchmark Old
const startOld = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    getValueForDateOld(logs, targetDateStr);
}
const endOld = performance.now();
const timeOld = endOld - startOld;
console.log(`Old Implementation: ${timeOld.toFixed(2)}ms`);


// Benchmark New (Optimized)
const startNew = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    MetricEngine.getValueForDate(logs, targetDateStr);
}
const endNew = performance.now();
const timeNew = endNew - startNew;
console.log(`New Implementation: ${timeNew.toFixed(2)}ms`);

const speedup = timeOld / timeNew;
console.log(`Speedup: ${speedup.toFixed(2)}x`);
