
// Performance Benchmark for MetricEngine.getLastNDaysValues

import { MetricEngine } from '../src/engine/MetricEngine.js';

// Define the "Slow" implementation (as per task description)
const slowGetLastNDaysValues = (logs = [], days = 7) => {
  const values = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Mimic the behavior of calling getValueForDate in a loop
    // Note: We need to use MetricEngine.getValueForDate or a copy of it.
    // Since we are inside the same module in the real code, we can simulate it.

    const target = d.toLocaleDateString();
    const val = logs
      .filter(l => new Date(l.timestamp).toLocaleDateString() === target)
      .reduce((acc, l) => acc + (parseFloat(l.value) || 0), 0);

    values.push(val);
  }
  return values;
};

// Generate Test Data
const generateLogs = (count, daysSpan) => {
  const logs = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * daysSpan));
    logs.push({
      timestamp: d.toISOString(),
      value: Math.random() * 10,
    });
  }
  return logs;
};

const runBenchmark = () => {
  const LOG_COUNT = 10000;
  const DAYS_SPAN = 365;
  const WINDOW_DAYS = 7;

  console.log(`Generating ${LOG_COUNT} logs over ${DAYS_SPAN} days...`);
  const logs = generateLogs(LOG_COUNT, DAYS_SPAN);

  // Baseline (Slow)
  const startSlow = performance.now();
  const resSlow = slowGetLastNDaysValues(logs, WINDOW_DAYS);
  const endSlow = performance.now();
  const timeSlow = endSlow - startSlow;

  // Current/Optimized (MetricEngine)
  const startFast = performance.now();
  const resFast = MetricEngine.getLastNDaysValues(logs, WINDOW_DAYS);
  const endFast = performance.now();
  const timeFast = endFast - startFast;

  console.log(`\nBenchmark Results (Window: ${WINDOW_DAYS} days):`);
  console.log(`Slow Implementation: ${timeSlow.toFixed(4)} ms`);
  console.log(`Fast Implementation: ${timeFast.toFixed(4)} ms`);
  console.log(`Improvement: ${(timeSlow / timeFast).toFixed(2)}x faster`);

  // Verify Correctness
  // Floating point arithmetic might cause slight differences, so use a tolerance
  const isClose = (a, b) => Math.abs(a - b) < 0.0001;
  const allMatch = resSlow.every((v, i) => isClose(v, resFast[i]));

  if (allMatch) {
    console.log('\n✅ Verification Passed: Results match.');
  } else {
    console.error('\n❌ Verification Failed: Results do not match.');
    console.log('Slow:', resSlow);
    console.log('Fast:', resFast);
  }
};

runBenchmark();
