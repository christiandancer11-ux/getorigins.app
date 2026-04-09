import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CATEGORY_MAP = {
  football:         { sport: 'football',  label: 'Football Cards' },
  baseball:         { sport: 'baseball',  label: 'Baseball Cards' },
  basketball:       { sport: 'basketball', label: 'Basketball Cards' },
  soccer:           { sport: 'soccer',    label: 'Soccer Cards' },
  hockey:           { sport: 'hockey',    label: 'Hockey Cards' },
  golf:             { sport: 'golf',      label: 'Golf Cards' },
  ufc:              { sport: 'ufc',       label: 'UFC Cards' },
  wwe:              { sport: 'wwe',       label: 'WWE Cards' },
  f1:               { sport: 'f1',        label: 'F1 Cards' },
  ncaa_football:    { sport: 'football',  label: 'NCAA Football Cards' },
  ncaa_basketball:  { sport: 'basketball', label: 'NCAA Basketball Cards' },
  ncaa_baseball:    { sport: 'baseball',  label: 'NCAA Baseball Cards' },
  pokemon:          { sport: 'pokemon',   label: 'Pokémon Cards' },
  one_piece:        { sport: 'one_piece', label: 'One Piece Cards' },
  mtg:              { sport: 'magic_the_gathering', label: 'Magic: The Gathering Cards' },
  yugioh:           { sport: 'yugioh',    label: 'Yu-Gi-Oh! Cards' },
  lorcana:          { sport: 'lorcana',   label: 'Disney Lorcana Cards' },
};

