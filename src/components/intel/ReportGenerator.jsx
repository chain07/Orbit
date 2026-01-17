import React, { useState, useContext, useMemo, useEffect } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { ReportEngine } from '../../engine/ReportEngine';
import { Glass } from '../ui/Glass';
import { Icons } from '../ui/Icons';

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
  const [selectedReport, setSelectedReport] = useState(null);

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
                 <Icons.Archive size={18} />
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
          <button
            onClick={handleCopy}
            className="flex-1 py-3 rounded-xl bg-blue text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            {copied ? (
              <>
                <Icons.Check size={16} />
                Copied!
              </>
            ) : (
              <>
                <Icons.Copy size={16} />
                Copy
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-green text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
             {saved ? <Icons.Check size={16} /> : <Icons.Save size={16} />}
             Save
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 py-3 rounded-xl border border-separator font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Icons.Download size={16} />
            DL
          </button>
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
                    <div
                        key={report.id}
                        className="p-3 border border-separator rounded-lg bg-bg-color hover:bg-separator/10 transition-colors cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-blue uppercase">{report.segment}</span>
                            <span className="text-[10px] text-secondary">{new Date(report.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-primary line-clamp-2 font-mono opacity-80 whitespace-pre-wrap pointer-events-none">
                            {report.content.substring(0, 100)}...
                        </div>
                    </div>
                ))}
            </div>
        </Glass>
    )}

    {/* Report Viewer Modal */}
    {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <Glass className="w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-separator bg-bg-color">
                    <div>
                        <div className="text-sm font-bold text-blue uppercase">{selectedReport.segment} Report</div>
                        <div className="text-xs text-secondary">{new Date(selectedReport.timestamp).toLocaleString()}</div>
                    </div>
                    <button
                        onClick={() => setSelectedReport(null)}
                        className="p-2 hover:bg-separator/20 rounded-full transition-colors"
                    >
                        <Icons.X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 bg-bg-color">
                    <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap text-primary leading-relaxed">
                        {selectedReport.content}
                    </pre>
                </div>
                <div className="p-4 border-t border-separator bg-bg-color flex justify-end">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(selectedReport.content);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue text-white rounded-lg font-bold text-sm"
                    >
                        {copied ? <Icons.Check size={16} /> : <Icons.Copy size={16} />}
                        Copy to Clipboard
                    </button>
                </div>
            </Glass>
        </div>
    )}
    </div>
  );
};
