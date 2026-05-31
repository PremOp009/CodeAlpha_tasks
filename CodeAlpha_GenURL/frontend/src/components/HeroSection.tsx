/**
 * HeroSection Component
 * Animated hero with headline, subtext, and decorative orbs.
 */

import React from 'react';

interface HeroSectionProps {
  onScrollToForm: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToForm }) => {
  return (
    <section
      id="home"
      className="relative flex flex-col items-center justify-center
                 min-h-[60vh] pt-32 pb-16 px-4 overflow-hidden"
    >
      {/* ── Ambient Orbs ─────────────────────────────────────────────── */}
      <div
        className="hero-orb w-96 h-96 bg-dark-brown/50 -top-24 -left-32"
        style={{ animationDuration: '6s' }}
      />
      <div
        className="hero-orb w-80 h-80 bg-mid-brown/30 top-0 right-0"
        style={{ animationDuration: '8s', animationDelay: '2s' }}
      />
      <div
        className="hero-orb w-64 h-64 bg-warm-beige/15 bottom-0 left-1/3"
        style={{ animationDuration: '10s', animationDelay: '4s' }}
      />

      {/* ── Badge ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center gap-2 px-4 py-2 mb-8
                      rounded-full border border-warm-beige/20
                      bg-dark-brown/30 backdrop-blur-sm
                      text-warm-beige text-sm font-medium
                      animate-fade-in">
        <span className="w-2 h-2 rounded-full bg-mid-brown animate-pulse" />
        Lightning-fast URL Shortening
      </div>

      {/* ── Headline ──────────────────────────────────────────────────── */}
      <h1 className="relative z-10 font-display text-center font-black
                     text-5xl sm:text-6xl lg:text-7xl leading-none tracking-tight
                     mb-6 animate-slide-up text-shadow">
        <span className="block text-light-cream">Shorten.</span>
        <span className="block text-gradient mt-1">Share. Connect.</span>
      </h1>

      {/* ── Subtext ───────────────────────────────────────────────────── */}
      <p className="relative z-10 max-w-lg text-center text-warm-beige/80
                    text-lg sm:text-xl leading-relaxed mb-10
                    animate-fade-in font-light"
         style={{ animationDelay: '0.2s' }}>
        Transform any long URL into a sleek, shareable link in seconds.
        Track clicks, generate QR codes, and manage your links effortlessly.
      </p>

      {/* ── CTA Button ────────────────────────────────────────────────── */}
      <button
        onClick={onScrollToForm}
        className="btn-primary relative z-10 text-base px-10 py-4
                   animate-fade-in flex items-center gap-2"
        style={{ animationDelay: '0.4s' }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path
            fillRule="evenodd"
            d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        Start Shortening
      </button>

      {/* ── Stats Row ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-wrap justify-center gap-6 mt-14
                      animate-fade-in" style={{ animationDelay: '0.6s' }}>
        {[
          { label: 'Links Shortened', value: '10K+' },
          { label: 'Avg. Redirect Speed', value: '<10ms' },
          { label: 'Uptime', value: '99.9%' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="font-display text-2xl font-bold text-light-cream">
              {stat.value}
            </div>
            <div className="text-warm-beige/60 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Bottom gradient fade ───────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-32
                      bg-gradient-to-t from-[#1a0d08] to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
