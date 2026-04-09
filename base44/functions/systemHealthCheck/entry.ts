import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ADMIN_EMAIL = 'admin@originscard.com'; // Update this to your email

const CHECKS = [
  'trendingCache',
  'marketPicks',
  'priceAlerts',
  'cardKnowledge',
  'subscriptions',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled/internal calls without user auth
    let isAdmin = false;
    try {
      const user = await base44.auth.me();
      isAdmin = user?.role === 'admin';
    } catch (_) {}

    const results = [];
    const now = new Date();

    // ── 1. Trending Cache ──────────────────────────────────────────
    try {
      const allCache = await base44.asServiceRole.entities.TrendingCache.list('-updated_date', 50);
      const freshEntries = allCache.filter(e => e.expires_at && new Date(e.expires_at) > now);
      const staleEntries = allCache.filter(e => !e.expires_at || new Date(e.expires_at) <= now);
      const EXPECTED_CATEGORIES = 16;

      if (freshEntries.length < EXPECTED_CATEGORIES) {
        results.push({
          check: 'Trending Cache',
          status: 'warning',
          message: `Only ${freshEntries.length}/${EXPECTED_CATEGORIES} categories have fresh cache. ${staleEntries.length} stale entries found.`,
        });
      } else {
        results.push({
          check: 'Trending Cache',
          status: 'ok',
          message: `${freshEntries.length} fresh cache entries across all categories.`,
        });
      }
    } catch (e) {
      results.push({ check: 'Trending Cache', status: 'error', message: e.message });
    }

    // ── 2. Market Picks ────────────────────────────────────────────
    try {
      const picks = await base44.asServiceRole.entities.MarketPick.list('-updated_date', 10);
      if (picks.length === 0) {
        results.push({ check: 'Market Picks', status: 'error', message: 'No market picks found in database.' });
      } else {
        const newest = new Date(picks[0].updated_date || picks[0].created_date);
        const ageHours = (now - newest) / (1000 * 60 * 60);
        if (ageHours > 6) {
          results.push({ check: 'Market Picks', status: 'warning', message: `Market picks are ${Math.round(ageHours)}h old (expected < 6h).` });
        } else {
          results.push({ check: 'Market Picks', status: 'ok', message: `${picks.length} picks, last updated ${Math.round(ageHours * 60)}m ago.` });
        }
      }
    } catch (e) {
      results.push({ check: 'Market Picks', status: 'error', message: e.message });
    }

    // ── 3. Price Alerts ────────────────────────────────────────────
    try {
      const alerts = await base44.asServiceRole.entities.PriceAlert.filter({ status: 'active' });
      const staleAlerts = alerts.filter(a => {
        if (!a.last_checked) return true;
        const ageHours = (now - new Date(a.last_checked)) / (1000 * 60 * 60);
        return ageHours > 5;
      });
      if (staleAlerts.length > 0) {
        results.push({ check: 'Price Alerts', status: 'warning', message: `${staleAlerts.length} active alerts haven't been checked in 5+ hours.` });
      } else {
        results.push({ check: 'Price Alerts', status: 'ok', message: `${alerts.length} active alerts, all recently checked.` });
      }
    } catch (e) {
      results.push({ check: 'Price Alerts', status: 'error', message: e.message });
    }

    // ── 4. Card Knowledge ──────────────────────────────────────────
    try {
      const knowledge = await base44.asServiceRole.entities.CardKnowledge.list('-updated_date', 5);
      if (knowledge.length === 0) {
        results.push({ check: 'Card Knowledge', status: 'warning', message: 'No CardKnowledge records found.' });
      } else {
        const newest = new Date(knowledge[0].updated_date || knowledge[0].created_date);
        const ageHours = (now - newest) / (1000 * 60 * 60);
        results.push({ check: 'Card Knowledge', status: 'ok', message: `${knowledge.length}+ records, last synced ${Math.round(ageHours)}h ago.` });
      }
    } catch (e) {
      results.push({ check: 'Card Knowledge', status: 'error', message: e.message });
    }

    // ── 5. Subscriptions ───────────────────────────────────────────
    try {
      const subs = await base44.asServiceRole.entities.UserSubscription.filter({ status: 'active' });
      results.push({ check: 'Subscriptions', status: 'ok', message: `${subs.length} active subscriptions.` });
    } catch (e) {
      results.push({ check: 'Subscriptions', status: 'error', message: e.message });
    }

    // ── Summary ────────────────────────────────────────────────────
    const errors = results.filter(r => r.status === 'error');
    const warnings = results.filter(r => r.status === 'warning');
    const allOk = errors.length === 0 && warnings.length === 0;

    console.log(`[systemHealthCheck] Results: ${results.filter(r => r.status === 'ok').length} ok, ${warnings.length} warnings, ${errors.length} errors`);
    results.forEach(r => console.log(`  [${r.status.toUpperCase()}] ${r.check}: ${r.message}`));

    // ── Email alert if anything is broken ─────────────────────────
    if (!allOk) {
      const statusEmoji = { ok: '✅', warning: '⚠️', error: '❌' };
      const rows = results.map(r => `${statusEmoji[r.status]} <strong>${r.check}</strong>: ${r.message}`).join('<br>');

      const subject = errors.length > 0
        ? `🚨 Origins System Alert — ${errors.length} error(s) detected`
        : `⚠️ Origins System Warning — ${warnings.length} warning(s) detected`;

      const body = `
<h2>Origins System Health Report</h2>
<p><strong>Time:</strong> ${now.toISOString()}</p>
<p><strong>Summary:</strong> ${errors.length} error(s), ${warnings.length} warning(s)</p>
<hr>
${rows}
<hr>
<p style="color:#888;font-size:12px;">This is an automated health check from the Origins platform. Check your automations dashboard for more details.</p>
      `.trim();

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ADMIN_EMAIL,
          subject,
          body,
        });
        console.log(`[systemHealthCheck] Alert email sent to ${ADMIN_EMAIL}`);
      } catch (emailErr) {
        console.error('[systemHealthCheck] Failed to send alert email:', emailErr.message);
      }
    } else {
      console.log('[systemHealthCheck] All systems healthy — no email sent.');
    }

    return Response.json({
      timestamp: now.toISOString(),
      overall: allOk ? 'healthy' : errors.length > 0 ? 'error' : 'warning',
      errors: errors.length,
      warnings: warnings.length,
      results,
    });

  } catch (error) {
    console.error('[systemHealthCheck] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});