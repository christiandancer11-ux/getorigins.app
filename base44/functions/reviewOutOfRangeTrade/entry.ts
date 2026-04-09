import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BAN_THRESHOLD = 4;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { trade_data, comps } = await req.json();

    if (!trade_data || !trade_data.card_name) {
      return Response.json({ error: 'trade_data with card_name is required' }, { status: 400 });
    }

    // Check if user is already banned
    const userRecord = await base44.asServiceRole.entities.User.filter({ email: user.email });
    const userData = userRecord?.[0] || {};

    if (userData.trade_banned) {
      return Response.json({
        approved: false,
        banned: true,
        reason: 'You are currently banned from logging trades. Please contact an admin to appeal.',
      });
    }

    const marketRef = comps?.ebay_avg ?? comps?.point130_avg ?? null;
    const tv = parseFloat(trade_data.total_value);
    const pct = marketRef ? Math.round((tv / marketRef) * 100) : null;

    // Ask AI to evaluate whether this out-of-range trade has a legitimate reason
    const prompt = `You are a card market integrity reviewer for Origins, a sports card trading platform.

A user is submitting a trade/sale that falls OUTSIDE the normal 70%–100% of market value range.

Card: ${trade_data.card_name} ${trade_data.set_name || ''} ${trade_data.year || ''}
Trade type: ${trade_data.trade_type}
Submitted value: $${tv}
Market average: ${marketRef ? `$${marketRef}` : 'unknown'}
Percentage of market: ${pct !== null ? `${pct}%` : 'unknown (no comps available)'}
Event/Location: ${trade_data.event_name || 'not specified'}
User notes: ${trade_data.notes || 'none'}

Evaluate whether this trade should be approved despite being out of range. Consider:
- Is the value so extreme it appears to be manipulation (e.g. $1 for a $500 card, or $5000 for a $100 card)?
- Could there be a legitimate reason (bulk deal, damaged card, rare condition, private collection sale, no comps available)?
- If no market comps exist, give benefit of the doubt.

Return JSON:
{
  "approved": true or false,
  "reason": "short 1-2 sentence explanation of your decision"
}

Be fair but firm. Approve borderline cases. Only deny clear manipulation attempts.`;

    const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          approved: { type: 'boolean' },
          reason: { type: 'string' },
        },
      },
    });

    const approved = aiResult?.approved ?? false;
    const reason = aiResult?.reason ?? 'No reason provided.';

    console.log(`AI review for ${user.email}: approved=${approved}, pct=${pct}, reason=${reason}`);

    if (!approved) {
      // Increment fraud attempts
      const currentAttempts = (userData.trade_fraud_attempts || 0) + 1;
      const shouldBan = currentAttempts >= BAN_THRESHOLD;

      await base44.asServiceRole.entities.User.update(userData.id, {
        trade_fraud_attempts: currentAttempts,
        ...(shouldBan ? {
          trade_banned: true,
          trade_ban_reason: `Automatically banned after ${BAN_THRESHOLD} denied out-of-range trade submissions. Please contact an admin to appeal.`,
        } : {}),
      });

      console.log(`Fraud attempt ${currentAttempts}/${BAN_THRESHOLD} for ${user.email}. Banned: ${shouldBan}`);

      return Response.json({
        approved: false,
        banned: shouldBan,
        attempts_remaining: Math.max(0, BAN_THRESHOLD - currentAttempts),
        reason,
      });
    }

    // Approved — log the trade as unverified (out of range but AI-approved)
    await base44.asServiceRole.entities.CardTrade.create({
      ...trade_data,
      verified: false,
      market_pct: pct,
      ebay_comp_avg: comps?.ebay_avg ?? null,
      ebay_comp_low: comps?.ebay_low ?? null,
      ebay_comp_high: comps?.ebay_high ?? null,
      market_data_raw: comps?.market_summary ?? null,
      notes: `[AI Approved - Out of Range] ${trade_data.notes || ''}`.trim(),
    });

    return Response.json({ approved: true, reason });
  } catch (error) {
    console.error('reviewOutOfRangeTrade error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});