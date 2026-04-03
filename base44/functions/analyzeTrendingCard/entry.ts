import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const subs = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: user.email });
    const isAdmin = user.role === 'admin';
    const activeSub = subs.find(s => s.status === 'active');
    if (!isAdmin && (!activeSub || !['pro', 'expert'].includes(activeSub.plan))) {
      return Response.json({ error: 'Pro subscription required' }, { status: 403 });
    }

    const { card, viewMode = 'hottest' } = await req.json();
    if (!card) return Response.json({ error: 'Card data required' }, { status: 400 });

    const viewLabels = {
      hottest:       'overall market hotness and collector demand',
      highest_sold:  'high sale prices and big-dollar transactions',
      most_searched: 'search volume and collector interest',
      most_bought:   'purchase frequency and transaction volume',
      rising:        '48-hour price growth and rising momentum',
    };
    const viewContext = viewLabels[viewMode] || viewLabels.hottest;

    const prompt = `You are a sports card and trading card market expert. Give a detailed analysis of why this card is currently trending based on: ${viewContext}.

Card Details:
- Player/Name: ${card.player_or_name}
- Card Name: ${card.card_name || ''}
- Year: ${card.year || 'Unknown'}
- Set: ${card.set_name || 'Unknown'}
- Variant: ${card.variant || 'Base'}
- Estimated Value: $${card.estimated_value_avg || 0}
- Heat Score: ${card.heat_score}/100
- Market Trend: ${card.trend}
- Why Hot (brief): ${card.why_hot}
- Rank: #${card.rank} in current trending list

Provide a thorough, expert-level breakdown covering:
1. Why this card is so popular right now (be specific — mention real-world events, player performance, pop reports, etc.)
2. What market forces are driving this (investors, collectors, hype, scarcity?)
3. Recent sales context (what kinds of prices have been seen, what grades are commanding premiums?)
4. Collector sentiment (is this a buy, hold, or sell right now in the community's view?)
5. Short-term outlook (next 1-4 weeks — is this momentum sustainable?)

Be detailed and insightful. Use current knowledge of the hobby market.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          popularity_reason:    { type: 'string' },
          market_drivers:       { type: 'string' },
          recent_sales_context: { type: 'string' },
          collector_sentiment:  { type: 'string' },
          short_term_outlook:   { type: 'string' },
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('analyzeTrendingCard error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});