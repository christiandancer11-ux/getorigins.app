import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Split into two groups so each run finishes well under the 180s timeout
const CATEGORY_GROUPS = {
  A: ['football', 'baseball', 'basketball', 'soccer', 'hockey', 'golf', 'ufc', 'wwe'],
  B: ['f1', 'ncaa_football', 'ncaa_basketball', 'ncaa_baseball', 'pokemon', 'one_piece', 'mtg', 'yugioh'],
};

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

async function warmCategory(base44, category) {
  const { sport, label } = CATEGORY_MAP[category];
  const categoryStart = Date.now();

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

  const trendingCutoffISO = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

  const prompt = `You are a trading card market expert. List the top 15 hottest and most in-demand ${label} right now based on collector buzz, sell-through rate, and market activity.

Context from Origins community trades:
${internalSummary}

RULES: Only use confirmed SOLD listings. Exclude outlier sales within 12 hours before ${trendingCutoffISO}. Base values on the median of qualifying confirmed sales.

Return exactly 15 cards. For each include: rank, player_or_name, card_name, year, set_name, variant, estimated_value_avg (number), heat_score (1-100), why_hot (one sentence), trend (up/down/stable).`;

  const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: false,
    response_json_schema: cardSchema,
    model: 'gemini_3_flash',
  });

  const cards = llmResult?.cards || [];
  const categorySummary = llmResult?.category_summary || '';

  // Write result to TrendingCache entity so fetchTrending can read it
  const cacheKey = `${category}__hottest__15`;
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4 hours
  const generatedAt = new Date().toISOString();

  try {
    // Delete old cache entry for this key if it exists
    const existing = await base44.asServiceRole.entities.TrendingCache.filter({ cache_key: cacheKey });
    for (const entry of existing) {
      await base44.asServiceRole.entities.TrendingCache.delete(entry.id);
    }
    // Write fresh entry
    await base44.asServiceRole.entities.TrendingCache.create({
      cache_key: cacheKey,
      category,
      label,
      view_mode: 'hottest',
      cards,
      category_summary: categorySummary,
      generated_at: generatedAt,
      expires_at: expiresAt,
    });
  } catch (e) {
    console.warn(`Could not write TrendingCache for ${category}:`, e.message);
  }

  const elapsed = Date.now() - categoryStart;
  console.log(`✓ ${category}: ${cards.length} cards in ${elapsed}ms`);
  return { category, status: 'success', elapsed, cards: cards.length };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const group = (body.group || 'A').toUpperCase();
    const categories = CATEGORY_GROUPS[group];
    if (!categories) {
      return Response.json({ error: `Invalid group "${group}". Use A or B.` }, { status: 400 });
    }

    console.log(`[preCacheTrending] Group ${group} starting at ${new Date().toISOString()}`);
    const startTime = Date.now();

    // Run all categories in parallel
    const results = await Promise.all(
      categories.map(cat => warmCategory(base44, cat).catch(err => {
        console.error(`✗ ${cat}: ${err.message}`);
        return { category: cat, status: 'error', message: err.message };
      }))
    );

    const totalElapsed = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'success').length;
    console.log(`[preCacheTrending] Group ${group} done in ${totalElapsed}ms. Success: ${successCount}/${categories.length}`);

    return Response.json({
      message: `Group ${group}: warmed ${successCount}/${categories.length} categories`,
      group,
      total_ms: totalElapsed,
      results,
      cached_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('[preCacheTrending] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});