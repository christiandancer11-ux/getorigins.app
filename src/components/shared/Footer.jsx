import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';

export default function Footer() {
  const WEBSITE_URL = 'https://www.getorigins.app';

  return (
    <footer className="border-t border-border bg-secondary/20 mt-12 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Origins</h3>
            <p className="text-sm text-muted-foreground">Track and share your trading card collection with the world.</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features" className="text-muted-foreground hover:text-foreground transition">Features</Link></li>
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition">Dashboard</Link></li>
              <li><Link to="/market" className="text-muted-foreground hover:text-foreground transition">Market</Link></li>
              <li><Link to="/trending" className="text-muted-foreground hover:text-foreground transition">Trending</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/support" className="text-muted-foreground hover:text-foreground transition">Support</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition">Privacy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition">Terms</Link></li>
            </ul>
          </div>

          {/* Website */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Visit</h4>
            <a 
              href={WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
            >
              <Globe className="w-4 h-4" />
              getorigins.app
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground">
            © 2026 Origins. All rights reserved. Crafted by Skillerz Breaks.
          </p>
        </div>
      </div>
    </footer>
  );
}