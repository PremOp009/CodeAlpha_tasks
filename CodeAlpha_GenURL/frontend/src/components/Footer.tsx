/**
 * Footer Component
 * Simple, elegant footer with brand info and links.
 */

import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-warm-beige/10 bg-black/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-dark-brown to-mid-brown
                            flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                className="w-4 h-4 text-light-cream"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101" />
              </svg>
            </div>
            <div>
              <div className="font-display font-bold text-sm">
                <span className="text-gradient">Gen</span>
                <span className="text-light-cream">URL</span>
              </div>
              <div className="text-warm-beige/70 text-xs mt-0.5 font-medium">
                Shorten. Share. Connect.
              </div>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-warm-beige/60 text-xs font-semibold">
            © {year} GenURL. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
