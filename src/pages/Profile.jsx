import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Pencil, MessageCircle, QrCode } from 'lucide-react';
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

  const myMessageCount = messages.filter(m => cards.some(c => c.id === m.card_id)).length;
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
          <div className="flex gap-6 mt-5 pt-5 border-t border-border/50">
            <div className="text-center">
              <p className="text-2xl font-bold font-display text-foreground">{cards.length}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center mt-0.5"><QrCode className="w-3 h-3" />Cards</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-display text-foreground">{myMessageCount}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center mt-0.5"><MessageCircle className="w-3 h-3" />Messages</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-display text-foreground">
                {cards.reduce((s, c) => s + (c.scan_count || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Views</p>
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

        <ReferralSection />
      </div>

      {showEdit && <EditProfileModal user={user} onClose={() => setShowEdit(false)} />}
    </div>
  );
}