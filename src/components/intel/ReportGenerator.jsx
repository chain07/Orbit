import React, { useState, useContext, useMemo, useEffect } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { ReportEngine } from '../../engine/ReportEngine';
import { Glass } from '../ui/Glass';
import { Icons } from '../ui/Icons';
import '../../styles/index.css'; // For standard buttons

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
        {/* Header - L-05: Aligned Timeframe */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Report Generator</h3>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-full">
                 <Icons.BarChart2 size={14} className="text-secondary" />
                 <span className="text-xs font-bold text-secondary uppercase tracking-wide translate-y-[1px]">{segment}</span>
             </div>
             <button
                onClick={() => setShowArchive(!showArchive)}
                className={`p-2 rounded-lg transition-all active:scale-95 ${showArchive ? 'bg-blue text-white shadow-lg shadow-blue/20' : 'text-secondary hover:text-primary hover:bg-bg-color'}`}
                title="Archived Reports"
             >
                 <Icons.Archive size={20} />
             </button>
          </div>
        </div>

        {/* Section Toggles - S-03: Styled Switches */}
        <div className="flex flex-col gap-3 border-t border-separator pt-4">
          <div className="text-xs font-bold text-secondary uppercase tracking-wide">
            Include Sections
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(selectedSections).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-color/50 transition-colors cursor-pointer group">
                  <span className="text-sm font-medium capitalize text-primary/80 group-hover:text-primary transition-colors">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>

                  {/* CSS-Only Checkbox (Spring Physics) */}
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${value ? 'bg-blue border-blue' : 'border-separator bg-transparent'}`}>
                      <input
                        type="checkbox"
                        name={key}
                        checked={value}
                        onChange={() => toggleSection(key)}
                        className="hidden"
                      />
                      <Icons.Check size={14} className={`text-white transition-transform duration-200 ${value ? 'scale-100' : 'scale-0'}`} />
                  </div>
                </label>
            ))}
          </div>
        </div>

        {/* Action Buttons - S-04: Styled Standard Buttons */}
        <div className="flex gap-3 pt-4 border-t border-separator">
          <button
            onClick={handleCopy}
            className="btn-primary flex-1 h-11 flex items-center justify-center gap-2 text-sm"
          >
            {copied ? (
              <>
                <Icons.Check size={16} />
                Copied
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
            className="btn-secondary flex-1 h-11 flex items-center justify-center gap-2 text-sm"
          >
             {saved ? <Icons.Check size={16} /> : <Icons.Save size={16} />}
             Save
          </button>

          <button
            onClick={handleDownload}
            className="btn-secondary w-12 h-11 flex items-center justify-center"
            title="Download Markdown"
          >
            <Icons.Download size={18} />
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <Glass className="w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl p-0">
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
                        className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
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
