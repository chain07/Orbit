// src/engine/CorrelationEngine.js
/**
 * CorrelationEngine
 * Computes correlations and lagged correlations between metrics
 */

export const CorrelationEngine = {
  /**
   * Compute Pearson correlation coefficient between two arrays
   * Returns null if arrays are empty or unequal length
   */
  pearson: (arrX, arrY) => {
    if (!arrX.length || !arrY.length || arrX.length !== arrY.length) return null;

    const n = arrX.length;
    const meanX = arrX.reduce((a, b) => a + b, 0) / n;
    const meanY = arrY.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = arrX[i] - meanX;
      const dy = arrY[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    const denominator = Math.sqrt(denomX * denomY);
    return denominator === 0 ? 0 : numerator / denominator;
  },

  /**
   * Compute lagged correlation between two metrics
   * logsA and logsB are arrays of numeric values ordered by time
   * lagDays shifts logsB forward
   */
  laggedCorrelation: (logsA = [], logsB = [], lagDays = 0) => {
    if (lagDays > 0) {
      logsB = logsB.slice(lagDays);
      logsA = logsA.slice(0, logsB.length);
    } else if (lagDays < 0) {
      logsA = logsA.slice(-lagDays);
      logsB = logsB.slice(0, logsA.length);
    }

    if (logsA.length !== logsB.length || logsA.length === 0) return null;

    return CorrelationEngine.pearson(logsA, logsB);
  },

  /**
   * Compute pairwise correlations for multiple metrics
   * metrics: array of MetricConfig { id }
   * logs: array of LogEntry { metricId, value }
   * lagDays: optional lag to apply to second metric
   * Returns: { 'metricId1-metricId2': correlation }
   */
  pairwiseCorrelations: (metrics = [], logs = [], lagDays = 0) => {
    const results = {};

    // Helper: get numeric values for a metric
    const getValues = (metricId) =>
      logs
        .filter(l => l.metricId === metricId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map(l => l.value);

    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const idA = metrics[i].id;
        const idB = metrics[j].id;

        const valuesA = getValues(idA);
        const valuesB = getValues(idB);

        results[`${idA}-${idB}`] = CorrelationEngine.laggedCorrelation(valuesA, valuesB, lagDays);
      }
    }

    return results;
  },
};
