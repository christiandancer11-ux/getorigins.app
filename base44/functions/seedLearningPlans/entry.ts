import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BASE_PLANS = [
  {
    name: 'Pokemon TCG for Collectors',
    description: 'Learn to build and maintain a valuable Pokemon TCG collection',
    card_interests: ['pokemon'],
    use_case: 'collecting',
    category: 'tcg',
    key_topics: ['card types', 'set identification', 'grading basics', 'market values', 'storage']
  },
  {
    name: 'Sports Cards for Flippers',
    description: 'Master the art of finding undervalued sports cards and selling for profit',
    card_interests: ['baseball', 'basketball', 'football'],
    use_case: 'flipping',
    category: 'sports_cards',
    key_topics: ['market trends', 'rookie cards', 'parallel identification', 'pricing strategies', 'sealed products']
  },
  {
    name: 'Magic: The Gathering for Players',
    description: 'Build competitive Magic decks while understanding card values',
    card_interests: ['magic_the_gathering'],
    use_case: 'collecting_selling',
    category: 'tcg',
    key_topics: ['card formats', 'set rotations', 'deck building', 'market timing', 'trading']
  },
  {
    name: 'Lorcana for New Collectors',
    description: 'Start your Disney Lorcana collection with confidence',
    card_interests: ['lorcana'],
    use_case: 'collecting',
    category: 'tcg',
    key_topics: ['card types', 'set structure', 'ink costs', 'market development', 'community']
  },
  {
    name: 'Card Dealing Business',
    description: 'Build a sustainable card dealing and flipping operation',
    card_interests: ['pokemon', 'magic_the_gathering', 'sports_cards'],
    use_case: 'business',
    category: 'tcg',
    key_topics: ['sourcing inventory', 'pricing models', 'customer management', 'scaling operations', 'market analysis']
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Check if plans already exist
    const existingPlans = await base44.asServiceRole.entities.LearningPlan.list();
    
    if (existingPlans.length > 0) {
      return Response.json({ message: 'Base plans already seeded', count: existingPlans.length });
    }

    // Create base plans without lessons (AI will add them during personalization)
    const createdPlans = [];
    for (const plan of BASE_PLANS) {
      const created = await base44.asServiceRole.entities.LearningPlan.create({
        name: plan.name,
        description: plan.description,
        card_interests: plan.card_interests,
        use_case: plan.use_case,
        category: plan.category,
        lessons: [], // Empty, will be populated during personalization
        total_lessons: 0,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        next_update_date: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      });
      createdPlans.push(created);
    }

    console.log(`Seeded ${createdPlans.length} base learning plans`);
    return Response.json({ success: true, created: createdPlans.length });

  } catch (error) {
    console.error('seedLearningPlans error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});