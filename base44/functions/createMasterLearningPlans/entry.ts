import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const SPORTS_CARDS_INFO = {
  baseball: { name: 'Baseball', icon: '⚾', desc: 'Learn about rookie cards, grading, and market trends in baseball card collecting.' },
  basketball: { name: 'Basketball', icon: '🏀', desc: 'Master NBA card values, modern vs vintage, and spotting valuable parallels.' },
  football: { name: 'Football', icon: '🏈', desc: 'Understand NFL card rarities, autograph values, and set variations.' },
  hockey: { name: 'Hockey', icon: '🏒', desc: 'Explore NHL card collecting, rookie sensations, and vintage market opportunities.' },
  soccer: { name: 'Soccer', icon: '⚽', desc: 'Discover international player cards and emerging market trends.' },
  golf: { name: 'Golf', icon: '⛳', desc: 'Learn about golf card rarity and collector demand.' },
  ufc: { name: 'UFC', icon: '🥊', desc: 'Understand MMA fighter card values and market dynamics.' },
  wwe: { name: 'WWE', icon: '🎭', desc: 'Explore wrestling card collectibles and signature variants.' }
};

const TCG_INFO = {
  pokemon: { name: 'Pokémon', icon: '🔴', desc: 'Master base set values, holographics, and modern set collecting.' },
  magic_the_gathering: { name: 'Magic: The Gathering', icon: '✨', desc: 'Learn about card rarity, power level, and vintage market trends.' },
  yugioh: { name: 'Yu-Gi-Oh!', icon: '⚡', desc: 'Understand deck viability, secret rares, and competitive card values.' },
  one_piece: { name: 'One Piece', icon: '🏴‍☠️', desc: 'Explore emerging TCG market and collector demand.' },
  lorcana: { name: 'Disney Lorcana', icon: '👑', desc: 'Learn about new set releases and character rarity tiers.' }
};

const MASTER_LESSON_TEMPLATE = (category, cardTypes) => ({
  lesson_number: 1,
  title: `Complete ${category} Card Collecting Guide`,
  description: `Master all major ${category.toLowerCase()} types and their unique characteristics.`,
  content: `# Your ${category} Card Education

Welcome! This comprehensive guide covers all major ${category} types supported on Origins. Each card type has unique market dynamics, grading standards, and collecting strategies.

## Card Types You'll Learn About

${cardTypes.map((ct, i) => `
### ${i + 1}. ${ct.name} (${ct.icon})
${ct.desc}

**Key Topics:**
- Market values and trends
- Grading and condition factors
- Rare variations and parallels
- Collector demand patterns
- Where to buy and sell

`).join('\n')}

## Getting Started
1. Explore each card type section
2. Track cards you're interested in using Origins Watchlist
3. Set price alerts for opportunities
4. Log your trades and sales to build data

## Your Learning Path
As you explore Origins' features, you'll naturally learn about each card type. Use the practical exercises below to apply your knowledge.`,
  key_takeaways: [
    `Understand the unique characteristics of each ${category} type`,
    'Learn market dynamics and collector preferences',
    'Develop a strategy based on your collecting goals',
    'Use Origins tools to research and track opportunities'
  ],
  learning_resources: [
    {
      title: 'Origins Watchlist Feature',
      url: '#/watchlist',
      type: 'tool',
      platform: 'origins'
    },
    {
      title: 'Origins Market Value Tool',
      url: '#/market',
      type: 'tool',
      platform: 'origins'
    },
    {
      title: 'Trending Cards & Market Insights',
      url: '#/trending',
      type: 'tool',
      platform: 'origins'
    }
  ],
  practical_exercise: `Create a collection in Origins and add 5-10 cards you own or are interested in. Use the Watchlist feature to track similar cards and observe price trends over time.`,
  origins_feature_integration: `Use Origins' Market Value tool to research card values, Watchlist to track cards of interest, and the Trading Dashboard to log real transactions and build your market knowledge.`
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Delete existing master plans
    const existing = await base44.asServiceRole.entities.LearningPlan.list();
    for (const plan of existing) {
      if (plan.name.includes('Master')) {
        await base44.asServiceRole.entities.LearningPlan.delete(plan.id);
      }
    }

    // Create Sports Cards Master Plan
    const sportTypes = Object.values(SPORTS_CARDS_INFO);
    const sportPlan = await base44.asServiceRole.entities.LearningPlan.create({
      name: 'Sports Cards Collector Mastery',
      description: 'Complete guide to all sports card types: Baseball, Basketball, Football, Hockey, Soccer, Golf, UFC, and WWE.',
      card_interests: Object.keys(SPORTS_CARDS_INFO),
      use_case: 'collecting',
      category: 'sports_cards',
      lessons: [MASTER_LESSON_TEMPLATE('Sports Cards', sportTypes)],
      total_lessons: 1,
      is_active: true
    });

    // Create TCG Master Plan
    const tcgTypes = Object.values(TCG_INFO);
    const tcgPlan = await base44.asServiceRole.entities.LearningPlan.create({
      name: 'Trading Card Games Mastery',
      description: 'Complete guide to all TCGs: Pokémon, Magic: The Gathering, Yu-Gi-Oh!, One Piece, and Lorcana.',
      card_interests: Object.keys(TCG_INFO),
      use_case: 'collecting',
      category: 'tcg',
      lessons: [MASTER_LESSON_TEMPLATE('Trading Card Games', tcgTypes)],
      total_lessons: 1,
      is_active: true
    });

    return Response.json({
      success: true,
      sports_plan_id: sportPlan.id,
      tcg_plan_id: tcgPlan.id
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});