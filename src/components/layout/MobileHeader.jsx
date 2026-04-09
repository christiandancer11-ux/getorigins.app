import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QrCode, ChevronLeft } from 'lucide-react';

// Root screens that show logo instead of back button
const ROOT_PATHS = ['/dashboard', '/card-show', '/market', '/trending', '/leaderboard', '/analytics', '/profile', '/'];

export default function MobileHeader({ title, backTo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = ROOT_PATHS.includes(location.pathname);

  if (isRoot) return null; // Navbar handles root screens

  return (
    <div
      className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 flex items-center px-4 h-14"
      style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(3.5rem + env(safe-area-inset-top))' }}
    >
      <button
        onClick={() => backTo ? navigate(backTo) : navigate(-1)}
        className="select-none flex items-center gap-1 text-primary font-medium text-sm -ml-1 pr-4 py-2"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>
      {title && (
        <span className="absolute left-1/2 -translate-x-1/2 font-semibold text-sm text-foreground truncate max-w-[55%]">
          {title}
        </span>
      )}
    </div>
  );
}