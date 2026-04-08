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

=== PRIMARY DATA SOURCES — YOU MUST USE ALL OF THESE ===

For ALL sports cards (baseball, basketball, football, hockey, soccer, golf, UFC, WWE, F1, NCAA):
1. **130point.com** — REQUIRED. Use as the primary confirmed sales database. Pull the most recent sold transactions for each card (last 7-30 days). 130point aggregates eBay sold data with verified prices — treat it as ground truth for sports card comps.
2. **Alt (alt.com)** — REQUIRED for sports cards. Alt is a verified card marketplace with authenticated graded cards. Check their recent sales and current listings to find undervalued slabs.
3. **Collx / Ludex / Cardbase** — REQUIRED. These apps aggregate collector pricing and community data. Collx tracks recent scan-and-price data from the collector community. Use them to cross-reference fair market value.
4. **Card Ladder (cardladder.com)** — REQUIRED for graded sports cards. Card Ladder tracks grade-specific population data and price trends over time. Use it to identify cards with price momentum or undervalued grades.
5. **eBay recently sold listings** — Use as supplementary validation, not primary source.
6. **PSA, BGS, SGC population reports** — Use to assess scarcity and grade premiums.

For TCG cards (Pokemon, Magic, Yu-Gi-Oh, One Piece):
- TCGPlayer Market Price (primary), CardMarket, eBay sold, MTGGoldfish, Limitless TCG, YGOProdeck
- Factor in tournament legality, ban lists, meta shifts, and upcoming set releases

=== PRICING RULES ===
- CONFIRMED SALES ONLY: Only use verified sold transactions, not asking prices or unaccepted offers.
- Cross-reference at least 2 of the above sources before setting current_buy_price.
- For graded cards, check Card Ladder for grade-specific price trends — a PSA 9 spiking while PSA 10 is flat is a signal.
- data_source field MUST name the specific platform(s) you used (e.g. "130point.com + Card Ladder" or "Alt.com + Collx").

Origins recent trade data (what the Origins community is actually buying and selling):
${tradesSummary || 'No recent trade data'}

Origins collection data (bought vs estimated value):
${collectionSummary || 'No collection data'}

=== WHAT TO LOOK FOR ===
Find cards currently trading BELOW their true market value where there's a clear catalyst or trend that will push prices HIGHER soon:
- Cards being bought below recent 130point comps
- Rookie cards of players trending up (recent signings, award winners, breakout performances)
- Upcoming sports seasons or playoffs driving demand
- Slabs on Alt or Card Ladder trading near or below raw card prices (grading arb)
- Low recent sale volume creating artificially suppressed prices
- TCG cards with upcoming set releases, bans, or meta shifts
- Cards where Collx/Cardbase community data shows growing collector interest ahead of eBay price movement

For each of the top 10 flip opportunities return:
- rank: 1-10
- card_name: player name or card title
- set_name: set or collection
- year: year of card (string)
- sport_or_tcg: category (baseball, basketball, football, hockey, soccer, pokemon, magic_the_gathering, yugioh, other)
- current_buy_price: estimated current buy price in USD (based on 130point/Alt/Card Ladder confirmed sales)
- target_sell_price: realistic sell target in USD
- potential_gain_pct: percentage gain potential (number)
- buy_reason: 1-2 sentences on WHY it's undervalued right now, citing specific data source
- sell_catalyst: 1-2 sentences on WHAT will drive the price up
- time_horizon: "short" (days-weeks), "medium" (1-3 months), or "long" (3-6+ months)
- risk_level: "low", "medium", or "high"
- data_source: SPECIFIC platforms used (e.g. "130point.com, Card Ladder, Alt.com")

Sort by potential_gain_pct descending. Only include cards with real, verifiable recent sales data from the sources above.`;

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