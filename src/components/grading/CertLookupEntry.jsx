import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, Camera, Upload, Loader2, Search, AlertCircle, ChevronDown } from 'lucide-react';

export default function CertLookupEntry({ onClose }) {
  // TODO: Migrate cert lookup to Supabase
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-bold text-foreground">Certificate Lookup</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>
      <div className="text-center py-8">
        <p className="text-muted-foreground">Certificate lookup is temporarily unavailable during migration.</p>
      </div>
    </div>
  );
}