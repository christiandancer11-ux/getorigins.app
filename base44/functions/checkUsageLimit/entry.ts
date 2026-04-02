import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FREE_DAILY_LIMIT = 5;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [subs, allMessages] = await Promise.all([
      base44.asServiceRole.entities.UserSubscription.filter({ user_email: user.email }),
      base44.asServiceRole.entities.VideoMessage.filter({ created_by: user.email }),
    ]);

    const activeSub = subs.find(s => s.status === 'active');
    if (activeSub) {
      // Pro users: unlimited stories + all features
      return Response.json({ allowed: true, isPro: true, plan: 'pro', remaining: null });
    }

    // Free tier: 5 story messages/videos per day
    const count = allMessages.filter(m => new Date(m.created_date) >= today).length;
    const remaining = FREE_DAILY_LIMIT - count;

    return Response.json({
      allowed: count < FREE_DAILY_LIMIT,
      isPro: false,
      plan: 'free',
      remaining: Math.max(0, remaining),
      used: count,
      limit: FREE_DAILY_LIMIT,
    });
  } catch (error) {
    console.error('checkUsageLimit error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});