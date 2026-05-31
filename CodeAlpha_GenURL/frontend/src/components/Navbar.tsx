/**
 * Navbar Component
 * Responsive top navigation bar with logo, title, and scrolling backdrop behavior.
 * Uses a solid high-contrast dark backing on scroll so that page text does not overlap or bleed.
 */

import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to swap styles for readability
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#120905]/95 backdrop-blur-[12px] border-b border-warm-beige/20 shadow-card py-3.5'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo + Brand */}
        <div className="flex items-center gap-3">
          {/* SVG Logo Mark */}
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-dark-brown to-mid-brown animate-glow" />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="relative w-5 h-5 text-light-cream"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101"
              />
            </svg>
          </div>

          {/* Brand Name */}
          <span className="font-display font-bold text-xl tracking-tight">
            <span className="text-gradient">Gen</span>
            <span className="text-light-cream font-extrabold">URL</span>
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden sm:flex items-center gap-6 text-sm font-bold text-light-cream">
          <a
            href="#home"
            className="hover:text-white transition-colors duration-200"
          >
            Home
          </a>
          <a
            href="#features"
            className="hover:text-white transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#shorten"
            className="px-6 py-2.5 rounded-xl bg-dark-brown/90 border border-warm-beige/35
                       hover:bg-mid-brown hover:border-warm-beige/60 hover:text-white
                       text-light-cream font-bold text-xs uppercase tracking-wider
                       transition-all duration-200 hover:scale-105 shadow-[0_4px_12px_rgba(98,43,20,0.3)]"
          >
            Get Started
          </a>
        </div>

        {/* Mobile hamburger dots */}
        <div className="sm:hidden flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-1.5 h-1.5 rounded-full bg-warm-beige"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
