// src/engine/MetricEngine.js
import { MetricType } from '../types/schemas.js';

/**
 * MetricEngine
 * Provides all core metric calculations for ORBIT
 */
export const MetricEngine = {
  // ----------------------
  // Current streak calculation (Legacy support)
  // ----------------------
  currentStreak: (logs = [], metricId) => {
    const metricLogs = logs
      .filter(l => l.metricId === metricId)
      .sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));

    if (metricLogs.length === 0) return 0;
    
    // Delegate to the robust calculator
    return MetricEngine.calculateCurrentStreak(metricLogs);
  },

  // ----------------------
  // NEW: Calculate Current Streak (Expects pre-filtered logs)
  // ----------------------
  calculateCurrentStreak: (logs = []) => {
    if (!logs || logs.length === 0) return 0;

    // Get unique dates (normalized to midnight) sorted descending
    const uniqueDayTimestamps = new Set();
    logs.forEach(l => {
      const d = new Date(l.timestamp);
      d.setHours(0, 0, 0, 0);
      uniqueDayTimestamps.add(d.getTime());
    });

    const uniqueDates = Array.from(uniqueDayTimestamps)
      .map(ts => new Date(ts))
      .sort((a, b) => b - a);

    if (uniqueDates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if the most recent entry is today or yesterday
    const mostRecent = uniqueDates[0];
    const diffHours = (today - mostRecent) / (1000 * 60 * 60);

    // If last entry is older than yesterday (>48h roughly), streak is 0
    // We use 36h to be safe for "yesterday" logic without strict midnight adherence
    if (diffHours > 36) return 0;

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const curr = uniqueDates[i];
      const next = uniqueDates[i+1];
      const diffDays = Math.round((curr - next) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) streak++;
      else break;
    }
    return streak;
  },

  // ----------------------
  // NEW: Calculate Best Streak
  // ----------------------
  calculateBestStreak: (logs = []) => {
    if (!logs || logs.length === 0) return 0;

    const uniqueDayTimestamps = new Set();
    logs.forEach(l => {
      const d = new Date(l.timestamp);
      d.setHours(0, 0, 0, 0);
      uniqueDayTimestamps.add(d.getTime());
    });

    const uniqueDates = Array.from(uniqueDayTimestamps)
      .map(ts => new Date(ts))
      .sort((a, b) => b - a);

    if (uniqueDates.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const curr = uniqueDates[i];
      const next = uniqueDates[i+1];
      const diffDays = Math.round((curr - next) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    return Math.max(maxStreak, currentStreak);
  },

  // ----------------------
  // NEW: Get Today's Value (Sum)
  // OPTIMIZED: Uses string comparison for high performance (5x speedup)
  // ----------------------
  getTodayValue: (logs = []) => {
    const now = new Date();
    // Get local midnight and next midnight
    const startOfLocalDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfLocalDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Convert to ISO string (UTC) to match log format
    // This gives the UTC time corresponding to local midnight
    const startIso = startOfLocalDay.toISOString();
    const endIso = endOfLocalDay.toISOString();

    return logs
      .filter(l => l.timestamp >= startIso && l.timestamp < endIso)
      .reduce((acc, l) => acc + (parseFloat(l.value) || 0), 0);
  },

  // ----------------------
  // NEW: Get Total Value (Sum of all logs)
  // ----------------------
  getTotal: (logs = []) => {
    return logs.reduce((acc, l) => acc + (parseFloat(l.value) || 0), 0);
  },

  // ----------------------
  // NEW: Get Value for Specific Date
  // OPTIMIZED: Uses string comparison for high performance
  // ----------------------
  getValueForDate: (logs = [], date) => {
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const endTarget = new Date(target);
    endTarget.setDate(target.getDate() + 1);

    const startIso = target.toISOString();
    const endIso = endTarget.toISOString();

    return logs
      .filter(l => l.timestamp >= startIso && l.timestamp < endIso)
      .reduce((acc, l) => acc + (parseFloat(l.value) || 0), 0);
  },

  // ----------------------
  // NEW: Get Last N Days Values (Array for Charts)
  // OPTIMIZED: Single pass bucketing instead of N filters
  // ----------------------
  getLastNDaysValues: (logs = [], days = 7) => {
    // 1. Bucket values by date string key (YYYY-M-D)
    const buckets = {};
    const now = new Date();

    // Calculate cutoff time to filter old logs early.
    // Logic: We need the last 'days' days.
    // If days=7, we need Today, Yesterday, ..., Today-6.
    // So cutoff is Today-6 at 00:00:00.
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - (days - 1));
    cutoffDate.setHours(0, 0, 0, 0);
    const cutoffTime = cutoffDate.getTime();

    logs.forEach(l => {
      const d = new Date(l.timestamp);

      // Optimization: Skip logs older than the window
      if (d.getTime() < cutoffTime) return;

      // Construct key manually to avoid slow string formatting
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      buckets[key] = (buckets[key] || 0) + (parseFloat(l.value) || 0);
    });

    // 2. Generate result array from buckets
    const values = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      values.push(buckets[key] || 0);
    }
    return values;
  },

  // ----------------------
  // Goal completion %
  // ----------------------
  goalCompletion: (metricConfig, logs = []) => {
    // 1. Telemetry/Passive: Goal 0 always passes
    if (metricConfig.goal === 0) return 100;

    const metricLogs = logs.filter(l => l.metricId === metricConfig.id);
    if (metricLogs.length === 0) return 0;

    const now = new Date();
    const freq = metricConfig.frequency || 'daily';
    let startTime;

    // Calculate Window Start
    if (freq === 'weekly') {
        // Start of Week (Sunday based)
        const d = new Date(now);
        const day = d.getDay(); // 0-6
        d.setDate(d.getDate() - day);
        d.setHours(0, 0, 0, 0);
        startTime = d;
    } else if (freq === 'monthly') {
        startTime = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
        // Daily
        startTime = new Date(now);
        startTime.setHours(0, 0, 0, 0);
    }

    // Filter by Time Window
    const startIso = startTime.toISOString();
    const relevantLogs = metricLogs.filter(l => l.timestamp >= startIso);

    // Calculate Sum
    const currentSum = relevantLogs.reduce((acc, l) => {
        let val = 0;
        if (typeof l.value === 'boolean') {
             val = l.value ? 1 : 0;
        } else {
             val = parseFloat(l.value) || 0;
        }
        return acc + val;
    }, 0);

    const goal = metricConfig.goal || 1;

    // Calculate Percentage
    const percentage = (currentSum / goal) * 100;

    return Math.min(100, Math.max(0, percentage));
  },

  // ----------------------
  // Rolling averages
  // ----------------------
  rollingAverage: (logs = [], metricId, windowDays = 7) => {
    const metricLogs = logs
      .filter(l => l.metricId === metricId)
      .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

    if (metricLogs.length === 0) return 0;

    const today = new Date();
    const startDate = new Date(today.getTime() - windowDays * 24 * 60 * 60 * 1000);

    const windowLogs = metricLogs.filter(l => new Date(l.timestamp) >= startDate);
    const sum = windowLogs.reduce((acc, l) => acc + l.value, 0);
    return sum / (windowLogs.length || 1);
  },

  // ----------------------
  // Normalization across metric types
  // ----------------------
  normalizeValue: (metricConfig, value) => {
    switch (metricConfig.type) {
      case MetricType.BOOLEAN:
        return value ? 1 : 0;
      case MetricType.NUMBER:
      case MetricType.PERCENTAGE:
        return Math.min(1, Math.max(0, value / (metricConfig.goal || 1)));
      default:
        return 0;
    }
  },

  // ----------------------
  // Aggregated stats
  // ----------------------
  stats: (metricConfig, logs = []) => {
    const values = logs
      .filter(l => l.metricId === metricConfig.id)
      .map(l => l.value);

    if (values.length === 0) return {};

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { sum, avg, min, max, count: values.length };
  },
};
