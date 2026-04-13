import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/AuthContext';
import { Trash2, Plus, Check, Loader2 } from 'lucide-react';
import { createDiscordWebhook, deleteDiscordWebhook, getDiscordWebhooks, sendDiscordMessage } from '@/api/discord';

export default function DiscordSetup() {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [serverName, setServerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWebhooks();
  }, [user]);

  const loadWebhooks = async () => {
    setLoading(true);
    setError(null);

    if (!user) {
      setWebhooks([]);
      setLoading(false);
      return;
    }

    const { data, error } = await getDiscordWebhooks();
    if (error) {
      console.error('Failed to load webhooks:', error);
      setError('Could not load Discord webhooks.');
      setWebhooks([]);
    } else {
      setWebhooks(data || []);
    }

    setLoading(false);
  };

  const addWebhook = async () => {
    if (!newUrl.trim()) return;

    try {
      setAdding(true);
      await createDiscordWebhook({ server_name: serverName || 'My Server', webhook_url: newUrl.trim() });
      setNewUrl('');
      setServerName('');
      await loadWebhooks();
    } catch (e) {
      console.error('Failed to add webhook:', e);
      alert('Failed to add webhook. Make sure the URL is valid.');
    } finally {
      setAdding(false);
    }
  };

  const deleteWebhookById = async (id) => {
    if (!confirm('Remove this webhook?')) return;

    try {
      await deleteDiscordWebhook(id);
      await loadWebhooks();
    } catch (e) {
      console.error('Failed to delete webhook:', e);
      alert('Failed to delete webhook.');
    }
  };

  const testWebhook = async (webhook) => {
    setTestingId(webhook.id);

    try {
      const { error } = await sendDiscordMessage({ webhookId: webhook.id, test: true });
      if (error) {
        alert('❌ Webhook test failed.');
      } else {
        alert('✅ Test message sent successfully!');
      }
    } catch (e) {
      console.error('Webhook test error:', e);
      alert('❌ Error testing webhook.');
    } finally {
      setTestingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Discord Growth Tools</h1>
          <p className="text-muted-foreground mb-8">Securely connect Discord webhooks to post card shares, community updates, and activity from Origins.</p>

          <Card className="p-6 mb-8 bg-secondary/30 border-border/50">
            <h2 className="font-semibold text-foreground mb-4">Start sharing to Discord</h2>
            <p className="text-sm text-muted-foreground mb-4">Register a webhook once, then use the Share Story button on any card to share updates to your server.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="/discord"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Configure Webhooks
              </a>
              <a
                href="https://discord.com/new"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-border/50 bg-background px-4 py-3 text-sm font-semibold text-foreground hover:border-primary"
              >
                Open Discord
              </a>
            </div>
          </Card>

          {/* Setup Instructions */}
          <Card className="p-6 mb-8 bg-secondary/30 border-border/50">
            <h2 className="font-semibold text-foreground mb-4">How to connect</h2>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Open your Discord server → Server Settings → Integrations.</li>
              <li>Create a new Webhook and copy its URL.</li>
              <li>Paste the URL below and save it here.</li>
              <li>Then use Share Story on a card to post to Discord.</li>
            </ol>
          </Card>

          {/* Add New Webhook */}
          <Card className="p-6 mb-8 border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Add a Webhook</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Server Name (optional)</label>
                <Input
                  placeholder="e.g., My Collecting Community"
                  value={serverName}
                  onChange={e => setServerName(e.target.value)}
                  className="bg-secondary/50 border-border/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Webhook URL *</label>
                <Input
                  placeholder="https://discord.com/api/webhooks/..."
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  className="bg-secondary/50 border-border/50 font-mono text-xs"
                />
              </div>
              <Button
                onClick={addWebhook}
                disabled={!newUrl.trim() || adding}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {adding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                {adding ? 'Adding...' : 'Add Webhook'}
              </Button>
            </div>
          </Card>

          {/* Active Webhooks */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Your Webhooks ({webhooks.length})</h3>
            {webhooks.length === 0 ? (
              <Card className="p-6 text-center border-border/50">
                <p className="text-muted-foreground text-sm">No webhooks added yet. Add one above to get started.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {webhooks.map(webhook => (
                  <motion.div
                    key={webhook.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-border/50 bg-card flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{webhook.server_name}</h4>
                        {webhook.is_active && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Active</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">Webhook configuration saved securely.</p>
                      {webhook.last_posted && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last posted: {new Date(webhook.last_posted).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        onClick={() => testWebhook(webhook)}
                        disabled={testingId === webhook.id}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {testingId === webhook.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Test
                      </Button>
                      <Button
                        onClick={() => deleteWebhook(webhook.id)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

