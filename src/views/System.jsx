import React, { useContext, useState, useEffect, useMemo } from 'react';
import { StorageContext } from '../context/StorageContext';
import { Glass } from '../components/ui/Glass';
import { MetricBuilder } from '../components/system/MetricBuilder';
import { DataManagement } from '../components/system/DataManagement';
import { Library } from '../lib/library';
import SegmentedControl from '../components/ui/SegmentedControl';

export const System = ({ onNavigate }) => {
  const { 
    metrics, 
    addMetric, 
    updateMetric, 
    deleteMetric, 
  } = useContext(StorageContext);
  
  const [viewMode, setViewMode] = useState('Library'); // 'Library' | 'Settings'

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
      // Create Default "Welcome" Item if empty
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
    // Map metrics to list format
    const metricItems = metrics.map(m => ({
      ...m,
      isMetric: true,
      category: 'Metric',
      title: m.name, // Uniform title
      icon: getTypeIcon(m.type)
    }));

    // Map protocols to list format
    const protocolItems = libraryItems.map(p => ({
      ...p,
      isMetric: false,
      category: p.category || 'Protocol',
      icon: 'Aa'
    }));

    // Combine and sort (Metrics first, then protocols, or alphabetical?)
    // Prompt says "Unified List". I'll put Metrics first as they are "Active".
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
  // (Reusing existing logic for Protocol editing)
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
    setViewingItem({ title: '', category: '', metricId: '', blocks: [{ type: 'text', heading: '', content: '' }] });
    setIsEditingLibrary(true);
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-32 fade-in">
      
      {/* Header & Toggle */}
      <div className="flex justify-between items-end mt-2">
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
                className="w-full p-4 rounded-2xl bg-blue text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue/20 active:scale-97 transition-transform"
            >
                <span className="text-xl">+</span> Add New Metric
            </button>

            <div className="flex flex-col gap-2">
                {unifiedList.map(item => (
                    <div
                        key={item.id}
                        onClick={() => item.isMetric ? handleEditMetric(item) : setViewingItem(item)}
                        className="p-3 rounded-xl border border-separator bg-card flex justify-between items-center cursor-pointer active:scale-[0.99] transition-transform"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${item.isMetric ? 'bg-bg-color text-blue' : 'bg-orange bg-opacity-10 text-orange'}`}>
                                {item.icon}
                            </div>
                            <div>
                                <div className="font-bold text-primary">{item.title}</div>
                                <div className="text-xs text-secondary flex items-center gap-1">
                                    {item.category}
                                    {!item.isMetric && <span className="text-[10px] bg-separator bg-opacity-30 px-1 rounded">Protocol</span>}
                                </div>
                            </div>
                        </div>
                        <div className="text-secondary opacity-30">→</div>
                    </div>
                ))}
            </div>

            {/* Secondary Action for Protocols */}
            <button onClick={openNewLibraryItem} className="text-center text-blue font-bold text-sm mt-4">
                + Create Protocol Item
            </button>
        </div>
      )}

      {/* --- SETTINGS VIEW --- */}
      {viewMode === 'Settings' && (
        <div className="flex flex-col gap-6 animate-fade-in">
            <DataManagement />

            <Glass>
                <div className="font-bold text-lg mb-4">App Preferences</div>
                <div className="flex flex-col gap-0 divider-y">
                    <div className="flex justify-between items-center p-3 border-b border-separator border-opacity-50">
                        <span className="font-medium">Notifications</span>
                        <div className="w-10 h-6 bg-separator bg-opacity-30 rounded-full relative">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border-b border-separator border-opacity-50">
                        <span className="font-medium">Haptics</span>
                        <div className="w-10 h-6 bg-green rounded-full relative">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-3">
                        <span className="font-medium">iCloud Sync</span>
                         <span className="text-xs text-secondary">Coming Soon</span>
                    </div>
                </div>
            </Glass>

            <div className="text-center text-xs text-secondary mt-8">
                ORBIT v1.1.0 • Liquid Native
            </div>
        </div>
      )}

      {/* --- MODALS --- */}

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

      {/* Library Viewer/Editor Modal (Legacy) */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          {/* ... keeping the library modal logic inline or ideally refactoring it to a component ... */}
          {/* For brevity, I will inject the existing Library Modal JSX here */}
          <LibraryModal
             viewingItem={viewingItem}
             setViewingItem={setViewingItem}
             isEditingLibrary={isEditingLibrary}
             setIsEditingLibrary={setIsEditingLibrary}
             handleSaveLibraryItem={handleSaveLibraryItem}
             handleDeleteLibraryItem={handleDeleteLibraryItem}
             handleQuickLink={(metricId) => {
                 if (onNavigate) onNavigate('Logger', { metricId });
                 else window.dispatchEvent(new CustomEvent('orbit-navigate', { detail: { tab: 'Logger', metricId } }));
             }}
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

// Extracted Library Modal to keep file clean(er)
const LibraryModal = ({ viewingItem, setViewingItem, isEditingLibrary, setIsEditingLibrary, handleSaveLibraryItem, handleDeleteLibraryItem, handleQuickLink, metrics }) => {
    return (
        <div className="bg-card w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-slide-up">
            <div className="p-4 border-b border-separator flex justify-between items-center bg-bg-color">
              <button onClick={() => setViewingItem(null)} className="text-blue font-bold">Close</button>
              <div className="font-bold">{isEditingLibrary ? (viewingItem.id ? 'Edit Item' : 'New Item') : 'Library'}</div>
              {!isEditingLibrary ? (
                <button onClick={() => setIsEditingLibrary(true)} className="text-blue font-bold">Edit</button>
              ) : (
                <button form="libraryForm" type="submit" className="text-green font-bold">Save</button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isEditingLibrary ? (
                <form id="libraryForm" onSubmit={handleSaveLibraryItem} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase">Title</label>
                    <input name="title" defaultValue={viewingItem.title} required className="w-full p-3 rounded-lg bg-bg-color border border-separator font-bold text-lg outline-none" placeholder="Protocol Name" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase">Category</label>
                    <input name="category" defaultValue={viewingItem.category} className="w-full p-3 rounded-lg bg-bg-color border border-separator outline-none" placeholder="e.g. Psychology" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-secondary uppercase">Linked Metric</label>
                    <div className="relative">
                        <select name="metricId" defaultValue={viewingItem.metricId || ''} className="w-full p-3 rounded-lg bg-bg-color border border-separator outline-none appearance-none">
                            <option value="">None</option>
                            {metrics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                  </div>
                  <div className="border-t border-separator my-2"></div>
                  {/* Blocks Editor Simplified */}
                  <div className="text-center text-sm text-secondary italic">Block editor available in detailed view (simplified here)</div>
                  {viewingItem.blocks && viewingItem.blocks.map((blk, idx) => (
                      <div key={idx} className="flex flex-col gap-1 p-2 border border-separator rounded-lg">
                          <input type="hidden" name="type" value={blk.type} />
                          <input name="heading" defaultValue={blk.heading} className="font-bold text-sm bg-transparent outline-none" placeholder="HEADING" />
                          <textarea name="content" defaultValue={blk.content} className="w-full bg-transparent outline-none" placeholder="Content..." />
                      </div>
                  ))}
                  <div className="flex flex-col gap-1 p-2 border border-separator border-dashed rounded-lg">
                       <input type="hidden" name="type" value="text" />
                       <input name="heading" className="font-bold text-sm bg-transparent outline-none placeholder-blue/50" placeholder="+ NEW BLOCK HEADING" />
                       <textarea name="content" className="w-full bg-transparent outline-none" placeholder="Content..." />
                  </div>
                  {viewingItem.id && (
                     <button type="button" onClick={() => handleDeleteLibraryItem(viewingItem.id)} className="mt-8 py-3 text-red font-bold bg-red bg-opacity-10 rounded-lg">Delete Item</button>
                  )}
                </form>
              ) : (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-3xl font-extrabold">{viewingItem.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block px-2 py-1 rounded bg-blue bg-opacity-10 text-blue text-xs font-bold uppercase">{viewingItem.category}</span>
                    </div>
                  </div>
                  {viewingItem.blocks && viewingItem.blocks.map((blk, idx) => (
                    <div key={idx}>
                      <div className="text-xs font-bold text-secondary uppercase mb-1 tracking-wide">{blk.heading}</div>
                      <div className="text-primary leading-relaxed whitespace-pre-wrap">{blk.content}</div>
                      <div className="border-b border-separator opacity-20 mt-4"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
    );
};
