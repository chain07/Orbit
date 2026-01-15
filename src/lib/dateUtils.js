// src/lib/dateUtils.js

/**
 * dateUtils
 * Provides helper functions for dates and time calculations
 */
export const dateUtils = {
  /**
   * Format a Date object or ISO string to YYYY-MM-DD
   */
  formatDate: (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Get the difference in days between two dates
   * Returns positive if dateA > dateB
   */
  diffDays: (dateA, dateB) => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    const diffTime = a - b;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Generate an array of dates (YYYY-MM-DD) between two dates, inclusive
   */
  dateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(dateUtils.formatDate(d));
    }
    return dates;
  },

  /**
   * Add or subtract days from a date
   * Returns a new Date object
   */
  addDays: (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  },

  /**
   * Get start of day for a given date
   */
  startOfDay: (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  /**
   * Get end of day for a given date
   */
  endOfDay: (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  },

  /**
   * Returns true if two dates are on the same calendar day
   */
  isSameDay: (dateA, dateB) => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  },

  /**
   * Get ISO string for today
   */
  todayISO: () => {
    return new Date().toISOString();
  },

  /**
   * Get array of last N days (YYYY-MM-DD) including today
   */
  lastNDays: (n) => {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(dateUtils.formatDate(d));
    }
    return dates;
  },
};
