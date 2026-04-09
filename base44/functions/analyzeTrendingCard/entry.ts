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

    const tcgCategories = ['pokemon', 'magic_the_gathering', 'yugioh', 'one_piece', 'lorcana'];
    const isTCG = tcgCategories.some(t => (card.card_name || card.player_or_name || card.set_name || '').toLowerCase().includes(t.replace('_', ' ')))
      || tcgCategories.some(t => (card.set_name || '').toLowerCase().includes(t.replace('_', ' ')));

    const tcgExtra = isTCG ? `

This appears to be a TCG card. Include in your analysis:
- Current format legality: Is this card legal in Standard/Advanced/Modern? Has it been banned or restricted recently?
- Tournament performance: Has this card appeared in recent Regional, YCS, Pro Tour, or Major top 8 decklists?
- Meta relevance: Is this a staple in a current competitive archetype? Is a meta shift making it more/less relevant?
- Upcoming set impact: Does a new set release affect this card's playability or reprint risk?
- Competitive vs. collectible value: Is demand driven by players who need it to play or by collectors chasing art/rarity?
- Ban list risk: Is this card likely to be banned or limited in the next list update?
- TCGPlayer.com Market Data (REQUIRED): Check TCGPlayer.com for this card's current Market Price (weighted average of verified sales), Low Price from verified dealers, and any notable recent sales. Compare TCGPlayer Market Price to eBay comps — if they diverge significantly, explain why. Note the NM (Near Mint) TCGPlayer price as the baseline and mention if condition-graded copies command a premium.
Sources to consider: Limitless TCG, MTGGoldfish, YGOProdeck, r/PokemonTCG, r/magicTCG, r/yugioh, One Piece Card official, TCGPlayer.com.` : '';

    const prompt = `You are a sports card and trading card market expert with deep knowledge of competitive TCG play. Give a detailed analysis of why this card is currently trending based on: ${viewContext}.

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
${tcgExtra}

Provide a thorough, expert-level breakdown covering:
1. Why this card is so popular right now (be specific — mention real-world events, player performance, tournament results, ban list changes, pop reports, etc.)
2. What market forces are driving this (competitive players, investors, collectors, hype, scarcity?)
3. Recent sales context (what kinds of prices have been seen, what grades or conditions are commanding premiums? For TCG cards, explicitly cite the TCGPlayer Market Price and any notable verified dealer sales.)
4. Collector/player sentiment (is this a buy, hold, or sell right now in the community's view?)
5. Short-term outlook (next 1-4 weeks — is this momentum sustainable? Any upcoming events or releases that could move this?)

Be detailed and insightful. Use current, real-world knowledge of the hobby and competitive meta.`;

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