import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Video, X, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import UpgradeModal from '@/components/shared/UpgradeModal';

async function moderateContent({ message, video_url }) {
  const prompt = `You are a content moderation system for a family-friendly sports card collecting app used by collectors of all ages including children.

Review the following user-submitted content and determine if it contains anything offensive, vulgar, hateful, sexually explicit, violent, or otherwise inappropriate.

Text message: "${message || '(none)'}"
Video attached: ${video_url ? 'Yes' : 'No'}
${video_url ? `Video URL: ${video_url}` : ''}

Respond with a JSON object:
{
  "approved": true or false,
  "reason": "brief reason if rejected, empty string if approved"
}

Be strict. Reject anything that would be inappropriate for a child to see or read.`;

  const fileUrls = video_url ? [video_url] : undefined;
  return base44.integrations.Core.InvokeLLM({
    prompt,
    file_urls: fileUrls,
    response_json_schema: {
      type: "object",
      properties: {
        approved: { type: "boolean" },
        reason: { type: "string" },
      },
    },
  });
}

export default function AddMessageForm({ cardId, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ owner_name: '', message: '', video_url: '' });
  const [uploading, setUploading] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [usageData, setUsageData] = useState(null);
  const [checkingUsage, setCheckingUsage] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    base44.functions.invoke('checkUsageLimit', {}).then(res => {
      setUsageData(res.data);
      setCheckingUsage(false);
    }).catch(() => setCheckingUsage(false));
  }, []);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.VideoMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-messages', cardId] });
      onClose();
    },
  });

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setRejectionReason('');
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, video_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRejectionReason('');
    setModerating(true);
    const result = await moderateContent({ message: form.message, video_url: form.video_url });
    setModerating(false);
    if (!result.approved) {
      setRejectionReason(result.reason || 'Your message was flagged as inappropriate and could not be posted.');
      return;
    }
    createMutation.mutate({ ...form, card_id: cardId });
  };

  const isLoading = moderating || createMutation.isPending;

  if (checkingUsage) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 p-6 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Checking usage...</span>
      </div>
    );
  }

  if (usageData && !usageData.allowed) {
    return (
      <>
        <div className="rounded-2xl bg-card border border-border/50 p-6 text-center">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Leave a Message</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h4 className="font-semibold text-foreground mb-2">Daily Limit Reached</h4>
          <p className="text-sm text-muted-foreground mb-5">
            You've used all 5 free messages for today. Upgrade for unlimited access.
          </p>
          <Button onClick={() => setShowUpgrade(true)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            View Plans — from $3.99/mo
          </Button>
        </div>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-card border border-border/50 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-foreground">Leave a Message</h3>
            {usageData && !usageData.isPro && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {usageData.remaining} of 5 free messages remaining today
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {usageData && !usageData.isPro && (
              <button onClick={() => setShowUpgrade(true)} className="text-xs text-primary hover:underline">
                Upgrade
              </button>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-foreground">Your Name *</Label>
            <Input
              value={form.owner_name}
              onChange={e => { setForm(prev => ({ ...prev, owner_name: e.target.value })); setRejectionReason(''); }}
              placeholder="e.g. John D."
              required
              className="mt-1.5 bg-secondary border-border"
            />
          </div>

          <div>
            <Label className="text-foreground">Message</Label>
            <Textarea
              value={form.message}
              onChange={e => { setForm(prev => ({ ...prev, message: e.target.value })); setRejectionReason(''); }}
              placeholder="Share a memory, story, or note about this card..."
              rows={3}
              className="mt-1.5 bg-secondary border-border"
            />
          </div>

          <div>
            <Label className="text-foreground">Video</Label>
            {form.video_url ? (
              <div className="mt-1.5 flex items-center gap-3 p-3 rounded-lg bg-secondary border border-border">
                <Video className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-foreground truncate flex-1">Video uploaded</span>
                <button type="button" onClick={() => setForm(prev => ({ ...prev, video_url: '' }))} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="mt-1.5 flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/30 cursor-pointer transition-colors bg-secondary/50">
                <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload video</span>
                  </>
                )}
              </label>
            )}
          </div>

          {rejectionReason && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold mb-0.5">Content Not Allowed</p>
                <p className="text-destructive/80">{rejectionReason}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary/60 shrink-0" />
            All messages are reviewed for appropriate content before posting.
          </div>

          <Button
            type="submit"
            disabled={!form.owner_name || isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {moderating ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Reviewing content...</>
            ) : createMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Posting...</>
            ) : (
              'Post Message'
            )}
          </Button>
        </form>
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}