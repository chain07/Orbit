import React, { useState, useContext, useMemo, useEffect } from 'react';
import { StorageContext } from '../../context/StorageContext';
import { ReportEngine } from '../../engine/ReportEngine';
import { Glass } from '../ui/Glass';
import { Icons } from '../ui/Icons';
import { OrbitButton } from '../ui/OrbitButton';
import '../../styles/index.css';

export const ReportGenerator = ({ segment = 'Weekly' }) => {
  const { metrics, logEntries } = useContext(StorageContext);
  const [selectedSections, setSelectedSections] = useState({
    summary: true,
    highs: true,
    lows: true,
    averages: true,
    correlations: true,
    streaks: true,
    completion: true
  });
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [archivedReports, setArchivedReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const reportData = useMemo(() => {
    return ReportEngine.generateReportData(metrics, logEntries, segment);
  }, [metrics, logEntries, segment]);

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
          setArchivedReports(ReportEngine.getArchivedReports());
          setTimeout(() => setSaved(false), 2000);
      } else {
          alert("Failed to save report. Storage might be full.");
      }
  };

  return (
    <div className="flex flex-col gap-4">
      <Glass className="p-0 overflow-hidden">
        {/* Collapsible Header */}
        <div
          className="flex justify-between items-center p-4 cursor-pointer hover:bg-bg-color/30 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h3 className="text-lg font-bold">Report Generator</h3>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-full">
                 <Icons.BarChart2 size={14} className="text-secondary" />
                 <span className="text-xs font-bold text-secondary uppercase tracking-wide translate-y-[1px]">{segment}</span>
             </div>
             <div className={`text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
               <Icons.ChevronDown size={20} />
             </div>
          </div>
        </div>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="px-4 pb-4 animate-fade-in">
             <div className="flex flex-col gap-4">
              {/* Controls Row */}
              <div className="flex justify-end pt-2 border-t border-separator">
                 <OrbitButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowArchive(!showArchive);
                    }}
                    variant={showArchive ? 'primary' : 'secondary'}
                    className={`!w-auto !h-8 !px-3 !text-xs ${!showArchive ? '!bg-transparent' : ''}`}
                    title="Archived Reports"
                    icon={<Icons.Archive size={14} />}
                 >
                   Archive
                 </OrbitButton>
              </div>

              <div className="text-xs font-bold text-secondary uppercase tracking-wide mt-2 mb-1">
                 Configuration
              </div>

              {/* Section Toggles */}
              <div className="grid grid-cols-2 gap-5">
                {Object.entries(selectedSections).map(([key, value]) => (
                  <div key={key} className="mb-5 last:mb-0">
                    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-color/50 transition-colors cursor-pointer group">
                      <span className="text-sm font-medium capitalize text-primary/80 group-hover:text-primary transition-colors">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>

                      {/* CSS-Only Toggle Switch */}
                      <div className="toggle-wrapper">
                          <input
                            type="checkbox"
                            name={key}
                            checked={value}
                            onChange={() => toggleSection(key)}
                            className="toggle-checkbox"
                          />
                          <div className="toggle-label"></div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-separator">
                <OrbitButton
                  onClick={handleCopy}
                  variant="primary"
                  className="flex-1 !text-sm"
                  icon={copied ? <Icons.Check size={16} /> : <Icons.Copy size={16} />}
                >
                  {copied ? 'Copied' : 'Copy'}
                </OrbitButton>

                <OrbitButton
                  onClick={handleSave}
                  variant="secondary"
                  className="flex-1 !text-sm"
                  icon={saved ? <Icons.Check size={16} /> : <Icons.Save size={16} />}
                >
                   Save
                </OrbitButton>

                <OrbitButton
                  onClick={handleDownload}
                  variant="secondary"
                  className="!w-12 !px-0"
                  title="Download Markdown"
                  icon={<Icons.Download size={18} />}
                />
              </div>
            </div>
          </div>
        )}
      </Glass>

      {showArchive && isOpen && (
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

    {selectedReport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <Glass className="w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl p-0">
                <div className="flex justify-between items-center p-4 border-b border-separator bg-bg-color">
                    <div>
                        <div className="text-sm font-bold text-blue uppercase">{selectedReport.segment} Report</div>
                        <div className="text-xs text-secondary">{new Date(selectedReport.timestamp).toLocaleString()}</div>
                    </div>
                    <OrbitButton
                        onClick={() => setSelectedReport(null)}
                        variant="secondary"
                        className="!w-10 !h-10 !p-0 !bg-transparent"
                        icon={<Icons.X size={20} />}
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-4 bg-bg-color">
                    <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap text-primary leading-relaxed">
                        {selectedReport.content}
                    </pre>
                </div>
                <div className="p-4 border-t border-separator bg-bg-color flex justify-end">
                    <OrbitButton
                        onClick={() => {
                            navigator.clipboard.writeText(selectedReport.content);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}
                        variant="primary"
                        className="!px-6"
                        icon={copied ? <Icons.Check size={16} /> : <Icons.Copy size={16} />}
                    >
                        Copy to Clipboard
                    </OrbitButton>
                </div>
            </Glass>
        </div>
    )}
    </div>
  );
};
