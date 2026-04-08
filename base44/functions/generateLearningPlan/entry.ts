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
    const prompt = `You are an expert card collector and educator. Create a comprehensive, personalized learning plan for someone interested in ${card_interests.join(', ')}.

Use Case: ${USE_CASE_DESCRIPTIONS[use_case]}

Create a lesson plan with exactly 15 lessons that covers:
1. Card Types & Variations (what makes cards valuable)
2. Market Basics (how to read pricing, understand trends)
3. Buying Strategies (where and when to buy)
4. Grading Fundamentals (when and why to grade)
5. Selling & Flipping (pricing, platforms, logistics)
6. Community & Resources (top creators, communities)

For each lesson, provide:
- Clear, actionable content written for beginners
- 3-5 key takeaways
- 5-10 relevant learning resources (YouTube, Reddit, websites, TikTok creators)
- A practical exercise they can do
- How to use Origins features to practice

Focus on ${isPrimarySports ? 'sports cards' : 'TCG'} specific knowledge.

Return as valid JSON object with:
{
  "plan": {
    "name": string,
    "description": string,
    "lessons": [
      {
        "lesson_number": number,
        "title": string,
        "description": string,
        "content": string (markdown),
        "key_takeaways": [string],
        "learning_resources": [
          {
            "title": string,
            "url": string,
            "type": "article|video|guide|reddit|tool",
            "platform": string
          }
        ],
        "practical_exercise": string,
        "origins_feature_integration": string
      }
    ]
  }
}`;

    const planData = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gpt_5', // Higher quality for structured learning content
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
                  type: 'object'
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

    // Store the plan
    const savedPlan = await base44.asServiceRole.entities.LearningPlan.create({
      name: planData.plan.name,
      description: planData.plan.description,
      card_interests,
      use_case,
      category,
      lessons: planData.plan.lessons,
      total_lessons: planData.plan.lessons.length,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      is_active: true
    });

    console.log(`Created learning plan: ${savedPlan.id} for ${card_interests.join(', ')}`);

    return Response.json(savedPlan);

  } catch (error) {
    console.error('generateLearningPlan error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});