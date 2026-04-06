import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CATEGORIES = [
  'football', 'baseball', 'basketball', 'soccer', 'hockey', 'golf', 'ufc', 'wwe', 'f1',
  'ncaa_football', 'ncaa_basketball', 'ncaa_baseball',
  'pokemon', 'one_piece', 'mtg', 'yugioh'
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // Allow execution by admin or internal automation
    if (!user?.role || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log(`[preCacheTrending] Starting cache population at ${new Date().toISOString()}`);

    const results = [];
    const startTime = Date.now();

    for (const category of CATEGORIES) {
      try {
        const categoryStart = Date.now();
        const res = await base44.asServiceRole.functions.invoke('fetchTrending', {
          category,
          limit: 15,
          viewMode: 'hottest'
        });
        const elapsed = Date.now() - categoryStart;
        results.push({ category, status: 'success', elapsed });
        console.log(`✓ Cached ${category} in ${elapsed}ms`);
      } catch (err) {
        results.push({ category, status: 'error', message: err.message });
        console.error(`✗ Failed to cache ${category}:`, err.message);
      }
    }

    const totalElapsed = Date.now() - startTime;
    console.log(`[preCacheTrending] Completed in ${totalElapsed}ms`);

    return Response.json({
      message: `Pre-cached ${CATEGORIES.length} categories`,
      total_ms: totalElapsed,
      results,
      cached_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('[preCacheTrending] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});