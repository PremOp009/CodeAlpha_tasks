/**
 * ResultCard Component
 * Displays the shortened URL result with copy button, QR code, sharing tools, and click stats.
 * Uses qrcode.react (QRCodeSVG) — works natively in the browser without canvas hacks.
 * Features official, pixel-perfect social icons and standard sharing URLs.
 */

import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Counter from './Counter';
import type { ShortenResult } from '../types';

interface ResultCardProps {
  result: ShortenResult;
  onAddToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onAddToast }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // ── Copy short URL to clipboard ─────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.short_url);
      setCopied(true);
      onAddToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      (document.getElementById('short-url-display') as HTMLInputElement)?.select();
    }
  };

  // ── Open link in new tab ─────────────────────────────────────────────
  const handleOpen = () => {
    window.open(result.short_url, '_blank', 'noopener,noreferrer');
  };

  // ── Share Helpers ───────────────────────────────────────────────────
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out this short link: ${result.short_url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Shortened with GenURL! 🚀 `);
    const url = encodeURIComponent(result.short_url);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(result.short_url);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  // ── Download QR as PNG via hidden canvas ─────────────────────────────
  const handleDownloadQR = () => {
    const svgEl = qrRef.current?.querySelector('svg');
    if (!svgEl) return;

    const serialized = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([serialized], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#E4D6A9';
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `genurl-qr-${result.short_code}.png`;
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const truncate = (str: string, max = 80) =>
    str.length > max ? str.slice(0, max) + '…' : str;

  return (
    <section className="px-4 pb-12 animate-bounce-in">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card rounded-3xl overflow-hidden animate-slide-up">
          <div className="h-1.5 w-full bg-gradient-to-r from-dark-brown via-mid-brown to-warm-beige" />

          <div className="p-8 sm:p-10">
            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-mid-brown/30 border border-mid-brown/40
                              flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-light-cream">
                  <path fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd" />
                </svg>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-light-cream leading-tight">
                  {result.already_exists ? 'URL Already Shortened!' : 'Short URL Generated!'}
                </h3>
                <p className="text-warm-beige/80 text-xs mt-0.5 font-medium">
                  {result.already_exists
                    ? 'We found an existing short link for this URL.'
                    : 'Your link is ready to share.'}
                </p>
              </div>

              {/* Click analytics badge with animated Counter */}
              <div className="ml-auto stat-badge bg-black/40 border border-warm-beige/25 text-white py-1.5 px-3 flex-shrink-0 flex items-center gap-1.5 shadow-brand">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-warm-beige">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd" />
                </svg>
                <span className="font-extrabold text-white">
                  <Counter value={result.clicks} />
                </span>
                <span className="text-warm-beige text-xs font-semibold">click{result.clicks !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* ── Short URL row with high-visibility styling ───────────────── */}
            <div className="mb-6">
              <label className="text-light-cream text-xs font-bold uppercase tracking-widest mb-2 block">
                Short URL
              </label>
              <div className="flex items-center gap-3 p-4 rounded-2xl
                              bg-mid-brown/10 border-2 border-mid-brown/40
                              hover:border-mid-brown/70 transition-all duration-300
                              shadow-[0_0_25px_rgba(153,95,47,0.15)] focus-within:shadow-[0_0_30px_rgba(153,95,47,0.25)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                  className="w-5 h-5 text-mid-brown flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101" />
                </svg>
                <input
                  id="short-url-display"
                  type="text"
                  readOnly
                  value={result.short_url}
                  className="flex-1 bg-transparent outline-none text-white font-mono
                             text-base font-extrabold cursor-pointer select-all tracking-wide"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button onClick={handleOpen} title="Open in new tab"
                  className="flex-shrink-0 p-2 rounded-xl text-warm-beige hover:text-white
                             hover:bg-warm-beige/10 transition-all duration-200">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Original URL ──────────────────────────────────────────── */}
            <div className="mb-6">
              <label className="text-warm-beige/50 text-xs font-semibold uppercase tracking-widest mb-2 block">
                Original URL
              </label>
              <p className="text-light-cream text-sm font-mono break-all leading-relaxed
                            px-4 py-3 rounded-xl bg-black/30 border border-warm-beige/15">
                {truncate(result.original_url)}
              </p>
            </div>

            {/* ── Share Row ─────────────────────────────────────────────── */}
            <div className="mb-6">
              <label className="text-warm-beige/50 text-xs font-semibold uppercase tracking-widest mb-2.5 block">
                Share Link
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold
                             bg-emerald-950/20 border border-emerald-500/20 text-emerald-400
                             hover:bg-emerald-950/40 hover:border-emerald-500/40 transition-all duration-200"
                >
                  {/* Pixel-perfect official WhatsApp SVG Icon */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.706 1.458h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>WhatsApp</span>
                </button>

                {/* Twitter / X */}
                <button
                  onClick={handleShareTwitter}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold
                             bg-black/40 border border-warm-beige/20 text-light-cream
                             hover:bg-black/60 hover:border-warm-beige/45 transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Twitter / X</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={handleShareLinkedIn}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold
                             bg-blue-950/20 border border-blue-500/20 text-blue-400
                             hover:bg-blue-950/40 hover:border-blue-500/40 transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>LinkedIn</span>
                </button>
              </div>
            </div>

            {/* ── Action Buttons ────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Copy */}
              <button id="copy-btn" onClick={handleCopy}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-5
                            rounded-2xl font-bold text-sm transition-all duration-300 border
                            ${copied
                              ? 'bg-mid-brown/40 border-mid-brown/60 text-light-cream scale-[0.98]'
                              : 'bg-dark-brown/40 border-warm-beige/25 text-warm-beige hover:bg-dark-brown/60 hover:border-warm-beige/50 hover:text-white hover:scale-[1.02]'
                            }`}>
                {copied ? (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    Copy URL
                  </>
                )}
              </button>

              {/* QR Toggle */}
              <button id="qr-btn" onClick={() => setShowQR((v) => !v)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-5
                            rounded-2xl font-bold text-sm transition-all duration-300 border
                            ${showQR
                              ? 'bg-mid-brown/40 border-mid-brown/60 text-light-cream'
                              : 'bg-dark-brown/40 border-warm-beige/25 text-warm-beige hover:bg-dark-brown/60 hover:border-warm-beige/50 hover:text-white hover:scale-[1.02]'
                            }`}>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z"
                    clipRule="evenodd" />
                  <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM15 13a1 1 0 10-2 0 1 1 0 002 0zM14 16a1 1 0 10-2 0 1 1 0 002 0z" />
                </svg>
                {showQR ? 'Hide QR' : 'QR Code'}
              </button>

              {/* Visit */}
              <button id="open-btn" onClick={handleOpen}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3.5 px-5 text-sm">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                Visit Link
              </button>
            </div>

            {/* ── QR Code Panel ─────────────────────────────────────────── */}
            {showQR && (
              <div className="mt-6 pt-6 border-t border-warm-beige/15
                              flex flex-col items-center gap-4 animate-fade-in">
                <p className="text-light-cream text-xs font-bold uppercase tracking-widest">
                  Scan to Open
                </p>

                <div ref={qrRef}
                  className="p-5 rounded-2xl bg-light-cream shadow-card">
                  <QRCodeSVG
                    value={result.short_url}
                    size={180}
                    bgColor="#E4D6A9"
                    fgColor="#622B14"
                    level="M"
                    includeMargin={false}
                  />
                </div>

                <p className="text-warm-beige text-xs text-center max-w-xs font-semibold">
                  Point your camera at the QR code to open{' '}
                  <span className="text-light-cream font-mono block mt-1 underline">
                    {result.short_url}
                  </span>
                </p>

                {/* Download as PNG */}
                <button
                  onClick={handleDownloadQR}
                  className="text-xs text-warm-beige hover:text-white font-bold
                             underline underline-offset-2 transition-colors duration-200
                             flex items-center gap-1.5"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd" />
                  </svg>
                  Download QR Image
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultCard;
