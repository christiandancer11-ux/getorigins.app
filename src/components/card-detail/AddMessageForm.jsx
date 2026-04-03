import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, X, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AddMessageForm({ cardId, onClose }) {
  const queryClient = useQueryClient();
  const [ownerName, setOwnerName] = useState('');
  const [message, setMessage] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [moderationError, setModerationError] = useState('');

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) setVideoFile(file);
  };

  const moderateContent = async (text, videoUrl) => {
    const prompt = `You are a content moderator enforcing YouTube Community Guidelines. Review the following content and determine if it should be APPROVED or REJECTED.

REJECT content that contains: weapons, violence, gore, nudity, sexual content, hate speech, vulgarity, profanity, harassment, dangerous activities, or anything that would violate YouTube's standard community guidelines.

Text message: "${text || '(none)'}"
Has video: ${videoUrl ? 'yes' : 'no'}

Return JSON: { "approved": true/false, "reason": "short explanation if rejected" }`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      ...(videoUrl ? { file_urls: [videoUrl] } : {}),
      response_json_schema: {
        type: 'object',
        properties: {
          approved: { type: 'boolean' },
          reason: { type: 'string' },
        },
      },
    });
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ownerName.trim()) return;
    setModerationError('');
    setSubmitting(true);

    let videoUrl = null;

    // Upload video if provided
    if (videoFile) {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file: videoFile });
      videoUrl = file_url;
      setUploading(false);
    }

    // AI moderation
    const modResult = await moderateContent(message, videoUrl);
    if (!modResult.approved) {
      setModerationError(modResult.reason || 'Content was flagged and cannot be posted.');
      setSubmitting(false);
      return;
    }

    await base44.entities.VideoMessage.create({
      card_id: cardId,
      owner_name: ownerName.trim(),
      message: message.trim(),
      video_url: videoUrl,
    });

    queryClient.invalidateQueries({ queryKey: ['card-messages'] });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-bold text-foreground">Leave Your Story</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-sm text-foreground mb-1 block">Your Name *</Label>
          <Input
            value={ownerName}
            onChange={e => setOwnerName(e.target.value)}
            placeholder="How you'd like to be known"
            required
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label className="text-sm text-foreground mb-1 block">Message</Label>
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Share the story of this card..."
            rows={3}
            className="bg-secondary border-border resize-none"
          />
        </div>

        <div>
          <Label className="text-sm text-foreground mb-1 block">Video (optional)</Label>
          {videoFile ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border/50">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-sm text-foreground flex-1 truncate">{videoFile.name}</span>
              <button type="button" onClick={() => setVideoFile(null)} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/30 cursor-pointer bg-secondary/30 transition-colors">
              <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Upload a video message</span>
            </label>
          )}
        </div>

        {moderationError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{moderationError}</p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border/50">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!ownerName.trim() || submitting}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {uploading
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</>
              : submitting
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Posting...</>
              : 'Post Message'}
          </Button>
        </div>
      </form>
    </div>
  );
}