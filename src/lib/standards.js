// src/lib/standards.js

// Example schema for a standard reference item
export const createStandard = ({ id, title, description = '', category = '', sections = [], metadata = {} }) => ({
  id,
  title,
  description,
  category,
  sections,
  metadata
});

// Standards store (localStorage-backed)
const STORAGE_KEY = 'orbit_standards';

const getAll = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveAll = (standards) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(standards));
};

// CRUD operations
export const Standards = {
  list: () => getAll(),
  add: (item) => {
    const standards = getAll();
    standards.push(createStandard(item));
    saveAll(standards);
  },
  update: (item) => {
    const standards = getAll();
    const idx = standards.findIndex(s => s.id === item.id);
    if (idx !== -1) {
      standards[idx] = createStandard(item);
      saveAll(standards);
    }
  },
  remove: (id) => {
    const standards = getAll().filter(s => s.id !== id);
    saveAll(standards);
  },
  findByCategory: (category) => {
    return getAll().filter(s => s.category === category);
  },
  clear: () => {
    saveAll([]);
  }
};
