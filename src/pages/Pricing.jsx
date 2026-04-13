import React, { useState } from 'react';
import { CheckCircle, Sparkles, ArrowRight, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { createCheckoutSession, createBillingPortalSession } from '@/api/stripe';

const plans = [
  {
    id: 'monthly',
    title: 'Pro Monthly',
    price: '$14.99',
    cadence: '/month',
    description: 'Flexible monthly payments with full access.',
  },
  {
    id: 'yearly',
    title: 'Pro Yearly',
    price: '$149.99',
    cadence: '/year',
    description: 'Best value — save on annual billing.',
  },
]

const features = [
  'Unlimited story messages & videos per day',
  'AI-powered card grading and market value insights',
  'Trade logs, market trends, and top 100 hot card tracker',
  'Live pricing across eBay, 130point and Origins sources',
  'Advanced card flipper analysis and value-builder tools',
]

export default function Pricing() {
  const subscription = useSubscription()
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCheckout = async (plan) => {
    setLoading(true)
    setError(null)

    const { data, error: checkoutError } = await createCheckoutSession({ plan })
    if (checkoutError) {
      setError(checkoutError.message)
      setLoading(false)
      return
    }

    if (data?.alreadySubscribed) {
      setError('You already have an active Origins Pro subscription. Redirecting to billing portal...')
      setLoading(false)
      await handleManageBilling()
      return
    }

    if (data?.url) {
      window.location.href = data.url
      return
    }

    setError('Unable to begin checkout. Please try again.')
    setLoading(false)
  }

  const handleManageBilling = async () => {
    setPortalLoading(true)
    setError(null)

    const { data, error: portalError } = await createBillingPortalSession()
    if (portalError) {
      setError(portalError.message)
      setPortalLoading(false)
      return
    }

    if (data?.url) {
      window.location.href = data.url
      return
    }

    setError('Unable to open billing portal.')
    setPortalLoading(false)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-10 text-center">
        <Sparkles className="mx-auto mb-4 h-10 w-10 text-amber-400" />
        <h1 className="text-3xl font-bold tracking-tight">Choose your plan</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          Upgrade to Origins Pro to unlock market insights, advanced card tools, and smarter collection growth.
        </p>
      </div>

      {subscription.isPro ? (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700 uppercase tracking-[0.2em]">Pro active</p>
              <h2 className="mt-2 text-2xl font-bold">Your subscription is active</h2>
              <p className="mt-2 text-sm text-muted-foreground">Manage billing, update payment details, or cancel via Stripe.</p>
            </div>
            <Button onClick={handleManageBilling} disabled={portalLoading} className="h-12 px-6">
              {portalLoading ? 'Opening portal…' : 'Manage billing'}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/70 bg-card p-6">
            <div className="flex items-center gap-3 mb-4 text-foreground">
              <Gift className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-semibold">Why go Pro?</h2>
            </div>
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="mt-1 h-4 w-4 text-amber-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Subscription details</h2>
            <p className="text-sm text-muted-foreground">
              Stripe handles secure checkout and recurring billing. Your subscription status is saved in Supabase so the app always knows when you are Pro.
            </p>
            {subscription.current_period_end ? (
              <p className="mt-4 text-sm text-foreground">
                Current billing period ends on{' '}
                <strong>{new Date(subscription.current_period_end).toLocaleDateString()}</strong>.
              </p>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border/70 bg-card p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground">Pro plans</p>
                <p className="text-xs text-muted-foreground">Pick monthly or yearly billing.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-amber-400" />
            </div>

            <div className="grid gap-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${selectedPlan === plan.id ? 'border-amber-400 bg-amber-400/10' : 'border-border/70 bg-card hover:border-amber-300'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{plan.title}</p>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{plan.price}</p>
                      <p className="text-xs text-muted-foreground">{plan.cadence}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

            <Button onClick={() => handleCheckout(selectedPlan)} disabled={loading} className="mt-5 w-full h-12">
              {loading ? 'Starting checkout…' : 'Subscribe now'}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
