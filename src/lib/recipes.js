// src/lib/recipes.js
import { MetricType, WidgetType, MetricConfig } from '../context/StorageContext';

/**
 * recipes.js
 * Predefined metric & widget recipes for ORBIT
 * These are optional templates to bootstrap new metrics
 */
export const Recipes = {
  // ----------------------
  // Sample Metric Recipes
  // ----------------------
  defaultMetrics: [
    new MetricConfig({
      id: 'habit_morning_routine',
      label: 'Morning Routine',
      type: MetricType.BOOLEAN,
      goal: 1,
      color: '#4f46e5',
      widgetType: WidgetType.RING,
    }),
    new MetricConfig({
      id: 'exercise_minutes',
      label: 'Exercise Minutes',
      type: MetricType.NUMBER,
      goal: 60,
      color: '#10b981',
      widgetType: WidgetType.SPARKLINE,
    }),
    new MetricConfig({
      id: 'hydration',
      label: 'Water Intake',
      type: MetricType.NUMBER,
      goal: 2000, // ml
      color: '#3b82f6',
      widgetType: WidgetType.BAR,
    }),
  ],

  // ----------------------
  // Layout Recipes (optional)
  // ----------------------
  defaultWidgetLayout: {
    Horizon: ['habit_morning_routine', 'exercise_minutes', 'hydration'],
  },

  // ----------------------
  // Insight/Analysis Recipes (optional)
  // ----------------------
  insightTemplates: [
    {
      id: 'streak_bonus',
      description: 'Notifies user when streak > 7 days',
      condition: ({ streak }) => streak >= 7,
      message: (metric) => `🔥 Awesome! Your ${metric.label} streak is over a week!`,
    },
    {
      id: 'goal_progress',
      description: 'Reports when goal completion exceeds 80%',
      condition: ({ completion }) => completion >= 80,
      message: (metric, completion) => `✅ You are ${completion.toFixed(1)}% toward ${metric.label} goal.`,
    },
  ],
};
