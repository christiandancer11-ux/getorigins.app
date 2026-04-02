import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();
  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, Deno.env.get("STRIPE_WEBHOOK_SECRET"));
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userEmail = session.metadata?.user_email;
      if (!userEmail) return Response.json({ received: true });

      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

      const existing = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: userEmail });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, {
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: 'active',
          current_period_end: periodEnd,
        });
      } else {
        await base44.asServiceRole.entities.UserSubscription.create({
          user_email: userEmail,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: 'active',
          current_period_end: periodEnd,
        });
      }
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const existing = await base44.asServiceRole.entities.UserSubscription.filter({ stripe_subscription_id: sub.id });
      if (existing.length > 0) {
        const status = sub.status === 'active' ? 'active' : 'inactive';
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
        await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, {
          status,
          current_period_end: periodEnd,
        });
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err.message);
  }

  return Response.json({ received: true });
});