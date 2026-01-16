import React, { useContext, useState, useEffect } from 'react';
import { StorageContext } from '../context/StorageContext';
import { Glass } from '../components/ui/Glass';
import { MetricBuilder } from '../components/system/MetricBuilder';
import { Library } from '../lib/library';

export const System = ({ onNavigate }) => {
  const { 
    metrics, 
    addMetric, 
    updateMetric, 
    deleteMetric, 
    exportData, 
    importData, 
    clearAllData 
  } = useContext(StorageContext);
  
  // Metric Management State
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);

  // Library Management State
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
      // Create Default "Welcome" Item if empty
      const defaultItem = {
        id: crypto.randomUUID(),
        title: 'Library Manifest',
        category: 'System',
        blocks: [
          { type: 'text', heading: 'Purpose', content: 'The Library is your long-term storage for protocols, principles, core values, and insights.' },
          { type: 'text', heading: 'Usage', content: 'Create items here to document how you want to operate. You can define custom sections for any topic.' }
        ]
      };
      Library.add(defaultItem);
      setLibraryItems([defaultItem]);
    } else {
      setLibraryItems(items);
    }
  };

  // --- Metric Handlers ---
  const handleEditMetric = (metric) => {
    setEditingMetric(metric);
    setShowBuilder(true);
  };

  const handleAddMetric = () => {
    setEditingMetric(null);
    setShowBuilder(true);
  };

  const handleSaveMetric = (metric) => {
    // Ensure ID uniqueness for new metrics
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
    
    // Parse dynamic blocks
    const headings = formData.getAll('heading');
    const contents = formData.getAll('content');
    const types = formData.getAll('type'); // Assuming we add a hidden input or select for type

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
    setViewingItem({ title: '', category: '', metricId: '', blocks: [{ type: 'text', heading: '', content: '' }] });
    setIsEditingLibrary(true);
  };

  const handleQuickLink = (metricId) => {
      // Dispatch a custom event for navigation since we don't have direct access to setTab here yet
      // This is a temporary loose coupling strategy until App.jsx is updated to pass onNavigate
      window.dispatchEvent(new CustomEvent('orbit-navigate', { detail: { tab: 'Logger', metricId } }));

      // Also try calling prop if it exists (future proofing)
      if (onNavigate) onNavigate('Logger', { metricId });
  };

  // --- Data Management Handlers ---
  const handleArchive = () => {
    try {
      // 1. Snapshot current state
      const snapshot = {
        metrics,
        logEntries: exportData().logEntries, // using export helper to get consistent state
        archivedAt: new Date().toISOString()
      };

      // 2. Load existing archive
      const existingArchiveJson = localStorage.getItem('orbit_archive');
      let archive = [];
      if (existingArchiveJson) {
        archive = JSON.parse(existingArchiveJson);
      }

      // 3. Append and Save
      archive.push(snapshot);
      localStorage.setItem('orbit_archive', JSON.stringify(archive));

      alert(`Archive saved. Total snapshots: ${archive.length}`);
    } catch (e) {
      console.error("Archive failed", e);
      alert("Failed to save archive (Quota exceeded?)");
    }
  };

  const handleExport = () => {
    const json = exportData();
    // Include Library in export
    json.library = Library.list();
    // Versioning and Metadata
    json.meta = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      platform: "ORBIT_PWA"
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbit-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        importData(data);
        if (data.library) {
            // Simple overwrite/merge strategy for library
            data.library.forEach(item => Library.update(item));
            refreshLibrary();
        }
        alert('Import successful');
      } catch (err) {
        console.error("Invalid JSON", err);
        alert('Failed to parse JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleNukeData = () => {
    if (window.confirm("⚠️ WARNING: This will delete ALL metrics, logs, and library items. This action cannot be undone.")) {
      if (window.confirm("Are you absolutely sure? Type 'YES' in your mind and click OK.")) {
        clearAllData();
        Library.clear();
        refreshLibrary(); // Will re-generate default manifest
        alert("System reset complete.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-32 fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col gap-1 mt-2">
         <h1 className="text-3xl font-extrabold tracking-tight">System</h1>
         <p className="text-secondary font-medium">Configuration & Library.</p>
      </div>

      {/* --- LIBRARY SECTION --- */}
      <Glass>
        <div className="flex justify-between items-center mb-1">
          <div className="text-lg font-bold">Library</div>
          <button onClick={openNewLibraryItem} whileTap={{ scale: 0.95 }} className="text-xs font-bold bg-blue text-white px-3 py-2 rounded-lg">
            + New Item
          </button>
        </div>
        <div className="text-xs text-secondary mb-4">Qualitative Protocols & Principles</div>

        <div className="flex flex-col gap-2">
          {libraryItems.length === 0 && <div className="text-secondary text-sm italic">Library is empty.</div>}
          {libraryItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => { setViewingItem(item); setIsEditingLibrary(false); }}
              className="p-3 rounded-lg border border-separator bg-bg-color flex justify-between items-center cursor-pointer hover:bg-opacity-50 transition-colors"
            >
              <div>
                <div className="font-bold">{item.title}</div>
                <div className="text-xs text-secondary">{item.category}</div>
              </div>
              <div className="text-secondary opacity-50">→</div>
            </div>
          ))}
        </div>
      </Glass>

      {/* --- METRICS SECTION --- */}
      <Glass>
        <div className="flex justify-between items-center mb-1">
          <div className="text-lg font-bold">Metrics</div>
          <button onClick={handleAddMetric} whileTap={{ scale: 0.95 }} className="text-xs font-bold bg-blue text-white px-3 py-2 rounded-lg">
            + Add Metric
          </button>
        </div>
        <div className="text-xs text-secondary mb-4">Quantitative Data Points</div>

        <div className="flex flex-col gap-2">
          {metrics.map(m => (
            <div key={m.id} className="flex justify-between items-center p-3 rounded-lg border border-separator bg-bg-color">
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full" style={{ background: m.color }}></div>
                 <span className="font-medium">{m.name}</span>
              </div>
              <div className="flex gap-3 text-sm font-bold">
                <button onClick={() => handleEditMetric(m)} className="text-blue">Edit</button>
                <button onClick={() => deleteMetric(m.id)} className="text-red">Delete</button>
              </div>
            </div>
          ))}
          {metrics.length === 0 && (
             <div className="text-center text-secondary py-4 italic text-sm">No metrics configured.</div>
          )}
        </div>
      </Glass>

      {/* --- DATA MANAGEMENT --- */}
      <Glass>
        <div className="flex flex-col gap-3">
          <div className="text-lg font-bold">Data Management</div>
          
          {/* Import/Export/Archive */}
          <div className="flex flex-col gap-2">
             <div className="flex gap-2">
                <button onClick={handleArchive} whileTap={{ scale: 0.95 }} className="flex-1 py-3 rounded-xl bg-purple text-white font-bold transition-transform">Save to Archive</button>
             </div>
             <div className="flex gap-2">
                <button onClick={handleExport} whileTap={{ scale: 0.95 }} className="flex-1 py-3 rounded-xl bg-blue text-white font-bold transition-transform">Export JSON</button>
                <label className="flex-1 py-3 rounded-xl border border-separator text-center font-bold cursor-pointer hover:bg-bg-color transition-colors active:scale-95">
                Import JSON
                <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
                </label>
             </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-4 pt-4 border-t border-separator">
            <button 
              onClick={handleNukeData} 
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 rounded-xl border border-red text-red font-bold hover:bg-red hover:bg-opacity-10 transition-colors"
            >
              Clear All Data (Reset)
            </button>
          </div>
        </div>
      </Glass>

      {/* --- MODALS / EDITORS --- */}

      {/* Metric Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <MetricBuilder
            metric={editingMetric}
            onSave={handleSaveMetric}
            onCancel={() => setShowBuilder(false)}
          />
        </div>
      )}

      {/* Library Viewer/Editor Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-slide-up">
            
            {/* Header */}
            <div className="p-4 border-b border-separator flex justify-between items-center bg-bg-color">
              <button onClick={() => setViewingItem(null)} className="text-blue font-bold">Close</button>
              <div className="font-bold">{isEditingLibrary ? (viewingItem.id ? 'Edit Item' : 'New Item') : 'Library'}</div>
              {!isEditingLibrary ? (
                <button onClick={() => setIsEditingLibrary(true)} className="text-blue font-bold">Edit</button>
              ) : (
                <button form="libraryForm" type="submit" className="text-green font-bold">Save</button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isEditingLibrary ? (
                <form id="libraryForm" onSubmit={handleSaveLibraryItem} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase">Title</label>
                    <input name="title" defaultValue={viewingItem.title} required className="w-full p-3 rounded-lg bg-bg-color border border-separator font-bold text-lg outline-none" placeholder="Protocol Name" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase">Category</label>
                    <input name="category" defaultValue={viewingItem.category} className="w-full p-3 rounded-lg bg-bg-color border border-separator outline-none" placeholder="e.g. Psychology, Recovery" />
                  </div>
                  
                  {/* Metric Link */}
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase">Linked Metric</label>
                    <div className="relative">
                        <select name="metricId" defaultValue={viewingItem.metricId || ''} className="w-full p-3 rounded-lg bg-bg-color border border-separator outline-none appearance-none">
                            <option value="">None</option>
                            {metrics.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-secondary">▼</div>
                    </div>
                  </div>

                  <div className="border-t border-separator my-2"></div>
                  
                  {/* Dynamic Blocks Editor */}
                  <div id="blocks-container" className="flex flex-col gap-4">
                    {viewingItem.blocks && viewingItem.blocks.map((blk, idx) => (
                      <div key={idx} className="flex flex-col gap-1 p-2 border border-separator rounded-lg bg-bg-color">
                        <div className="flex justify-between mb-1">
                             <input name="heading" defaultValue={blk.heading} className="font-bold text-sm bg-transparent outline-none text-blue placeholder-blue/50 flex-1" placeholder="HEADING" />
                             <select name="type" defaultValue={blk.type || 'text'} className="text-xs bg-transparent text-secondary outline-none text-right">
                                 <option value="text">Text</option>
                                 <option value="code">Code</option>
                                 <option value="list">List</option>
                             </select>
                        </div>
                        <textarea name="content" defaultValue={blk.content} className="w-full bg-transparent outline-none min-h-[60px]" placeholder="Content..." />
                      </div>
                    ))}
                    {/* Always show one empty slot at bottom for new blocks */}
                    <div className="flex flex-col gap-1 p-2 border border-separator border-dashed rounded-lg">
                       <div className="flex justify-between mb-1">
                           <input name="heading" className="font-bold text-sm bg-transparent outline-none text-blue placeholder-blue/50 flex-1" placeholder="+ ADD HEADING" />
                           <select name="type" className="text-xs bg-transparent text-secondary outline-none text-right">
                               <option value="text">Text</option>
                               <option value="code">Code</option>
                               <option value="list">List</option>
                           </select>
                       </div>
                       <textarea name="content" className="w-full bg-transparent outline-none min-h-[60px]" placeholder="Content..." />
                    </div>
                  </div>

                  {viewingItem.id && (
                     <button type="button" onClick={() => handleDeleteLibraryItem(viewingItem.id)} className="mt-8 py-3 text-red font-bold bg-red bg-opacity-10 rounded-lg">Delete Item</button>
                  )}
                </form>
              ) : (
                // READ MODE
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-3xl font-extrabold">{viewingItem.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block px-2 py-1 rounded bg-blue bg-opacity-10 text-blue text-xs font-bold uppercase">{viewingItem.category}</span>
                        {viewingItem.metricId && (
                            <button
                                onClick={() => handleQuickLink(viewingItem.metricId)}
                                whileTap={{ scale: 0.95 }}
                                className="px-2 py-1 rounded bg-green text-white text-xs font-bold uppercase hover:bg-opacity-90 transition-opacity"
                            >
                                Quick Link ⚡
                            </button>
                        )}
                    </div>
                  </div>
                  
                  {viewingItem.blocks && viewingItem.blocks.map((blk, idx) => (
                    <div key={idx}>
                      <div className="text-xs font-bold text-secondary uppercase mb-1 tracking-wide">{blk.heading}</div>
                      {blk.type === 'code' ? (
                          <pre className="bg-black bg-opacity-5 p-3 rounded-lg overflow-x-auto text-sm font-mono">{blk.content}</pre>
                      ) : blk.type === 'list' ? (
                          <ul className="list-disc pl-5 space-y-1">
                              {blk.content.split('\n').map((line, i) => <li key={i}>{line.replace(/^-\s*/, '')}</li>)}
                          </ul>
                      ) : (
                          <div className="text-primary leading-relaxed whitespace-pre-wrap">{blk.content}</div>
                      )}
                      <div className="border-b border-separator opacity-20 mt-4"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
