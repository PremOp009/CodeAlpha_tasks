/**
 * FeaturesSection Component
 * Highlights the key features of the URL Shortener with animated cards.
 */

import React from 'react';

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Instant Shortening',
    description: 'Generate your short link in milliseconds. No signup, no friction — just paste and go.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Click Analytics',
    description: 'Track how many times your short link has been visited with real-time click counters.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3m2 4H1m18-4h-2M4 4l-.01.01M20 4l-.01.01M4 20l-.01-.01M20 20l-.01-.01" />
      </svg>
    ),
    title: 'QR Code Generator',
    description: 'Download a scannable QR code for any shortened link — perfect for print and presentations.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Duplicate Prevention',
    description: 'Already shortened this URL? We return the same link instantly — no redundant entries.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: 'One-Click Copy',
    description: 'Copy your shortened URL to the clipboard instantly with a single button press.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Mobile First',
    description: 'Fully responsive across all devices. Works flawlessly on phones, tablets, and desktops.',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="px-4 py-20 max-w-6xl mx-auto">
      {/* ── Section Header ─────────────────────────────────────────────── */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-5
                        rounded-full border border-warm-beige/25 bg-dark-brown/30
                        text-light-cream text-sm font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-mid-brown animate-pulse" />
          Everything You Need
        </div>
        <h2 className="font-display text-4xl sm:text-5xl font-black text-light-cream mb-4 leading-tight">
          Packed with <span className="text-gradient">Features</span>
        </h2>
        <p className="text-warm-beige text-lg max-w-xl mx-auto font-medium">
          A powerful yet simple URL shortener built with modern tech and thoughtful UX.
        </p>
      </div>

      {/* ── Feature Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feat, idx) => (
          <div
            key={feat.title}
            className="glass-card rounded-2xl p-6 group
                       hover:border-warm-beige/45 hover:-translate-y-1.5
                       transition-all duration-300 cursor-default"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl mb-4
                            bg-gradient-to-br from-dark-brown to-mid-brown
                            flex items-center justify-center text-light-cream
                            group-hover:scale-110 group-hover:shadow-glow-btn
                            transition-all duration-300">
              {feat.icon}
            </div>

            {/* Text */}
            <h3 className="font-display text-lg font-bold text-light-cream mb-2">
              {feat.title}
            </h3>
            <p className="text-warm-beige/90 text-sm leading-relaxed font-medium">
              {feat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
