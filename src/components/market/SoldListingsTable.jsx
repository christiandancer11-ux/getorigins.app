import React from 'react';

export default function SoldListingsTable({ title, icon: Icon, sales, avg, low, high, salesCount, accentColor, bgColor, borderColor }) {
  const hasData = avg != null || (sales && sales.length > 0);

  return (
    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-3 border-b border-border/50 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${bgColor} border ${borderColor} flex items-center justify-center`}>
            <Icon className={`w-3.5 h-3.5 ${accentColor}`} />
          </div>
          <span className="font-semibold text-sm text-foreground">{title}</span>
        </div>
        {salesCount != null && <span className="text-xs text-muted-foreground">{salesCount} sales</span>}
      </div>

      {!hasData ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">No data found for this card.</div>
      ) : (
        <>
          {/* Price range bar */}
          {avg != null && (
            <div className="px-4 py-3 border-b border-border/30 flex items-center gap-4 text-sm flex-wrap">
              {low != null && <span className="text-muted-foreground">Low: <span className="text-green-400 font-semibold">${low}</span></span>}
              <span className="text-muted-foreground">Avg: <span className={`font-bold text-base ${accentColor}`}>${avg}</span></span>
              {high != null && <span className="text-muted-foreground">High: <span className="text-foreground font-semibold">${high}</span></span>}
            </div>
          )}

          {/* Listings */}
          {sales && sales.length > 0 ? (
            <div className="divide-y divide-border/20">
              {sales.map((s, i) => (
                <div key={i} className="px-4 py-2.5 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{s.title || '—'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.condition || ''}{s.date ? ` · ${s.date}` : ''}</p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${accentColor}`}>${s.price != null ? s.price.toFixed(2) : '—'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-4 text-center text-xs text-muted-foreground">No individual listings available.</div>
          )}
        </>
      )}
    </div>
  );
}