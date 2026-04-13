import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateQRCodeImageUrl } from '@/lib/qr';

export default function QRCodeDisplay({ code, size = 200 }) {
  const qrUrl = generateQRCodeImageUrl(code, size, 'svg');
  const pngUrl = generateQRCodeImageUrl(code, 600, 'png');

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