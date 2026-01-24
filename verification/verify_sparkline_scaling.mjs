import { WidgetDataEngine } from '../src/engine/WidgetDataEngine.js';
import { MetricType } from '../src/types/schemas.js';

console.log("Verifying Sparkline Scaling Fix...");

const now = new Date();
const today = now.toISOString();

// Create a date for yesterday
const yesterdayDate = new Date();
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterday = yesterdayDate.toISOString();

const metric = {
    id: 'test-metric-1',
    label: 'Test Metric',
    type: MetricType.NUMBER,
    goal: 10,
    widgetType: 'sparkline'
};

const logs = [
    {
        metricId: 'test-metric-1',
        value: 5,
        timestamp: today
    },
    {
        metricId: 'test-metric-1',
        value: 15,
        timestamp: yesterday
    }
];

// Call sparklineData
const result = WidgetDataEngine.sparklineData(metric, logs, 'Weekly');

console.log("Result Data:", result.data);
console.log("Result Current:", result.current);

// Verification Logic
// 1. Check if current value is raw (should be 5). If normalized it would be 0.5.
if (result.current === 5) {
    console.log("✅ Current value is raw (5).");
} else {
    console.error(`❌ Current value mismatch. Expected 5, got ${result.current}`);
    process.exit(1);
}

// 2. Check if history data contains raw values.
// The array is last 7 days. last element should be today (5), element before that yesterday (15).
const lastVal = result.data[result.data.length - 1];
const prevVal = result.data[result.data.length - 2];

if (lastVal === 5 && prevVal === 15) {
     console.log(`✅ History values are raw (Today: ${lastVal}, Yesterday: ${prevVal}).`);
} else {
    console.error(`❌ History values mismatch. Expected Today: 5, Yesterday: 15. Got Today: ${lastVal}, Yesterday: ${prevVal}`);
    process.exit(1);
}

console.log("Verification Successful: Sparkline data is returning raw values.");
