import React from 'react';

export default function ReferralSection() {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-6 mt-5">
      <div className="mb-4">
         <h2 className="font-semibold text-foreground">Referral Program</h2>
         <p className="text-xs text-muted-foreground mt-0.5">Referral rewards are being migrated to the new membership system.</p>
       </div>
      <div className="rounded-2xl bg-secondary/30 p-4 text-sm text-muted-foreground">
        Referral codes are temporarily unavailable. This section will return once referral tracking is migrated to Supabase.
      </div>
    </div>
  );
}

