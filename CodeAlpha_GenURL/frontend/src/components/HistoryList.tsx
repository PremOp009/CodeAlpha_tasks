/**
 * HistoryList Component
 * Renders a list of recently shortened URLs as a dashboard section.
 * Includes copy-to-clipboard buttons, real-time clicks counter badges,
 * external link icons, and share tools.
 */

import React, { useState } from 'react';
import Counter from './Counter';
import type { HistoryItem } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
  onRefresh: () => void;
  isLoading: boolean;
  onAddToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onRefresh, isLoading, onAddToast }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = async (id: number, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      onAddToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleOpen = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const truncate = (str: string, max = 50) =>
    str.length > max ? str.slice(0, max) + '…' : str;

  return (
    <section className="px-4 pb-24 max-w-4xl mx-auto">
      <div className="glass-card rounded-3xl p-6 sm:p-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-light-cream">
              Recent Links
            </h2>
            <p className="text-warm-beige/80 text-xs mt-0.5 font-medium">
              Manage your shortened URLs and track real-time visitor analytics.
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                       bg-warm-beige/10 text-light-cream border border-warm-beige/25
                       hover:bg-warm-beige/20 hover:text-white active:scale-95
                       transition-all duration-200 disabled:opacity-50"
            title="Refresh link history"
          >
            {isLoading ? (
              <div className="spinner !w-3.5 !h-3.5 !border-[1.5px]" />
            ) : (
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.254.653A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.653-1.254z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span>Refresh</span>
          </button>
        </div>

        {/* Links List */}
        {history.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-warm-beige/20 rounded-2xl">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-10 h-10 text-warm-beige/40 mx-auto mb-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
              />
            </svg>
            <p className="text-light-cream text-sm font-bold">
              No links shortened yet.
            </p>
            <p className="text-warm-beige/60 text-xs mt-1">
              Shorten a link above to see it appear in your dashboard history.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4
                           rounded-2xl bg-dark-brown/30 border border-warm-beige/15 hover:border-warm-beige/40
                           transition-all duration-300 group"
              >
                {/* Info Column */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {/* Short Code Link */}
                    <button
                      onClick={() => handleOpen(item.short_url)}
                      className="font-mono text-sm font-extrabold text-light-cream hover:text-white
                                 transition-colors duration-200 text-left truncate flex items-center gap-1.5"
                    >
                      <span className="underline decoration-warm-beige/30 decoration-wavy hover:decoration-white">
                        {item.short_url}
                      </span>
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-warm-beige"
                      >
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </button>
                  </div>

                  {/* Original URL */}
                  <p className="text-warm-beige/80 text-xs font-mono truncate max-w-full">
                    {truncate(item.original_url, 65)}
                  </p>
                </div>

                {/* Metrics + Quick Actions Row */}
                <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                  {/* Real Click Analytics with Animated Counter */}
                  <div className="stat-badge bg-black/40 border border-warm-beige/20 text-light-cream py-1.5 px-3 flex items-center gap-1.5 shadow-brand">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3.5 h-3.5 text-warm-beige"
                    >
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <span className="font-extrabold text-white">
                      <Counter value={item.clicks} />
                    </span>
                    <span className="text-warm-beige text-xs font-semibold">click{item.clicks !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Actions (Copy / Visit) */}
                  <div className="flex items-center gap-2">
                    {/* Copy */}
                    <button
                      onClick={() => handleCopy(item.id, item.short_url)}
                      className={`p-2.5 rounded-xl border transition-all duration-200 ${
                        copiedId === item.id
                          ? 'bg-mid-brown/40 border-mid-brown text-light-cream'
                          : 'bg-warm-beige/5 border-warm-beige/15 text-warm-beige hover:text-white hover:bg-warm-beige/15 hover:border-warm-beige/35'
                      }`}
                      title={copiedId === item.id ? 'Copied' : 'Copy link'}
                    >
                      {copiedId === item.id ? (
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                      )}
                    </button>

                    {/* Visit */}
                    <button
                      onClick={() => handleOpen(item.short_url)}
                      className="p-2.5 rounded-xl bg-warm-beige/5 border border-warm-beige/15 text-warm-beige
                                 hover:text-white hover:bg-warm-beige/15 hover:border-warm-beige/35
                                 transition-all duration-200"
                      title="Open Link"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HistoryList;
