import { AnalyticsEngine } from './src/engine/AnalyticsEngine.js';
import { MetricEngine } from './src/engine/MetricEngine.js';

console.log('Engines imported successfully');

const metrics = [
    { id: 'm1', type: 'boolean', goal: 1 },
    { id: 'm2', type: 'number', goal: 10 }
];
const logs = [
    { metricId: 'm1', value: true, timestamp: new Date().toISOString() },
    { metricId: 'm2', value: 5, timestamp: new Date().toISOString() }
];

try {
    const stats = AnalyticsEngine.calculateSystemHealth(metrics, logs, 'Weekly');
    console.log('System Health calculated:', stats);
} catch (e) {
    console.error('Error calculating system health:', e);
}
