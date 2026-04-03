import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, MessageCircle, QrCode, Trash2, LogOut, Handshake, DollarSign, ShieldCheck, CreditCard, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import SportBadge from '../components/shared/SportBadge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import SocialLink from '../components/profile/SocialLink';
import EditProfileModal from '../components/profile/EditProfileModal';
import EmptyState from '../components/shared/EmptyState';
import ReferralSection from '../components/profile/ReferralSection';

const SOCIAL_CONFIG = [
  { key: 'youtube',       label: 'YouTube',         baseUrl: 'https://youtube.com/@' },
  { key: 'twitch',        label: 'Twitch',          baseUrl: 'https://twitch.tv/' },
  { key: 'x_twitter',    label: 'X / Twitter',     baseUrl: 'https://x.com/' },
  { key: 'tiktok',       label: 'TikTok',          baseUrl: 'https://tiktok.com/@' },
  { key: 'instagram',    label: 'Instagram',       baseUrl: 'https://instagram.com/' },
  { key: 'ebay_store',   label: 'eBay Store',      baseUrl: 'https://www.ebay.com/usr/' },
  { key: 'fanatics_live',label: 'Fanatics Live',   baseUrl: 'https://fanatics.live/' },
  { key: 'whatnot',      label: 'Whatnot Live',    baseUrl: 'https://www.whatnot.com/user/' },
];

export default function Profile() {
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDeleteAccount = async () => {
    setDeleting(true);
    // Delete all user's cards, messages, trades
    const [myCards, myTrades] = await Promise.all([
      base44.entities.Card.list('-created_date'),
      base44.entities.CardTrade.list('-created_date'),
    ]);
    await Promise.all([
      ...myCards.map(c => base44.entities.Card.delete(c.id)),
      ...myTrades.map(t => base44.entities.CardTrade.delete(t.id)),
    ]);
    queryClient.clear();
    base44.auth.logout('/');
  };

  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: cards = [] } = useQuery({
    queryKey: ['my-cards'],
    queryFn: () => base44.entities.Card.list('-created_date'),
    enabled: !!user,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['all-messages'],
    queryFn: () => base44.entities.VideoMessage.list(),
    enabled: !!user,
  });

  const { data: myTrades = [] } = useQuery({
    queryKey: ['my-trades-profile'],
    queryFn: () => base44.entities.CardTrade.filter({ created_by: user.email }, '-created_date', 50),
    enabled: !!user,
  });

  const myMessageCount = messages.filter(m => cards.some(c => c.id === m.card_id)).length;
  const tradeVolume = myTrades.reduce((s, t) => s + (t.total_value || 0), 0);
  const verifiedTrades = myTrades.filter(t => t.verified).length;
  const hasSocials = user && SOCIAL_CONFIG.some(s => user[s.key]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border/50 p-6 mb-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted/40 border border-border/50 shrink-0">
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                }
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">{user?.full_name}</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {user?.bio && <p className="text-sm text-foreground/80 mt-1 max-w-sm">{user.bio}</p>}
              </div>
            </div>
            <Button onClick={() => setShowEdit(true)} variant="outline" size="sm" className="border-border/50 shrink-0">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 mt-5 pt-5 border-t border-border/50 flex-wrap">
            <div className="text-center">
              <p className="text-2xl font-bold font-display text-foreground">{cards.length}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center mt-0.5"><QrCode className="w-3 h-3" />Cards</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-display text-foreground">{myMessageCount}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center mt-0.5"><MessageCircle className="w-3 h-3" />Messages</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-display text-green-400">{myTrades.length}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center mt-0.5"><Handshake className="w-3 h-3" />Trades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-display text-primary">${tradeVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center mt-0.5"><DollarSign className="w-3 h-3" />Volume</p>
            </div>
          </div>
        </motion.div>

        {/* Socials & Selling Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card border border-border/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-foreground">Socials & Selling Platforms</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Connect your accounts so followers can find you everywhere</p>
            </div>
            {!hasSocials && (
              <Button onClick={() => setShowEdit(true)} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Add Links
              </Button>
            )}
          </div>

          {hasSocials ? (
            <div className="grid gap-2">
              {SOCIAL_CONFIG.map(({ key, label, baseUrl }) =>
                user[key] ? (
                  <SocialLink key={key} label={label} value={user[key]} baseUrl={baseUrl} />
                ) : null
              )}
              <Button onClick={() => setShowEdit(true)} variant="ghost" size="sm" className="mt-2 text-muted-foreground hover:text-foreground w-fit">
                <Pencil className="w-3.5 h-3.5 mr-2" />
                Edit links
              </Button>
            </div>
          ) : (
            <EmptyState
              icon={null}
              title="No links added yet"
              description="Add your YouTube, Twitch, X, TikTok, Instagram, eBay store, Fanatics Live, or Whatnot accounts."
            >
              <Button onClick={() => setShowEdit(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Add Your Links
              </Button>
            </EmptyState>
          )}
        </motion.div>

        {/* Trade History */}
        {myTrades.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl bg-card border border-border/50 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-foreground flex items-center gap-2"><Handshake className="w-4 h-4 text-primary" />Trade History</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{myTrades.length} trades · ${tradeVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })} total · {verifiedTrades} verified</p>
              </div>
              <Link to={`/collector/${encodeURIComponent(user?.email || '')}`}
                className="flex items-center gap-1 text-xs text-primary hover:underline">
                Public view <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {myTrades.map(trade => (
                <div key={trade.id} className="flex gap-3 p-3 rounded-xl bg-secondary/30 border border-border/40">
                  {trade.image_url ? (
                    <img src={trade.image_url} alt={trade.card_name} className="w-10 h-14 object-cover rounded-lg border border-border/50 shrink-0" />
                  ) : (
                    <div className="w-10 h-14 rounded-lg bg-muted/40 border border-border/40 flex items-center justify-center shrink-0">
                      <CreditCard className="w-3 h-3 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-sm font-semibold text-foreground truncate">{trade.card_name}</p>
                      <span className="text-sm font-bold text-primary shrink-0">${(trade.total_value || trade.cash_paid || 0).toFixed(0)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{[trade.year, trade.set_name].filter(Boolean).join(' · ')}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {trade.sport && <SportBadge sport={trade.sport} />}
                      {trade.verified && <span className="flex items-center gap-1 text-[10px] text-green-400"><ShieldCheck className="w-3 h-3" />Verified</span>}
                      {trade.event_name && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{trade.event_name}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <ReferralSection />

        {/* Account Actions */}
        <div className="mt-6 pt-6 border-t border-border/30 text-center">
          <Button
            variant="outline"
            size="sm"
            className="border-border/50 text-muted-foreground hover:text-foreground mb-4"
            onClick={() => base44.auth.logout('/')}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>

        {/* Delete Account */}
        <div className="mt-2 text-center">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors underline underline-offset-2"
            >
              Delete Account
            </button>
          ) : (
            <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-5 text-left">
              <div className="flex items-start gap-3 mb-4">
                <Trash2 className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Delete your account?</p>
                  <p className="text-xs text-muted-foreground mt-1">This will permanently delete all your cards, trades, and data. This cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="flex-1 border-border/50" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                  Cancel
                </Button>
                <Button size="sm" className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteAccount} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showEdit && <EditProfileModal user={user} onClose={() => setShowEdit(false)} />}
    </div>
  );
}