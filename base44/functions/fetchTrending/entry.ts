import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CATEGORY_MAP = {
  football:    { sport: 'football',  label: 'Football Cards' },
  baseball:    { sport: 'baseball',  label: 'Baseball Cards' },
  basketball:  { sport: 'basketball', label: 'Basketball Cards' },
  soccer:      { sport: 'soccer',    label: 'Soccer Cards' },
  f1:          { sport: 'f1',        label: 'F1 Cards' },
  pokemon:     { sport: 'pokemon',   label: 'Pokémon Cards' },
  one_piece:   { sport: 'one_piece', label: 'One Piece Cards' },
  mtg:         { sport: 'magic_the_gathering', label: 'Magic: The Gathering Cards' },
  yugioh:      { sport: 'yugioh',   label: 'Yu-Gi-Oh! Cards' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify expert subscription
    const subs = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: user.email });
    const isAdmin = user.role === 'admin';
    const activeSub = subs.find(s => s.status === 'active');
    if (!isAdmin && (!activeSub || !['pro', 'expert'].includes(activeSub.plan))) {
      return Response.json({ error: 'Pro subscription required' }, { status: 403 });
    }

    const { category, limit = 25 } = await req.json();
    if (!CATEGORY_MAP[category]) {
      return Response.json({ error: 'Invalid category' }, { status: 400 });
    }

    const cardCount = Math.min(Math.max(parseInt(limit) || 25, 25), 100);
    const { sport, label } = CATEGORY_MAP[category];

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

    const buildPrompt = (startRank, endRank) =>
      `You are a sports card market expert. List ranks #${startRank} to #${endRank} of the hottest cards RIGHT NOW for: "${label}".

Context from Origins community trades:
${internalSummary}

Return exactly ${endRank - startRank + 1} cards. For each include: rank, player_or_name, card_name, year, set_name, variant, estimated_value_avg (number), heat_score (1-100), why_hot (short sentence), trend (up/down/stable).`;

    // Batch by 10 to avoid LLM JSON truncation with internet search
    const BATCH_SIZE = 10;
    const batches = [];
    for (let start = 1; start <= cardCount; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE - 1, cardCount);
      batches.push({ start, end });
    }

    const batchResults = await Promise.all(
      batches.map(({ start, end }) =>
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: buildPrompt(start, end),
          add_context_from_internet: true,
          response_json_schema: cardSchema,
        })
      )
    );

    const allCards = batchResults.flatMap(r => r.cards || []);
    const categorySummary = batchResults[0]?.category_summary || '';

    return Response.json({
      category,
      label,
      cards: allCards,
      category_summary: categorySummary,
      generated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('fetchTrending error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});