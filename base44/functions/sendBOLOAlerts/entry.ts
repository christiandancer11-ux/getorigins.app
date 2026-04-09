import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Haversine distance in miles
function distanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { bolo_id } = await req.json();
    if (!bolo_id) return Response.json({ error: 'bolo_id required' }, { status: 400 });

    // Load the BOLO alert
    const alerts = await base44.asServiceRole.entities.BOLOAlert.filter({ id: bolo_id });
    const alert = alerts[0];
    if (!alert) return Response.json({ error: 'Alert not found' }, { status: 404 });

    // Load all user locations
    const locations = await base44.asServiceRole.entities.UserLocation.list();

    // Find users within 10 miles
    const nearby = locations.filter(loc => {
      if (!loc.bolo_notifications_enabled) return false;
      const dist = distanceMiles(alert.location_lat, alert.location_lng, loc.lat, loc.lng);
      return dist <= 10;
    });

    console.log(`Found ${nearby.length} users within 10 miles of incident`);

    const incidentLabels = {
      stolen_at_show: 'stolen at a card show',
      shop_break_in: 'taken in a shop break-in',
      other: 'reported stolen',
    };

    let sent = 0;
    for (const loc of nearby) {
      const imagesHtml = (alert.image_urls || []).slice(0, 6).map(url =>
        `<img src="${url}" style="width:150px;height:auto;border-radius:8px;margin:4px;" />`
      ).join('');

      const body = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f1117;color:#f0ede8;padding:24px;border-radius:12px;">
  <div style="background:#dc2626;color:#fff;padding:12px 18px;border-radius:8px;margin-bottom:20px;display:flex;align-items:center;gap:10px;">
    <span style="font-size:22px;">🚨</span>
    <span style="font-size:18px;font-weight:bold;">BOLO — Stolen Cards Alert</span>
  </div>

  <p style="color:#a0a0b0;margin-bottom:4px;">Cards were <strong style="color:#f0ede8;">${incidentLabels[alert.incident_type] || 'reported stolen'}</strong> near your location.</p>
  <p style="color:#a0a0b0;margin-bottom:20px;">Reported by: <strong style="color:#f0ede8;">${alert.reporter_name || alert.reporter_email}</strong> (${alert.reporter_type === 'card_show_dealer' ? 'Certified Card Show Dealer' : 'Certified Card Shop Owner'})</p>

  <div style="background:#1a1d27;border:1px solid #2a2d3a;border-radius:8px;padding:16px;margin-bottom:16px;">
    <p style="margin:0 0 6px;font-size:13px;color:#a0a0b0;text-transform:uppercase;letter-spacing:.05em;">Incident Location</p>
    <p style="margin:0;font-size:16px;font-weight:600;">${alert.location_name || 'Unknown location'}</p>
    ${alert.incident_date ? `<p style="margin:4px 0 0;font-size:13px;color:#a0a0b0;">${new Date(alert.incident_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>` : ''}
  </div>

  <div style="background:#1a1d27;border:1px solid #2a2d3a;border-radius:8px;padding:16px;margin-bottom:16px;">
    <p style="margin:0 0 8px;font-size:13px;color:#a0a0b0;text-transform:uppercase;letter-spacing:.05em;">Stolen Cards</p>
    <p style="margin:0;font-size:14px;white-space:pre-line;">${alert.card_list}</p>
    <p style="margin:10px 0 0;font-size:15px;font-weight:700;color:#e8a020;">Total Value: $${(alert.total_value || 0).toLocaleString()}</p>
  </div>

  ${alert.slab_cert_numbers ? `
  <div style="background:#1a1d27;border:1px solid #2a2d3a;border-radius:8px;padding:16px;margin-bottom:16px;">
    <p style="margin:0 0 8px;font-size:13px;color:#a0a0b0;text-transform:uppercase;letter-spacing:.05em;">Slab Cert Numbers</p>
    <p style="margin:0;font-size:13px;font-family:monospace;white-space:pre-line;">${alert.slab_cert_numbers}</p>
  </div>` : ''}

  ${alert.suspect_description ? `
  <div style="background:#2a1010;border:1px solid #5a2020;border-radius:8px;padding:16px;margin-bottom:16px;">
    <p style="margin:0 0 8px;font-size:13px;color:#f87171;text-transform:uppercase;letter-spacing:.05em;">Suspect Description</p>
    <p style="margin:0;font-size:14px;">${alert.suspect_description}</p>
  </div>` : ''}

  ${imagesHtml ? `
  <div style="margin-bottom:16px;">
    <p style="margin:0 0 8px;font-size:13px;color:#a0a0b0;text-transform:uppercase;letter-spacing:.05em;">Card Photos</p>
    <div>${imagesHtml}</div>
  </div>` : ''}

  <p style="font-size:13px;color:#a0a0b0;">If you see any of these cards being sold, please contact the original owner or local authorities. Do not attempt to confront anyone yourself.</p>

  <p style="font-size:11px;color:#606070;margin-top:24px;">You received this alert because you're within 10 miles of the incident and have BOLO notifications enabled in Origins. To unsubscribe, update your notification settings in your profile.</p>
</div>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: loc.user_email,
        subject: `🚨 BOLO Alert — Stolen Cards Near You ($${(alert.total_value || 0).toLocaleString()})`,
        body,
      });
      sent++;
    }

    // Update sent count
    await base44.asServiceRole.entities.BOLOAlert.update(bolo_id, { notifications_sent: sent });

    return Response.json({ success: true, notifications_sent: sent });
  } catch (error) {
    console.error('sendBOLOAlerts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});