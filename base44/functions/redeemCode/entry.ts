import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { code } = await req.json();
    if (!code) return Response.json({ error: 'No code provided' }, { status: 400 });

    const upperCode = code.toUpperCase().trim();

    // Find the promo code
    const codes = await base44.asServiceRole.entities.PromoCode.filter({ code: upperCode });
    const promo = codes.find(c => c.is_active !== false);
    if (!promo) return Response.json({ error: 'Invalid or expired code.' }, { status: 404 });

    // Check max uses
    if (promo.max_uses != null && (promo.use_count || 0) >= promo.max_uses) {
      return Response.json({ error: 'This code has already been used.' }, { status: 400 });
    }

    // Check if this user already redeemed this code
    const existing = await base44.asServiceRole.entities.CodeRedemption.filter({ user_email: user.email, code: upperCode });
    if (existing.length > 0) return Response.json({ error: 'You have already used this code.' }, { status: 400 });

    // Apply benefit based on type
    let benefit = '';
    const now = new Date();

    if (promo.type === 'lifetime') {
      // Lifetime access — set end date 100 years in the future
      const endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 100);
      const existing_sub = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: user.email });
      if (existing_sub.length > 0) {
        await base44.asServiceRole.entities.UserSubscription.update(existing_sub[0].id, {
          status: 'active', plan: 'pro', current_period_end: endDate.toISOString(),
        });
      } else {
        await base44.asServiceRole.entities.UserSubscription.create({
          user_email: user.email, status: 'active', plan: 'pro', current_period_end: endDate.toISOString(),
        });
      }
      benefit = '🎉 Lifetime access to all Origins features activated!';

    } else if (promo.type === 'admin_gift') {
      // 3 months free expert access
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 3);
      const existing_sub = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: user.email });
      if (existing_sub.length > 0) {
        await base44.asServiceRole.entities.UserSubscription.update(existing_sub[0].id, {
          status: 'active', plan: 'expert', current_period_end: endDate.toISOString(),
        });
      } else {
        await base44.asServiceRole.entities.UserSubscription.create({
          user_email: user.email, status: 'active', plan: 'expert', current_period_end: endDate.toISOString(),
        });
      }
      benefit = '3 months free Expert Bundle access activated!';

    } else if (promo.type === 'referral' || promo.type === 'trial') {
      // referral = 7 days, trial = 10 days
      const trialDays = promo.type === 'trial' ? 10 : 7;
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + trialDays);
      const existing_sub = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: user.email });
      // Only apply if they don't have a paid active sub already
      const hasPaid = existing_sub.find(s => s.status === 'active' && s.stripe_subscription_id);
      if (!hasPaid) {
        if (existing_sub.length > 0) {
          await base44.asServiceRole.entities.UserSubscription.update(existing_sub[0].id, {
            status: 'active', plan: 'expert', current_period_end: endDate.toISOString(),
          });
        } else {
          await base44.asServiceRole.entities.UserSubscription.create({
            user_email: user.email, status: 'active', plan: 'expert', current_period_end: endDate.toISOString(),
          });
        }
      }

      // If referral, also grant the referrer 7 days
      if (promo.type === 'referral' && promo.created_by_email && promo.created_by_email !== user.email) {
        const referrerEnd = new Date(now);
        referrerEnd.setDate(referrerEnd.getDate() + 7);
        const referrer_sub = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: promo.created_by_email });
        if (referrer_sub.length > 0) {
          const currentEnd = referrer_sub[0].current_period_end ? new Date(referrer_sub[0].current_period_end) : now;
          const base = currentEnd > now ? currentEnd : now;
          const newEnd = new Date(base);
          newEnd.setDate(newEnd.getDate() + 7);
          await base44.asServiceRole.entities.UserSubscription.update(referrer_sub[0].id, {
            status: 'active', plan: 'expert', current_period_end: newEnd.toISOString(),
          });
        } else {
          await base44.asServiceRole.entities.UserSubscription.create({
            user_email: promo.created_by_email, status: 'active', plan: 'expert', current_period_end: referrerEnd.toISOString(),
          });
        }
        benefit = '7 days free access activated! Your friend also got 7 days.';
      } else {
        benefit = promo.type === 'trial' ? '10 days free Pro access activated!' : '7 days free Expert Bundle access activated!';
      }
    } else if (promo.type === 'creator') {
      // Creator codes return the stripe_coupon_id for use at checkout
      benefit = 'Creator code valid! You\'ll get 50% off your first 3 months at checkout.';
      // Increment use count and record redemption
      await base44.asServiceRole.entities.PromoCode.update(promo.id, { use_count: (promo.use_count || 0) + 1 });
      await base44.asServiceRole.entities.CodeRedemption.create({
        code: upperCode, user_email: user.email, promo_code_id: promo.id,
        code_type: promo.type, benefit_applied: benefit,
      });
      return Response.json({ success: true, benefit, type: 'creator', couponId: promo.stripe_coupon_id });
    }

    // Record redemption & increment use count
    await base44.asServiceRole.entities.PromoCode.update(promo.id, { use_count: (promo.use_count || 0) + 1 });
    await base44.asServiceRole.entities.CodeRedemption.create({
      code: upperCode, user_email: user.email, promo_code_id: promo.id,
      code_type: promo.type, benefit_applied: benefit,
    });

    return Response.json({ success: true, benefit, type: promo.type });
  } catch (error) {
    console.error('redeemCode error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});