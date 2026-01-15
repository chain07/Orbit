import { MetricEngine } from './MetricEngine';
import { AnalyticsEngine } from './AnalyticsEngine';
import { NormalizationEngine } from './NormalizationEngine';
import { dateUtils } from '../lib/dateUtils'; // Assuming this exists, or use native Date

/**
 * WidgetEngine
 * ---------------------------------------------------------------------------
 * The transformation layer that turns raw Metrics + Logs into View-ready data.
 * It maps specific 'widgetType' strings to their corresponding data shapers.
 * ---------------------------------------------------------------------------
 */
export const WidgetEngine = {

  /**
   * MASTER AGGREGATOR
   * Loops through metrics and generates the correct data object for the view.
   */
  generateWidgets: (metrics = [], logs = [], segment = 'Weekly') => {
    // 1. Filter out hidden metrics
    const visibleMetrics = metrics.filter(m => m.dashboardVisible !== false);

    // 2. Map each metric to a widget configuration
    return visibleMetrics.map(metric => {
      const metricLogs = logs.filter(l => l.metricId === metric.id);
      let data = null;

      try {
        switch (metric.widgetType) {
          // --- Visual Charts ---
          case 'ring':
            data = WidgetEngine.ringData(metric, metricLogs);
            break;
            
          case 'sparkline':
            data = WidgetEngine.sparklineData(metric, metricLogs, segment);
            break;
            
          case 'heatmap':
            data = WidgetEngine.heatmapData(metric, metricLogs);
            break;
            
          case 'stackedbar':
            data = WidgetEngine.stackedBarData(metric, metricLogs);
            break;

          // --- Data Displays ---
          case 'streak':
            data = WidgetEngine.streakData(metric, metricLogs);
            break;

          case 'number':
            data = WidgetEngine.numberData(metric, metricLogs);
            break;

          case 'history':
            data = WidgetEngine.historyData(metric, metricLogs);
            break;

          // --- Fallback ---
          default:
            // Default to a simple number summary if type is unknown
            data = WidgetEngine.numberData(metric, metricLogs);
            break;
        }
      } catch (err) {
        console.error(`Widget generation failed for ${metric.label}:`, err);
        data = { error: true, message: 'Data Error' };
      }

      return {
        id: metric.id,
        type: metric.widgetType || 'number',
        title: metric.label || metric.name,
        data: data
      };
    });
  },

  // ---------------------------------------------------------------------------
  // DATA SHAPERS
  // ---------------------------------------------------------------------------

  /**
   * Ring Chart Data
   * Returns: { value: 0-100, label: string, color: string }
   */
  ringData: (metric, logs) => {
    const todayVal = MetricEngine.getTodayValue(logs); // Assumes MetricEngine helper
    const goal = metric.goal || 100;
    
    // Calculate percentage, capped at 100 for visual cleanliness (or let it loop)
    const percentage = Math.min(100, Math.max(0, (todayVal / goal) * 100));

    return {
      value: percentage,
      label: `${todayVal} / ${goal}`,
      color: metric.color
    };
  },

  /**
   * Sparkline Trend Data
   * Returns: { values: number[], label: string, color: string, trendLabel: string }
   */
  sparklineData: (metric, logs, segment) => {
    // Determine window size based on segment
    const days = segment === 'Monthly' ? 30 : segment === 'Weekly' ? 7 : 14;
    
    // Get last N days of data (filling zeros for missing days)
    const values = MetricEngine.getLastNDaysValues(logs, days);
    
    // Calculate simple trend (e.g., avg of last 3 vs avg of prev 3)
    const trend = AnalyticsEngine.calculateTrend(values);

    return {
      values: values,
      color: metric.color,
      label: 'Trend',
      trendLabel: trend > 0 ? `+${trend}%` : `${trend}%`
    };
  },

  /**
   * Heatmap Data
   * Returns: { values: { 'YYYY-MM-DD': 0-1 }, start: string, end: string }
   */
  heatmapData: (metric, logs) => {
    // Heatmaps need a longer history, typically 90 days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 90);

    const values = {};
    logs.forEach(log => {
      const dateKey = new Date(log.timestamp).toISOString().split('T')[0];
      // Normalize value to 0-1 range for opacity mapping
      // If it's boolean, 1=true. If number, value/goal.
      let normalized = 0;
      if (metric.type === 'boolean') normalized = log.value ? 1 : 0;
      else if (metric.goal) normalized = Math.min(1, log.value / metric.goal);
      else normalized = log.value > 0 ? 1 : 0;

      values[dateKey] = normalized;
    });

    return {
      values,
      start: start.toISOString(),
      end: end.toISOString(),
      color: metric.color
    };
  },

  /**
   * Stacked Bar / Segmented Data
   * Returns: { entries: Array, colors: Object }
   */
  stackedBarData: (metric, logs) => {
    // This is complex: usually used for things like "Sleep vs Awake" or Categorical logs
    // For a single metric, this might just show daily totals
    const days = 7;
    const entries = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Get value for this specific day
      // Note: This logic depends on if you want to stack DIFFERENT metrics or just 1
      // Assuming 1 metric for now:
      const val = MetricEngine.getValueForDate(logs, d);
      
      entries.push({
        label: dayStr,
        values: { [metric.label]: val }
      });
    }

    return {
      entries,
      colors: { [metric.label]: metric.color }
    };
  },

  /**
   * Streak Data
   * Returns: { current: number, best: number, isActive: boolean, unit: string }
   */
  streakData: (metric, logs) => {
    const current = MetricEngine.calculateCurrentStreak(logs);
    const best = MetricEngine.calculateBestStreak(logs);
    const todayVal = MetricEngine.getTodayValue(logs);

    return {
      current,
      best,
      isActive: todayVal >= (metric.goal || 1), // Active if goal met today
      unit: 'Days'
    };
  },

  /**
   * Number Summary Data
   * Returns: { value: string/number, label: string, trend: number, trendDirection: string }
   */
  numberData: (metric, logs) => {
    const total = MetricEngine.getTotal(logs);
    // OR get today's value depending on metric type preference
    // Let's default to Total for now, or Today if it's a daily tracker
    const val = metric.type === 'cumulative' ? total : MetricEngine.getTodayValue(logs);
    
    return {
      value: val,
      label: metric.label,
      unit: metric.unit,
      trend: 0, // Placeholder for AnalyticsEngine calc
      trendDirection: 'neutral'
    };
  },

  /**
   * History List Data
   * Returns: { entries: Array }
   */
  historyData: (metric, logs) => {
    // Return last 10 raw logs
    const sorted = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return {
      entries: sorted.slice(0, 10).map(l => ({
        id: l.id,
        value: l.value,
        timestamp: l.timestamp
      })),
      unit: metric.unit
    };
  }
};
