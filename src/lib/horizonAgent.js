import { MetricEngine } from '../engine/MetricEngine';
import { AnalyticsEngine } from '../engine/AnalyticsEngine';
import { CorrelationEngine } from '../engine/CorrelationEngine';
import { NormalizationEngine } from '../engine/NormalizationEngine';
import { Recipes } from './recipes';

export const HorizonAgent = {
  /**
   * Generates a rich set of statistics for a single metric
   * used to feed the Recipe engine.
   */
  calculateStats: (metric, logs, allLogs, allMetrics) => {
    const metricLogs = logs.filter(l => l.metricId === metric.id);
    const today = new Date();
    
    // Core Stats
    const streak = MetricEngine.currentStreak(logs, metric.id);
    const completion = MetricEngine.goalCompletion(metric, metricLogs);
    const rollingAvg = MetricEngine.rollingAverage(logs, metric.id, 7);
    const trend = AnalyticsEngine.trendDeltas([metric], allLogs, 7)[metric.id] || 0;
    
    // Time Stats
    const lastLog = metricLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    const daysSinceLastLog = lastLog 
      ? Math.floor((today - new Date(lastLog.timestamp)) / (1000 * 60 * 60 * 24)) 
      : 999;
    const todayValue = MetricEngine.getTodayValue(metricLogs);

    // Correlations (expensive, only run if needed)
    // We grab the highest correlation for this metric
    let maxCorr = 0;
    let corrPartner = null;
    const correlations = CorrelationEngine.pairwiseCorrelations(allMetrics, allLogs, 0);
    
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

    return {
      value: todayValue,
      streak,
      completion, // 0-100+
      rollingAvg,
      trend, // percentage delta
      daysSinceLastLog,
      metricType: metric.type,
      goal: metric.goal,
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

    metrics.forEach(metric => {
      // 1. Calculate Stats Context
      const stats = HorizonAgent.calculateStats(metric, logs, logs, metrics);
      const metricInsights = [];

      // 2. Run against Recipe Engine
      Recipes.insightTemplates.forEach(template => {
        try {
          if (template.condition(stats)) {
            metricInsights.push({
              id: template.id,
              type: template.type || 'general',
              title: template.type === 'recommendation' ? 'Next Best Move' : 'Insight',
              message: template.message(metric, stats),
              priority: template.type === 'recommendation' ? 10 : 5, // Higher priority for actionable recs
              metricId: metric.id
            });
          }
        } catch (err) {
          console.warn(`Failed to run recipe ${template.id} for ${metric.label}`, err);
        }
      });

      // 3. Sort by priority
      if (metricInsights.length > 0) {
        allInsights[metric.id] = metricInsights.sort((a, b) => b.priority - a.priority);
      }
    });

    return allInsights;
  },
};
