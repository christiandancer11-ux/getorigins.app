import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Zap, AlertCircle } from 'lucide-react';

const SPORTS = ['baseball', 'basketball', 'football', 'hockey', 'soccer', 'golf', 'ufc', 'wwe', 'f1'];
const TCG_TYPES = ['pokemon', 'magic_the_gathering', 'yugioh', 'one_piece', 'lorcana'];

export default function PullAlertPreferences({ user }) {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const existing = await base44.asServiceRole.entities.UserPullAlertPreference.filter({
          user_email: user.email
        });
        if (existing.length > 0) {
          setPrefs(existing[0]);
        } else {
          // Create default preferences
          const newPrefs = await base44.asServiceRole.entities.UserPullAlertPreference.create({
            user_email: user.email,
            enabled: true,
            notify_sports: true,
            notify_tcg: true,
            min_value: 100,
            sports_categories: SPORTS,
            tcg_types: TCG_TYPES,
            notify_email: true,
            notify_in_app: true
          });
          setPrefs(newPrefs);
        }
      } catch (e) {
        console.error('Failed to load pull alert preferences:', e);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user.email]);

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      await base44.asServiceRole.entities.UserPullAlertPreference.update(prefs.id, prefs);
    } catch (e) {
      console.error('Failed to save preferences:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-32 flex items-center justify-center">Loading...</div>;
  }

  if (!prefs) {
    return null;
  }

  return (
    <Card className="p-6 border-border/50">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Major Pull Alerts</h3>
      </div>

      <div className="space-y-6">
        {/* Master toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">Enable Major Pull Alerts</Label>
            <p className="text-xs text-muted-foreground mt-1">Get notified when high-value cards are pulled from new products</p>
          </div>
          <Switch
            checked={prefs.enabled}
            onCheckedChange={(checked) => setPrefs({ ...prefs, enabled: checked })}
          />
        </div>

        {prefs.enabled && (
          <>
            {/* Sports Cards */}
            <div className="border-t border-border/30 pt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-semibold">Sports Cards Pulls</Label>
                <Switch
                  checked={prefs.notify_sports}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, notify_sports: checked })}
                />
              </div>

              {prefs.notify_sports && (
                <div className="space-y-2 ml-2">
                  {SPORTS.map((sport) => (
                    <div key={sport} className="flex items-center gap-2">
                      <Checkbox
                        checked={(prefs.sports_categories || []).includes(sport)}
                        onCheckedChange={(checked) => {
                          const updated = prefs.sports_categories || [];
                          if (checked) {
                            setPrefs({ ...prefs, sports_categories: [...updated, sport] });
                          } else {
                            setPrefs({ ...prefs, sports_categories: updated.filter(s => s !== sport) });
                          }
                        }}
                      />
                      <Label className="text-xs capitalize cursor-pointer">{sport}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TCG Cards */}
            <div className="border-t border-border/30 pt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-semibold">TCG Pulls</Label>
                <Switch
                  checked={prefs.notify_tcg}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, notify_tcg: checked })}
                />
              </div>

              {prefs.notify_tcg && (
                <div className="space-y-2 ml-2">
                  {TCG_TYPES.map((tcg) => {
                    const labels = {
                      pokemon: 'Pokémon',
                      magic_the_gathering: 'Magic: The Gathering',
                      yugioh: 'Yu-Gi-Oh!',
                      one_piece: 'One Piece',
                      lorcana: 'Disney Lorcana'
                    };
                    return (
                      <div key={tcg} className="flex items-center gap-2">
                        <Checkbox
                          checked={(prefs.tcg_types || []).includes(tcg)}
                          onCheckedChange={(checked) => {
                            const updated = prefs.tcg_types || [];
                            if (checked) {
                              setPrefs({ ...prefs, tcg_types: [...updated, tcg] });
                            } else {
                              setPrefs({ ...prefs, tcg_types: updated.filter(t => t !== tcg) });
                            }
                          }}
                        />
                        <Label className="text-xs cursor-pointer">{labels[tcg]}</Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Minimum value threshold */}
            <div className="border-t border-border/30 pt-6">
              <Label className="text-sm font-semibold">Minimum Card Value</Label>
              <p className="text-xs text-muted-foreground mb-2">Only alert for pulls estimated at or above this value</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">$</span>
                <Input
                  type="number"
                  min="50"
                  step="50"
                  value={prefs.min_value || 100}
                  onChange={(e) => setPrefs({ ...prefs, min_value: parseInt(e.target.value) || 100 })}
                  className="w-24 h-8 text-xs"
                />
              </div>
            </div>

            {/* Notification methods */}
            <div className="border-t border-border/30 pt-6">
              <Label className="text-sm font-semibold mb-3 block">Notification Methods</Label>
              <div className="space-y-2 ml-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Email notifications</Label>
                  <Switch
                    checked={prefs.notify_email}
                    onCheckedChange={(checked) => setPrefs({ ...prefs, notify_email: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">In-app notifications</Label>
                  <Switch
                    checked={prefs.notify_in_app}
                    onCheckedChange={(checked) => setPrefs({ ...prefs, notify_in_app: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border/30 pt-6 flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">Alerts are monitored across Whatnot, Twitch, TikTok, Instagram, X, and Fanatics Live. Only verified high-engagement pulls are included.</p>
            </div>
          </>
        )}

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </Card>
  );
}