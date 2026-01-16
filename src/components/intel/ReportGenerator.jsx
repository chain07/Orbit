import React, { useState, useContext, useMemo } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { AnalyticsEngine } from '../../engine/AnalyticsEngine';
import { MetricEngine } from '../../engine/MetricEngine';
import { Glass } from '../ui/Glass';
import { Copy, Download, Check } from 'lucide-react';

export const ReportGenerator = ({ segment = 'Weekly' }) => {
  const { metrics, logEntries } = useContext(StorageContext);
  const [selectedSections, setSelectedSections] = useState({
    summary: true,
    highs: true,
    lows: true,
    averages: true,
    correlations: false,
    streaks: true,
    completion: true
  });
  const [copied, setCopied] = useState(false);

  const reportData = useMemo(() => {
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
  }, [metrics, logEntries, segment]);

  const toggleSection = (section) => {
    setSelectedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const generateReportText = () => {
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
  };

  const handleCopy = async () => {
    const text = generateReportText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const text = generateReportText();
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbit-report-${segment.toLowerCase()}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Glass className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Report Generator</h3>
          <span className="text-xs text-secondary font-medium">{segment}</span>
        </div>

        {/* Section Toggles */}
        <div className="flex flex-col gap-2 border-t border-separator pt-3">
          <div className="text-xs font-bold text-secondary uppercase tracking-wide mb-1">
            Include Sections
          </div>
          {Object.entries(selectedSections).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={() => toggleSection(key)}
                className="w-4 h-4 rounded border-separator"
              />
              <span className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-separator">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 rounded-xl bg-blue text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy to Clipboard
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-3 rounded-xl border border-separator font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>
    </Glass>
  );
};