// In-memory cache: key -> { data, expires }
const trendingCache = new Map();
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const { category, limit = 15, viewMode = 'hottest', internal_cache_warmup = false } = body;

    // Allow internal cache warmup calls (from preCacheTrending automation) to bypass auth
    if (!internal_cache_warmup) {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      // Check subscription
      if (user.role !== 'admin') {
        const subs = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: user.email });
        const activeSub = subs.find(s => s.status === 'active');
        if (!activeSub || !['pro', 'expert'].includes(activeSub.plan)) {
          return Response.json({ error: 'Pro subscription required for trending data' }, { status: 403 });
        }
      }
    }

    if (!CATEGORY_MAP[category]) {
      return Response.json({ error: 'Invalid category' }, { status: 400 });
    }

    const cardCount = Math.min(Math.max(parseInt(limit) || 15, 10), 100);
    const { sport, label } = CATEGORY_MAP[category];

    // Check in-memory cache first
    const cacheKey = `${category}__${viewMode}__${cardCount}`;
    const cached = trendingCache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      console.log('Cache hit (memory) for:', cacheKey);
      return Response.json(cached.data);
    }

    // Check DB-backed TrendingCache (populated by preCacheTrending automation)
    if (viewMode === 'hottest' && cardCount === 15) {
      try {
        const dbCached = await base44.asServiceRole.entities.TrendingCache.filter({ cache_key: cacheKey });
        const entry = dbCached[0];
        if (entry && entry.expires_at && new Date(entry.expires_at) > new Date() && entry.cards?.length > 0) {
          console.log('Cache hit (DB) for:', cacheKey);
          const responseData = {
            category,
            label,
            cards: entry.cards,
            category_summary: entry.category_summary || '',
            generated_at: entry.generated_at,
          };
          trendingCache.set(cacheKey, { data: responseData, expires: Date.now() + CACHE_TTL_MS });
          return Response.json(responseData);
        }
      } catch (e) {
        console.warn('DB cache lookup failed:', e.message);
      }
    }

    console.log('Cache miss, fetching fresh data for:', cacheKey);

    // Pull Origins card show trades for this sport
    const allTrades = await base44.asServiceRole.entities.CardTrade.filter({ sport });

    const internalSummary = allTrades.length > 0
      ? `Origins community trades for ${label} (${allTrades.length} trades):\n` +
        allTrades.slice(0, 50).map(t =>
          `${t.card_name} ${t.set_name || ''} - $${t.total_value || t.cash_paid || 0} (${t.condition || 'raw'})`
        ).join('\n')
      : `No Origins community trades recorded yet for ${label}.`;

    const cardSchema_trending = {
      type: 'object',
      properties: {
        cards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              rank: { type: 'number' },
              player_or_name: { type: 'string' },
              card_name: { type: 'string' },
              year: { type: 'string' },
              set_name: { type: 'string' },
              variant: { type: 'string' },
              estimated_value_avg_raw: { type: 'number' },
              estimated_value_avg_graded: { type: 'number' },
              estimated_value_avg: { type: 'number' },
              heat_score: { type: 'number' },
              why_hot: { type: 'string' },
              trend: { type: 'string' },
            }
          }
        },
        category_summary: { type: 'string' },
      }
    };

    const VIEW_MODE_INSTRUCTIONS = {
      hottest:       'overall hottest and most in-demand cards right now based on collector buzz, sell-through rate, and market activity',
      highest_sold:  'cards with the HIGHEST recent sale prices — focus on big-dollar transactions from the last 1-2 weeks on eBay and major platforms',
      most_searched: 'most searched players and cards — focus on names generating the most search volume and collector interest right now',
      most_bought:   'most frequently purchased cards — highest transaction volume and buy frequency across platforms in recent days',
      rising:        'cards showing STEADY VALUE GROWTH in the last 48 hours — focus on upward price momentum, recent pop reports, and breakout demand',
    };

    const modeInstruction = VIEW_MODE_INSTRUCTIONS[viewMode] || VIEW_MODE_INSTRUCTIONS.hottest;
    const trendingCutoffISO = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    const isTCG = ['pokemon', 'magic_the_gathering', 'yugioh', 'one_piece', 'lorcana'].includes(sport);

    const tcgContext = isTCG ? `
    === TCG COMPETITIVE META & TOURNAMENT INTELLIGENCE ===
For this TCG category, you MUST factor in the following when determining card rankings and values:

1. CURRENT TOURNAMENT FORMAT & LEGALITY
   - What sets/cards are currently legal in Standard, Expanded, Advanced, Modern, or equivalent formats?
   - Any recent ban list updates, forbidden/limited lists?
   - Cards that are newly banned often DROP sharply in value; newly unbanned cards often SPIKE.

2. RECENT MAJOR TOURNAMENT RESULTS (last 30 days)
   - What decks/archetypes placed 1st–8th at recent Regional Championships, Majors, or Pro Tour events?
   - Which specific cards are in winning decks right now? Those cards command premiums.
   - Source from: Limitless TCG (Pokemon), MTG Goldfish/EDHREC (MTG), YGOProdeck (Yu-Gi-Oh!), TCGPlayer.com sales history.

3. TCGPLAYER VERIFIED SALES DATA — AUTHORITATIVE SOURCE (REQUIRED for all TCG cards)
   - For EVERY TCG card, you MUST look up TCGPlayer.com Market Price.
   - TCGPlayer Market Price = weighted average of ACTUAL completed transactions from verified sellers.
   - estimated_value_avg for any TCG card MUST be set to TCGPlayer Market Price (NM condition) as the primary value.
   - Only deviate if the card does not exist on TCGPlayer or price is clearly stale (fewer than 5 recent sales).
   - NM (Near Mint) is the baseline condition. If reporting a graded (PSA/BGS) copy, note the premium above NM Market Price.
` : '';

    const prompt = `You are a trading card market expert. List ${cardCount} cards for the category "${label}", focused on: ${modeInstruction}.

⚠️ CRITICAL PRICE RULE — PRICES ARE CURRENT MARKET SALE PRICES:
estimated_value_avg_raw and estimated_value_avg_graded represent what the card is ACTUALLY SELLING FOR RIGHT NOW.
This is NOT appreciation. This is NOT how much the card has gone up. This is the REAL CURRENT PRICE a buyer pays today.
- estimated_value_avg_raw = the current median confirmed sale price for a raw/ungraded copy (last 14 days)
- estimated_value_avg_graded = the current median confirmed sale price for a graded copy at the specific grade listed in "variant" (last 14 days)
If you cannot find confirmed recent sales for a card, use a different card you have data for. NEVER guess or fabricate prices.
Price movement/appreciation context belongs in the "why_hot" field ONLY (e.g. "up 40% over the last 60 days, currently selling for $X").

Context from Origins community trades:
${internalSummary}
${tcgContext}

=== RAW vs GRADED PRICE SEPARATION RULES ===
1. RAW (UNGRADED) CARDS:
   - Source ONLY ungraded/raw card confirmed sales on eBay, TCGPlayer (raw NM), PriceCharting.com
   - EXCLUDE all slabbed (PSA, BGS, SGC, CGC, HGA) sales from raw price calculation
   - estimated_value_avg_raw = median of qualifying raw confirmed sales (last 14 days)

2. GRADED CARDS:
   - Source ONLY confirmed graded sales for the SPECIFIC grade listed in "variant" (e.g. PSA 10 only)
   - EXCLUDE raw/ungraded sales from graded price calculation
   - estimated_value_avg_graded = median of qualifying graded confirmed sales at that specific grade (last 14 days)
   - Do NOT blend graded and raw values — they have completely different market dynamics

3. CONFIRMED SALES ONLY: Only use listings verified as SOLD. No BIN ask prices, no unsold listings.

4. OUTLIER FILTERING: If a single sale is >100% above the established market average:
   - Exclude it UNLESS there are 2+ confirmed sales within 20-30% of each other AND all occurred before ${trendingCutoffISO}
   - Use 130point.com or TCGPlayer Market Price as cross-reference to validate.

5. BASE ALL VALUES ON THE MEDIAN of qualifying confirmed sales, not single outliers.

Return exactly ${cardCount} cards. For each: rank, player_or_name, card_name, year, set_name, variant (include grade if graded e.g. "PSA 10"), estimated_value_avg_raw (current market price for raw — null if no raw market), estimated_value_avg_graded (current market price for this specific grade — null if no graded market), estimated_value_avg (current market price using the more actively traded condition for this card), heat_score (1-100), why_hot (explain why it's trending — include price trend context here, e.g. "currently selling for $X PSA 10, up 30% over past 90 days"), trend (up/down/stable).`;

    const startTime = Date.now();
    const batchResults = [
      await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: cardSchema_trending,
        model: 'gemini_3_flash',
      })
    ];
    const elapsed = Date.now() - startTime;
    console.log(`LLM inference took ${elapsed}ms for ${cardCount} cards`);

    const allCards = batchResults.flatMap(r => r.cards || []);
    const categorySummary = batchResults[0]?.category_summary || '';

    const responseData = {
      category,
      label,
      cards: allCards,
      category_summary: categorySummary,
      generated_at: new Date().toISOString(),
    };

    // Cache the result
    trendingCache.set(cacheKey, { data: responseData, expires: Date.now() + CACHE_TTL_MS });

    return Response.json(responseData);

  } catch (error) {
    console.error('fetchTrending error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});