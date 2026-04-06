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
};

// In-memory cache: key -> { data, expires }
const trendingCache = new Map();
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours (prioritize speed over freshness)

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
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

    const { category, limit = 15, viewMode = 'hottest' } = await req.json();
    if (!CATEGORY_MAP[category]) {
      return Response.json({ error: 'Invalid category' }, { status: 400 });
    }

    const cardCount = Math.min(Math.max(parseInt(limit) || 15, 10), 100);
    const { sport, label } = CATEGORY_MAP[category];

    // Check cache first (15-minute TTL for faster response)
    const cacheKey = `${category}__${viewMode}__${cardCount}`;
    const cached = trendingCache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      console.log('Cache hit for:', cacheKey);
      return Response.json(cached.data);
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

    const cardSchema = {
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

    const isTCG = ['pokemon', 'magic_the_gathering', 'yugioh', 'one_piece'].includes(sport);

    const tcgContext = isTCG ? `
=== TCG COMPETITIVE META & TOURNAMENT INTELLIGENCE ===
For this TCG category, you MUST factor in the following when determining card rankings and values:

1. CURRENT TOURNAMENT FORMAT & LEGALITY
   - What sets/cards are currently legal in Standard, Expanded, Advanced, Modern, or equivalent formats?
   - Any recent ban list updates, forbidden/limited lists (Yu-Gi-Oh! F&L list, MTG banned/restricted list, Pokémon rotation)?
   - Cards that are newly banned often DROP sharply in value; newly unbanned cards often SPIKE.

2. RECENT MAJOR TOURNAMENT RESULTS (last 30 days)
   - What decks/archetypes placed 1st–8th at recent Regional Championships, Majors, or Pro Tour/Grand Prix/YCS events?
   - Which specific cards are in winning decks right now? Those cards command premiums.
   - Source from: Limitless TCG (Pokemon), MTG Goldfish/EDHREC (MTG), YGOProdeck/Yugipedia (Yu-Gi-Oh!), One Piece Card Game official site, TCGPlayer.com sales history.

3. PRO FORUM & COMMUNITY BUZZ
   - What are players discussing on r/PokemonTCG, r/magicTCG, r/yugioh, r/OnePieceTCG, Limitless TCG forums, MTG Salvation, DuelingBook?
   - Which cards are being tested in new archetypes or are considered "sleepers"?
   - Upcoming set releases — what cards from upcoming sets are hyped and may push existing cards up or down?

4. SET ROTATION & UPCOMING RELEASES
   - Is a major set rotating out soon? Cards leaving the format often drop.
   - New set announcement or pre-release? Cards that synergize with spoiled new cards spike early.
   - Special sets (Secret Lair, 25th Anniversary reprints, etc.) can suppress prices of original printings.

5. PLAY ABILITY IMPACT ON CARD VALUE
   - Tournament-staple cards in competitive decks are worth MORE even at common/uncommon rarity.
   - Cards that are only collectible (high art, alt art, full art) but not competitively played may have different value drivers.
   - Grade/condition matters differently for TCG: PSA 10 holo/alt-art cards of competitive staples command extreme premiums.

6. TCGPLAYER VERIFIED SALES DATA — AUTHORITATIVE SOURCE (REQUIRED for all TCG cards)
   - For EVERY TCG card, you MUST look up TCGPlayer.com Market Price. This is a NON-OPTIONAL step.
   - TCGPlayer Market Price = weighted average of ACTUAL completed transactions from verified sellers. It is the single most reliable TCG price signal available.
   - estimated_value_avg for any TCG card MUST be set to TCGPlayer Market Price (NM condition) as the primary value. DO NOT use eBay BIN listings, ask prices, or speculation as the primary source.
   - Only deviate from TCGPlayer Market Price if: (a) the card does not exist on TCGPlayer, or (b) TCGPlayer Market Price is clearly stale (fewer than 5 recent sales in the last 30 days) — in which case use eBay confirmed sold average and note it.
   - NM (Near Mint) is the baseline condition. If you are reporting a graded (PSA/BGS) copy, note the premium above TCGPlayer NM Market Price.
   - Also report if the card has spiked or dropped recently vs its 30-day TCGPlayer average.
` : '';

    const buildPrompt = (startRank, endRank) =>
      `You are a trading card market expert specializing in both sports cards and TCG competitive play. List ranks #${startRank} to #${endRank} for the category "${label}", focused on: ${modeInstruction}.

Context from Origins community trades:
${internalSummary}
${tcgContext}
=== STRICT MARKET DATA QUALITY RULES ===
When sourcing eBay, TCGPlayer, CardMarket, or external market prices for estimated_value_avg:
1. CONFIRMED SALES ONLY: Only use listings that are verified as SOLD. Exclude unsold, expired, relisted, or unaccepted-offer listings.
2. OUTLIER FILTERING: If a single sale is more than 100% above the established market average for that card:
   - Exclude it from value calculations UNLESS there are 2+ confirmed sales within 20-30% of each other AND all occurred more than 12 hours ago (before ${trendingCutoffISO})
   - A lone outlier sale within the last 12 hours must be excluded — it may be a manipulation attempt
   - Use 130point.com or TCGPlayer.com Market Price as cross-reference to validate values. TCGPlayer Market Price = weighted average of ACTUAL verified sales — treat it as the authoritative benchmark for all TCG cards.
3. BASE VALUES ON THE MEDIAN of qualifying confirmed sales, not on single high outliers.
4. For TCG cards: factor in whether the card is currently tournament-legal and seeing competitive play — this directly impacts demand.

Return exactly ${endRank - startRank + 1} cards ranked by the specified criteria. For each include: rank, player_or_name, card_name, year, set_name, variant, estimated_value_avg (number — use TCGPlayer Market Price as primary source for TCG cards), heat_score (1-100), why_hot (one sentence explaining why it ranks here — for TCG cards mention tournament staple status, meta relevance, and TCGPlayer Market Price), trend (up/down/stable).`;

    // Fetch all cards in one optimized request to reduce LLM overhead
    const promptAllCards = buildPrompt(1, cardCount);
    
    // Use flash model without internet search for speed (trades freshness for <10s response time)
    const startTime = Date.now();
    const batchResults = [
      await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: promptAllCards,
        add_context_from_internet: false,
        response_json_schema: cardSchema,
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