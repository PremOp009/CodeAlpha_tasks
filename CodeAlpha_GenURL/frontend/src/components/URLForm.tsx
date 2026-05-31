/**
 * URLForm Component
 * Input field + optional Custom Alias field + submit button.
 * Features: URL validation, Alias validation, loading state, error feedback,
 * and One-Click Paste Detection on mount.
 */

import React, { useState, useRef, useEffect } from 'react';

interface URLFormProps {
  onShorten: (url: string, customAlias?: string) => Promise<void>;
  isLoading: boolean;
}

/** Basic URL format validation */
function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Valid custom alias: empty OR 2-30 alphanumeric characters and hyphens */
function isValidAlias(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === '') return true;
  return /^[a-zA-Z0-9\-]{2,30}$/.test(trimmed);
}

/** Truncate long URLs for display in the suggestion pill */
function truncateUrl(url: string, max = 42): string {
  return url.length > max ? url.slice(0, max) + '…' : url;
}

const URLForm: React.FC<URLFormProps> = ({ onShorten, isLoading }) => {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [touched, setTouched] = useState(false);

  // ── Paste Detection State ──────────────────────────────────────────────
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // ── On Mount: Read Clipboard ───────────────────────────────────────────
  useEffect(() => {
    const detectClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        const trimmed = text.trim();
        if (trimmed && isValidUrl(trimmed)) {
          setClipboardUrl(trimmed);
          setShowSuggestion(true);
        }
      } catch {
        // Clipboard permission denied or not available — silently skip
      }
    };

    const timer = setTimeout(detectClipboard, 600);
    return () => clearTimeout(timer);
  }, []);

  // ── Accept the clipboard suggestion ───────────────────────────────────
  const handleUseSuggestion = () => {
    if (!clipboardUrl) return;
    setUrl(clipboardUrl);
    setShowSuggestion(false);
    setSuggestionDismissed(true);
    setTouched(false);
    inputRef.current?.focus();
  };

  // ── Dismiss the suggestion ─────────────────────────────────────────────
  const handleDismissSuggestion = () => {
    setShowSuggestion(false);
    setSuggestionDismissed(true);
  };

  const hasUrlError = touched && url.length > 0 && !isValidUrl(url);
  const isUrlEmpty = touched && url.length === 0;
  const hasAliasError = touched && customAlias.length > 0 && !isValidAlias(customAlias);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isValidUrl(url) || !isValidAlias(customAlias)) return;

    await onShorten(url.trim(), customAlias.trim() || undefined);
    setUrl('');
    setCustomAlias('');
    setTouched(false);
    setSuggestionDismissed(false);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text.trim());
      setTouched(false);
      setShowSuggestion(false);
      inputRef.current?.focus();
    } catch {
      // Clipboard access denied
    }
  };

  return (
    <section id="shorten" className="relative px-4 pb-12">
      <div className="max-w-2xl mx-auto">

        {/* ── Clipboard Suggestion Pill ─────────────────────────────────── */}
        <div
          className={`mb-4 transition-all duration-500 ease-out overflow-hidden ${
            showSuggestion && !suggestionDismissed
              ? 'max-h-24 opacity-100 translate-y-0'
              : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl
                          bg-mid-brown/20 border border-mid-brown/40
                          backdrop-blur-sm shadow-brand">
            <div className="w-8 h-8 rounded-xl bg-mid-brown/30 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-light-cream">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-light-cream text-xs font-semibold leading-tight">
                Paste your copied link?
              </p>
              <p className="text-warm-beige/60 text-xs font-mono mt-0.5 truncate">
                {clipboardUrl ? truncateUrl(clipboardUrl) : ''}
              </p>
            </div>

            <button
              type="button"
              onClick={handleUseSuggestion}
              className="flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold
                         bg-gradient-to-r from-dark-brown to-mid-brown text-light-cream
                         hover:opacity-90 hover:scale-105 active:scale-95
                         transition-all duration-200 shadow-brand"
            >
              Use it
            </button>

            <button
              type="button"
              onClick={handleDismissSuggestion}
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                         text-warm-beige/40 hover:text-warm-beige hover:bg-warm-beige/10
                         transition-all duration-200 text-base leading-none"
              aria-label="Dismiss suggestion"
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Main Card ─────────────────────────────────────────────────── */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 animate-slide-up">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-light-cream mb-2">
              Shorten Your URL
            </h2>
            <p className="text-warm-beige/70 text-sm">
              Paste your long link below and customize your shortcut.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Input 1: Original URL */}
            <div>
              <label className="text-warm-beige/60 text-xs font-semibold uppercase tracking-wider mb-2 block">
                Destination URL
              </label>
              <div
                className={`glow-ring rounded-2xl transition-all duration-300 ${
                  hasUrlError || isUrlEmpty ? 'shadow-[0_0_0_2px_rgba(239,68,68,0.5)]' : ''
                }`}
              >
                <div className="input-wrapper rounded-2xl">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    className="w-5 h-5 text-warm-beige/60 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101" />
                  </svg>

                  <input
                    ref={inputRef}
                    id="url-input"
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (touched) setTouched(false);
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder="https://your-very-long-url.com/paste-here"
                    className="url-input flex-1"
                    disabled={isLoading}
                    autoComplete="url"
                    spellCheck={false}
                  />

                  <button
                    type="button"
                    onClick={handlePaste}
                    disabled={isLoading}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold
                               bg-warm-beige/10 text-warm-beige border border-warm-beige/20
                               hover:bg-warm-beige/20 hover:text-light-cream
                               transition-all duration-200 disabled:opacity-40"
                    title="Paste from clipboard"
                  >
                    Paste
                  </button>

                  {url && !isLoading && (
                    <button
                      type="button"
                      onClick={() => { setUrl(''); setTouched(false); inputRef.current?.focus(); }}
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center
                                 rounded-full bg-warm-beige/10 text-warm-beige/60
                                 hover:bg-warm-beige/25 hover:text-warm-beige
                                 transition-all duration-200 text-base leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* URL Validation Message */}
              <div className="h-5 mt-1.5">
                {(hasUrlError || isUrlEmpty) && (
                  <p className="text-red-400/90 text-xs font-medium flex items-center gap-1.5 animate-fade-in">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd" />
                    </svg>
                    {isUrlEmpty
                      ? 'Please enter a URL.'
                      : 'Enter a valid URL starting with http:// or https://'}
                  </p>
                )}
              </div>
            </div>

            {/* Input 2: Custom Alias */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-warm-beige/60 text-xs font-semibold uppercase tracking-wider block">
                  Custom Alias (Optional)
                </label>
                <span className="text-warm-beige/40 text-[10px] uppercase font-bold tracking-wider">
                  2–30 alphanumeric chars
                </span>
              </div>
              <div
                className={`glow-ring rounded-2xl transition-all duration-300 ${
                  hasAliasError ? 'shadow-[0_0_0_2px_rgba(239,68,68,0.5)]' : ''
                }`}
              >
                <div className="input-wrapper rounded-2xl bg-black/10">
                  <span className="text-warm-beige/40 text-sm font-mono select-none pr-1">
                    genurl.vercel.app/
                  </span>

                  <input
                    id="alias-input"
                    type="text"
                    value={customAlias}
                    onChange={(e) => {
                      // Allow only letters, numbers, and hyphens
                      const clean = e.target.value.replace(/[^a-zA-Z0-9\-]/g, '');
                      setCustomAlias(clean);
                      if (touched) setTouched(false);
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder="prem"
                    className="url-input flex-1 font-mono text-sm"
                    disabled={isLoading}
                    maxLength={30}
                    spellCheck={false}
                  />

                  {customAlias && !isLoading && (
                    <button
                      type="button"
                      onClick={() => setCustomAlias('')}
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center
                                 rounded-full bg-warm-beige/10 text-warm-beige/60
                                 hover:bg-warm-beige/25 hover:text-warm-beige
                                 transition-all duration-200 text-base leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Alias Validation Message */}
              <div className="h-5 mt-1.5">
                {hasAliasError && (
                  <p className="text-red-400/90 text-xs font-medium flex items-center gap-1.5 animate-fade-in">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd" />
                    </svg>
                    Alias must be 2 to 30 characters (letters, numbers, or hyphens only).
                  </p>
                )}
              </div>
            </div>

            {/* Submit button */}
            <button
              id="shorten-btn"
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-base py-4 flex items-center justify-center gap-3 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clipRule="evenodd" />
                  </svg>
                  Generate Short URL
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default URLForm;
