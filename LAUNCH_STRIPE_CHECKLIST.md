# Stripe Launch Checklist

## 1. Environment setup
- [ ] Set `STRIPE_SECRET_KEY` in Supabase edge function environment
- [ ] Set `STRIPE_PRICE_PRO_MONTHLY` in Supabase edge function environment
- [ ] Set `STRIPE_PRICE_PRO_YEARLY` in Supabase edge function environment
- [ ] Set `SITE_URL` in Supabase edge function environment
- [ ] Set `VITE_STRIPE_FUNCTIONS_URL` in frontend deployment env
- [ ] Set `VITE_SUPABASE_URL` in frontend deployment env
- [ ] Set `VITE_SUPABASE_PUBLISHABLE_KEY` in frontend deployment env
- [ ] After webhook creation, set `STRIPE_WEBHOOK_SECRET` in Supabase edge function env

## 2. Stripe dashboard setup
- [ ] In Stripe test mode, create product `Origins Pro`
- [ ] Add recurring price: `14.99 USD / month`
- [ ] Add recurring price: `149.99 USD / year`
- [ ] Copy `price_...` ID for monthly into `STRIPE_PRICE_PRO_MONTHLY`
- [ ] Copy `price_...` ID for yearly into `STRIPE_PRICE_PRO_YEARLY`

## 3. Webhook setup
- [ ] Deploy Supabase functions and confirm base URL: `https://<project>.supabase.co/functions/v1`
- [ ] Register webhook endpoint: `https://<project>.supabase.co/functions/v1/stripeWebhook`
- [ ] Subscribe to event `checkout.session.completed`
- [ ] Subscribe to event `customer.subscription.updated`
- [ ] Subscribe to event `customer.subscription.deleted`
- [ ] Copy webhook secret into `STRIPE_WEBHOOK_SECRET`

## 4. App test flow
- [ ] Sign in as a test user
- [ ] Open the pricing page in the app
- [ ] Select monthly or yearly plan
- [ ] Click `Subscribe now`
- [ ] Complete Stripe Checkout with test card `4242 4242 4242 4242`
- [ ] Confirm Stripe checkout completes successfully

## 5. Verification in Supabase
- [ ] Confirm webhook delivery succeeded in Stripe Dashboard
- [ ] Confirm `user_subscriptions` row exists for the test user
- [ ] Confirm row contains `stripe_customer_id`
- [ ] Confirm row contains `stripe_subscription_id`
- [ ] Confirm row contains `plan = pro`
- [ ] Confirm row contains `status = active`
- [ ] Confirm row contains `current_period_end`

## 6. Billing portal test
- [ ] From pricing page, click `Manage billing`
- [ ] Confirm redirect to Stripe Billing Portal
- [ ] Confirm portal loads for the same customer

## 7. Cancellation test
- [ ] Cancel subscription in Stripe Billing Portal
- [ ] Confirm Stripe sends `customer.subscription.updated` or `customer.subscription.deleted`
- [ ] Confirm `user_subscriptions.status` is updated to `inactive`
- [ ] Confirm the app no longer shows Pro access for the user

## 8. Duplicate checkout prevention test
- [ ] With an active Pro subscription, return to the pricing page
- [ ] Attempt to start a new checkout
- [ ] Confirm the app does not create a second Stripe checkout session
- [ ] Confirm the app redirects to billing portal or shows the active subscription warning
- [ ] Confirm Stripe does not create a second active subscription

## Next recommended task
- After Stripe test passes, implement a minimal subscription admin control tool.
- The admin tool should let an internal operator:
  - search a user by email or user id
  - view the current `user_subscriptions` row
  - set `plan` to `free` or `pro`
  - set `status` to `active` or `inactive`
  - inspect `stripe_customer_id` and `stripe_subscription_id`
- Restrict access clearly to admin-only users.
- Do not build advanced admin tooling yet.
