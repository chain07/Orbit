
import { MetricEngine } from '../src/engine/MetricEngine.js';

// Mock LogEntry class if needed, or just plain objects since MetricEngine doesn't enforce instanceof
const createLog = (timestamp, value) => ({
  id: 'mock-id',
  metricId: 'mock-metric',
  value,
  timestamp
});

// Generate 10,000 logs over the last 10 years
const logs = [];
const today = new Date();
for (let i = 0; i < 3650; i++) {
  const d = new Date(today);
  d.setDate(d.getDate() - i);
  // Add 3 logs per day
  logs.push(createLog(d.toISOString(), 10));
  logs.push(createLog(d.toISOString(), 20));
  logs.push(createLog(d.toISOString(), 30));
}

console.log(`Generated ${logs.length} logs.`);

// Benchmark
const runs = 1000;
const start = performance.now();

for (let i = 0; i < runs; i++) {
  MetricEngine.getLastNDaysValues(logs, 7);
}

const end = performance.now();
const totalTime = end - start;
const avgTime = totalTime / runs;

console.log(`Total time for ${runs} runs: ${totalTime.toFixed(2)}ms`);
console.log(`Average time per run: ${avgTime.toFixed(4)}ms`);

// Verify correctness
const result = MetricEngine.getLastNDaysValues(logs, 7);
console.log('Result for last 7 days:', result);
