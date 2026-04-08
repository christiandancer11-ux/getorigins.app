import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { base_plan_id, card_interests, use_case } = await req.json();

    if (!base_plan_id || !card_interests || !use_case) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Load the base plan
    const basePlans = await base44.asServiceRole.entities.LearningPlan.filter({
      id: base_plan_id
    });

    if (basePlans.length === 0) {
      return Response.json({ error: 'Base plan not found' }, { status: 404 });
    }

    const basePlan = basePlans[0];

    // Generate personalized lessons via AI
    const prompt = `You are an expert card collecting educator. Using this base learning framework, generate a personalized 15-lesson plan.

Base Plan: ${basePlan.name}
Card Interests: ${card_interests.join(', ')}
Use Case: ${use_case}

Create exactly 15 lessons covering:
1. Card Types & Variations
2. Market Basics & Pricing
3. Buying Strategies
4. Grading Fundamentals
5. Selling & Flipping
6. Community & Resources

For each lesson provide:
- Clear, beginner-friendly content
- 3-5 key takeaways
- 5-8 kid-friendly learning resources with URLs
- Practical exercise
- How to use Origins features

Return valid JSON:
{
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
}`;

    const lessonData = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_1_pro',
      response_json_schema: {
        type: 'object',
        properties: {
          lessons: {
            type: 'array',
            items: { type: 'object' }
          }
        }
      }
    });

    // Create personalized plan
    const personalizedPlan = await base44.asServiceRole.entities.LearningPlan.create({
      name: basePlan.name,
      description: basePlan.description,
      card_interests,
      use_case,
      category: basePlan.category,
      lessons: lessonData.lessons,
      total_lessons: lessonData.lessons.length,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      next_update_date: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    });

    return Response.json(personalizedPlan);

  } catch (error) {
    console.error('personalizeLearningPlan error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});