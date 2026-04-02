import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Drop-in replacement for Radix Select that uses a bottom Drawer on mobile.
 * Props: value, onValueChange, options=[{value,label}], placeholder
 */
export default function NativeSelect({ value, onValueChange, options = [], placeholder = 'Select...', className = '' }) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const selected = options.find(o => o.value === value);

  const handleSelect = (val) => {
    onValueChange(val);
    setOpen(false);
  };

  if (!isMobile) {
    // Desktop: plain native select for simplicity, styled to match design
    return (
      <div className={`relative ${className}`}>
        <select
          value={value || ''}
          onChange={e => onValueChange(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-secondary px-3 py-1 text-sm text-foreground appearance-none pr-8 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {!value && <option value="" disabled>{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    );
  }

  // Mobile: button + bottom drawer
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`select-none flex items-center justify-between w-full h-9 rounded-md border border-input bg-secondary px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${className}`}
      >
        <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-base">{placeholder}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto max-h-[60vh] pb-safe px-4 pb-6">
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => handleSelect(o.value)}
                className={`select-none w-full text-left px-4 py-3.5 rounded-xl mb-1 text-sm font-medium transition-colors ${
                  o.value === value
                    ? 'bg-primary/15 text-primary'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}