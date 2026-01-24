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
      // ENFORCEMENT: Strictly retrieve logs by metricId (UUID) from Map
      const metricLogs = logsByMetric[metric.id] || [];
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

          case 'stackedbar':
            data = WidgetDataEngine.stackedBarData(metric, metricLogs, segment);
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
    const completion = MetricEngine.goalCompletion ? MetricEngine.goalCompletion(metric, logs) : 0;

    return {
      value: completion,
      label: metric.label,
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

    const rawHistory = MetricEngine.getLastNDaysValues
      ? MetricEngine.getLastNDaysValues(logs, days)
      : new Array(days).fill(0);

    const currentVal = MetricEngine.getTodayValue ? MetricEngine.getTodayValue(logs) : 0;

    return {
      data: rawHistory,
      current: currentVal,
      label: metric.label,
      color: metric.color || '#007AFF',
    };
  },

  /**
   * Heatmap Data
   * Returns: { values: Object<string, number>, color: string }
   */
  heatmapData: (metric, logs) => {
    const values = {};

    // Group logs by date - O(N)
    const logsByDate = logs.reduce((acc, log) => {
      // Use split('T') which is faster/consistent vs toLocaleDateString
      const date = log.timestamp.split('T')[0];
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
             // FIX: Return 0-100 percentage or raw-ish value for intensity.
             // Previous was 0-1. We multiply by 100 to match Ring/Chart standard scale.
             dayValue = MetricEngine.normalizeValue(metric, total) * 100;
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

    // OPTIMIZED: Is Active Check
    // Use ISO string comparison to avoid Date object creation in loop
    let isActive = false;
    const now = new Date();

    // Get local midnight and next midnight
    const startOfLocalDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfLocalDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Convert to ISO string (UTC) to match log format
    const startIso = startOfLocalDay.toISOString();
    const endIso = endOfLocalDay.toISOString();

    // 1. Get today's logs for this metric
    const todayLogs = logs.filter(l => {
       return l.timestamp >= startIso && l.timestamp < endIso;
    });

    if (metric.type === MetricType.BOOLEAN) {
        isActive = todayLogs.some(l => l.value === true);
    } else {
        const sum = todayLogs.reduce((acc, l) => acc + (parseFloat(l.value) || 0), 0);
        isActive = sum >= (metric.goal || 1);
    }

    return {
      current,
      best,
      isActive,
      unit: 'Days'
    };
  },

  /**
   * Number Summary Data
   * Returns: { value: number, label: string, unit: string, trend: number, trendDirection: string }
   */
  numberData: (metric, logs, segment = 'Weekly') => {
    const todayVal = MetricEngine.getTodayValue ? MetricEngine.getTodayValue(logs) : 0;

    const days = segment === 'Monthly' ? 30 : 7;
    const history = MetricEngine.getLastNDaysValues(logs, days);
    const trend = AnalyticsEngine.calculateTrend(history);

    return {
      value: todayVal,
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
    const sorted = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recent = sorted.slice(0, 10);

    return {
      data: recent
    };
  },

  /**
   * Stacked Bar Data
   * Returns: { entries: Array<{ label: string, values: Object }>, colors: Object }
   */
  stackedBarData: (metric, logs, segment = 'Weekly') => {
    // This is a stub implementation to ensure data flows to the component.
    // In a real implementation, this would aggregate based on segment.

    // For now, we return empty structure or mock based on segment to verify UI switching.
    // Daily: 6 buckets (4h)
    // Weekly: 7 days
    // Monthly: 4 weeks

    let entries = [];
    if (segment === 'Daily') {
        entries = [
            { label: '4AM', values: {} }, { label: '8AM', values: {} },
            { label: '12PM', values: {} }, { label: '4PM', values: {} },
            { label: '8PM', values: {} }, { label: '12AM', values: {} }
        ];
    } else if (segment === 'Weekly') {
        entries = [
            { label: 'Mon', values: {} }, { label: 'Tue', values: {} },
            { label: 'Wed', values: {} }, { label: 'Thu', values: {} },
            { label: 'Fri', values: {} }, { label: 'Sat', values: {} },
            { label: 'Sun', values: {} }
        ];
    } else { // Monthly
        entries = [
            { label: 'W1', values: {} }, { label: 'W2', values: {} },
            { label: 'W3', values: {} }, { label: 'W4', values: {} }
        ];
    }

    return {
        entries,
        colors: { [metric.label]: metric.color || '#007AFF' } // Simple mapping
    };
  }
};
