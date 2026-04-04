import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layers, Plus, Trophy, BarChart2, User, Handshake, Menu, X, TrendingUp, Flame, Bell, PieChart, ShieldAlert, Shield, FileText, Repeat2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { to: '/dashboard', icon: Layers, label: 'My Cards' },
  { to: '/card-show', icon: Handshake, label: 'Card Show' },
  { to: '/market', icon: TrendingUp, label: 'Market' },
  { to: '/trending', icon: Flame, label: 'Trending' },
  { to: '/flipper', icon: Repeat2, label: 'Flipper' },
  { to: '/trade-dashboard', icon: PieChart, label: 'Trade Stats' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/bolo', icon: ShieldAlert, label: 'BOLO' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  // Track last visited path per tab so tapping active tab returns to root
  const tabRoots = useRef(NAV_LINKS.reduce((acc, l) => ({ ...acc, [l.to]: l.to }), {}));

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleTabPress = (to) => {
    if (isActive(to)) {
      navigate(to); // return to tab root
    } else {
      navigate(to);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isLanding && !menuOpen ? 'bg-transparent' : 'bg-background/95 backdrop-blur-xl border-b border-border/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMenuOpen(false)}>
            <img src="https://media.base44.com/images/public/69ceb0c6913655f4b9105f84/7231ac246_BF64DB45-9D7E-4450-BC8E-767F5F7DD0E0.jpeg" alt="Origins" className="h-10 w-10 rounded-lg" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}>
                <Button
                  variant="ghost" size="sm"
                  className={`transition-colors ${isActive(to) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Register button — visible on md+ */}
            <Link to="/register" className="hidden md:block">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1.5" />
                Register Card
              </Button>
            </Link>

            {/* Hamburger — visible below lg */}
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 z-40 w-72 bg-card border-l border-border/50 flex flex-col lg:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-border/50 shrink-0">
                <span className="font-display font-bold text-foreground">Menu</span>
                <button onClick={() => setMenuOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {NAV_LINKS.map(({ to, icon: Icon, label }) => (
                  <Link key={to} to={to} onClick={() => setMenuOpen(false)}>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive(to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="font-medium">{label}</span>
                    </div>
                  </Link>
                ))}
              </nav>

              <div className="space-y-3 px-4 pb-6 shrink-0">
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11">
                    <Plus className="w-4 h-4 mr-2" />
                    Register a Card
                  </Button>
                </Link>

                {/* Footer Links */}
                <div className="pt-3 border-t border-border/40 space-y-2">
                  <Link to="/privacy" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                    Privacy Policy
                  </Link>
                  <Link to="/terms" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                    Terms of Use
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card/95 backdrop-blur-xl border-t border-border/50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around px-1 py-2 max-w-lg mx-auto overflow-x-auto">
          {NAV_LINKS.slice(0, 6).map(({ to, icon: Icon, label }) => (
            <button key={to} onClick={() => handleTabPress(to)} className="flex-1 min-w-0 select-none">
              <div className={`flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl transition-colors ${isActive(to) ? 'text-primary' : 'text-muted-foreground'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-tight truncate w-full text-center">{label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}