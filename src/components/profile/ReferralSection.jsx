import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Copy, CheckCircle, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReferralSection() {
  const [code, setCode] = useState('');
  const [useCount, setUseCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.functions.invoke('getUserReferralCode', {}).then(res => {
      if (res.data?.code) {
        setCode(res.data.code);
        setUseCount(res.data.use_count || 0);
      }
    }).finally(() => setLoading(false));
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = () => {
    const text = `Use my Origins referral code ${code} to get 7 days free access to all features! https://app.origins.gg`;
    if (navigator.share) {
      navigator.share({ title: 'Origins Referral', text });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-6 mt-5">
      <div className="mb-4">
        <h2 className="font-semibold text-foreground">Your Referral Code</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Share your code — you and your friend both get 7 free days on all features.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />Loading your code...
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 px-4 py-3 rounded-xl bg-secondary border border-border font-mono text-sm font-bold text-primary tracking-widest">
              {code}
            </div>
            <Button variant="outline" size="icon" onClick={copyCode} className="border-border/50 shrink-0">
              {copied ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={shareCode} className="border-border/50 shrink-0">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Used <span className="text-foreground font-semibold">{useCount}</span> time{useCount !== 1 ? 's' : ''} so far.
          </p>
        </>
      )}
    </div>
  );
}