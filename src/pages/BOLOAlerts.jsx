import React, { useState, useEffect } from 'react';
import { legacyApi } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, Plus, Bell, BellOff, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import BOLOCard from '../components/bolo/BOLOCard.jsx';
import BOLOSubmitForm from '../components/bolo/BOLOSubmitForm.jsx';

export default function BOLOAlerts() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    legacyApi.auth.me().then(u => {
      if (u) setCurrentUser(u);
    });
  }, []);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['bolo-alerts'],
    queryFn: () => legacyApi.entities.BOLOAlert.filter({ status: 'active' }, '-created_date', 50),
  });

  const { data: myLocation } = useQuery({
    queryKey: ['my-location'],
    queryFn: async () => {
      if (!currentUser) return null;
      const locs = await legacyApi.entities.UserLocation.filter({ user_email: currentUser.email });
      return locs[0] || null;
    },
    enabled: !!currentUser,
  });

  const isDealer = currentUser?.dealer_tag === 'card_show_dealer' || currentUser?.dealer_tag === 'card_shop_owner';

  const handleEnableNotifications = () => {
    setSavingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const data = {
          user_email: currentUser.email,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          bolo_notifications_enabled: true,
        };
        if (myLocation) {
          await legacyApi.entities.UserLocation.update(myLocation.id, data);
        } else {
          await legacyApi.entities.UserLocation.create(data);
        }
        queryClient.invalidateQueries({ queryKey: ['my-location'] });
        setSavingLocation(false);
      },
      () => {
        setSavingLocation(false);
        alert('Could not get location. Please allow location access and try again.');
      }
    );
  };

  const handleToggleNotifications = async () => {
    if (!myLocation) return;
    await legacyApi.entities.UserLocation.update(myLocation.id, {
      bolo_notifications_enabled: !myLocation.bolo_notifications_enabled,
    });
    queryClient.invalidateQueries({ queryKey: ['my-location'] });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-6 h-6 text-destructive" />
              <h1 className="font-display text-3xl font-bold text-foreground">BOLO Alerts</h1>
            </div>
            <p className="text-sm text-muted-foreground">Stolen card alerts from certified dealers & shop owners within your area.</p>
          </div>
          {isDealer && (
            <Button onClick={() => setShowForm(true)} className="bg-destructive text-white hover:bg-destructive/90 shrink-0">
              <Plus className="w-4 h-4 mr-2" />Report Theft
            </Button>
          )}
        </div>

        {/* Notification opt-in banner */}
        {currentUser && (
          <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border mb-6 ${myLocation?.bolo_notifications_enabled ? 'bg-green-500/10 border-green-500/20' : 'bg-secondary border-border/50'}`}>
            <div className="flex items-center gap-2.5">
              {myLocation?.bolo_notifications_enabled
                ? <Bell className="w-4 h-4 text-green-400 shrink-0" />
                : <BellOff className="w-4 h-4 text-muted-foreground shrink-0" />}
              <div>
                <p className={`text-sm font-medium ${myLocation?.bolo_notifications_enabled ? 'text-green-400' : 'text-foreground'}`}>
                  {myLocation?.bolo_notifications_enabled ? 'BOLO Notifications On' : 'Get BOLO Notifications'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {myLocation?.bolo_notifications_enabled
                    ? 'You\'ll be emailed when cards are stolen near you'
                    : 'Enable email alerts when cards are stolen within 10 miles'}
                </p>
              </div>
            </div>
            {myLocation ? (
              <button onClick={handleToggleNotifications} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors shrink-0 ${myLocation.bolo_notifications_enabled ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'border-border/50 text-muted-foreground hover:text-foreground'}`}>
                {myLocation.bolo_notifications_enabled ? 'Disable' : 'Enable'}
              </button>
            ) : (
              <Button size="sm" variant="outline" onClick={handleEnableNotifications} disabled={savingLocation} className="border-border/50 shrink-0">
                {savingLocation ? <><Loader2 className="w-3 h-3 animate-spin mr-1.5" />Saving...</> : <><MapPin className="w-3 h-3 mr-1.5" />Enable</>}
              </Button>
            )}
          </div>
        )}

        {/* Dealer-only notice for non-dealers */}
        {currentUser && !isDealer && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-secondary/50 border border-border/50 mb-6">
            <ShieldAlert className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">Only users with a <strong className="text-foreground">Certified Card Show Dealer</strong> or <strong className="text-foreground">Card Shop Owner</strong> tag can submit BOLO alerts. Contact an admin to get certified.</p>
          </div>
        )}

        {/* Submit Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={e => e.target === e.currentTarget && setShowForm(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl bg-card border border-border/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-destructive" />Report Stolen Cards
                  </h2>
                </div>
                <BOLOSubmitForm user={currentUser} onClose={() => setShowForm(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alerts Feed */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border/50 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-muted/40 rounded w-1/3 mb-3" />
                <div className="h-3 bg-muted/30 rounded w-full mb-2" />
                <div className="h-3 bg-muted/30 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No Active BOLO Alerts</h3>
            <p className="text-sm text-muted-foreground">No stolen card reports in your area right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, i) => (
              <BOLOCard key={alert.id} alert={alert} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

