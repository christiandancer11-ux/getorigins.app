import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

export default function LearningBadges({ achievements }) {
  if (!achievements || achievements.length === 0) return null;

  // Filter only plan completion achievements
  const planAchievements = achievements.filter(a => a.achievement_type === 'plan_completed');

  if (planAchievements.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Learning Achievements</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {planAchievements.map((achievement, idx) => (
          <motion.div
            key={achievement.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col items-center gap-1 p-3 rounded-lg bg-primary/10 border border-primary/20"
            title={achievement.description}
          >
            <span className="text-2xl">{achievement.badge_icon}</span>
            <span className="text-xs font-semibold text-primary text-center line-clamp-2">
              {achievement.description}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}