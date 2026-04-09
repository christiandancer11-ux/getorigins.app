import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all plans
    const allPlans = await base44.asServiceRole.entities.LearningPlan.list();

    let deleted = 0;
    for (const plan of allPlans) {
      // Check if any lesson has null values
      const hasNullLessons = plan.lessons.some(lesson => 
        !lesson.title || !lesson.content || !lesson.lesson_number
      );

      if (hasNullLessons) {
        await base44.asServiceRole.entities.LearningPlan.delete(plan.id);
        deleted++;
        console.log(`Deleted bad plan: ${plan.id}`);
      }
    }

    return Response.json({
      success: true,
      deleted,
      total: allPlans.length
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});