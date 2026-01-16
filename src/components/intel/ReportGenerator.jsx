import React, { useState, useContext, useMemo } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { ReportEngine } from '../../engine/ReportEngine';
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

  // Delegate logic to ReportEngine
  const reportData = useMemo(() => {
    return ReportEngine.generateReportData(metrics, logEntries, segment);
  }, [metrics, logEntries, segment]);

  const toggleSection = (section) => {
    setSelectedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCopy = async () => {
    const text = ReportEngine.generateReportText(reportData, segment, metrics, logEntries, selectedSections);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const text = ReportEngine.generateReportText(reportData, segment, metrics, logEntries, selectedSections);
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
