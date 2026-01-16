// src/lib/library.js

// Example schema for a standard reference item
export const createLibraryItem = ({ id, title, description = '', category = '', blocks = [], metricId = null, metadata = {} }) => ({
  id,
  title,
  description,
  category,
  blocks, // Replaced sections with blocks
  metricId, // Optional link to a metric
  metadata
});

// Library store (localStorage-backed)
const STORAGE_KEY = 'orbit_library'; // Renamed key

const getAll = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  // Fallback to old key if new one is empty for migration
  if (!raw) {
    const oldRaw = localStorage.getItem('orbit_standards');
    if (oldRaw) {
      const parsed = JSON.parse(oldRaw);
      // Migrate structure
      const migrated = parsed.map(item => ({
        ...item,
        blocks: item.sections ? item.sections.map(s => ({ ...s, type: 'text' })) : [],
        sections: undefined
      }));
      saveAll(migrated);
      localStorage.removeItem('orbit_standards');
      return migrated;
    }
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveAll = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

// CRUD operations
export const Library = {
  list: () => getAll(),
  add: (item) => {
    const items = getAll();
    items.push(createLibraryItem(item));
    saveAll(items);
  },
  update: (item) => {
    const items = getAll();
    const idx = items.findIndex(s => s.id === item.id);
    if (idx !== -1) {
      items[idx] = createLibraryItem(item);
      saveAll(items);
    }
  },
  remove: (id) => {
    const items = getAll().filter(s => s.id !== id);
    saveAll(items);
  },
  findByCategory: (category) => {
    return getAll().filter(s => s.category === category);
  },
  clear: () => {
    saveAll([]);
  }
};
