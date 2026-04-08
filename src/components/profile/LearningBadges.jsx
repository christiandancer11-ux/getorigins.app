import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';

export default function LearningBadges({ achievements }) {
  if (!achievements || achievements.length === 0) return null;

  // Filter only badge achievements
  const badgeAchievements = achievements.filter(a => a.reward_type === 'badge' || a.achievement_type === 'all_card_types_mastery');

  if (badgeAchievements.length === 0) return null;

  const isMasterOfAll = badgeAchievements.some(a => a.achievement_type === 'all_card_types_mastery');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Learning Badges</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {isMasterOfAll && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-1 p-3 rounded-lg bg-gradient-to-b from-amber-500/20 to-amber-500/10 border border-amber-500/30"
          >
            <span className="text-3xl">🏆</span>
            <span className="text-xs font-bold text-amber-400 text-center">Master of All Cards</span>
          </motion.div>
        )}

        {badgeAchievements
          .filter(a => a.achievement_type !== 'all_card_types_mastery')
          .map((achievement, idx) => (
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
                {achievement.card_type?.replace(/_/g, ' ').toUpperCase()}
              </span>
            </motion.div>
          ))}
      </div>
    </div>
  );
}