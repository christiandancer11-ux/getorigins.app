import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Each group is a single category so each automation run completes in ~30s
const CATEGORY_GROUPS = {
  A: ['football'],
  B: ['baseball'],
  C: ['basketball'],
  D: ['soccer'],
  E: ['hockey'],
  F: ['golf'],
  G: ['ufc'],
  H: ['wwe'],
  I: ['f1'],
  J: ['ncaa_football'],
  K: ['ncaa_basketball'],
  L: ['ncaa_baseball'],
  M: ['pokemon'],
  N: ['one_piece'],
  O: ['mtg'],
  P: ['yugioh'],
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
          estimated_value_avg_raw: { type: 'number' },
          estimated_value_avg_graded: { type: 'number' },
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

  const prompt = `You are a trading card market expert with live internet access. List the top 15 hottest ${label} RIGHT NOW based on real eBay sold data, collector buzz, and sell-through rate.

Context from Origins community trades:
${internalSummary}

CRITICAL RULES:
1. Only use CONFIRMED SOLD listings from eBay, 130point.com, or TCGPlayer (TCG only). No unsold or relisted items.
2. For each card, SEPARATELY provide the RAW (ungraded) average price AND the top graded (PSA 10 or best available grade) average price. Never blend raw and graded sales into one average.
3. Set estimated_value_avg to the graded price if the variant is a graded slab, or raw price if ungraded.
4. estimated_value_avg_raw = average of raw/ungraded confirmed sales only.
5. estimated_value_avg_graded = average of PSA 10 (or equivalent top grade) confirmed sales only.
6. variant field must clearly state condition: e.g. "PSA 10", "Raw/Ungraded", "BGS 9.5".
7. heat_score 1-100 based on recent volume, price momentum, and collector buzz.
8. why_hot: one concise sentence referencing a real market reason.
9. trend: up/down/stable based on recent price direction.

Return exactly 15 cards with all fields populated. Also return category_summary (2 sentences about the ${label} market right now).`;

  // Wrap LLM call with an 85-second timeout
  let llmResult = null;
  const llmTimeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('LLM timeout after 85s')), 85000)
  );
  llmResult = await Promise.race([
    base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: cardSchema,
    }),
    llmTimeout,
  ]);

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

    // Run the (single) category — parallel is fine since each group is 1 item
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