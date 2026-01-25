/**
 * ORBIT Schema Definitions
 * 
 * This file is the SINGLE SOURCE OF TRUTH for all data structures in ORBIT.
 * 
 * CRITICAL RULES:
 * 1. Never modify these schemas without updating docs/naming-conventions.md
 * 2. All new properties must have JSDoc comments
 * 3. Use Object.freeze() to prevent accidental mutations
 * 4. Export factory functions, not just classes (for validation)
 * 
 * @version 1.1.0
 * @last-updated 2026-01-20
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Valid metric types
 * @readonly
 * @enum {string}
 */
export const MetricType = Object.freeze({
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  DURATION: 'duration',
  RANGE: 'range',
  SELECT: 'select',
  TEXT: 'text'
});

/**
 * Valid widget types for rendering metrics
 * @readonly
 * @enum {string}
 */
export const WidgetType = Object.freeze({
  RING: 'ring',
  SPARKLINE: 'sparkline',
  HEATMAP: 'heatmap',
  STACKEDBAR: 'stackedbar',
  STREAK: 'streak',
  NUMBER: 'number',
  HISTORY: 'history',
  COMPOUND: 'compound', // Matches Seeder
  PROGRESS: 'progress'  // Matches Seeder
});

/**
 * Valid time segments for analytics
 * @readonly
 * @enum {string}
 */
export const Segment = Object.freeze({
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly'
});

/**
 * Value normalization scales
 * Used to document which scale a function expects/returns
 * @readonly
 * @enum {string}
 */
export const Scale = Object.freeze({
  RAW: 'raw',           // As stored in LogEntry.value
  NORMALIZED: '0-1',    // Normalized to 0-1 for internal calculations
  PERCENTAGE: '0-100'   // Percentage for display (0-100)
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates that a value is a non-empty string
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of field for error message
 * @throws {Error} If validation fails
 */
const validateRequiredString = (value, fieldName) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
};

/**
 * Validates that a value is a valid UUID
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of field for error message
 * @throws {Error} If validation fails
 */
const validateUUID = (value, fieldName) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof value !== 'string' || !uuidRegex.test(value)) {
    throw new Error(`${fieldName} must be a valid UUID`);
  }
};

/**
 * Validates that a value is one of the allowed enum values
 * @param {any} value - Value to validate
 * @param {object} enumObj - Enum object to check against
 * @param {string} fieldName - Name of field for error message
 * @throws {Error} If validation fails
 */
