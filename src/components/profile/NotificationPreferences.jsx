import React, { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateUserProfile } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const NOTIFICATION_TYPES = [
  { key: 'notify_follower', label: 'New Followers', desc: 'Get notified when someone follows your collection' },
  { key: 'notify_friend_cards', label: 'Friend Adds Cards', desc: 'Get notified when collectors you follow add new cards' },
  { key: 'notify_card_reactions', label: 'Card Reactions', desc: 'Get notified when someone reacts to your cards' },
  { key: 'notify_card_comments', label: 'Card Comments', desc: 'Get notified when someone comments on your cards' },
  { key: 'notify_profile_reactions', label: 'Profile Reactions', desc: 'Get notified when someone reacts to your collection profile' },
  { key: 'notify_app_updates', label: 'App Updates', desc: 'Get notified about new features and improvements to Origins' },
];

export default function NotificationPreferences({ user }) {
  const queryClient = useQueryClient();
  const [prefs, setPrefs] = useState({
    notify_follower: user?.notify_follower !== false,
    notify_friend_cards: user?.notify_friend_cards !== false,
    notify_card_reactions: user?.notify_card_reactions !== false,
    notify_card_comments: user?.notify_card_comments !== false,
    notify_profile_reactions: user?.notify_profile_reactions !== false,
    notify_app_updates: user?.notify_app_updates !== false,
  });
  const [saving, setSaving] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User must be signed in to update preferences');
      }
      return updateUserProfile(user.id, prefs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
    onSettled: () => {
      setSaving(false);
    },
  });

  const handleToggle = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    await saveMutation.mutateAsync();
  };

  const allEnabled = Object.values(prefs).every(v => v);
  const hasChanges = Object.keys(prefs).some(key => prefs[key] !== (user?.[key] !== false));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="rounded-2xl bg-card border border-border/50 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />Notification Preferences
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Choose what you want to be notified about.</p>
        </div>
        {hasChanges && (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />Saving...</> : 'Save'}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {NOTIFICATION_TYPES.map(({ key, label, desc }) => (
          <label key={key} className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={prefs[key]}
              onChange={() => handleToggle(key)}
              className="w-4 h-4 mt-0.5 rounded border-border accent-primary"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </label>
        ))}
      </div>

      {Object.values(prefs).every(v => !v) && (
        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-muted/50 text-xs text-muted-foreground">
          <p>⚠️ You have all notifications disabled. You won't receive any email updates.</p>
        </div>
      )}
    </motion.div>
  );
}

