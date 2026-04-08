import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const USE_CASE_DESCRIPTIONS = {
  collecting: 'Focus on building a valuable collection for personal enjoyment',
  collecting_selling: 'Balance collecting with occasional sales of duplicates and lower-priority cards',
  flipping: 'Buy undervalued cards and sell them for profit',
  business: 'Start a full-scale card dealing and flipping operation'
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { card_interests, use_case } = await req.json();

    if (!card_interests || card_interests.length === 0 || !use_case) {
      return Response.json({ error: 'Missing card_interests or use_case' }, { status: 400 });
    }

    // Determine if sports cards or TCG
    const sportsCards = ['baseball', 'basketball', 'football', 'hockey', 'soccer', 'golf', 'ufc', 'wwe'];
    const tcgCards = ['pokemon', 'magic_the_gathering', 'yugioh', 'one_piece', 'lorcana'];
    
    const category = card_interests.some(c => sportsCards.includes(c)) ? 'sports_cards' : 'tcg';
    const isPrimarySports = category === 'sports_cards';

    // Generate structured learning plan via LLM
    const prompt = `You are an expert card collector and educator. Create a learning plan for someone interested in ${card_interests.join(', ')} for: ${USE_CASE_DESCRIPTIONS[use_case]}

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

    IMPORTANT: Keep content kid-friendly (ages 8+). Include only verified kid-safe resources with URLs.

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

    if (!planData.plan || !planData.plan.lessons) {
      throw new Error('Invalid plan structure from LLM');
    }

    // Store the plan with 3-month update schedule
    const now = new Date();
    const nextUpdateDate = new Date(now.getTime() + 3 * 30 * 24 * 60 * 60 * 1000); // Approximately 3 months
    
    const savedPlan = await base44.asServiceRole.entities.LearningPlan.create({
      name: planData.plan.name,
      description: planData.plan.description,
      card_interests,
      use_case,
      category,
      lessons: planData.plan.lessons,
      total_lessons: planData.plan.lessons.length,
      created_at: now.toISOString(),
      last_updated: now.toISOString(),
      next_update_date: nextUpdateDate.toISOString(),
      is_active: true
    });

    console.log(`Created learning plan: ${savedPlan.id} for ${card_interests.join(', ')}`);

    return Response.json(savedPlan);

  } catch (error) {
    console.error('generateLearningPlan error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});