const validateEnum = (value, enumObj, fieldName) => {
  const validValues = Object.values(enumObj);
  if (!validValues.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${validValues.join(', ')}`);
  }
};

/**
 * Validates that a value is a valid ISO 8601 date string
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of field for error message
 * @throws {Error} If validation fails
 */
const validateISODate = (value, fieldName) => {
  if (typeof value !== 'string' || isNaN(Date.parse(value))) {
    throw new Error(`${fieldName} must be a valid ISO date string`);
  }
};

/**
 * Validates that a value is a valid hex color
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of field for error message
 * @throws {Error} If validation fails
 */
const validateHexColor = (value, fieldName) => {
  const hexRegex = /^#[0-9A-F]{6}$/i;
  if (typeof value !== 'string' || !hexRegex.test(value)) {
    throw new Error(`${fieldName} must be a valid hex color (e.g., #007AFF)`);
  }
};

// ============================================================================
// CORE SCHEMAS
// ============================================================================

/**
 * MetricConfig Schema
 * 
 * Represents a user-defined metric configuration.
 * This is what gets stored in StorageContext.metrics array.
 * 
 * @class
 */
export class MetricConfig {
  /**
   * Creates a MetricConfig instance
   * @param {Object} data - Metric configuration data
   * @param {string} data.id - Unique identifier (UUID)
   * @param {string} data.name - Internal machine-readable key
   * @param {string} data.label - Human-readable display name
   * @param {string} data.type - Metric type (from MetricType enum)
   * @param {number|null} data.goal - Target value for this metric
   * @param {string} data.color - Hex color code (e.g., '#007AFF')
   * @param {string} data.widgetType - Widget rendering type (from WidgetType enum)
   * @param {boolean} [data.dashboardVisible=true] - Show on Horizon dashboard
   * @param {string} [data.unit=''] - Display unit (e.g., 'hrs', 'reps')
   * @param {number} [data.displayOrder=0] - Sort order in UI
   * @param {string} [data.created] - ISO timestamp of creation
   * @param {Object|null} [data.range] - Range config for RANGE type {min, max, step}
   * @param {string[]} [data.options] - Options for SELECT type
   */
  constructor({
    id,
    name,
    label,
    type,
    goal,
    color,
    widgetType,
    dashboardVisible = true,
    unit = '',
    displayOrder = 0,
    created = new Date().toISOString(),
    range = null,
    options = [],
    config = {}
  }) {
    // Validate required fields
    validateUUID(id, 'id');
    validateRequiredString(name, 'name');
    validateRequiredString(label, 'label');
    validateEnum(type, MetricType, 'type');
    validateHexColor(color, 'color');
    validateEnum(widgetType, WidgetType, 'widgetType');
    
    // Validate goal based on type
    if (type === MetricType.NUMBER || type === MetricType.DURATION) {
      if (typeof goal !== 'number' && goal !== null) {
        throw new Error('goal must be a number or null for NUMBER/DURATION metrics');
      }
    }

    // Validate range
    if (type === MetricType.RANGE) {
        if (!range || typeof range !== 'object') {
            // Provide default if missing
            range = { min: 1, max: 10, step: 1 };
        }
        if (typeof range.min !== 'number' || typeof range.max !== 'number') {
            throw new Error('Range metrics must have min and max values');
        }
    }

    // Validate options
    if (type === MetricType.SELECT) {
        if (!Array.isArray(options)) {
            options = [];
        }
    }
    
    this.id = id;
    this.name = name;
    this.label = label;
    this.type = type;
    this.goal = goal;
    this.color = color;
    this.widgetType = widgetType;
    this.dashboardVisible = Boolean(dashboardVisible);
    this.unit = unit;
    this.displayOrder = Number(displayOrder);
    this.created = created;
    this.range = range;
    this.options = options;
    this.config = config || {};
    
    // Freeze to prevent accidental mutation
    Object.freeze(this);
  }
  
  /**
   * Creates a new MetricConfig with updated properties
   * (Since the object is frozen, we need a method to create modified copies)
   * @param {Object} updates - Properties to update
   * @returns {MetricConfig} New MetricConfig instance
   */
  update(updates) {
    return new MetricConfig({
      ...this,
      ...updates
    });
  }
  
  /**
   * Converts to plain object (for JSON serialization)
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      label: this.label,
      type: this.type,
      goal: this.goal,
      color: this.color,
      widgetType: this.widgetType,
      dashboardVisible: this.dashboardVisible,
      unit: this.unit,
      displayOrder: this.displayOrder,
      created: this.created,
      range: this.range,
      options: this.options,
      config: this.config
    };
  }
  
  /**
   * Creates MetricConfig from plain object (for JSON deserialization)
   * @param {Object} obj - Plain object
   * @returns {MetricConfig} MetricConfig instance
   */
  static fromJSON(obj) {
    return new MetricConfig(obj);
  }
}

/**
 * LogEntry Schema
 * 
 * Represents a single data point logged by the user.
 * This is what gets stored in StorageContext.logEntries array.
 * 
 * @class
 */
export class LogEntry {
  /**
   * Creates a LogEntry instance
   * @param {Object} data - Log entry data
   * @param {string} data.id - Unique identifier (UUID)
   * @param {string} data.metricId - Foreign key to metric (UUID)
   * @param {any} data.value - The logged value (type depends on metric.type)
   * @param {string} [data.timestamp] - ISO timestamp (defaults to now)
   */
  constructor({
    id,
    metricId,
    value,
    timestamp = new Date().toISOString()
  }) {
    // Validate required fields
    validateUUID(id, 'id');
    validateUUID(metricId, 'metricId');
    validateISODate(timestamp, 'timestamp');
    
    // Value can be any type - validation happens at runtime based on metric.type
    if (value === undefined || value === null) {
      throw new Error('value is required and cannot be null/undefined');
    }
    
    this.id = id;
    this.metricId = metricId;  // ⚠️ CRITICAL: This is metricId, not metricKey
    this.value = value;
    this.timestamp = timestamp;
    
    Object.freeze(this);
  }
  
  /**
   * Converts to plain object (for JSON serialization)
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      metricId: this.metricId,
      value: this.value,
      timestamp: this.timestamp
    };
  }
  
  /**
   * Creates LogEntry from plain object (for JSON deserialization)
   * @param {Object} obj - Plain object
   * @returns {LogEntry} LogEntry instance
   */
  static fromJSON(obj) {
    return new LogEntry(obj);
  }
  
  /**
   * Gets the date portion of timestamp (YYYY-MM-DD)
   * @returns {string} Date string
   */
  getDate() {
    return this.timestamp.split('T')[0];
  }
  
  /**
   * Checks if this log entry is from a specific date
   * @param {string|Date} date - Date to check against
   * @returns {boolean} True if log is from this date
   */
  isFromDate(date) {
    const targetDate = date instanceof Date 
      ? date.toISOString().split('T')[0]
      : new Date(date).toISOString().split('T')[0];
    return this.getDate() === targetDate;
  }
}

/**
 * TimeLog Schema
 * 
 * Represents a time-tracked activity session.
 * Used by the Time Tracker feature in the Logger tab.
 * 
 * @class
 */
export class TimeLog {
  /**
   * Creates a TimeLog instance
   * @param {Object} data - Time log data
   * @param {string} data.id - Unique identifier (UUID)
   * @param {string} data.activityId - Foreign key to metric (UUID)
   * @param {string} data.activityLabel - Display name of activity
   * @param {string} data.startTime - Session start timestamp (ISO)
   * @param {string} data.endTime - Session end timestamp (ISO)
   * @param {number} data.duration - Duration in hours (decimal)
   * @param {string} [data.notes=''] - User notes
   */
  constructor({
    id,
    activityId,
    activityLabel,
    startTime,
    endTime,
    duration,
    notes = ''
  }) {
    // Validate required fields
    validateUUID(id, 'id');
    validateUUID(activityId, 'activityId');
    validateRequiredString(activityLabel, 'activityLabel');
    validateISODate(startTime, 'startTime');
    validateISODate(endTime, 'endTime');
    
    if (typeof duration !== 'number' || duration < 0) {
      throw new Error('duration must be a positive number');
    }
    
    // Validate that endTime is after startTime
    if (new Date(endTime) <= new Date(startTime)) {
      throw new Error('endTime must be after startTime');
    }
    
    this.id = id;
    this.activityId = activityId;
    this.activityLabel = activityLabel;
    this.startTime = startTime;
    this.endTime = endTime;
    this.duration = duration;
    this.notes = notes;
    
    Object.freeze(this);
  }
  
  /**
   * Converts to plain object (for JSON serialization)
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      activityId: this.activityId,
      activityLabel: this.activityLabel,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      notes: this.notes
    };
  }
  
  /**
   * Creates TimeLog from plain object (for JSON deserialization)
   * @param {Object} obj - Plain object
   * @returns {TimeLog} TimeLog instance
   */
  static fromJSON(obj) {
    return new TimeLog(obj);
  }
  
  /**
   * Calculates duration from start and end times
   * @param {string} startTime - ISO timestamp
   * @param {string} endTime - ISO timestamp
   * @returns {number} Duration in hours (decimal)
   */
  static calculateDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    return durationMs / (1000 * 60 * 60); // Convert to hours
  }
}

