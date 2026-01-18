import React, { useContext, useState, useEffect, useMemo } from 'react';
import { StorageContext } from '../context/StorageContext';
import { Glass } from '../components/ui/Glass';
import { MetricBuilder } from '../components/system/MetricBuilder';
import { DataManagement } from '../components/system/DataManagement';
import { Library } from '../lib/library';
import SegmentedControl from '../components/ui/SegmentedControl';
import { Icons } from '../components/ui/Icons';
import '../styles/index.css';

export const System = ({ onNavigate }) => {
  const { 
    metrics, 
    addMetric, 
    updateMetric, 
    deleteMetric, 
    logEntries, // Needed for Debug Export
    addLogEntry // Needed for Seeding
  } = useContext(StorageContext);
  
  const [viewMode, setViewMode] = useState('Library'); // 'Library' | 'Settings'
  const [isDebugMode, setIsDebugMode] = useState(false); // T-01: Debug State

  // Metric Management State
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);

  // Library Protocols State
  const [libraryItems, setLibraryItems] = useState([]);
  const [viewingItem, setViewingItem] = useState(null);
  const [isEditingLibrary, setIsEditingLibrary] = useState(false);

  // Load Library on Mount
  useEffect(() => {
    refreshLibrary();
  }, []);

  const refreshLibrary = () => {
    const items = Library.list();
    if (items.length === 0) {
      const defaultItem = {
        id: crypto.randomUUID(),
        title: 'Library Manifest',
        category: 'System',
        blocks: [
          { type: 'text', heading: 'Purpose', content: 'The Library is your long-term storage for protocols, principles, core values, and insights.' }
        ]
      };
      Library.add(defaultItem);
      setLibraryItems([defaultItem]);
    } else {
      setLibraryItems(items);
    }
  };

  // Unified List Generation
  const unifiedList = useMemo(() => {
    const metricItems = metrics.map(m => ({
      ...m,
      isMetric: true,
      category: 'Metric',
      title: m.name,
      icon: getTypeIcon(m.type)
    }));

    const protocolItems = libraryItems.map(p => ({
      ...p,
      isMetric: false,
      category: p.category || 'Protocol',
      icon: 'Aa'
    }));

    return [...metricItems, ...protocolItems];
  }, [metrics, libraryItems]);

  const handleEditMetric = (metric) => {
    setEditingMetric(metric);
    setShowBuilder(true);
  };

  const handleAddMetric = () => {
    setEditingMetric(null);
    setShowBuilder(true);
  };

  const handleSaveMetric = (metric) => {
    if (!metric.id) {
      metric.id = metric.label.toLowerCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).substr(2, 5);
    }
    if (editingMetric) updateMetric(metric);
    else addMetric(metric);
    setShowBuilder(false);
  };

  // --- Library Handlers ---
  const handleSaveLibraryItem = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const blocks = [];
    const headings = formData.getAll('heading');
    const contents = formData.getAll('content');
    const types = formData.getAll('type');

    headings.forEach((h, i) => {
      if(h || contents[i]) {
          blocks.push({
              heading: h,
              content: contents[i],
              type: types[i] || 'text'
          });
      }
    });

    const newItem = {
      id: viewingItem?.id || crypto.randomUUID(),
      title: formData.get('title'),
      category: formData.get('category'),
      metricId: formData.get('metricId') || null,
      blocks: blocks
    };

    if (viewingItem && viewingItem.id) Library.update(newItem);
    else Library.add(newItem);

    setViewingItem(null);
    setIsEditingLibrary(false);
    refreshLibrary();
  };

  const handleDeleteLibraryItem = (id) => {
    if (confirm('Delete this item?')) {
      Library.remove(id);
      setViewingItem(null);
      refreshLibrary();
    }
  };

  const openNewLibraryItem = () => {
    // F-02: Ensure clear state for creation
    setViewingItem({ id: null, title: '', category: '', metricId: '', blocks: [{ type: 'text', heading: '', content: '' }] });
    setIsEditingLibrary(true);
  };

  // F-02: Ensure Edit opens in Edit Mode or View Mode?
  // N-02 proposed solution: Tap -> Detail View. Detail View -> Edit Button -> Edit Mode.
  const handleViewLibraryItem = (item) => {
      setViewingItem(item);
      setIsEditingLibrary(false); // Default to viewing
  };

  // T-01: Seed Test Data
  const seedTestData = () => {
      if (!confirm("Inject random test data? This will affect your stats.")) return;
      const now = new Date();
      metrics.forEach(m => {
          for(let i=0; i<7; i++) {
               const date = new Date();
               date.setDate(now.getDate() - i);
               const val = m.type === 'boolean' ? Math.random() > 0.5 : Math.floor(Math.random() * 10);
               addLogEntry({
                   metricId: m.id,
                   value: val,
                   timestamp: date.toISOString()
               });
          }
      });
      alert("Test data seeded.");
  };

  // T-01: Export Archive Test
  const exportArchive = () => {
      const archive = {
          timestamp: new Date().toISOString(),
          metrics,
          logs: logEntries
      };
      const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orbit-debug-archive.json`;
      a.click();
  };


  return (
    <div className="flex flex-col gap-6 p-4 pb-32 fade-in">
      
      {/* Header & Toggle - L-06: Safe MT */}
      <div className="flex justify-between items-end safe-mt">
         <div className="flex flex-col gap-1">
             <h1 className="text-3xl font-extrabold tracking-tight">System</h1>
             <p className="text-secondary font-medium">Configuration</p>
         </div>
         <div className="w-[180px]">
             <SegmentedControl
                options={['Library', 'Settings']}
                value={viewMode}
                onChange={setViewMode}
             />
         </div>
      </div>

      {/* --- LIBRARY VIEW --- */}
      {viewMode === 'Library' && (
        <div className="flex flex-col gap-4">
            {/* Create Button (Top of List) */}
            <button
                onClick={handleAddMetric}
                className="btn-primary w-full shadow-lg shadow-blue/20"
            >
                <span className="text-xl">+</span> Add New Metric
            </button>

            {/* N-02: List View (Already implemented, refined styling) */}
            <div className="flex flex-col gap-2">
                {unifiedList.map(item => (
                    <div
                        key={item.id}
                        onClick={() => item.isMetric ? handleEditMetric(item) : handleViewLibraryItem(item)}
                        className="p-3 rounded-xl border border-separator bg-card flex justify-between items-center cursor-pointer active:scale-[0.99] transition-transform hover:bg-bg-color/50"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${item.isMetric ? 'bg-bg-color text-blue' : 'bg-orange/10 text-orange'}`}>
                                {item.isMetric ? item.icon : <Icons.BookOpen size={20} />} {/* L-08: Semantic Icon */}
                            </div>
                            <div>
                                <div className="font-bold text-primary">{item.title}</div>
                                <div className="text-xs text-secondary flex items-center gap-1">
                                    {item.category}
                                    {!item.isMetric && <span className="text-[10px] bg-separator bg-opacity-30 px-1 rounded">Protocol</span>}
                                </div>
                            </div>
                        </div>
                        <div className="text-secondary opacity-30">
                            <Icons.ChevronRight size={16} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Secondary Action for Protocols */}
            <button onClick={openNewLibraryItem} className="text-center text-blue font-bold text-sm mt-4 hover:underline">
                + Create Protocol Item
            </button>
        </div>
      )}

      {/* --- SETTINGS VIEW --- */}
      {viewMode === 'Settings' && (
        <div className="flex flex-col gap-6 animate-fade-in">
            <DataManagement />

            {/* Preferences */}
            <Glass className="p-0 overflow-hidden">
                <div className="font-bold text-lg p-4 border-b border-separator/50">App Preferences</div>
                <div className="flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b border-separator/50">
                        <span className="font-medium">Notifications</span>
                        <div className="w-10 h-6 bg-separator/30 rounded-full relative">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-4 border-b border-separator/50">
                        <span className="font-medium">Haptics</span>
                        <div className="w-10 h-6 bg-green rounded-full relative">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-4">
                        <span className="font-medium">Developer Mode</span>
                        <button
                            onClick={() => setIsDebugMode(!isDebugMode)}
                            className={`w-10 h-6 rounded-full relative transition-colors ${isDebugMode ? 'bg-blue' : 'bg-separator/30'}`}
                        >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isDebugMode ? 'right-1' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>
            </Glass>

            {/* T-01: Debug Tools */}
            {isDebugMode && (
                <Glass className="p-4 border-l-4 border-orange">
                    <div className="text-xs font-bold text-orange uppercase tracking-wide mb-3">Developer Tools</div>
                    <div className="flex gap-2">
                        <button onClick={seedTestData} className="flex-1 btn-secondary text-xs">Seed Test Data</button>
                        <button onClick={exportArchive} className="flex-1 btn-secondary text-xs">Export Debug Archive</button>
                    </div>
                </Glass>
            )}

            <div className="text-center text-xs text-secondary mt-8">
                ORBIT v1.1.0 • Liquid Native
            </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Metric Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <MetricBuilder
            metric={editingMetric}
            onSave={handleSaveMetric}
            onCancel={() => setShowBuilder(false)}
          />
        </div>
      )}

      {/* Library Viewer/Editor Modal (Refactored) */}
      {viewingItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <LibraryModal
             viewingItem={viewingItem}
             setViewingItem={setViewingItem}
             isEditingLibrary={isEditingLibrary}
             setIsEditingLibrary={setIsEditingLibrary}
             handleSaveLibraryItem={handleSaveLibraryItem}
             handleDeleteLibraryItem={handleDeleteLibraryItem}
             metrics={metrics}
          />
        </div>
      )}
    </div>
  );
};

