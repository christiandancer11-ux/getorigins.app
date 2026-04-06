import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only function
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log('Starting CardKnowledge sync from authoritative sources...');

    const sourcesData = [];

    // Source 1: Query LLM to fetch latest set info from PSA, TCGPlayer, Cardmarket, set wikis
    const setDataPrompt = `You are a sports card and TCG expert. Research and compile information about the NEWEST RELEASED CARD SETS from the last 7 days across all sports and TCG categories.

For each new set, provide:
1. Set name
2. Sport/TCG type (baseball, basketball, football, hockey, pokemon, magic_the_gathering, yugioh, etc.)
3. Release date
4. Top 5-10 rookie cards or chase cards in this set
5. For each card: card name, card number, parallels available (Refractor, Prizm, Gold, etc.), short prints (SP, SSP), case hits
6. Visual markers that identify each parallel and variant
7. Market estimates for base and parallels
8. Sources consulted (PSA, TCGPlayer, Cardmarket, set wiki)

Return a JSON object:
{
  "sets": [
    {
      "set_name": "string",
      "sport": "string",
      "release_date": "string",
      "cards": [
        {
          "card_name": "string",
          "card_number": "string",
          "parallels": [{ "name": "string", "serial": "string", "premium": number }],
          "short_prints": [{ "name": "string", "rarity": "string" }],
          "case_hits": [{ "name": "string", "rarity": "string" }],
          "visual_markers": ["string"],
          "rookie_card": boolean
        }
      ],
      "source": "string"
    }
  ]
}`;

    try {
      const setData = await base44.integrations.Core.InvokeLLM({
        prompt: setDataPrompt,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            sets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  set_name: { type: 'string' },
                  sport: { type: 'string' },
                  release_date: { type: 'string' },
                  cards: {
                    type: 'array',
                    items: { type: 'object' }
                  },
                  source: { type: 'string' }
                }
              }
            }
          }
        }
      });

      console.log('Set data retrieved:', setData.sets?.length || 0, 'sets');
      sourcesData.push({ source: 'new_set_releases', data: setData });
    } catch (e) {
      console.warn('Could not fetch new set data:', e.message);
    }

    // Source 2: Query LLM for trending/hot cards from community forums and YouTube
    const trendingPrompt = `You are a sports card and TCG researcher. Search for TRENDING CARDS and hot releases being discussed in the last 24-48 hours on:
- Reddit (r/sportscards, r/pokemoncards, r/magicTCG, r/yugioh)
- CardMarket forums
- YouTube (top sports card and TCG channels)
- 130point.com community
- eBay sold listings (hottest sellers)

For each trending card, provide:
- Card name, set, year, player/character
- Why it's trending (new player debut, set release, grading news, value spike)
- Variants being chased (parallels, short prints, autos)
- Current market price
- Community sentiment

Return a JSON object:
{
  "trending_cards": [
    {
      "card_name": "string",
      "set_name": "string",
      "year": "string",
      "sport": "string",
      "trend_reason": "string",
      "hot_variants": ["string"],
      "market_price": number,
      "sources": ["string"]
    }
  ]
}`;

    try {
      const trendingData = await base44.integrations.Core.InvokeLLM({
        prompt: trendingPrompt,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            trending_cards: {
              type: 'array',
              items: { type: 'object' }
            }
          }
        }
      });

      console.log('Trending cards retrieved:', trendingData.trending_cards?.length || 0, 'cards');
      sourcesData.push({ source: 'trending_community', data: trendingData });
    } catch (e) {
      console.warn('Could not fetch trending data:', e.message);
    }

    // Now upsert CardKnowledge records
    let upsertCount = 0;
    let skipCount = 0;

    for (const sourceItem of sourcesData) {
      const data = sourceItem.data;

      // Process new set releases
      if (sourceItem.source === 'new_set_releases' && data.sets) {
        for (const set of data.sets) {
          for (const card of set.cards || []) {
            try {
              // Check if this knowledge already exists
              const existing = await base44.asServiceRole.entities.CardKnowledge.filter({
                card_name: card.card_name,
                set_name: set.set_name,
                year: card.year || ''
              }, '-updated_date', 1);

              const knowledgeData = {
                card_name: card.card_name,
                set_name: set.set_name,
                year: card.year || new Date().getFullYear().toString(),
                sport: set.sport,
                card_number: card.card_number,
                parallels: card.parallels || [],
                short_prints: card.short_prints || [],
                case_hits: card.case_hits || [],
                key_visual_markers: card.visual_markers || [],
                rookie_card: card.rookie_card || false,
                last_updated: new Date().toISOString(),
                source: set.source || 'set_database',
                production_notes: `Released: ${set.release_date}`
              };

              if (existing.length > 0) {
                // Update existing
                await base44.asServiceRole.entities.CardKnowledge.update(existing[0].id, knowledgeData);
                skipCount++;
              } else {
                // Create new
                await base44.asServiceRole.entities.CardKnowledge.create(knowledgeData);
                upsertCount++;
              }
            } catch (e) {
              console.warn(`Could not upsert card ${card.card_name} from ${set.set_name}:`, e.message);
            }
          }
        }
      }

      // Process trending cards
      if (sourceItem.source === 'trending_community' && data.trending_cards) {
        for (const card of data.trending_cards) {
          try {
            const existing = await base44.asServiceRole.entities.CardKnowledge.filter({
              card_name: card.card_name,
              set_name: card.set_name
            }, '-updated_date', 1);

            const knowledgeData = {
              card_name: card.card_name,
              set_name: card.set_name,
              year: card.year || new Date().getFullYear().toString(),
              sport: card.sport,
              rookie_variations: card.hot_variants || [],
              last_updated: new Date().toISOString(),
              source: 'community_trending',
              production_notes: `Trending: ${card.trend_reason}. Market: $${card.market_price}`
            };

            if (existing.length > 0) {
              await base44.asServiceRole.entities.CardKnowledge.update(existing[0].id, knowledgeData);
              skipCount++;
            } else {
              await base44.asServiceRole.entities.CardKnowledge.create(knowledgeData);
              upsertCount++;
            }
          } catch (e) {
            console.warn(`Could not upsert trending card ${card.card_name}:`, e.message);
          }
        }
      }
    }

    console.log(`Sync complete. Created: ${upsertCount}, Updated: ${skipCount}`);

    return Response.json({
      success: true,
      created: upsertCount,
      updated: skipCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('syncCardKnowledge error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});