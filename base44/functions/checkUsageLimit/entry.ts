import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FREE_DAILY_LIMIT = 5;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Check subscription
    const subs = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: user.email });
    const activeSub = subs.find(s => s.status === 'active');
    if (activeSub) {
      return Response.json({ allowed: true, isPro: true, plan: activeSub.plan || 'stories', remaining: null });
    }

    // Count today's messages by this user
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allMessages = await base44.asServiceRole.entities.VideoMessage.filter({ created_by: user.email });
    const todayMessages = allMessages.filter(m => new Date(m.created_date) >= today);
    const count = todayMessages.length;
    const remaining = FREE_DAILY_LIMIT - count;

    return Response.json({
      allowed: count < FREE_DAILY_LIMIT,
      isPro: false,
      remaining: Math.max(0, remaining),
      used: count,
      limit: FREE_DAILY_LIMIT,
    });
  } catch (error) {
    console.error('checkUsageLimit error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});