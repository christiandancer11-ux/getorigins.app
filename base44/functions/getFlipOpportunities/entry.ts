import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// In-memory rate limit
const rateLimitStore = new Map();
function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }
  if (entry.count >= maxRequests) {
    const retryAfterSec = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
    return { allowed: false, retryAfterSec };
  }
  entry.count += 1;
  return { allowed: true };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limit: 5 requests per hour (expensive AI call)
    const rl = checkRateLimit(`getFlipOpportunities:${user.email}`, 5, 60 * 60 * 1000);
    if (!rl.allowed) {
      return Response.json({ error: `Too many requests. Please wait ${rl.retryAfterSec} seconds.` }, { status: 429 });
    }

    // Pull internal data from Origins to enrich the prompt
    const [recentTrades, recentCards] = await Promise.all([
      base44.asServiceRole.entities.CardTrade.list('-created_date', 100),
      base44.asServiceRole.entities.Card.list('-updated_date', 200),
    ]);

    const tradesSummary = recentTrades.slice(0, 30).map(t =>
      `${t.card_name} ${t.set_name || ''} ${t.year || ''} ${t.condition || 'raw'}: deal=$${t.total_value || t.cash_paid || 0}${t.ebay_comp_avg ? `, mkt avg=$${t.ebay_comp_avg}` : ''}${t.market_pct ? `, ${t.market_pct}% of market` : ''}`
    ).join('\n');

    const collectionSummary = recentCards.filter(c => c.estimated_value && c.price_paid).slice(0, 20).map(c =>
      `${c.name} ${c.set_name || ''} ${c.year || ''} ${c.grading_company ? `${c.grading_company} ${c.grade}` : 'raw'}: paid=$${c.price_paid}, est=$${c.estimated_value}`
    ).join('\n');

    const prompt = `You are an expert sports card & TCG investment analyst. Your job is to find the TOP 10 best "buy low, sell high" flip opportunities RIGHT NOW across all card categories (sports and TCG).

Use data from:
- eBay recently sold listings (last 7-30 days)
- 130point.com confirmed sales
- PSA, BGS price guides
- Known upcoming auctions, player news, sports seasons, and release announcements
- Origins community trade data below

Origins recent trade data:
${tradesSummary || 'No recent trade data'}

Origins collection data (bought vs estimated value):
${collectionSummary || 'No collection data'}

Find cards currently trading BELOW their true market value where there's a clear catalyst or trend that will push prices HIGHER soon. Consider:
- Cards being bought below recent comps
- Rookie cards of players trending up (recent signings, award winners, breakout performances)
- Upcoming sports seasons driving demand
- Low recent sale volume creating artificially suppressed prices
- Graded slabs trading near or below raw card prices
- TCG cards with upcoming set releases, bans, or meta shifts

For each of the top 10 flip opportunities return:
- rank: 1-10
- card_name: player name or card title
- set_name: set or collection
- year: year of card (string)
- sport_or_tcg: category (baseball, basketball, football, hockey, soccer, pokemon, magic_the_gathering, yugioh, other)
- current_buy_price: estimated current buy price in USD
- target_sell_price: realistic sell target in USD
- potential_gain_pct: percentage gain potential (number)
- buy_reason: 1-2 sentences on WHY it's undervalued right now
- sell_catalyst: 1-2 sentences on WHAT will drive the price up
- time_horizon: "short" (days-weeks), "medium" (1-3 months), or "long" (3-6+ months)
- risk_level: "low", "medium", or "high"
- data_source: where you found the pricing data

Sort by potential_gain_pct descending. Only include cards with real, verifiable recent sales data.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rank: { type: 'number' },
                card_name: { type: 'string' },
                set_name: { type: 'string' },
                year: { type: 'string' },
                sport_or_tcg: { type: 'string' },
                current_buy_price: { type: 'number' },
                target_sell_price: { type: 'number' },
                potential_gain_pct: { type: 'number' },
                buy_reason: { type: 'string' },
                sell_catalyst: { type: 'string' },
                time_horizon: { type: 'string' },
                risk_level: { type: 'string' },
                data_source: { type: 'string' },
              },
            },
          },
          summary: { type: 'string' },
          generated_at: { type: 'string' },
        },
      },
    });

    console.log('getFlipOpportunities completed, found:', result?.opportunities?.length, 'opportunities');
    return Response.json({ ...result, generated_at: new Date().toISOString() });
  } catch (error) {
    console.error('getFlipOpportunities error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});