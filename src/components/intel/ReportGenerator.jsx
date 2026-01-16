import React, { useState, useContext, useMemo, useEffect } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { ReportEngine } from '../../engine/ReportEngine';
import { Glass } from '../ui/Glass';
import { Copy, Download, Check, Save, Archive } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [saved, setSaved] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [archivedReports, setArchivedReports] = useState([]);

  // Delegate logic to ReportEngine
  const reportData = useMemo(() => {
    return ReportEngine.generateReportData(metrics, logEntries, segment);
  }, [metrics, logEntries, segment]);

  // Load archive on mount
  useEffect(() => {
      setArchivedReports(ReportEngine.getArchivedReports());
  }, []);

  const toggleSection = (section) => {
    setSelectedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getReportText = () => {
    return ReportEngine.generateReportText(reportData, segment, metrics, logEntries, selectedSections);
  };

  const handleCopy = async () => {
    const text = getReportText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const text = getReportText();
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbit-report-${segment.toLowerCase()}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
      const text = getReportText();
      const success = ReportEngine.saveReportSnapshot(text, segment);
      if (success) {
          setSaved(true);
          setArchivedReports(ReportEngine.getArchivedReports()); // Refresh list
          setTimeout(() => setSaved(false), 2000);
      } else {
          alert("Failed to save report. Storage might be full.");
      }
  };

  return (
    <div className="flex flex-col gap-4">
    <Glass className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Report Generator</h3>
          <div className="flex gap-2 items-center">
             <button
                onClick={() => setShowArchive(!showArchive)}
                className={`p-2 rounded-lg transition-colors ${showArchive ? 'bg-blue text-white' : 'text-secondary hover:bg-bg-color'}`}
                title="View Saved Reports"
             >
                 <Archive size={18} />
             </button>
             <span className="text-xs text-secondary font-medium">{segment}</span>
          </div>
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
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="flex-1 py-3 rounded-xl bg-blue text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy
              </>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-green text-white font-bold text-sm flex items-center justify-center gap-2"
          >
             {saved ? <Check size={16} /> : <Save size={16} />}
             Save
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="flex-1 py-3 rounded-xl border border-separator font-bold text-sm flex items-center justify-center gap-2"
          >
            <Download size={16} />
            DL
          </motion.button>
        </div>
      </div>
    </Glass>

    {/* Stored Reports Section */}
    {showArchive && (
        <Glass className="p-4 animate-fade-in">
            <div className="text-sm font-bold text-secondary uppercase mb-3">Stored Reports</div>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                {archivedReports.length === 0 && <div className="text-center text-sm text-secondary italic py-4">No saved reports found.</div>}
                {archivedReports.map(report => (
                    <div key={report.id} className="p-3 border border-separator rounded-lg bg-bg-color hover:bg-opacity-50 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-blue uppercase">{report.segment}</span>
                            <span className="text-[10px] text-secondary">{new Date(report.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-primary line-clamp-3 font-mono opacity-80 whitespace-pre-wrap">
                            {report.content.substring(0, 150)}...
                        </div>
                        <div className="mt-2 flex justify-end">
                             <button
                                onClick={() => {
                                    navigator.clipboard.writeText(report.content);
                                    alert("Report copied to clipboard!");
                                }}
                                className="text-xs font-bold text-blue hover:underline"
                             >
                                 Copy Content
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        </Glass>
    )}
    </div>
  );
};
