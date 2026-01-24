
import { performance } from 'perf_hooks';
import { AnalyticsEngine } from '../src/engine/AnalyticsEngine.js';

// Mock data generation
const generateData = (numMetrics, numLogs) => {
  const metrics = [];
  for (let i = 0; i < numMetrics; i++) {
    metrics.push({ id: `metric-${i}`, value: 0 });
  }

  const logs = [];
  const now = Date.now();
  for (let i = 0; i < numLogs; i++) {
    const metricId = `metric-${Math.floor(Math.random() * numMetrics)}`;
    // Random time in last 30 days
    const timestamp = new Date(now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString();
    logs.push({
      id: `log-${i}`,
      metricId,
      value: Math.random() * 100,
      timestamp
    });
  }
  return { metrics, logs };
};

// Original implementation (copied) for comparison baseline
const originalCalculateMomentum = (metrics = [], logs = []) => {
    const results = {};
    const windowDays = 7;
    const today = new Date();

    const currentWindowStart = new Date(today.getTime() - windowDays * 24 * 60 * 60 * 1000);
    const previousWindowStart = new Date(today.getTime() - 2 * windowDays * 24 * 60 * 60 * 1000);

    const logsByMetric = new Map();
    logs.forEach(l => {
      if (!logsByMetric.has(l.metricId)) logsByMetric.set(l.metricId, []);
      logsByMetric.get(l.metricId).push(l);
    });

    metrics.forEach(metric => {
      const metricLogs = logsByMetric.get(metric.id) || [];
      // Note: We need a copy if we are going to sort in place,
      // otherwise we might affect the other run if they share the object
      // But here we construct logsByMetric locally, so it's fine as long as logs array elements are not mutated (they aren't)
      // Wait, metricLogs is an array from the Map.
      // If we sort it in place, and then pass 'logs' to the other function,
      // the 'logs' array order is not changed, but the Map logic...
      // The other function builds its own Map. So it's fine.

      const metricLogsCopy = [...metricLogs];

      metricLogsCopy.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const currentWindowLogs = metricLogsCopy.filter(l => new Date(l.timestamp) >= currentWindowStart);
      const previousWindowLogs = metricLogsCopy.filter(l => {
        const ts = new Date(l.timestamp);
        return ts >= previousWindowStart && ts < currentWindowStart;
      });

      const currentAvg =
        currentWindowLogs.reduce((acc, l) => acc + l.value, 0) / (currentWindowLogs.length || 1);
      const previousAvg =
        previousWindowLogs.reduce((acc, l) => acc + l.value, 0) / (previousWindowLogs.length || 1);

      results[metric.id] = currentAvg - previousAvg;
    });

    return results;
};


// Run benchmark
const { metrics, logs } = generateData(50, 20000);

console.log(`Generated ${metrics.length} metrics and ${logs.length} logs.`);

// Warmup
originalCalculateMomentum(metrics, logs);
AnalyticsEngine.calculateMomentum(metrics, logs);

const iterations = 50;

const startOriginal = performance.now();
for (let i = 0; i < iterations; i++) {
  originalCalculateMomentum(metrics, logs);
}
const endOriginal = performance.now();
const originalTime = (endOriginal - startOriginal) / iterations;

const startActual = performance.now();
for (let i = 0; i < iterations; i++) {
  AnalyticsEngine.calculateMomentum(metrics, logs);
}
const endActual = performance.now();
const actualTime = (endActual - startActual) / iterations;

console.log(`Original Average Time: ${originalTime.toFixed(3)} ms`);
console.log(`Actual (Optimized) Time: ${actualTime.toFixed(3)} ms`);
console.log(`Improvement: ${((originalTime - actualTime) / originalTime * 100).toFixed(2)}%`);

// Verification
const resOriginal = originalCalculateMomentum(metrics, logs);
const resActual = AnalyticsEngine.calculateMomentum(metrics, logs);

const keys = Object.keys(resOriginal);
let match = true;
for(const k of keys) {
    if (Math.abs(resOriginal[k] - resActual[k]) > 0.000001) {
        console.error(`Mismatch for metric ${k}: Original ${resOriginal[k]}, Actual ${resActual[k]}`);
        match = false;
    }
}
if(match) console.log("Verification Passed: Results match.");
