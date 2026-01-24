import { MetricType, WidgetType, MetricConfig } from '../context/StorageContext';

/**
 * recipes.js
 * The "Brain" of the Horizon Agent.
 * Contains heuristic templates to generate insights and "Next Best Actions".
 */
export const Recipes = {
  // ----------------------
  // Default Metrics (Bootstrap)
  // ----------------------
  // NOTE: Emptied defaults to satisfy "No Assumptions" rule.
  // The system must start blank and rely on user creation or onboarding wizards.
  defaultMetrics: [],

  defaultWidgetLayout: {
    Horizon: [],
  },

  // ----------------------
  // Insight Templates (The Agent Logic)
  // ----------------------
  insightTemplates: [
    // --- CATEGORY: NEXT BEST MOVE (Actionable) ---
    {
      id: 'finish_line',
      type: 'recommendation',
      description: 'Nudges user when they are very close to a goal',
      condition: ({ completion, metricType }) => metricType === 'number' && completion >= 85 && completion < 100,
      message: (metric, { value }) => `🏁 So close! You only need ${(metric.goal - value).toFixed(0)} more ${metric.unit || 'units'} to hit your ${metric.label} goal.`,
    },
    {
      id: 'easy_win',
      type: 'recommendation',
      description: 'Suggests a boolean habit that hasnt been done yet',
      condition: ({ completion, metricType }) => metricType === 'boolean' && completion === 0,
      message: (metric) => `⚡️ Quick win: Check off "${metric.label}" to build momentum right now.`,
    },
    {
      id: 'protect_streak',
      type: 'recommendation',
      description: 'Warns if a long streak is about to break',
      condition: ({ streak, completion }) => streak >= 3 && completion < 100,
      message: (metric, { streak }) => `🛡️ Protect the chain! Complete ${metric.label} today to make it ${streak + 1} days in a row.`,
    },
    {
      id: 'weekend_warrior',
      type: 'recommendation',
      description: 'Encourages activity on weekends if usually active then',
      condition: ({ dayOfWeek, completion }) => (dayOfWeek === 0 || dayOfWeek === 6) && completion < 50,
      message: (metric) => `☀️ It's the weekend. Make time for ${metric.label} today.`,
    },

    // --- CATEGORY: STREAKS & MOMENTUM ---
    {
      id: 'streak_hat_trick',
      type: 'celebration',
      condition: ({ streak }) => streak === 3,
      message: (metric) => `🔥 That's 3 days in a row for ${metric.label}. You're heating up!`,
    },
    {
      id: 'streak_week',
      type: 'celebration',
      condition: ({ streak }) => streak === 7,
      message: (metric) => `🏆 One perfect week of ${metric.label}. Keep this consistency!`,
    },
    {
      id: 'streak_milestone_30',
      type: 'celebration',
      condition: ({ streak }) => streak === 30,
      message: (metric) => `🎖️ Month mastered. 30-day streak on ${metric.label}. Incredible discipline.`,
    },
    {
      id: 'comeback_kid',
      type: 'motivation',
      description: 'Encouragement after breaking a 0 streak',
      condition: ({ streak, logs }) => streak === 1 && logs && logs.length > 10, 
      message: (metric) => `🌱 You're back on track with ${metric.label}. Let's build a new streak.`,
    },

    // --- CATEGORY: PERFORMANCE & TRENDS ---
    {
      id: 'goal_crushed',
      type: 'celebration',
      condition: ({ completion }) => completion >= 150,
      message: (metric) => `🚀 You absolutely crushed ${metric.label} today (${completion.toFixed(0)}%). Outstanding!`,
    },
    {
      id: 'warming_up',
      type: 'trend',
      condition: ({ trend }) => trend > 15,
      message: (metric) => `📈 ${metric.label} is trending up (+${trend.toFixed(0)}% vs last week).`,
    },
    {
      id: 'cooling_down',
      type: 'trend',
      condition: ({ trend }) => trend < -15,
      message: (metric) => `📉 ${metric.label} is down ${Math.abs(trend).toFixed(0)}% this week. Can we push a bit harder?`,
    },
    {
      id: 'consistency_check',
      type: 'analysis',
      condition: ({ rollingAvg, metricType, goal }) => metricType === 'number' && goal > 0 && rollingAvg > (goal * 0.9),
      message: (metric, { rollingAvg }) => `⚖️ Your consistency on ${metric.label} is rock solid (Avg: ${rollingAvg.toFixed(1)}).`,
    },

    // --- CATEGORY: SMART ADJUSTMENTS (System Maintenance) ---
    {
      id: 'raise_the_bar',
      type: 'adjustment',
      description: 'Suggests increasing goal if consistently overachieving',
      condition: ({ rollingAvg, goal }) => goal > 0 && rollingAvg > (goal * 1.3),
      message: (metric, { goal }) => `💪 You're consistently crushing ${metric.label}. Consider raising the goal to ${Math.round(goal * 1.2)} to keep challenging yourself.`,
    },
    {
      id: 'lower_the_bar',
      type: 'adjustment',
      description: 'Suggests lowering goal if consistently failing (to prevent demoralization)',
      condition: ({ rollingAvg, goal, streak }) => streak === 0 && goal > 0 && rollingAvg < (goal * 0.4) && rollingAvg > 0,
      message: (metric, { goal }) => `📉 Struggling with ${metric.label}? Try lowering the goal to ${Math.round(goal * 0.5)} to build momentum back up.`,
    },
    {
      id: 'forgotten_metric',
      type: 'adjustment',
      description: 'Identifies stale metrics',
      condition: ({ daysSinceLastLog }) => daysSinceLastLog > 14 && daysSinceLastLog < 900,
      message: (metric) => `🕸️ You haven't logged ${metric.label} in 2 weeks. Is this still important to you?`,
    },

    // --- CATEGORY: CORRELATIONS (Advanced) ---
    {
      id: 'positive_synergy',
      type: 'insight',
      condition: ({ correlation, corrPartner }) => correlation > 0.75 && corrPartner,
      message: (metric, stats) => `🔗 Synergy found: When you do ${metric.label}, you also tend to do ${stats.corrPartner}.`,
    },
    {
      id: 'negative_friction',
      type: 'insight',
      condition: ({ correlation, corrPartner }) => correlation < -0.75 && corrPartner,
      message: (metric, stats) => `⚠️ Friction: ${metric.label} seems to negatively impact ${stats.corrPartner}.`,
    },
  ],
};