// Helper for Icons
const getTypeIcon = (type) => {
  switch(type) {
    case 'number': return '#';
    case 'boolean': return '✓';
    case 'duration': return '⏱';
    case 'range': return '↔';
    case 'select': return '☰';
    case 'text': return 'Aa';
    default: return '?';
  }
};

// Extracted Library Modal - S-05 (Dark Mode), F-01 (Block Editor)
const LibraryModal = ({ viewingItem, setViewingItem, isEditingLibrary, setIsEditingLibrary, handleSaveLibraryItem, handleDeleteLibraryItem, metrics }) => {
    return (
        <Glass className="w-full max-w-lg h-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl p-0 bg-card">
            <div className="p-4 border-b border-separator flex justify-between items-center bg-bg-color/50">
              <button onClick={() => setViewingItem(null)} className="text-blue font-bold">Close</button>
              <div className="font-bold">{isEditingLibrary ? (viewingItem.id ? 'Edit Item' : 'New Item') : 'Library'}</div>
              {!isEditingLibrary ? (
                <button onClick={() => setIsEditingLibrary(true)} className="text-blue font-bold">Edit</button>
              ) : (
                <button form="libraryForm" type="submit" className="text-green font-bold">Save</button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-bg-color">
              {isEditingLibrary ? (
                <form id="libraryForm" onSubmit={handleSaveLibraryItem} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase">Title</label>
                    <input name="title" defaultValue={viewingItem.title} required className="w-full p-3 rounded-lg bg-bg-color border border-separator font-bold text-lg outline-none text-primary" placeholder="Protocol Name" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase">Category</label>
                    <input name="category" defaultValue={viewingItem.category} className="w-full p-3 rounded-lg bg-bg-color border border-separator outline-none text-primary" placeholder="e.g. Psychology" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase">Linked Metric</label>
                    <div className="relative">
                        <select name="metricId" defaultValue={viewingItem.metricId || ''} className="w-full p-3 rounded-lg bg-bg-color border border-separator outline-none appearance-none text-primary">
                            <option value="">None</option>
                            {metrics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                  </div>
                  <div className="border-t border-separator my-2"></div>

                  {/* F-01: Full Block Editor (Removed "Simplified View" text) */}
                  <div className="text-xs font-bold text-secondary uppercase mb-2">Content Blocks</div>

                  {viewingItem.blocks && viewingItem.blocks.map((blk, idx) => (
                      <div key={idx} className="flex flex-col gap-2 p-3 border border-separator rounded-lg bg-bg-color">
                          <input type="hidden" name="type" value={blk.type} />
                          <input name="heading" defaultValue={blk.heading} className="font-bold text-sm bg-transparent outline-none text-primary placeholder-secondary" placeholder="HEADING (Optional)" />
                          <textarea name="content" defaultValue={blk.content} className="w-full bg-transparent outline-none text-primary min-h-[60px]" placeholder="Content..." />
                      </div>
                  ))}

                  {/* Add New Block Stub */}
                  <div className="flex flex-col gap-2 p-3 border border-separator border-dashed rounded-lg opacity-80 hover:opacity-100 transition-opacity">
                       <input type="hidden" name="type" value="text" />
                       <div className="flex justify-between">
                           <input name="heading" className="font-bold text-sm bg-transparent outline-none placeholder-blue" placeholder="+ ADD HEADING" />
                           <span className="text-xs text-secondary uppercase">New Block</span>
                       </div>
                       <textarea name="content" className="w-full bg-transparent outline-none text-primary min-h-[60px]" placeholder="Content..." />
                  </div>

                  {viewingItem.id && (
                     <button type="button" onClick={() => handleDeleteLibraryItem(viewingItem.id)} className="mt-8 py-3 text-red font-bold bg-red/10 rounded-lg hover:bg-red/20 transition-colors">Delete Item</button>
                  )}
                </form>
              ) : (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <div>
                    <h2 className="text-3xl font-extrabold text-primary">{viewingItem.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block px-2 py-1 rounded bg-blue/10 text-blue text-xs font-bold uppercase">{viewingItem.category}</span>
                    </div>
                  </div>
                  {viewingItem.blocks && viewingItem.blocks.map((blk, idx) => (
                    <div key={idx}>
                      {blk.heading && <div className="text-xs font-bold text-secondary uppercase mb-1 tracking-wide">{blk.heading}</div>}
                      <div className="text-primary leading-relaxed whitespace-pre-wrap">{blk.content}</div>
                      <div className="border-b border-separator opacity-20 mt-4"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </Glass>
    );
};
