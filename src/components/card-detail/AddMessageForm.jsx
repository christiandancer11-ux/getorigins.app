import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Video, X } from 'lucide-react';

export default function AddMessageForm({ cardId, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ owner_name: '', message: '', video_url: '' });
  const [uploading, setUploading] = useState(false);

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
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, video_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ ...form, card_id: cardId });
  };

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-foreground">Leave a Message</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-foreground">Your Name *</Label>
          <Input
            value={form.owner_name}
            onChange={e => setForm(prev => ({ ...prev, owner_name: e.target.value }))}
            placeholder="e.g. John D."
            required
            className="mt-1.5 bg-secondary border-border"
          />
        </div>

        <div>
          <Label className="text-foreground">Message</Label>
          <Textarea
            value={form.message}
            onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
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

        <Button
          type="submit"
          disabled={!form.owner_name || createMutation.isPending}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Post Message
        </Button>
      </form>
    </div>
  );
}