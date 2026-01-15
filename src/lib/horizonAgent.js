// src/lib/horizonAgent.js
import { MetricEngine } from '../engine/MetricEngine';
import { AnalyticsEngine } from '../engine/AnalyticsEngine';
import { CorrelationEngine } from '../engine/CorrelationEngine';
import { NormalizationEngine } from '../engine/NormalizationEngine';

/**
 * HorizonAgent
 * Generates structured insights for the dashboard
 */
export const HorizonAgent = {
  /**
   * Generate insights for a single metric
   * Returns array of insight objects: { type, message, value }
   */
  insightsForMetric: (metricConfig, logs = [], metrics = [], allLogs = []) => {
    const insights = [];

    // Current streak
    const streak = MetricEngine.currentStreak(logs, metricConfig.id);
    if (streak > 1) {
      insights.push({
        type: 'streak',
        message: `You have a ${streak}-day streak for ${metricConfig.label}. Keep it up!`,
        value: streak,
      });
    }

    // Goal completion %
    const completion = MetricEngine.goalCompletion(metricConfig, logs);
    insights.push({
      type: 'goalCompletion',
      message: `You are ${completion.toFixed(1)}% towards your goal for ${metricConfig.label}.`,
      value: completion,
    });

    // Rolling averages and trend delta
    const rollingAvg = MetricEngine.rollingAverage(logs, metricConfig.id, 7);
    const trendDelta = AnalyticsEngine.trendDeltas([metricConfig], allLogs, 7)[metricConfig.id] || 0;
    insights.push({
      type: 'trend',
      message: `Last week average: ${rollingAvg.toFixed(1)} (${trendDelta >= 0 ? '+' : ''}${trendDelta.toFixed(1)} change from previous week).`,
      value: trendDelta,
    });

    // Correlations with other metrics
    const correlations = CorrelationEngine.pairwiseCorrelations(metrics, allLogs, 0);
    for (const key in correlations) {
      if (key.startsWith(metricConfig.id)) {
        const corr = correlations[key];
        if (corr != null && Math.abs(corr) >= 0.5) {
          insights.push({
            type: 'correlation',
            message: `Strong ${corr > 0 ? 'positive' : 'negative'} correlation (${corr.toFixed(2)}) with ${key.split('-')[1]}.`,
            value: corr,
          });
        }
      }
    }

    // Normalized performance
    const normValues = NormalizationEngine.normalizeLogs(metricConfig, logs);
    const avgNorm = normValues.length
      ? normValues.reduce((a, b) => a + b, 0) / normValues.length
      : 0;
    insights.push({
      type: 'normalized',
      message: `Normalized performance over time: ${(avgNorm * 100).toFixed(1)}%.`,
      value: avgNorm,
    });

    return insights;
  },

  /**
   * Generate all insights for all metrics
   * Returns object: { metricId: [insights] }
   */
  generateAllInsights: (metrics = [], logs = []) => {
    const allInsights = {};
    metrics.forEach(metric => {
      allInsights[metric.id] = HorizonAgent.insightsForMetric(metric, logs.filter(l => l.metricId === metric.id), metrics, logs);
    });
    return allInsights;
  },
};
