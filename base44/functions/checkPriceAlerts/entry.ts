import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both scheduled (service role) and admin manual runs
    let isAuthorized = false;
    try {
      const user = await base44.auth.me();
      if (user?.role === 'admin') isAuthorized = true;
    } catch (_) {
      // Called from scheduler without user — use service role
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all active alerts
    const alerts = await base44.asServiceRole.entities.PriceAlert.filter({ status: 'active' });

    if (alerts.length === 0) {
      return Response.json({ message: 'No active alerts', checked: 0, triggered: 0 });
    }

    let triggered = 0;
    let checked = 0;

    // Process each alert
    await Promise.all(alerts.map(async (alert) => {
      try {
        // Look up current market price via LLM + internet
        const cardQuery = [alert.card_name, alert.year, alert.set_name, alert.variant].filter(Boolean).join(' ');
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `What is the current average sold price on eBay for this sports card: "${cardQuery}"? Return only a JSON object with a single field "price" containing the estimated average sale price as a number (no dollar sign). If you cannot find reliable data, return {"price": null}.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: { price: { type: 'number' } }
          }
        });

        const currentPrice = result?.price ?? null;

        // Update last_checked and current_price
        await base44.asServiceRole.entities.PriceAlert.update(alert.id, {
          last_checked: new Date().toISOString(),
          current_price: currentPrice ?? alert.current_price,
        });

        checked++;

        if (currentPrice === null) return;

        // Check if alert condition is met
        const conditionMet =
          (alert.alert_type === 'buy_below' && currentPrice <= alert.target_price) ||
          (alert.alert_type === 'sell_above' && currentPrice >= alert.target_price);

        if (!conditionMet) return;

        // Mark as triggered
        await base44.asServiceRole.entities.PriceAlert.update(alert.id, {
          status: 'triggered',
          triggered_at: new Date().toISOString(),
          current_price: currentPrice,
        });

        triggered++;

        // Send email if opted in
        if (alert.notify_email && alert.user_email) {
          const actionLabel = alert.alert_type === 'buy_below' ? 'Buy Alert — Price Target Reached' : 'Sell Alert — Price Target Reached';
          const direction = alert.alert_type === 'buy_below'
            ? `dropped to $${currentPrice.toLocaleString()} (your target: ≤ $${alert.target_price.toLocaleString()})`
            : `rose to $${currentPrice.toLocaleString()} (your target: ≥ $${alert.target_price.toLocaleString()})`;

          const cardLabel = [alert.card_name, alert.year, alert.set_name, alert.variant].filter(Boolean).join(' ');

          await base44.asServiceRole.integrations.Core.SendEmail({
            to: alert.user_email,
            subject: `🔔 Origins Alert: ${alert.card_name} — ${actionLabel}`,
            body: `
Hi there,

Your price alert for <strong>${cardLabel}</strong> has been triggered!

The market price has ${direction}.

<strong>Alert type:</strong> ${alert.alert_type === 'buy_below' ? '🟢 Buy Below' : '🔴 Sell Above'}<br/>
<strong>Current price:</strong> $${currentPrice.toLocaleString()}<br/>
<strong>Your target:</strong> $${alert.target_price.toLocaleString()}<br/>
${alert.notes ? `<strong>Your notes:</strong> ${alert.notes}<br/>` : ''}

Log in to Origins to manage your alerts or log a trade.

— The Origins Team
            `.trim(),
          });
        }
      } catch (err) {
        console.error(`Failed to check alert ${alert.id}:`, err.message);
      }
    }));

    return Response.json({ message: 'Done', checked, triggered });
  } catch (error) {
    console.error('checkPriceAlerts error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});