// ============================================================================
// WIDGET DATA SCHEMAS
// ============================================================================

/**
 * Base widget data interface
 * All widget-specific data shapes should extend/follow this pattern
 * 
 * @typedef {Object} WidgetData
 * @property {string} type - Widget type (from WidgetType enum)
 * @property {string} metricId - Associated metric ID
 * @property {string} title - Display title
 */

/**
 * RingChart widget data shape
 * Used by ReliabilityRing and similar circular progress widgets
 * 
 * @typedef {Object} RingChartData
 * @property {number} value - Progress value (0-100 percentage)
 * @property {string} label - Display label (e.g., "85%" or "8/10")
 * @property {string} color - Hex color code
 * @property {number} [size] - Chart size in pixels (optional)
 * @property {number} [strokeWidth] - Stroke width (optional)
 */

/**
 * Sparkline widget data shape
 * Used by TrendSparkline widget
 * 
 * @typedef {Object} SparklineData
 * @property {number[]} data - Array of values to plot
 * @property {string} lineColor - Line color (hex)
 * @property {string} [fillColor] - Fill color (hex, optional)
 * @property {string[]} [labels] - X-axis labels (optional)
 * @property {boolean} [showDots=true] - Show dots at data points
 * @property {string} [label] - Chart label
 * @property {string} [trendLabel] - Trend indicator (e.g., "+5%")
 */

