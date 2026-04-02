import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Plus, QrCode, Trophy, BarChart2, User, Handshake } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isLanding ? 'bg-transparent' : 'bg-background/80 backdrop-blur-xl border-b border-border/50'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <QrCode className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display text-xl font-bold text-foreground tracking-tight">Origins</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Layers className="w-4 h-4 mr-2" />
              My Cards
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
          </Link>
          <Link to="/analytics">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <BarChart2 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link to="/card-show">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Handshake className="w-4 h-4 mr-2" />
              Card Show
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Register Card
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}