import { MetricEngine } from './MetricEngine';
import { AnalyticsEngine } from './AnalyticsEngine';

const ARCHIVE_KEY = 'orbit_reports_archive';

/**
 * ReportEngine
 * Logic for generating insights reports (text/markdown generation).
 */
export const ReportEngine = {

  /**
   * Generate Report Data
   * Calculates all the stats needed for the report.
   */
  generateReportData: (metrics, logEntries, segment) => {
    const windowDays = segment === 'Daily' ? 1 : segment === 'Weekly' ? 7 : 30;

    // Calculate metrics
    const avgData = AnalyticsEngine.rollingAverages(metrics, logEntries, windowDays);
    const trendData = AnalyticsEngine.trendDeltas(metrics, logEntries, windowDays);
    const correlations = AnalyticsEngine.laggedCorrelations(metrics, logEntries, 0);

    const metricsData = metrics.map(metric => {
      const metricLogs = logEntries.filter(l => l.metricId === metric.id);
      const stats = MetricEngine.stats(metric, logEntries);
      const streak = MetricEngine.currentStreak(logEntries, metric.id);
      const completion = MetricEngine.goalCompletion(metric, metricLogs);

      return {
        name: metric.label || metric.name,
        average: avgData[metric.id] || 0,
        trend: trendData[metric.id] || 0,
        stats,
        streak,
        completion
      };
    });

    return { metricsData, correlations, windowDays };
  },

  /**
   * Generate Markdown Report
   * Creates the actual string content based on data and options.
   */
  generateReportText: (reportData, segment, metrics, logEntries, selectedSections) => {
    const { metricsData, correlations, windowDays } = reportData;
    const date = new Date().toLocaleDateString();

    let report = `# ORBIT ${segment} Report\n`;
    report += `Generated: ${date}\n`;
    report += `Period: Last ${windowDays} day(s)\n\n`;

    if (selectedSections.summary) {
      report += `## Summary\n`;
      report += `Total Metrics Tracked: ${metrics.length}\n`;
      report += `Total Log Entries: ${logEntries.length}\n\n`;
    }

    if (selectedSections.averages) {
      report += `## Averages\n`;
      metricsData.forEach(m => {
        report += `- ${m.name}: ${m.average.toFixed(2)}\n`;
      });
      report += `\n`;
    }

    if (selectedSections.highs) {
      report += `## Top Performers\n`;
      const sorted = [...metricsData].sort((a, b) => b.completion - a.completion);
      sorted.slice(0, 3).forEach((m, i) => {
        report += `${i + 1}. ${m.name}: ${m.completion.toFixed(1)}% completion\n`;
      });
      report += `\n`;
    }

    if (selectedSections.lows) {
      report += `## Needs Attention\n`;
      const sorted = [...metricsData].sort((a, b) => a.completion - b.completion);
      sorted.slice(0, 3).forEach((m, i) => {
        report += `${i + 1}. ${m.name}: ${m.completion.toFixed(1)}% completion\n`;
      });
      report += `\n`;
    }

    if (selectedSections.streaks) {
      report += `## Current Streaks\n`;
      metricsData.forEach(m => {
        if (m.streak > 0) {
          report += `- ${m.name}: ${m.streak} day(s)\n`;
        }
      });
      report += `\n`;
    }

    if (selectedSections.completion) {
      report += `## Goal Completion Rates\n`;
      metricsData.forEach(m => {
        report += `- ${m.name}: ${m.completion.toFixed(1)}%\n`;
      });
      report += `\n`;
    }

    if (selectedSections.correlations) {
      report += `## Notable Correlations\n`;
      const significantCorr = Object.entries(correlations)
        .filter(([_, val]) => val !== null && Math.abs(val) > 0.5)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

      if (significantCorr.length > 0) {
        significantCorr.slice(0, 5).forEach(([key, val]) => {
          report += `- ${key.replace('-', ' ↔ ')}: ${(val * 100).toFixed(0)}%\n`;
        });
      } else {
        report += `No significant correlations found.\n`;
      }
      report += `\n`;
    }

    report += `---\n`;
    report += `End of Report\n`;

    return report;
  },

  /**
   * Save Report Snapshot
   * Persists the generated report text to localStorage.
   */
  saveReportSnapshot: (reportText, segment) => {
    try {
      const raw = localStorage.getItem(ARCHIVE_KEY);
      const archive = raw ? JSON.parse(raw) : [];

      const snapshot = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        segment,
        content: reportText
      };

      archive.unshift(snapshot); // Add to top

      // Limit archive size to last 50 reports to prevent storage issues
      if (archive.length > 50) {
          archive.length = 50;
      }

      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
      return true;
    } catch (e) {
      console.error("Failed to save report snapshot", e);
      return false;
    }
  },

  /**
   * Get Archived Reports
   * Retrieves snapshots from localStorage.
   */
  getArchivedReports: () => {
    try {
      const raw = localStorage.getItem(ARCHIVE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
};