/**
 * HeatMap widget data shape
 * Used by ConsistencyHeatmap widget
 * 
 * @typedef {Object} HeatMapData
 * @property {Object.<string, number>} values - Map of date to value (0-1 normalized)
 * @property {string} startDate - Start date (ISO string or YYYY-MM-DD)
 * @property {string} endDate - End date (ISO string or YYYY-MM-DD)
 * @property {Function} [colorScale] - Custom color scale function
 */

/**
 * StackedBar widget data shape
 * Used by SegmentedBarWidget
 * 
 * @typedef {Object} StackedBarData
 * @property {Array.<{label: string, values: Object.<string, number>}>} entries - Bar data
 * @property {Object.<string, string>} colors - Category to hex color mapping
 * @property {number} [maxValue] - Optional max Y value for scaling
 * @property {number} [height=220] - Chart height in pixels
 * @property {string} [title] - Chart title
 */

/**
 * Streak widget data shape
 * Used by CurrentStreak widget
 * 
 * @typedef {Object} StreakData
 * @property {number} current - Current streak length
 * @property {number} best - Best streak length
 * @property {boolean} isActive - Whether streak is currently active
 * @property {string} [unit='Days'] - Unit label (e.g., 'Days', 'Weeks')
 */

/**
 * Number widget data shape
 * Used by NumberWidget for simple numeric displays
 * 
 * @typedef {Object} NumberData
 * @property {number} value - The value to display
 * @property {string} label - Display label
 * @property {string} [unit] - Unit string (e.g., 'hrs', 'reps')
 * @property {number} [trend] - Trend percentage (e.g., 15 for +15%)
 * @property {string} [trendDirection] - 'up' | 'down' | 'neutral'
 */

/**
 * History widget data shape
 * Used by RecentHistory widget
 * 
 * @typedef {Object} HistoryData
 * @property {Array.<{id: string, value: any, timestamp: string}>} entries - Recent entries
 * @property {string} [unit] - Display unit
 */

// ============================================================================
// FACTORY FUNCTIONS (Recommended for creating instances)
// ============================================================================

/**
 * Creates a new MetricConfig with validation
 * @param {Object} data - Metric configuration data
 * @returns {MetricConfig} Validated MetricConfig instance
 */
export const createMetric = (data) => {
  // Provide defaults for optional fields
  const defaults = {
    dashboardVisible: true,
    unit: '',
    displayOrder: 0,
    created: new Date().toISOString(),
    range: null,
    options: []
  };

  // Ensure ID is generated if missing or undefined (even if explicitly passed as undefined)
  const id = data.id || crypto.randomUUID();
  
  return new MetricConfig({ ...defaults, ...data, id });
};

/**
 * Creates a new LogEntry with validation
 * @param {Object} data - Log entry data
 * @returns {LogEntry} Validated LogEntry instance
 */
export const createLog = (data) => {
  const defaults = {
    timestamp: new Date().toISOString()
  };

  const id = data.id || crypto.randomUUID();
  
  return new LogEntry({ ...defaults, ...data, id });
};

/**
 * Creates a new TimeLog with validation
 * @param {Object} data - Time log data
 * @returns {TimeLog} Validated TimeLog instance
 */
