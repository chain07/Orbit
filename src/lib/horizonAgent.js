import { MetricEngine } from '../engine/MetricEngine';
import { AnalyticsEngine } from '../engine/AnalyticsEngine';
import { CorrelationEngine } from '../engine/CorrelationEngine';
import { Recipes } from './recipes';

export const HorizonAgent = {
  /**
   * Generates a rich set of statistics for a single metric
   * used to feed the Recipe engine.
   */
  calculateStats: (metric, logs, allLogs, allMetrics, precalculatedCorrelations = null) => {
    // Defensive checks
    if (!metric || !logs) return null;

    const metricLogs = logs.filter(l => l.metricId === metric.id);
    const today = new Date();
    const todayStr = today.toDateString();
    
    // Core Stats (with safety checks for MetricEngine)
    const streak = MetricEngine.currentStreak ? MetricEngine.currentStreak(logs, metric.id) : 0;
    const completion = MetricEngine.goalCompletion ? MetricEngine.goalCompletion(metric, metricLogs) : 0;
    const rollingAvg = MetricEngine.rollingAverage ? MetricEngine.rollingAverage(logs, metric.id, 7) : 0;
    
    // Trend Calculation
    let trend = 0;
    if (AnalyticsEngine && AnalyticsEngine.trendDeltas) {
        const trends = AnalyticsEngine.trendDeltas([metric], allLogs, 7);
        trend = trends[metric.id] || 0;
    }
    
    // Time Stats
    const lastLog = metricLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    const daysSinceLastLog = lastLog 
      ? Math.floor((today - new Date(lastLog.timestamp)) / (1000 * 60 * 60 * 24)) 
      : 999;

    // FIX: Inline calculation for "Today's Value" since MetricEngine.getTodayValue is missing
    const todayLogs = metricLogs.filter(l => new Date(l.timestamp).toDateString() === todayStr);
    const todayValue = todayLogs.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);

    // Correlations (expensive, only run if engines available and data sufficient)
    let maxCorr = 0;
    let corrPartner = null;

    if (CorrelationEngine && CorrelationEngine.pairwiseCorrelations && allLogs.length > 50) {
      try {
        // OPTIMIZATION: Use precalculated correlations if available to avoid O(N^2) loop
        const correlations = precalculatedCorrelations || CorrelationEngine.pairwiseCorrelations(allMetrics, allLogs, 0);

        for (const key in correlations) {
          if (key.includes(metric.id)) {
            const val = correlations[key];
            if (val && Math.abs(val) > Math.abs(maxCorr)) {
              maxCorr = val;
              // Find the name of the OTHER metric in the key
              const partnerId = key.replace(metric.id, '').replace('-', '');
              const partner = allMetrics.find(m => m.id === partnerId);
              if (partner) corrPartner = partner.label;
            }
          }
        }
      } catch (err) {
        console.warn("Correlation engine skipped:", err);
      }
    }

    return {
      value: todayValue,
      streak,
      completion, // 0-100+
      rollingAvg,
      trend, // percentage delta
      daysSinceLastLog,
      metricType: metric.type,
      goal: metric.goal || 0,
      unit: metric.unit,
      dayOfWeek: today.getDay(), // 0 = Sunday
      correlation: maxCorr,
      corrPartner
    };
  },

  /**
   * Main Entry Point
   * Runs all metrics through all recipes to generate insights.
   */
  generateAllInsights: (metrics = [], logs = [], segment = 'Weekly') => {
    const allInsights = {};

    if (!metrics || !Array.isArray(metrics)) return {};

    // OPTIMIZATION: Pre-calculate correlations once instead of per-metric
    let globalCorrelations = null;
    if (CorrelationEngine && CorrelationEngine.pairwiseCorrelations && logs.length > 50) {
      try {
        globalCorrelations = CorrelationEngine.pairwiseCorrelations(metrics, logs, 0);
      } catch (err) {
        console.warn("Global correlation calc failed:", err);
      }
    }

    metrics.forEach(metric => {
      try {
        // 1. Calculate Stats Context
        const stats = HorizonAgent.calculateStats(metric, logs, logs, metrics, globalCorrelations);
        if (!stats) return;

        const metricInsights = [];

        // 2. Run against Recipe Engine
        Recipes.insightTemplates.forEach(template => {
          try {
            if (template.condition && template.condition(stats)) {
              metricInsights.push({
                id: template.id,
                type: template.type || 'general',
                title: template.type === 'recommendation' ? 'Next Best Move' : 'Insight',
                message: typeof template.message === 'function' ? template.message(metric, stats) : template.message,
                priority: template.type === 'recommendation' ? 10 : 5, // Higher priority for actionable recs
                metricId: metric.id
              });
            }
          } catch (recipeErr) {
            // Silently fail individual recipes to preserve the stream
            // console.debug(`Recipe ${template.id} skipped for ${metric.label}`);
          }
        });

        // 3. Sort by priority
        if (metricInsights.length > 0) {
          allInsights[metric.id] = metricInsights.sort((a, b) => b.priority - a.priority);
        }
      } catch (metricErr) {
        console.warn(`Horizon Agent failed to process metric: ${metric.label}`, metricErr);
      }
    });

    return allInsights;
  },
};
