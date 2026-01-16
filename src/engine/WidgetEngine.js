import { MetricEngine } from './MetricEngine';
import { AnalyticsEngine } from './AnalyticsEngine';
import { NormalizationEngine } from './NormalizationEngine';
import { dateUtils } from '../lib/dateUtils'; 

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
      // ENFORCEMENT: Strictly filter logs by metricId (UUID)
      const metricLogs = logs.filter(l => l.metricId === metric.id);
      let data = null;

      if (!metric.type) {
         console.warn(`Metric ${metric.id} missing type definition.`);
      }

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

          // --- Stats & Numbers ---
          case 'streak':
            data = WidgetEngine.streakData(metric, metricLogs);
            break;

          case 'number':
            data = WidgetEngine.numberData(metric, metricLogs);
            break;

          case 'history':
            data = WidgetEngine.historyData(metric, metricLogs);
            break;

          default:
            data = { error: 'Unknown widget type' };
        }
      } catch (err) {
        console.error(`WidgetEngine failed for metric ${metric.id}:`, err);
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
      label: `${Math.round(completion)}%`,
      color: metric.color || '#007AFF',
      title: metric.label
    };
  },

  /**
   * Sparkline Data
   * FIX: Changed 'values' key to 'data' to resolve UI prop mismatch.
   * Returns: { data: Array, current: number, label: string, color: string }
   */
  sparklineData: (metric, logs, segment = 'Weekly') => {
    const days = segment === 'Weekly' ? 7 : 30;
    
    // Get historical trend values (normalized 0-1)
    const values = MetricEngine.getHistory 
      ? MetricEngine.getHistory(metric, logs, days) 
      : new Array(days).fill(0);

    const currentVal = MetricEngine.getTodayValue ? MetricEngine.getTodayValue(logs) : 0;

    return {
      data: values, // FIXED: Sparkline.jsx expects 'data' prop
      current: currentVal,
      label: metric.label,
      color: metric.color || '#007AFF',
      change: 0 // Placeholder for future AnalyticsEngine delta calc
    };
  },

  /**
   * Heatmap Data
   * Returns: { matrix: Array, color: string }
   */
  heatmapData: (metric, logs) => {
    const matrix = MetricEngine.getHeatmapMatrix 
      ? MetricEngine.getHeatmapMatrix(metric, logs) 
      : [];
      
    return {
      matrix,
      color: metric.color || '#007AFF'
    };
  },

  /**
   * Streak Data
   * Returns: { current: number, best: number, isActive: boolean }
   */
  streakData: (metric, logs) => {
    const current = MetricEngine.calculateCurrentStreak 
      ? MetricEngine.calculateCurrentStreak(logs) 
      : 0;
    const best = MetricEngine.calculateBestStreak 
      ? MetricEngine.calculateBestStreak(logs) 
      : 0;
    const todayVal = MetricEngine.getTodayValue 
      ? MetricEngine.getTodayValue(logs) 
      : 0;

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
    const total = MetricEngine.getTotal ? MetricEngine.getTotal(logs) : 0;
    const todayVal = MetricEngine.getTodayValue ? MetricEngine.getTodayValue(logs) : 0;
    
    const val = metric.type === 'cumulative' ? total : todayVal;
    
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
   * Returns: { data: Array }
   */
  historyData: (metric, logs) => {
    // Return last 10 raw logs, formatted for the History widget
    const sorted = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recent = sorted.slice(0, 10);
    
    return {
      data: recent // Unified 'data' naming for the History widget component
    };
  }
};
