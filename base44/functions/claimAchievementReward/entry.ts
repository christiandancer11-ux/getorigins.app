import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { achievement_id } = await req.json();

    if (!achievement_id) {
      return Response.json({ error: 'Missing achievement_id' }, { status: 400 });
    }

    // Get the achievement
    const achievements = await base44.asServiceRole.entities.LearningAchievement.filter({
      id: achievement_id,
      user_email: user.email
    });

    if (achievements.length === 0) {
      return Response.json({ error: 'Achievement not found' }, { status: 404 });
    }

    const achievement = achievements[0];

    if (achievement.claimed) {
      return Response.json({ error: 'Achievement already claimed' }, { status: 400 });
    }

    // Update achievement as claimed
    const updated = await base44.asServiceRole.entities.LearningAchievement.update(
      achievement.id,
      {
        claimed: true,
        claimed_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + achievement.reward_value * 24 * 60 * 60 * 1000).toISOString()
      }
    );

    // If reward is pro_days, grant temporary pro subscription
    if (achievement.reward_type === 'pro_days') {
      // Check if user has existing subscription
      const subs = await base44.asServiceRole.entities.UserSubscription.filter({
        user_email: user.email
      });

      if (subs.length > 0) {
        // Extend existing subscription
        const currentSub = subs[0];
        const currentEnd = new Date(currentSub.current_period_end);
        const newEnd = new Date(currentEnd.getTime() + achievement.reward_value * 24 * 60 * 60 * 1000);

        await base44.asServiceRole.entities.UserSubscription.update(currentSub.id, {
          current_period_end: newEnd.toISOString()
        });
      } else {
        // Create new subscription with free trial
        const endDate = new Date(Date.now() + achievement.reward_value * 24 * 60 * 60 * 1000);
        await base44.asServiceRole.entities.UserSubscription.create({
          user_email: user.email,
          plan: 'pro',
          status: 'active',
          current_period_end: endDate.toISOString()
        });
      }
    }

    return Response.json({
      success: true,
      achievement: updated,
      message: `Claimed ${achievement.reward_value} days of Pro access!`
    });

  } catch (error) {
    console.error('claimAchievementReward error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});