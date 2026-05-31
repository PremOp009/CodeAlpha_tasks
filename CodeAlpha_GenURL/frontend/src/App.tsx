/**
 * App.tsx — Root application component.
 * Orchestrates global state, handles URL shortening (with custom alias support),
 * manages active link history, and implements toast notifications.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import URLForm from './components/URLForm';
import ResultCard from './components/ResultCard';
import HistoryList from './components/HistoryList';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import ToastNotification from './components/ToastNotification';
import { shortenUrl, getHistory } from './services/api';
import type { ShortenResult, Toast, HistoryItem } from './types';

const App: React.FC = () => {
  // ── State ──────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [result, setResult] = useState<ShortenResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Ref to the form section for smooth scrolling
  const formRef = useRef<HTMLDivElement>(null);

  // ── Toast Helpers ──────────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Scroll to Form ─────────────────────────────────────────────────────
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ── Load Link History ──────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const data = await getHistory(50);
      setHistory(data);
    } catch {
      // Fail silently or handle with a small log — don't show intrusive error toast automatically on load
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  // Load history once on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ── Handle URL Shortening ──────────────────────────────────────────────
  const handleShorten = async (url: string, customAlias?: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const data = await shortenUrl(url, customAlias);

      const fullResult: ShortenResult = {
        ...data,
        original_url: url,
      };

      setResult(fullResult);

      if (data.already_exists) {
        addToast('Found an existing short link for this URL!', 'info');
      } else {
        addToast(
          customAlias
            ? `Custom alias '${customAlias}' registered successfully!`
            : 'Short URL generated successfully!',
          'success'
        );
      }

      // Refresh recent links list so it shows the new link instantly
      await loadHistory();

      // Scroll result section into view
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { error?: string }; status?: number };
        message?: string;
      };

      const message =
        error?.response?.data?.error ||
        (error?.response?.status === 422
          ? 'Invalid format. Verify the URL is correct.'
          : 'Could not reach server. Verify your Flask app is running.');

      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-grid">
      {/* Notifications */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* Navbar */}
      <Navbar />

      {/* Main Pages composition */}
      <main>
        {/* Animated Hero */}
        <HeroSection onScrollToForm={scrollToForm} />

        {/* Input Form with Custom Alias & Paste Assist */}
        <div ref={formRef}>
          <URLForm onShorten={handleShorten} isLoading={isLoading} />
        </div>

        {/* Generation Results Card */}
        {result && (
          <div id="result-section">
            <ResultCard result={result} onAddToast={addToast} />
          </div>
        )}

        {/* Link History / Dashboard Stats (New Feature 2 & 3) */}
        <HistoryList
          history={history}
          onRefresh={loadHistory}
          isLoading={isHistoryLoading}
          onAddToast={addToast}
        />

        {/* Static Feature grids */}
        <FeaturesSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
