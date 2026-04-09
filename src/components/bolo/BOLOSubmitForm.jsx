import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Upload, Loader2, MapPin, AlertTriangle, CheckCircle2, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

const INCIDENT_TYPES = [
  { value: 'stolen_at_show', label: '🎪 Stolen at Card Show' },
  { value: 'shop_break_in', label: '🏪 Shop Break-In' },
  { value: 'other', label: '📋 Other' },
];

export default function BOLOSubmitForm({ user, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    incident_type: 'stolen_at_show',
    incident_date: new Date().toISOString().split('T')[0],
    location_name: '',
    card_list: '',
    total_value: '',
    suspect_description: '',
  });
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [extractingCerts, setExtractingCerts] = useState(false);
  const [certNumbers, setCertNumbers] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [location, setLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [notificationsSent, setNotificationsSent] = useState(0);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleGetLocation = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGettingLocation(false);
      },
      () => {
        setGettingLocation(false);
        alert('Could not get your location. Please allow location access and try again.');
      }
    );
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImages(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    const newUrls = [...imageUrls, ...urls];
    setImageUrls(newUrls);
    setUploadingImages(false);

    // Auto-extract cert numbers
    if (newUrls.length > 0) {
      setExtractingCerts(true);
      const res = await base44.functions.invoke('extractSlabCerts', { image_urls: newUrls });
      if (res.data?.cert_numbers) setCertNumbers(res.data.cert_numbers);
      setExtractingCerts(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) return alert('Please share your location before submitting.');
    setSubmitting(true);

    const boloData = {
      reporter_email: user.email,
      reporter_name: user.full_name || user.email.split('@')[0],
      reporter_type: user.dealer_tag,
      incident_type: form.incident_type,
      incident_date: form.incident_date,
      location_name: form.location_name,
      location_lat: location.lat,
      location_lng: location.lng,
      card_list: form.card_list,
      total_value: parseFloat(form.total_value) || 0,
      slab_cert_numbers: certNumbers,
      suspect_description: form.suspect_description,
      image_urls: imageUrls,
      status: 'active',
    };

    const created = await base44.entities.BOLOAlert.create(boloData);

    // Send notifications
    const notifRes = await base44.functions.invoke('sendBOLOAlerts', { bolo_id: created.id });
    setNotificationsSent(notifRes.data?.notifications_sent || 0);
    queryClient.invalidateQueries({ queryKey: ['bolo-alerts'] });
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="text-center py-10 px-6">
        <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="font-display text-xl font-bold text-foreground mb-2">BOLO Alert Sent!</h3>
        <p className="text-sm text-muted-foreground mb-1">
          {notificationsSent} collector{notificationsSent !== 1 ? 's' : ''} within 10 miles were notified.
        </p>
        <p className="text-xs text-muted-foreground/70 mb-6">The alert is now live in the BOLO feed.</p>
        <Button onClick={onClose} className="bg-primary text-primary-foreground">Done</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto max-h-[80vh] px-1">
      <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
        <p className="text-xs text-destructive">This feature is for certified dealers & shop owners only. False reports will result in account suspension.</p>
      </div>

      {/* Incident Type */}
      <div>
        <Label className="text-foreground mb-2 block">Incident Type *</Label>
        <div className="grid grid-cols-3 gap-2">
          {INCIDENT_TYPES.map(({ value, label }) => (
            <button key={value} type="button"
              onClick={() => set('incident_type', value)}
              className={`py-2.5 px-2 rounded-xl text-xs font-medium border transition-all text-center ${form.incident_type === value ? 'bg-destructive/20 text-destructive border-destructive/40' : 'bg-secondary border-border/50 text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Date & Location Name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-foreground mb-1 block">Incident Date *</Label>
          <Input type="date" value={form.incident_date} onChange={e => set('incident_date', e.target.value)} className="bg-secondary border-border" required />
        </div>
        <div>
          <Label className="text-foreground mb-1 block">Location / Event Name</Label>
          <Input value={form.location_name} onChange={e => set('location_name', e.target.value)} placeholder="e.g. Chicago Card Show" className="bg-secondary border-border" />
        </div>
      </div>

      {/* GPS Location */}
      <div>
        <Label className="text-foreground mb-1 block">Incident Location (GPS) *</Label>
        {location ? (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20">
            <MapPin className="w-4 h-4 text-green-400 shrink-0" />
            <span className="text-sm text-green-400 font-medium">Location captured</span>
            <span className="text-xs text-muted-foreground ml-auto">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
          </div>
        ) : (
          <Button type="button" variant="outline" onClick={handleGetLocation} disabled={gettingLocation} className="w-full border-border/50">
            {gettingLocation ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Getting location...</> : <><MapPin className="w-4 h-4 mr-2" />Share My Location</>}
          </Button>
        )}
      </div>

      {/* Card Photos */}
      <div>
        <Label className="text-foreground mb-1 block">Card Photos {extractingCerts && <span className="text-xs text-primary ml-2 flex items-center gap-1 inline-flex"><Bot className="w-3 h-3 animate-pulse" />AI extracting cert numbers...</span>}</Label>
        {imageUrls.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="w-16 h-20 object-cover rounded-lg border border-border/50" />
                <button type="button" onClick={() => setImageUrls(p => p.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/30 cursor-pointer bg-secondary/30 transition-colors">
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          {uploadingImages ? <><Loader2 className="w-4 h-4 animate-spin text-primary" /><span className="text-sm text-muted-foreground">Uploading...</span></>
            : <><Upload className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Upload card photos (AI will extract cert numbers)</span></>}
        </label>
      </div>

      {/* Cert Numbers */}
      <div>
        <Label className="text-foreground mb-1 block">Slab Cert Numbers (auto-filled by AI)</Label>
        <Textarea value={certNumbers} onChange={e => setCertNumbers(e.target.value)} placeholder="e.g.&#10;PSA: 12345678&#10;BGS: 87654321" rows={3} className="bg-secondary border-border resize-none font-mono text-sm" />
      </div>

      {/* Card List */}
      <div>
        <Label className="text-foreground mb-1 block">List of Stolen Cards *</Label>
        <Textarea value={form.card_list} onChange={e => set('card_list', e.target.value)} placeholder="e.g.&#10;2011 Topps Update Mike Trout RC PSA 10&#10;2003 LeBron James Topps Chrome BGS 9.5&#10;..." rows={5} className="bg-secondary border-border resize-none" required />
      </div>

      {/* Total Value */}
      <div>
        <Label className="text-foreground mb-1 block">Total Estimated Value ($) *</Label>
        <Input type="number" min="0" step="0.01" value={form.total_value} onChange={e => set('total_value', e.target.value)} placeholder="0.00" className="bg-secondary border-border" required />
      </div>

      {/* Suspect Description */}
      <div>
        <Label className="text-foreground mb-1 block">Suspect Description (if known)</Label>
        <Textarea value={form.suspect_description} onChange={e => set('suspect_description', e.target.value)} placeholder="e.g. Male, ~30s, 6'0&quot;, wearing a blue hoodie and cap. Left in a grey pickup truck." rows={3} className="bg-secondary border-border resize-none" />
      </div>

      <div className="flex gap-3 pt-1 pb-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border/50">Cancel</Button>
        <Button type="submit" disabled={submitting || !form.card_list || !form.total_value || !location}
          className="flex-1 bg-destructive text-white hover:bg-destructive/90">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending Alert...</> : '🚨 Send BOLO Alert'}
        </Button>
      </div>
    </form>
  );
}