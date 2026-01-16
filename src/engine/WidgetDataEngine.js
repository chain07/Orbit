import { MetricEngine } from './MetricEngine';
import { AnalyticsEngine } from './AnalyticsEngine';
import { MetricType, WidgetType } from '../types/schemas';

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

    // 2. Map each metric to a widget configuration
    return visibleMetrics.map(metric => {
      // ENFORCEMENT: Strictly filter logs by metricId (UUID)
      const metricLogs = logs.filter(l => l.metricId === metric.id);
      let data = null;

      if (!metric.type) {
         console.warn(`Metric ${metric.id} missing type definition.`);
      }

      try {
        switch (metric.widgetType) {
          // --- Visual Charts ---
          case WidgetType.RING:
            data = WidgetDataEngine.ringData(metric, metricLogs);
            break;

          case WidgetType.SPARKLINE:
            data = WidgetDataEngine.sparklineData(metric, metricLogs, segment);
            break;

          case WidgetType.HEATMAP:
            data = WidgetDataEngine.heatmapData(metric, metricLogs);
            break;

          // --- Stats & Numbers ---
          case WidgetType.STREAK:
            data = WidgetDataEngine.streakData(metric, metricLogs);
            break;

          case WidgetType.NUMBER:
            data = WidgetDataEngine.numberData(metric, metricLogs, segment);
            break;

          case WidgetType.HISTORY:
            data = WidgetDataEngine.historyData(metric, metricLogs);
            break;

          default:
            data = { error: 'Unknown widget type' };
        }
      } catch (err) {
        console.error(`WidgetDataEngine failed for metric ${metric.id}:`, err);
        data = { error: 'Calculation error' };
      }

      return {
        ...metric,
        data // This contains the formatted object for the UI component
      };
    });
  },

  /**
   * Ring Chart Data
   * Returns: { value: number (0-100), label: string, color: string, title: string }
   */
  ringData: (metric, logs) => {
    // MetricEngine.goalCompletion returns 0-100 per naming conventions
    const completion = MetricEngine.goalCompletion ? MetricEngine.goalCompletion(metric, logs) : 0;

    return {
      value: completion,
      label: metric.label, // RAW VALUE: Metric Label. Display formatting handled by UI.
      color: metric.color || '#007AFF',
      title: metric.label
    };
  },

  /**
   * Sparkline Data
   * Returns: { data: number[], current: number, label: string, color: string }
   */
  sparklineData: (metric, logs, segment = 'Weekly') => {
    const days = segment === 'Monthly' ? 30 : 7;

    // Get historical raw values
    const rawHistory = MetricEngine.getLastNDaysValues
      ? MetricEngine.getLastNDaysValues(logs, days)
      : new Array(days).fill(0);

    // Normalize to 0-1 for Sparkline
    const normalizedData = rawHistory.map(val => MetricEngine.normalizeValue(metric, val));

    const currentVal = MetricEngine.getTodayValue ? MetricEngine.getTodayValue(logs) : 0;

    return {
      data: normalizedData,
      current: currentVal,
      label: metric.label,
      color: metric.color || '#007AFF',
      // Trend calculation omitted for Sparkline as allowed by schema (trendLabel optional)
    };
  },

  /**
   * Heatmap Data
   * Returns: { values: Object<string, number>, color: string }
   */
  heatmapData: (metric, logs) => {
    const values = {};

    // Group logs by date
    const logsByDate = logs.reduce((acc, log) => {
      const date = log.timestamp.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(log);
      return acc;
    }, {});

    Object.keys(logsByDate).forEach(date => {
        const dayLogs = logsByDate[date];
        let dayValue = 0;

        if (metric.type === MetricType.BOOLEAN) {
             // For Boolean, usually "Any" is enough, but strictly "goalCompletion" logic?
             // MetricEngine.normalizeValue for boolean: true -> 1, false -> 0.
             // If multiple logs, if any is true, we consider it done (1).
             const hasTrue = dayLogs.some(l => l.value);
             dayValue = hasTrue ? 1 : 0; // Already normalized
        } else {
             // Sum values for Number/Duration
             const total = dayLogs.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
             dayValue = MetricEngine.normalizeValue(metric, total);
        }
        values[date] = dayValue;
    });

    return {
      values,
      color: metric.color || '#007AFF'
    };
  },

  /**
   * Streak Data
   * Returns: { current: number, best: number, isActive: boolean, unit: string }
   */
  streakData: (metric, logs) => {
    const current = MetricEngine.calculateCurrentStreak
      ? MetricEngine.calculateCurrentStreak(logs)
      : 0;
    const best = MetricEngine.calculateBestStreak
      ? MetricEngine.calculateBestStreak(logs)
      : 0;

    // Check if goal met today
    const todayVal = MetricEngine.getTodayValue ? MetricEngine.getTodayValue(logs) : 0;
    const isActive = metric.type === MetricType.BOOLEAN
        ? todayVal >= 1 // For boolean sum is count of trues? getTodayValue sums parseFloat.
        // Wait, MetricEngine.getTodayValue parses floats. true -> NaN.
        // MetricEngine.getTodayValue implementation:
        // .reduce((acc, l) => acc + (parseFloat(l.value) || 0), 0);
        // parseFloat(true) is NaN.
        // So getTodayValue returns 0 for booleans.
        // I need to handle boolean check manually here or fix MetricEngine (out of scope?).
        // Actually I should use MetricEngine.goalCompletion logic for "isActive"?
        // Or check logs manually.
        : todayVal >= (metric.goal || 1);

    // Fix for isActive on Boolean if getTodayValue is broken for booleans
    let safeIsActive = isActive;
    if (metric.type === MetricType.BOOLEAN) {
        const today = new Date().toLocaleDateString();
        const todayLogs = logs.filter(l => new Date(l.timestamp).toLocaleDateString() === today);
        safeIsActive = todayLogs.some(l => l.value === true);
    }

    return {
      current,
      best,
      isActive: safeIsActive,
      unit: 'Days' // Static unit
    };
  },

  /**
   * Number Summary Data
   * Returns: { value: number, label: string, unit: string, trend: number, trendDirection: string }
   */
  numberData: (metric, logs, segment = 'Weekly') => {
    const total = MetricEngine.getTotal ? MetricEngine.getTotal(logs) : 0;
    const todayVal = MetricEngine.getTodayValue ? MetricEngine.getTodayValue(logs) : 0;

    // For Cumulative metrics (if such type existed, but schema only has NUMBER/DURATION/BOOLEAN)
    // Assuming NUMBER/DURATION are daily goals usually.
    // If user wants cumulative, they might interpret NUMBER that way.
    // But usually NumberWidget shows "Today" or "Total"?
    // Standard seems to be Today's value for tracking.
    const val = todayVal;

    // Trend Calculation
    // Use last N days history
    const days = segment === 'Monthly' ? 30 : 7;
    const history = MetricEngine.getLastNDaysValues(logs, days);
    const trend = AnalyticsEngine.calculateTrend(history); // Returns number (percentage)

    return {
      value: val,
      label: metric.label,
      unit: metric.unit,
      trend: trend,
      trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral'
    };
  },

  /**
   * History List Data
   * Returns: { data: Array }
   */
  historyData: (metric, logs) => {
    // Return last 10 raw logs
    const sorted = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recent = sorted.slice(0, 10);

    return {
      data: recent
    };
  }
};
