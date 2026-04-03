import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { image_urls } = await req.json();
    if (!image_urls || image_urls.length === 0) {
      return Response.json({ cert_numbers: '' });
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze these trading card images. Extract ALL PSA, BGS, SGC, or other grading company certification numbers you can see. 
These are typically labeled as "Cert No.", "Cert #", or long numeric strings on the label of a graded slab.
Return JSON: { "cert_numbers": ["12345678", "87654321"] } — return an empty array if none found.`,
      file_urls: image_urls,
      response_json_schema: {
        type: 'object',
        properties: {
          cert_numbers: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    const formatted = (result.cert_numbers || []).join('\n');
    return Response.json({ cert_numbers: formatted });
  } catch (error) {
    console.error('extractSlabCerts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});