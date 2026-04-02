import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Find or create the user's personal referral code
    const existing = await base44.asServiceRole.entities.PromoCode.filter({
      type: 'referral', created_by_email: user.email,
    });

    if (existing.length > 0) {
      return Response.json({ code: existing[0].code, use_count: existing[0].use_count || 0 });
    }

    // Generate a unique referral code from user's name/email
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
    const namePart = (user.full_name || user.email).replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
    const code = `REF-${namePart}${suffix}`;

    await base44.asServiceRole.entities.PromoCode.create({
      code, type: 'referral', created_by_email: user.email,
      max_uses: null, use_count: 0, is_active: true,
    });

    return Response.json({ code, use_count: 0 });
  } catch (error) {
    console.error('getUserReferralCode error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});