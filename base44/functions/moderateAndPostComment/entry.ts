import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { trade_id, text } = await req.json();
  if (!trade_id || !text?.trim()) {
    return Response.json({ error: 'trade_id and text are required' }, { status: 400 });
  }

  // AI moderation
  const modResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a content moderator for a sports card trading community. Review the following comment and determine if it is appropriate for a family-friendly platform.

Comment: "${text.trim()}"

Reject the comment if it contains:
- Profanity or vulgar language
- Hate speech or slurs
- Personal attacks or harassment
- Spam or promotional content

Respond with ONLY a JSON object: { "approved": true/false, "reason": "brief reason if rejected" }`,
    response_json_schema: {
      type: "object",
      properties: {
        approved: { type: "boolean" },
        reason: { type: "string" }
      },
      required: ["approved"]
    }
  });

  if (!modResult.approved) {
    return Response.json({
      approved: false,
      reason: modResult.reason || 'Comment did not pass moderation.'
    });
  }

  // Save approved comment
  const comment = await base44.asServiceRole.entities.TradeComment.create({
    trade_id,
    user_email: user.email,
    user_name: user.full_name || user.email.split('@')[0],
    text: text.trim(),
    status: 'approved'
  });

  return Response.json({ approved: true, comment });
});