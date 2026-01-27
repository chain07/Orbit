// src/engine/AnalyticsEngine.js
import { MetricEngine } from './MetricEngine.js';
import { MetricType } from '../types/schemas.js';

/**
 * AnalyticsEngine
 * Provides advanced multi-metric analytics for ORBIT
 */
export const AnalyticsEngine = {
  // ----------------------
  // NEW: Calculate Trend (Percentage Change)
  // Input: Array of numbers (e.g. last 7 days values)
  // Output: Integer percentage (e.g. 15 for +15%, -10 for -10%)
  // ----------------------
  calculateTrend: (values = []) => {
    if (!values || values.length < 2) return 0;

    // Split data into two halves to compare recent vs previous performance
    const mid = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, mid);
    const secondHalf = values.slice(mid); // If odd length, second half includes the middle/extra item

    // Calculate averages
    const getAvg = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
    const avgFirst = getAvg(firstHalf);
    const avgSecond = getAvg(secondHalf);

    // Prevent divide by zero
    if (avgFirst === 0) {
      return avgSecond > 0 ? 100 : 0;
    }

    // Calculate percentage change
    const percentChange = ((avgSecond - avgFirst) / avgFirst) * 100;
    
    return Math.round(percentChange);
  },

  // ----------------------
  // Rolling averages per metric
  // ----------------------
  rollingAverages: (metrics = [], logs = [], windowDays = 7) => {
    const results = {};

    // Pre-group logs by metricId
    const logsByMetric = new Map();
    logs.forEach(l => {
      if (!logsByMetric.has(l.metricId)) logsByMetric.set(l.metricId, []);
      logsByMetric.get(l.metricId).push(l);
    });

    metrics.forEach(metric => {
      const metricLogs = logsByMetric.get(metric.id) || [];
      // Pass only the logs for this metric to MetricEngine
      // MetricEngine will filter by metric.id again, but since we pass only relevant logs, it's efficient
      results[metric.id] = MetricEngine.rollingAverage(metricLogs, metric.id, windowDays);
    });
    return results;
  },

  // ----------------------
  // Momentum Calculation (formerly Trend Deltas)
  // Compares current 7-day window vs previous 7-day window
  // Input: metrics, logs
  // Output: Object { metricId: number (delta) }
  // ----------------------
  calculateMomentum: (metrics = [], logs = []) => {
    const results = {};
    const windowDays = 7;
    const today = new Date();

    // Normalize dates to start of day for cleaner comparison?
    // Or just use timestamps. Timestamps are fine for rolling windows.

    const currentWindowStart = new Date(today.getTime() - windowDays * 24 * 60 * 60 * 1000);
    const previousWindowStart = new Date(today.getTime() - 2 * windowDays * 24 * 60 * 60 * 1000);

    // Pre-group logs by metricId for O(1) lookup
    const logsByMetric = new Map();
    logs.forEach(l => {
      if (!logsByMetric.has(l.metricId)) logsByMetric.set(l.metricId, []);
      logsByMetric.get(l.metricId).push(l);
    });

    metrics.forEach(metric => {
      const metricLogs = logsByMetric.get(metric.id) || [];

      // Sort logs by timestamp ascending
      metricLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const currentWindowLogs = metricLogs.filter(l => new Date(l.timestamp) >= currentWindowStart);
      const previousWindowLogs = metricLogs.filter(l => {
        const ts = new Date(l.timestamp);
        return ts >= previousWindowStart && ts < currentWindowStart;
      });

      const currentAvg =
        currentWindowLogs.reduce((acc, l) => acc + l.value, 0) / (currentWindowLogs.length || 1);
      const previousAvg =
        previousWindowLogs.reduce((acc, l) => acc + l.value, 0) / (previousWindowLogs.length || 1);

      results[metric.id] = currentAvg - previousAvg; // positive = upward momentum
    });

    return results;
  },

  // Alias for backward compatibility if needed, but we should remove "trendDeltas" calls
  trendDeltas: (metrics = [], logs = [], windowDays = 7) => {
      // Mapping old call to new Momentum logic, ignoring windowDays argument for strict 7-day momentum
      return AnalyticsEngine.calculateMomentum(metrics, logs);
  },

  // ----------------------
  // Multi-metric normalization
  // ----------------------
  normalizedMetrics: (metrics = [], logs = []) => {
    const results = {};

    // Pre-group logs by metricId
    const logsByMetric = new Map();
    logs.forEach(l => {
      if (!logsByMetric.has(l.metricId)) logsByMetric.set(l.metricId, []);
      logsByMetric.get(l.metricId).push(l);
    });

    metrics.forEach(metric => {
      const metricLogs = logsByMetric.get(metric.id) || [];
      results[metric.id] = metricLogs.map(l => MetricEngine.normalizeValue(metric, l.value));
    });
    return results;
  },

  // ----------------------
  // Lagged correlations (Pearson) between pairs of metrics
  // OPTIMIZED: Pre-calculates sorted values to avoid inner loop filtering/sorting
  // ----------------------
  laggedCorrelations: (metrics = [], logs = [], lagDays = 0) => {
    const correlations = {};

    // 1. Pre-calculate sorted values for all metrics
    const valuesCache = {};

    // Group first to avoid repeated filters on big logs array
    const groupedLogs = new Map();
    logs.forEach(l => {
        if (!groupedLogs.has(l.metricId)) groupedLogs.set(l.metricId, []);
        groupedLogs.get(l.metricId).push(l);
    });

    metrics.forEach(metric => {
        const mLogs = groupedLogs.get(metric.id) || [];
        mLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        valuesCache[metric.id] = mLogs.map(l => l.value);
    });

    // 2. Pre-calculate slices and stats for all metrics
    // We need two versions for each metric:
    // - "Head" (values[0...N-lag]) -> acts as idA
    // - "Tail" (values[lag...N]) -> acts as idB
    const precalc = {};

    metrics.forEach(metric => {
        const id = metric.id;
        const fullValues = valuesCache[id] || [];

        // Head slice
        const headValues = fullValues.slice(0, -lagDays || undefined);
        const headMean = headValues.length ? headValues.reduce((a, b) => a + b, 0) / headValues.length : 0;
        // Optimization: Pre-calculate deviations for head to avoid repeated subtractions
        const headDeviations = headValues.map(v => v - headMean);
        const headDenom = headDeviations.reduce((acc, dev) => acc + dev * dev, 0);

        // Tail slice
        const tailValues = fullValues.slice(lagDays);
        const tailMean = tailValues.length ? tailValues.reduce((a, b) => a + b, 0) / tailValues.length : 0;
        // Optimization: Pre-calculate deviations for tail
        const tailDeviations = tailValues.map(v => v - tailMean);
        const tailDenom = tailDeviations.reduce((acc, dev) => acc + dev * dev, 0);

        precalc[id] = {
            head: { values: headValues, mean: headMean, deviations: headDeviations, denom: headDenom },
            tail: { values: tailValues, mean: tailMean, deviations: tailDeviations, denom: tailDenom }
        };
    });

    // 3. Pairwise loop using pre-calculated stats
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const idA = metrics[i].id;
        const idB = metrics[j].id;

        const dataA = precalc[idA].head;
        const dataB = precalc[idB].tail;

        if (dataA.values.length !== dataB.values.length || dataA.values.length === 0) {
          correlations[`${idA}-${idB}`] = null;
          continue;
        }

        const denomA = dataA.denom;
        const denomB = dataB.denom;
        const devA = dataA.deviations;
        const devB = dataB.deviations;

        let numerator = 0;
        const len = devA.length;
        for (let k = 0; k < len; k++) {
          numerator += devA[k] * devB[k];
        }

        correlations[`${idA}-${idB}`] = numerator / (Math.sqrt(denomA * denomB) || 1);
      }
    }

    return correlations;
  },

  // ----------------------
  // Time-window comparison summaries
  // ----------------------
  windowComparisons: (metrics = [], logs = [], windowDays = 7) => {
    const comparisons = {};
    metrics.forEach(metric => {
      const avgCurrent = AnalyticsEngine.rollingAverages([metric], logs, windowDays)[metric.id];
      const avgPrevious = AnalyticsEngine.rollingAverages([metric], logs, 2 * windowDays)[metric.id];
      comparisons[metric.id] = {
        current: avgCurrent,
        previous: avgPrevious,
        delta: avgCurrent - avgPrevious,
      };
    });
    return comparisons;
  },

  // ----------------------
  // System Health / Intel Stats
  // ----------------------
  calculateSystemHealth: (metrics = [], logs = [], segment = 'Weekly', timeLogs = []) => {
    if (!metrics.length) return { reliability: 0, trend: '0%', intensity: 'None', status: 'Offline', momentumHistory: [], activityVolume: { entries: [] } };

    // 1. Determine Window Size
    let days = 7;
    if (segment === 'Daily') days = 1;
    if (segment === 'Monthly') days = 30;

    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setDate(windowStart.getDate() - days);

    // 2. Merge timeLogs into standard logs for counting
    const allLogs = [...logs];
    if (timeLogs && timeLogs.length > 0) {
        timeLogs.forEach(t => {
            allLogs.push({
                metricId: t.activityId || t.metricId,
                value: t.duration,
                timestamp: t.startTime,
                type: 'time'
            });
        });
    }

    // Filter logs for current window (Standard Health)
    const currentLogs = allLogs.filter(l => new Date(l.timestamp) >= windowStart);

    // 3. Momentum History (Sparkline Data - Activity Counts)
    const momentumHistory = [];
    // We want a history relative to the window.
    // For Daily: hourly buckets? Or just last 7 days regardless?
    // "Momentum is... compared to previous 7-day window".
    // Sparkline usually shows history.
    // If Segment is Weekly, show last 7 days.
    // If Monthly, show last 30 days.
    // If Daily, maybe show last 24 hours or just last 7 days history for context?
    // Let's stick to 'days' history.
    const historyDays = segment === 'Daily' ? 7 : days; // Always show at least 7 days context

    for (let i = historyDays - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        // Count all activity for this day
        const count = allLogs.filter(l => l.timestamp.startsWith(dateStr)).length;
        momentumHistory.push(count);
    }

    // 4. Activity Volume (Stacked Bar Data - TimeLogs Duration)
    const activityVolume = { entries: [], colors: {} };
    const volumeMap = new Map(); // Date -> { ActivityName: Duration }

    // Initialize map with empty entries for the window
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        let label = dateStr;
        if (segment === 'Weekly') label = d.toLocaleDateString('en-US', { weekday: 'short' });
        if (segment === 'Monthly') label = d.getDate().toString();
        if (segment === 'Daily') label = 'Today';

        volumeMap.set(dateStr, { label, values: {} });
    }

    if (timeLogs) {
        timeLogs.forEach(t => {
            const d = new Date(t.startTime);
            if (d < windowStart) return;
            const dateStr = d.toISOString().split('T')[0];

            if (volumeMap.has(dateStr)) {
                const entry = volumeMap.get(dateStr);
                const metric = metrics.find(m => m.id === (t.activityId || t.metricId));
                const name = metric ? (metric.label || metric.name) : 'Unknown';

                // Color mapping
                if (metric && metric.color) activityVolume.colors[name] = metric.color;

                entry.values[name] = (entry.values[name] || 0) + (t.duration || 0);
            }
        });
    }
    activityVolume.entries = Array.from(volumeMap.values());

    // 5. Reliability & Trend
    const prevWindowStart = new Date(windowStart);
    prevWindowStart.setDate(prevWindowStart.getDate() - days);

    const prevLogs = allLogs.filter(l => {
      const d = new Date(l.timestamp);
      return d >= prevWindowStart && d < windowStart;
    });

    let totalCompletion = 0;
    metrics.forEach(m => {
       const comp = MetricEngine.goalCompletion ? MetricEngine.goalCompletion(m, currentLogs) : 0;
       totalCompletion += Math.min(comp, 100);
    });
    const reliability = Math.round(totalCompletion / (metrics.length || 1));

    let prevTotal = 0;
    metrics.forEach(m => {
       const comp = MetricEngine.goalCompletion ? MetricEngine.goalCompletion(m, prevLogs) : 0;
       prevTotal += Math.min(comp, 100);
    });
    const prevReliability = Math.round(prevTotal / (metrics.length || 1));
    const trendVal = reliability - prevReliability;
    const trend = trendVal >= 0 ? `+${trendVal}%` : `${trendVal}%`;

    // 6. Intensity
    const expectedVolume = metrics.length * (days > 1 ? days : 1);
    const ratio = currentLogs.length / (expectedVolume || 1);

    let intensity = 'Low';
    if (ratio > 0.4) intensity = 'Moderate';
    if (ratio > 0.8) intensity = 'High';
    if (ratio > 1.2) intensity = 'Peak';

    const status = reliability > 80 ? 'Optimal' : reliability > 50 ? 'Functional' : 'Degraded';

    return { reliability, trend, intensity, status, momentumHistory, activityVolume };
  }
};
