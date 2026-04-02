import React from 'react';

export default function QRCodeDisplay({ code, size = 200 }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(window.location.origin + '/scan/' + code)}&bgcolor=0d1117&color=e5a825&format=svg`;

  return (
    <div className="relative">
      <div className="rounded-xl overflow-hidden border-2 border-primary/30 p-3 bg-background inline-block">
        <img
          src={qrUrl}
          alt="QR Code"
          width={size}
          height={size}
          className="rounded-lg"
        />
      </div>
      <div className="mt-3 text-center">
        <p className="text-xs text-muted-foreground font-mono tracking-wider uppercase">{code}</p>
      </div>
    </div>
  );
}