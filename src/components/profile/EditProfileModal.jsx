import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Loader2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

const SOCIAL_FIELDS = [
  { key: 'youtube',      label: 'YouTube',            placeholder: '@yourchannel or full URL' },
  { key: 'twitch',       label: 'Twitch',             placeholder: 'username' },
  { key: 'x_twitter',   label: 'X / Twitter',        placeholder: '@handle' },
  { key: 'tiktok',      label: 'TikTok',             placeholder: '@username' },
  { key: 'instagram',   label: 'Instagram',          placeholder: '@username' },
  { key: 'ebay_store',  label: 'eBay Store',         placeholder: 'store name or URL' },
  { key: 'fanatics_live', label: 'Fanatics Live',    placeholder: 'username or URL' },
  { key: 'whatnot',     label: 'Whatnot Live',       placeholder: 'username or URL' },
];

export default function EditProfileModal({ user, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    bio: user.bio || '',
    avatar_url: user.avatar_url || '',
    youtube: user.youtube || '',
    twitch: user.twitch || '',
    x_twitter: user.x_twitter || '',
    tiktok: user.tiktok || '',
    instagram: user.instagram || '',
    ebay_store: user.ebay_store || '',
    fanatics_live: user.fanatics_live || '',
    whatnot: user.whatnot || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, avatar_url: file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    queryClient.invalidateQueries({ queryKey: ['current-user'] });
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
            <h2 className="font-display text-lg font-bold text-foreground">Edit Profile</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted/40 border border-border/50 shrink-0">
                {form.avatar_url
                  ? <img src={form.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                }
              </div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <Button variant="outline" size="sm" className="border-border/50 pointer-events-none">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
              </label>
            </div>

            {/* Bio */}
            <div>
              <Label className="text-foreground mb-1.5 block">Bio</Label>
              <Textarea
                value={form.bio}
                onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell people a bit about yourself..."
                rows={2}
                className="bg-secondary border-border resize-none"
              />
            </div>

            {/* Social & Selling Links */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Socials & Selling Platforms</p>
              <div className="space-y-3">
                {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <Label className="text-foreground mb-1 block text-sm">{label}</Label>
                    <Input
                      value={form[key]}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="bg-secondary border-border"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/50 flex gap-3 shrink-0">
            <Button variant="outline" onClick={onClose} className="flex-1 border-border/50">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : 'Save Profile'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}