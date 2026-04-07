import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CATEGORIES = [
  'football', 'baseball', 'basketball', 'soccer', 'hockey', 'golf', 'ufc', 'wwe', 'f1',
  'ncaa_football', 'ncaa_basketball', 'ncaa_baseball',
  'pokemon', 'one_piece', 'mtg', 'yugioh'
];

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

// In-memory cache shared with fetchTrending isolate — note: each function has its own isolate,
// so this cache is local to preCacheTrending. The actual user-facing cache lives in fetchTrending.
// This automation's job is to trigger fetchTrending so ITS cache gets populated.
// We do this by invoking it as asServiceRole with the warmup flag.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log(`[preCacheTrending] Starting cache population at ${new Date().toISOString()}`);

    const startTime = Date.now();
    const trendingCutoffISO = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

    // Process in parallel batches of 4 to avoid timeout
    const BATCH_SIZE = 4;
    const allResults = [];

    for (let i = 0; i < CATEGORIES.length; i += BATCH_SIZE) {
      const batch = CATEGORIES.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(async (category) => {
        try {
          const categoryStart = Date.now();
          const { sport, label } = CATEGORY_MAP[category];

          // Pull trade context
          let internalSummary = `No Origins community trades recorded yet for ${label}.`;
          try {
            const allTrades = await base44.asServiceRole.entities.CardTrade.filter({ sport });
            if (allTrades.length > 0) {
              internalSummary = `Origins community trades for ${label} (${allTrades.length} trades):\n` +
                allTrades.slice(0, 20).map(t =>
                  `${t.card_name} ${t.set_name || ''} - $${t.total_value || t.cash_paid || 0} (${t.condition || 'raw'})`
                ).join('\n');
            }
          } catch (e) {
            console.warn(`Could not fetch trades for ${category}:`, e.message);
          }

          const prompt = `You are a trading card market expert. List the top 15 hottest and most in-demand ${label} right now based on collector buzz, sell-through rate, and market activity.

Context from Origins community trades:
${internalSummary}

=== STRICT MARKET DATA QUALITY RULES ===
1. CONFIRMED SALES ONLY: Only use listings verified as SOLD.
2. OUTLIER FILTERING: Exclude lone outlier sales within 12 hours before ${trendingCutoffISO}.
3. BASE VALUES ON THE MEDIAN of qualifying confirmed sales.

Return exactly 15 cards. For each include: rank, player_or_name, card_name, year, set_name, variant, estimated_value_avg (number), heat_score (1-100), why_hot (one sentence), trend (up/down/stable).`;

          const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: false,
            response_json_schema: cardSchema,
            model: 'gemini_3_flash',
          });

          const elapsed = Date.now() - categoryStart;
          const cardCount = llmResult?.cards?.length || 0;
          console.log(`✓ ${category}: ${cardCount} cards in ${elapsed}ms`);
          return { category, status: 'success', elapsed, cards: cardCount };
        } catch (err) {
          console.error(`✗ ${category}: ${err.message}`);
          return { category, status: 'error', message: err.message };
        }
      }));
      allResults.push(...batchResults);
    }

    const results = allResults;

    const totalElapsed = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'success').length;
    console.log(`[preCacheTrending] Completed in ${totalElapsed}ms. Success: ${successCount}/${CATEGORIES.length}`);

    if (successCount === 0) {
      return Response.json({ error: 'All categories failed', results }, { status: 500 });
    }

    return Response.json({
      message: `Pre-warmed ${successCount}/${CATEGORIES.length} categories`,
      total_ms: totalElapsed,
      results,
      cached_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('[preCacheTrending] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});