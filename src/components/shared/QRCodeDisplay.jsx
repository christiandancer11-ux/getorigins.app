import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QRCodeDisplay({ code, size = 200 }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(origin + '/scan/' + code)}&bgcolor=0d1117&color=e5a825&format=svg`;
  const pngUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(origin + '/scan/' + code)}&bgcolor=0d1117&color=e5a825&format=png`;

  const handleDownload = async () => {
    const res = await fetch(pngUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `origins-qr-${code}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-xl overflow-hidden border-2 border-primary/30 p-3 bg-background inline-block">
        <img src={qrUrl} alt="QR Code" width={size} height={size} className="rounded-lg" />
      </div>
      <p className="text-xs text-muted-foreground font-mono tracking-wider uppercase mt-3 mb-3">{code}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="border-primary/30 text-primary hover:bg-primary/10 gap-2"
      >
        <Download className="w-3.5 h-3.5" />
        Download QR Code
      </Button>
    </div>
  );
}