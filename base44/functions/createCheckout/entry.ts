import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

const PRICES = {
  stories: "price_1THrj4LrQAPNF8DfzUUNrRX5", // $3.99/mo
  pro:     "price_1THrhNLrQAPNF8DfX0HRbkgA", // $7.99/mo
  expert:  "price_1THs5qLrQAPNF8DfjWHXluli", // $14.99/mo
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { successUrl, cancelUrl, plan = 'stories', couponId, trialDays } = await req.json();
    const priceId = PRICES[plan] || PRICES.stories;

    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_email: user.email,
        plan,
      },
    };

    // Apply creator coupon if provided
    if (couponId) {
      sessionParams.discounts = [{ coupon: couponId }];
    }

    // Apply trial if requested (and no coupon — Stripe doesn't allow both)
    if (trialDays && !couponId) {
      sessionParams.subscription_data = { trial_period_days: trialDays };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('createCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});