import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Stories & videos are unlimited and free for all accounts
    return Response.json({ allowed: true, isPro: true, plan: 'free', remaining: null });
  } catch (error) {
    console.error('checkUsageLimit error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});