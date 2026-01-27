import { MetricEngine } from './MetricEngine.js';
import { AnalyticsEngine } from './AnalyticsEngine.js';
import { MetricType, WidgetType } from '../types/schemas.js';

/**
 * WidgetDataEngine
 * ---------------------------------------------------------------------------
 * The transformation layer that turns raw Metrics + Logs into View-ready data.
 * Strictly adheres to schemas and naming conventions.
 * ---------------------------------------------------------------------------
 */
export const WidgetDataEngine = {

  /**
   * MASTER AGGREGATOR
   * Loops through metrics and generates the correct data object for the view.
   */
  generateWidgets: (metrics = [], logs = [], segment = 'Weekly') => {
    // 1. Filter out hidden metrics
    const visibleMetrics = metrics.filter(m => m.dashboardVisible !== false);

    // 2. Pre-group logs by metricId for O(N) complexity
    const logsByMetric = {};
    logs.forEach(log => {
      if (!logsByMetric[log.metricId]) {
        logsByMetric[log.metricId] = [];
      }
      logsByMetric[log.metricId].push(log);
    });

    // 3. Map each metric to a widget configuration
    return visibleMetrics.map(metric => {
      const metricLogs = logsByMetric[metric.id] || [];
      let data = null;

      try {
        switch (metric.widgetType) {
          case WidgetType.RING:
            data = WidgetDataEngine.ringData(metric, metricLogs);
            break;
          case WidgetType.SPARKLINE:
            data = WidgetDataEngine.sparklineData(metric, metricLogs, segment);
            break;
          case WidgetType.HEATMAP:
            data = WidgetDataEngine.heatmapData(metric, metricLogs);
            break;
          case WidgetType.STREAK:
            data = WidgetDataEngine.streakData(metric, metricLogs);
            break;
          case WidgetType.NUMBER:
            data = WidgetDataEngine.numberData(metric, metricLogs, segment);
            break;
          case WidgetType.HISTORY:
            data = WidgetDataEngine.historyData(metric, metricLogs);
            break;
          case 'stackedbar':
            data = WidgetDataEngine.stackedBarData(metric, metricLogs, segment);
            break;
          case WidgetType.COMPOUND:
            data = WidgetDataEngine.compoundBarData(metric, metricLogs);
            break;
          case WidgetType.PROGRESS:
          case 'progress':
            data = WidgetDataEngine.progressBarData(metric, metricLogs);
            break;
          default:
            data = { error: 'Unknown widget type' };
        }
      } catch (err) {
        console.error(`WidgetDataEngine failed for metric ${metric.id}:`, err);
        data = { error: 'Calculation error' };
      }

      return { ...metric, data };
    });
  },

  // ... (Other methods remain unchanged until heatmapData) ...
  ringData: (metric, logs) => {
    const completion = MetricEngine.goalCompletion ? MetricEngine.goalCompletion(metric, logs) : 0;
    return { value: completion, label: metric.label, color: metric.color || '#007AFF', title: metric.label };
  },

  sparklineData: (metric, logs, segment = 'Weekly') => {
    const days = segment === 'Monthly' ? 30 : 7;
    const rawHistory = MetricEngine.getLastNDaysValues ? MetricEngine.getLastNDaysValues(logs, days) : new Array(days).fill(0);
    const currentVal = MetricEngine.getTodayValue ? MetricEngine.getTodayValue(logs) : 0;
    return { data: rawHistory, current: currentVal, label: metric.label, color: metric.color || '#007AFF' };
  },

  /**
   * Heatmap Data
   * Refactored Phase 4.15: Use Local Date Strings
   */
  heatmapData: (metric, logs) => {
    const values = {};
    const logsByDate = logs.reduce((acc, log) => {
      // Use Local Date to match user's day
      const date = new Date(log.timestamp).toLocaleDateString('en-CA'); // YYYY-MM-DD Local
      if (!acc[date]) acc[date] = [];
      acc[date].push(log);
      return acc;
    }, {});

    Object.keys(logsByDate).forEach(date => {
        const dayLogs = logsByDate[date];
        let dayValue = 0;

        if (metric.type === MetricType.BOOLEAN) {
             const hasTrue = dayLogs.some(l => l.value);
             dayValue = hasTrue ? 1 : 0;
        } else {
             const total = dayLogs.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
             dayValue = MetricEngine.normalizeValue(metric, total) * 100;
        }
        values[date] = dayValue;
    });

    return { values, color: metric.color || '#007AFF' };
  },

  streakData: (metric, logs) => {
    const current = MetricEngine.calculateCurrentStreak ? MetricEngine.calculateCurrentStreak(logs) : 0;
    const best = MetricEngine.calculateBestStreak ? MetricEngine.calculateBestStreak(logs) : 0;

    let isActive = false;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();

    const todayLogs = logs.filter(l => {
       const t = new Date(l.timestamp).getTime();
       return t >= startOfDay && t < endOfDay;
    });

    if (metric.type === MetricType.BOOLEAN) {
        isActive = todayLogs.some(l => l.value === true);
    } else {
        const sum = todayLogs.reduce((acc, l) => acc + (parseFloat(l.value) || 0), 0);
        isActive = sum >= (metric.goal || 1);
    }

    return { current, best, isActive, unit: 'Days' };
  },

  numberData: (metric, logs, segment = 'Weekly') => {
    const todayVal = MetricEngine.getTodayValue ? MetricEngine.getTodayValue(logs) : 0;
    const days = segment === 'Monthly' ? 30 : 7;
    const history = MetricEngine.getLastNDaysValues(logs, days);
    const trend = AnalyticsEngine.calculateTrend(history);
    return { value: todayVal, label: metric.label, unit: metric.unit, trend: trend, trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral' };
  },

  historyData: (metric, logs) => {
    const sorted = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recent = sorted.slice(0, 10);
    const entries = recent.map(l => ({ id: l.id, value: l.value, timestamp: l.timestamp, note: l.note || '' }));
    return { entries, unit: metric.unit };
  },

  /**
   * Stacked Bar Data
   * Refactored Phase 4.15: Real Implementation for Weekly View
   */
  stackedBarData: (metric, logs, segment = 'Weekly') => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const entriesMap = new Map();

    // Initialize buckets
    days.forEach(d => entriesMap.set(d, {}));

    // Calculate current week boundaries (Mon-Sun)
    const today = new Date();
    // Adjust to Monday start
    const day = today.getDay() || 7;
    const monday = new Date(today);
    monday.setHours(0,0,0,0);
    monday.setDate(monday.getDate() - day + 1);

    logs.forEach(log => {
        const logDate = new Date(log.timestamp);
        // Filter for current week only
        if (logDate < monday) return;

        const dayName = logDate.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...
        const entry = entriesMap.get(dayName);

        if (entry) {
            // If Select metric, stack by Option. Else stack by 'Value'
            const key = metric.type === 'select' ? String(log.value) : metric.label;
            const val = metric.type === 'select' ? 1 : (parseFloat(log.value) || 0);

            entry[key] = (entry[key] || 0) + val;
        }
    });

    const entries = days.map(label => ({
        label,
        values: entriesMap.get(label)
    }));

    return {
        entries,
        colors: { [metric.label]: metric.color || '#007AFF' }
    };
  },

  compoundBarData: (metric, logs) => {
    const counts = {};
    logs.forEach(l => { const val = String(l.value); counts[val] = (counts[val] || 0) + 1; });
    const breakdown = Object.entries(counts).map(([label, value]) => ({ label, value }));
    return { breakdown, label: metric.label };
  },

  progressBarData: (metric, logs) => {
    const val = MetricEngine.getTodayValue ? MetricEngine.getTodayValue(logs) : 0;
    return { value: Number(val.toFixed(1)), max: metric.goal || 10, label: metric.label, unit: metric.unit, color: metric.color };
  }
};
