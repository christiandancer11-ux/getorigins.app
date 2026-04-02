import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CATEGORY_MAP = {
  football:    { sport: 'football',  label: 'Football Cards' },
  baseball:    { sport: 'baseball',  label: 'Baseball Cards' },
  basketball:  { sport: 'basketball', label: 'Basketball Cards' },
  soccer:      { sport: 'soccer',    label: 'Soccer Cards' },
  f1:          { sport: 'f1',        label: 'F1 Cards' },
  pokemon:     { sport: 'pokemon',   label: 'Pokémon Cards' },
  one_piece:   { sport: 'one_piece', label: 'One Piece Cards' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify expert subscription
    const subs = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: user.email });
    const activeSub = subs.find(s => s.status === 'active');
    if (!activeSub || activeSub.plan !== 'expert') {
      return Response.json({ error: 'Expert subscription required' }, { status: 403 });
    }

    const { category } = await req.json();
    if (!CATEGORY_MAP[category]) {
      return Response.json({ error: 'Invalid category' }, { status: 400 });
    }

    const { sport, label } = CATEGORY_MAP[category];

    // Pull Origins card show trades for this sport
    const allTrades = await base44.asServiceRole.entities.CardTrade.filter({ sport });

    // Ask AI to research and compile top 100 trending cards
    const internalSummary = allTrades.length > 0
      ? `Origins community trades for ${label} (${allTrades.length} trades):\n` +
        allTrades.slice(0, 50).map(t =>
          `${t.card_name} ${t.set_name || ''} - $${t.total_value || t.cash_paid || 0} (${t.condition || 'raw'})`
        ).join('\n')
      : `No Origins community trades recorded yet for ${label}.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a sports card and trading card market expert. Research and compile the TOP 100 hottest, most-traded, and highest-demand cards RIGHT NOW for the category: "${label}".

Use your knowledge of:
- Recent eBay sold listings and price trends
- 130point.com market data
- Card show floor activity
- Social media buzz and collector demand
- Rookie cards, short prints, refractors, parallels, graded copies

Origins community trade data for context:
${internalSummary}

Return a JSON array of exactly 100 cards sorted by current demand/heat (hottest first). Each card object:
{
  "rank": 1,
  "player_or_name": "Name of player or character",
  "card_name": "Full card name",
  "year": "Year",
  "set_name": "Set name",
  "card_number": "#XXX or null",
  "variant": "Base / Rookie / Refractor / PSA 10 / etc",
  "sport_or_tcg": "${label}",
  "estimated_value_low": 10,
  "estimated_value_high": 50,
  "estimated_value_avg": 30,
  "heat_score": 95,
  "why_hot": "One sentence on why this card is hot right now",
  "trend": "up" | "down" | "stable"
}`,
      add_context_from_internet: true,
      response_json_schema: {
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
                card_number: { type: 'string' },
                variant: { type: 'string' },
                sport_or_tcg: { type: 'string' },
                estimated_value_low: { type: 'number' },
                estimated_value_high: { type: 'number' },
                estimated_value_avg: { type: 'number' },
                heat_score: { type: 'number' },
                why_hot: { type: 'string' },
                trend: { type: 'string' },
              }
            }
          },
          generated_at: { type: 'string' },
          category_summary: { type: 'string' },
        }
      }
    });

    return Response.json({
      category,
      label,
      cards: result.cards || [],
      category_summary: result.category_summary || '',
      generated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('fetchTrending error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});