import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CARD_TYPES = [
  'pokemon', 'magic_the_gathering', 'yugioh', 'lorcana', 'one_piece',
  'baseball', 'basketball', 'football', 'hockey', 'soccer', 'golf', 'ufc', 'wwe'
];

const USE_CASES = ['collecting', 'collecting_selling', 'flipping', 'business'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { card_type, use_case } = await req.json();

    if (!card_type || !use_case) {
      return Response.json({ 
        error: 'Missing card_type or use_case',
        availableCardTypes: CARD_TYPES,
        availableUseCases: USE_CASES
      }, { status: 400 });
    }

    if (!CARD_TYPES.includes(card_type) || !USE_CASES.includes(use_case)) {
      return Response.json({ 
        error: 'Invalid card_type or use_case',
        availableCardTypes: CARD_TYPES,
        availableUseCases: USE_CASES
      }, { status: 400 });
    }

    // Check if already exists
    const existing = await base44.asServiceRole.entities.LearningPlan.filter({
      card_interests: [card_type],
      use_case: use_case
    });

    if (existing.length > 0) {
      return Response.json({ 
        message: 'Plan already exists',
        plan: existing[0]
      });
    }

    const sportsCards = ['baseball', 'basketball', 'football', 'hockey', 'soccer', 'golf', 'ufc', 'wwe'];
    const category = sportsCards.includes(card_type) ? 'sports_cards' : 'tcg';

    const USE_CASE_DESCRIPTIONS = {
      collecting: 'Focus on building a valuable collection for personal enjoyment',
      collecting_selling: 'Balance collecting with occasional sales of duplicates',
      flipping: 'Buy undervalued cards and sell them for profit',
      business: 'Start a full-scale card dealing operation'
    };

    const prompt = `You are an expert card collector and educator. Create a learning plan for someone interested in ${card_type} for: ${USE_CASE_DESCRIPTIONS[use_case]}

Generate exactly 15 lessons covering: card types, market basics, buying, grading, selling, and community.

For EACH lesson provide:
- lesson_number (1-15)
- title (concise)
- description (1 sentence)
- content (2-3 paragraphs of markdown - practical advice)
- key_takeaways (3-4 bullet points)
- learning_resources (3-5 resources with title, url, type, platform)
- practical_exercise (what to do)
- origins_feature_integration (how to use Origins)

Keep content kid-friendly (ages 8+). Include only verified kid-safe resources with URLs.

Return valid JSON:
{
  "plan": {
    "name": "string",
    "description": "string",
    "lessons": [
      {
        "lesson_number": number,
        "title": "string",
        "description": "string",
        "content": "string",
        "key_takeaways": ["string"],
        "learning_resources": [
          {
            "title": "string",
            "url": "string",
            "type": "article|video|guide|reddit|tool",
            "platform": "string"
          }
        ],
        "practical_exercise": "string",
        "origins_feature_integration": "string"
      }
    ]
  }
}`;

    console.log(`Generating ${card_type} - ${use_case}...`);

    const planData = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          plan: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              lessons: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    lesson_number: { type: 'number' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    content: { type: 'string' },
                    key_takeaways: { type: 'array', items: { type: 'string' } },
                    learning_resources: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title: { type: 'string' },
                          url: { type: 'string' },
                          type: { type: 'string' },
                          platform: { type: 'string' }
                        }
                      }
                    },
                    practical_exercise: { type: 'string' },
                    origins_feature_integration: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!planData.plan || !planData.plan.lessons || planData.plan.lessons.length === 0) {
      throw new Error('Invalid plan structure from LLM');
    }

    const now = new Date();
    const nextUpdateDate = new Date(now.getTime() + 3 * 30 * 24 * 60 * 60 * 1000);

    const savedPlan = await base44.asServiceRole.entities.LearningPlan.create({
      name: planData.plan.name,
      description: planData.plan.description,
      card_interests: [card_type],
      use_case: use_case,
      category,
      lessons: planData.plan.lessons,
      total_lessons: planData.plan.lessons.length,
      created_at: now.toISOString(),
      last_updated: now.toISOString(),
      next_update_date: nextUpdateDate.toISOString(),
      is_active: true
    });

    console.log(`✓ Created plan: ${savedPlan.id} with ${savedPlan.total_lessons} lessons`);

    return Response.json({
      success: true,
      plan_id: savedPlan.id,
      name: savedPlan.name,
      total_lessons: savedPlan.total_lessons
    });

  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});