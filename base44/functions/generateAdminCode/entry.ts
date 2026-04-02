import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function randomCode(prefix = 'GIFT') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = prefix + '-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { type = 'admin_gift', count = 1, notes = '', max_uses = 1 } = await req.json();

    const created = [];
    for (let i = 0; i < Math.min(count, 50); i++) {
      const prefix = type === 'admin_gift' ? 'GIFT' : type === 'creator' ? 'CREATOR' : 'REF';
      const code = randomCode(prefix);
      const promo = await base44.asServiceRole.entities.PromoCode.create({
        code, type, max_uses, use_count: 0, is_active: true, notes,
      });
      created.push({ code, id: promo.id });
    }

    return Response.json({ success: true, codes: created });
  } catch (error) {
    console.error('generateAdminCode error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});