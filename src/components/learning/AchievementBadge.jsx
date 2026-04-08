import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Star, Gift } from 'lucide-react';

const ACHIEVEMENT_CONFIG = {
  lesson_5_completed: { icon: Star, color: 'bg-blue-500/20 border-blue-500/30' },
  lesson_10_completed: { icon: Zap, color: 'bg-purple-500/20 border-purple-500/30' },
  lesson_15_completed: { icon: Star, color: 'bg-orange-500/20 border-orange-500/30' },
  plan_completed: { icon: Gift, color: 'bg-primary/20 border-primary/30' },
};

export default function AchievementBadge({ achievement }) {
  const config = ACHIEVEMENT_CONFIG[achievement.achievement_type] || { icon: Star, color: 'bg-secondary/20 border-border/50' };
  const Icon = config.icon;

  const formatReward = () => {
    if (achievement.reward_type === 'pro_days') {
      return `${achievement.reward_value} days Pro access`;
    }
    return `${achievement.reward_feature} unlocked`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-3 rounded-lg border ${config.color}`}
    >
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">{achievement.description}</p>
          <p className="text-xs text-muted-foreground mt-0.5">+{formatReward()}</p>
        </div>
      </div>
    </motion.div>
  );
}