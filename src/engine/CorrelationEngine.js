// src/engine/CorrelationEngine.js
/**
 * CorrelationEngine
 * Computes correlations and lagged correlations between metrics
 */

export const CorrelationEngine = {
  /**
   * Compute Pearson correlation coefficient between two arrays
   * Returns null if arrays are empty or unequal length
   * OPTIMIZED: Single-pass calculation (O(N) instead of 3N)
   */
  pearson: (arrX, arrY) => {
    const n = arrX.length;
    if (!n || arrY.length !== n || n === 0) return null;

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    for (let i = 0; i < n; i++) {
      const x = arrX[i];
      const y = arrY[i];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
    }

    const numerator = (n * sumXY) - (sumX * sumY);
    const denomX = (n * sumX2) - (sumX * sumX);
    const denomY = (n * sumY2) - (sumY * sumY);

    if (denomX === 0 || denomY === 0) return 0;

    return numerator / Math.sqrt(denomX * denomY);
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
   * OPTIMIZED:
   * 1. Pre-process logs into Map<metricId, sortedValues>
   * 2. Use string comparison for timestamps (avoid Date parsing overhead)
   * 3. Use single-pass Pearson calculation
   * Returns: { 'metricId1-metricId2': correlation }
   */
  pairwiseCorrelations: (metrics = [], logs = [], lagDays = 0) => {
    const results = {};

    // 1. Pre-process logs into Map
    const valuesMap = new Map();
    const grouped = new Map();

    // Grouping Pass: O(N)
    logs.forEach(l => {
      let list = grouped.get(l.metricId);
      if (!list) {
        list = [];
        grouped.set(l.metricId, list);
      }
      list.push(l);
    });

    // Sorting Pass: O(M * K log K) where K is avg logs per metric
    grouped.forEach((list, id) => {
      // OPTIMIZATION: String comparison is significantly faster than new Date()
      // Relies on timestamps being valid ISO strings (enforced by schema)
      list.sort((a, b) => (a.timestamp < b.timestamp ? -1 : (a.timestamp > b.timestamp ? 1 : 0)));
      valuesMap.set(id, list.map(l => l.value));
    });

    // 2. Pairwise Calculation Loop: O(M^2 * K)
    // No filter or sort inside this loop
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const idA = metrics[i].id;
        const idB = metrics[j].id;

        const valuesA = valuesMap.get(idA) || [];
        const valuesB = valuesMap.get(idB) || [];

        results[`${idA}-${idB}`] = CorrelationEngine.laggedCorrelation(valuesA, valuesB, lagDays);
      }
    }

    return results;
  },
};
