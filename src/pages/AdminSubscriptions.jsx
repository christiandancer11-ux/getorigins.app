import React, { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { normalizeSubscription, upsertMySubscription } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

const PLAN_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
]

const STATUS_OPTIONS = [
  { value: 'inactive', label: 'Inactive' },
  { value: 'active', label: 'Active' },
]

export default function AdminSubscriptions() {
  const { user, isLoadingAuth } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [plan, setPlan] = useState('free')
  const [status, setStatus] = useState('inactive')
  const [stripeCustomerId, setStripeCustomerId] = useState('')
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState('')
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const isAdmin = user?.role === 'admin'

  const formatDateTimeLocal = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toISOString().slice(0, 16)
  }

  const parseDateTimeLocal = (value) => {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
  }

  const resetForm = () => {
    setSubscription(null)
    setUserInfo(null)
    setPlan('free')
    setStatus('inactive')
    setStripeCustomerId('')
    setStripeSubscriptionId('')
    setCurrentPeriodEnd('')
    setErrorMessage('')
  }

  const lookupUserIdByEmail = async (email) => {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      return { userId: null, email: null, error: 'Invalid email search.' }
    }

    const { data, error } = await supabase
      .from('users')
      .select('id,email')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (error) {
      return { userId: null, email: null, error: 'Unable to query users table. Email lookup may not be permitted.' }
    }

    if (!data) {
      return { userId: null, email: null, error: `No user found for ${cleanEmail}` }
    }

    return { userId: data.id, email: data.email, error: null }
  }

  const searchSubscription = async () => {
    if (!searchTerm.trim()) {
      setErrorMessage('Enter a user email or user id to search.')
      return
    }

    setIsSearching(true)
    setErrorMessage('')
    setSubscription(null)
    setUserInfo(null)

    try {
      const query = searchTerm.trim()
      let userId = query
      let email = null

      if (query.includes('@')) {
        const lookup = await lookupUserIdByEmail(query)
        if (lookup.error) {
          setErrorMessage(lookup.error)
          return
        }
        userId = lookup.userId
        email = lookup.email
      }

      if (!userId) {
        setErrorMessage('Unable to resolve a user for this search input.')
        return
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        setErrorMessage('Error fetching subscription details. ' + (error.message || ''))
        return
      }

      const subscriptionData = data || null
      setSubscription(subscriptionData)
      setUserInfo({ id: userId, email })

      if (subscriptionData) {
        setPlan(subscriptionData.plan || 'free')
        setStatus(subscriptionData.status || 'inactive')
        setStripeCustomerId(subscriptionData.stripe_customer_id || '')
        setStripeSubscriptionId(subscriptionData.stripe_subscription_id || '')
        setCurrentPeriodEnd(formatDateTimeLocal(subscriptionData.current_period_end))
      } else {
        setPlan('free')
        setStatus('inactive')
        setStripeCustomerId('')
        setStripeSubscriptionId('')
        setCurrentPeriodEnd('')
      }
    } finally {
      setIsSearching(false)
    }
  }

  const saveSubscription = async () => {
    if (!userInfo?.id) {
      setErrorMessage('Search for a user before saving subscription changes.')
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    const payload = {
      user_id: userInfo.id,
      plan,
      status,
      stripe_customer_id: stripeCustomerId || null,
      stripe_subscription_id: stripeSubscriptionId || null,
      current_period_end: parseDateTimeLocal(currentPeriodEnd),
    }

    const { data, error } = await upsertMySubscription(payload)
    if (error) {
      setErrorMessage('Failed to save subscription: ' + (error.message || 'Unknown error'))
      setIsSaving(false)
      return
    }

    const normalized = normalizeSubscription(data)
    setSubscription(data)
    setPlan(normalized.plan)
    setStatus(normalized.status)
    setStripeCustomerId(normalized.stripe_customer_id || '')
    setStripeSubscriptionId(normalized.stripe_subscription_id || '')
    setCurrentPeriodEnd(formatDateTimeLocal(normalized.current_period_end))
    setUserInfo({ id: data.user_id, email: userInfo.email })

    toast({
      title: 'Subscription updated',
      description: `Subscription row for ${userInfo.id} was saved.`,
    })

    setIsSaving(false)
  }

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto rounded-3xl border border-border/80 bg-card p-10 text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-3">Admin Access Required</h1>
          <p className="text-sm text-muted-foreground">
            This page is only available to admin users. If you believe this is an error, please sign in with an admin account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Admin tooling</p>
            <h1 className="text-3xl font-bold text-foreground">Subscription Control</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Search for a user by email or user id, review their subscription record, and set plan/status values or Stripe IDs.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border/70 rounded-3xl p-6 mb-8 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2 block">
                Search by email or user id
              </label>
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="user@example.com or user-id"
                className="bg-secondary border-border"
              />
            </div>
            <Button onClick={searchSubscription} disabled={isSearching || !searchTerm.trim()}>
              {isSearching ? 'Searching…' : 'Search'}
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            If email lookup is blocked by permissions, search by the user id directly.
          </p>
          {errorMessage && (
            <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {errorMessage}
            </div>
          )}
        </div>

        {userInfo && (
          <div className="bg-card border border-border/70 rounded-3xl p-6 shadow-sm">
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-1">User ID</p>
                <p className="font-medium text-foreground break-all">{userInfo.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-1">Email</p>
                <p className="font-medium text-foreground break-all">{userInfo.email || 'Unknown'}</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-2 block">Plan</label>
                <Select value={plan} onValueChange={setPlan}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-2 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-2 block">Stripe Customer ID</label>
                <Input
                  value={stripeCustomerId}
                  onChange={(event) => setStripeCustomerId(event.target.value)}
                  placeholder="cus_..."
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-2 block">Stripe Subscription ID</label>
                <Input
                  value={stripeSubscriptionId}
                  onChange={(event) => setStripeSubscriptionId(event.target.value)}
                  placeholder="sub_..."
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-2 block">Current Period End</label>
                <Input
                  type="datetime-local"
                  value={currentPeriodEnd}
                  onChange={(event) => setCurrentPeriodEnd(event.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subscription row {subscription ? 'found' : 'not found, will be created on save'}.</p>
              </div>
              <Button onClick={saveSubscription} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save subscription'}
              </Button>
            </div>
          </div>
        )}

        {!userInfo && !errorMessage && (
          <div className="border border-dashed border-border/70 rounded-3xl p-10 text-center text-sm text-muted-foreground">
            Enter a user email or ID above to manage subscription data.
          </div>
        )}
      </div>
    </div>
  )
}