export const createTimeLog = (data) => {
  const defaults = {
    notes: ''
  };

  const id = data.id || crypto.randomUUID();
  
  // Auto-calculate duration if not provided
  if (!data.duration && data.startTime && data.endTime) {
    defaults.duration = TimeLog.calculateDuration(data.startTime, data.endTime);
  }
  
  return new TimeLog({ ...defaults, ...data, id });
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validates that a value matches the expected type for a metric
 * @param {MetricConfig} metric - The metric configuration
 * @param {any} value - The value to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export const validateMetricValue = (metric, value) => {
  switch (metric.type) {
    case MetricType.BOOLEAN:
      if (typeof value !== 'boolean') {
        throw new Error(`Value for ${metric.label} must be boolean, got ${typeof value}`);
      }
      break;
      
    case MetricType.NUMBER:
    case MetricType.DURATION:
    case MetricType.RANGE:
      if (typeof value !== 'number') {
        throw new Error(`Value for ${metric.label} must be number, got ${typeof value}`);
      }
      if (isNaN(value)) {
        throw new Error(`Value for ${metric.label} cannot be NaN`);
      }
      break;

    case MetricType.SELECT:
    case MetricType.TEXT:
      if (typeof value !== 'string') {
          throw new Error(`Value for ${metric.label} must be string, got ${typeof value}`);
      }
      break;
      
    default:
      throw new Error(`Unknown metric type: ${metric.type}`);
  }
  
  return true;
};

/**
 * Validates an array of metrics
 * @param {Array} metrics - Array to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export const validateMetrics = (metrics) => {
  if (!Array.isArray(metrics)) {
    throw new Error('metrics must be an array');
  }
  
  const ids = new Set();
  metrics.forEach((metric, index) => {
    if (!(metric instanceof MetricConfig)) {
      throw new Error(`metrics[${index}] is not a MetricConfig instance`);
    }
    
    // Check for duplicate IDs
    if (ids.has(metric.id)) {
      throw new Error(`Duplicate metric ID: ${metric.id}`);
    }
    ids.add(metric.id);
  });
  
  return true;
};

/**
 * Validates an array of log entries
 * @param {Array} logEntries - Array to validate
 * @param {Array} metrics - Array of valid metrics (to check foreign keys)
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export const validateLogEntries = (logEntries, metrics = []) => {
  if (!Array.isArray(logEntries)) {
    throw new Error('logEntries must be an array');
  }
  
  const metricIds = new Set(metrics.map(m => m.id));
  const logIds = new Set();
  
  logEntries.forEach((log, index) => {
    if (!(log instanceof LogEntry)) {
      throw new Error(`logEntries[${index}] is not a LogEntry instance`);
    }
    
    // Check for duplicate IDs
    if (logIds.has(log.id)) {
      throw new Error(`Duplicate log ID: ${log.id}`);
    }
    logIds.add(log.id);
    
    // Check foreign key integrity (if metrics provided)
    if (metrics.length > 0 && !metricIds.has(log.metricId)) {
      throw new Error(`Log ${log.id} references non-existent metric ${log.metricId}`);
    }
  });
  
  return true;
};

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Migrates old data format to new schema
 * Use this when loading data from localStorage that might be in old format
 * 
 * @param {Object} data - Data to migrate
 * @returns {Object} Migrated data
 */
export const migrateData = (data) => {
  const migrated = { ...data };
  
  // Migrate metrics
  if (Array.isArray(migrated.metrics)) {
    migrated.metrics = migrated.metrics.map(m => {
      // Fix metricKey → metricId
      if (m.key && !m.id) {
        m.id = m.key;
        delete m.key;
      }
      
      // Ensure label exists (use name as fallback)
      if (!m.label && m.name) {
        m.label = m.name;
      }
      
      // Ensure name exists (use label as fallback)
      if (!m.name && m.label) {
        m.name = m.label.toLowerCase().replace(/\s+/g, '_');
      }
      
      // Convert to MetricConfig instance
      try {
        return new MetricConfig(m);
      } catch (e) {
        console.warn(`Failed to migrate metric ${m.id}:`, e);
        return null;
      }
    }).filter(Boolean);
  }
  
  // Migrate log entries
  if (Array.isArray(migrated.logEntries)) {
    migrated.logEntries = migrated.logEntries.map(log => {
      // Fix metricKey → metricId
      if (log.metricKey && !log.metricId) {
        log.metricId = log.metricKey;
        delete log.metricKey;
      }
      
      // Convert to LogEntry instance
      try {
        return new LogEntry(log);
      } catch (e) {
        console.warn(`Failed to migrate log ${log.id}:`, e);
        return null;
      }
    }).filter(Boolean);
  }
  
  return migrated;
};

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

/**
 * This file exports:
 * 
 * ENUMS:
 * - MetricType: Valid metric types
 * - WidgetType: Valid widget types
 * - Segment: Valid time segments
 * - Scale: Value normalization scales
 * 
 * CLASSES:
 * - MetricConfig: Metric configuration schema
 * - LogEntry: Log entry schema
 * - TimeLog: Time log schema
 * 
 * FACTORY FUNCTIONS:
 * - createMetric(): Create validated MetricConfig
 * - createLog(): Create validated LogEntry
 * - createTimeLog(): Create validated TimeLog
 * 
 * VALIDATORS:
 * - validateMetricValue(): Validate log value against metric type
 * - validateMetrics(): Validate metrics array
 * - validateLogEntries(): Validate log entries array
 * 
 * UTILITIES:
 * - migrateData(): Migrate old data format to new schema
 */
