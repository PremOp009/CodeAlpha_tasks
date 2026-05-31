/* ─── GenURL Chrome Extension — Popup Logic ─────────────────────────────── */

const API_BASE = "https://codealpha-genurl.onrender.com";
const HISTORY_LIMIT = 5;

// ── DOM Refs ──────────────────────────────────────────────────────────────────
const urlInput      = document.getElementById("url-input");
const aliasInput    = document.getElementById("alias-input");
const shortenBtn    = document.getElementById("shorten-btn");
const btnText       = document.getElementById("btn-text");
const btnSpinner    = document.getElementById("btn-spinner");
const resultBox     = document.getElementById("result-box");
const resultUrl     = document.getElementById("result-url");
const copyBtn       = document.getElementById("copy-btn");
const copyIcon      = document.getElementById("copy-icon");
const checkIcon     = document.getElementById("check-icon");
const alreadyBadge  = document.getElementById("already-badge");
const clicksCount   = document.getElementById("clicks-count");
const shortCodeLabel= document.getElementById("short-code-label");
const errorBox      = document.getElementById("error-box");
const errorText     = document.getElementById("error-text");
const historyList   = document.getElementById("history-list");
const refreshBtn    = document.getElementById("refresh-btn");
const statusDot     = document.getElementById("status-dot");
const footerApiLink = document.getElementById("footer-api-link");
const footerDashLink= document.getElementById("footer-dash-link");

// ── On Load ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  setupFooterLinks();
  await prefillCurrentTabUrl();
  await checkApiStatus();
  await loadHistory();
});

// ── Prefill current tab URL ────────────────────────────────────────────────────
async function prefillCurrentTabUrl() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && tab.url.startsWith("http")) {
      urlInput.value = tab.url;
    }
  } catch (_) {}
}

// ── API Health Check ──────────────────────────────────────────────────────────
async function checkApiStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      statusDot.classList.add("online");
      statusDot.title = "API is online ✓";
    } else {
      throw new Error();
    }
  } catch {
    statusDot.classList.add("offline");
    statusDot.title = "API is offline — start python app.py";
  }
}

// ── Shorten URL ───────────────────────────────────────────────────────────────
shortenBtn.addEventListener("click", async () => {
  const url   = urlInput.value.trim();
  const alias = aliasInput.value.trim();

  hideResult();
  hideError();

  if (!url) {
    showError("Please enter a URL to shorten.");
    return;
  }

  setLoading(true);

  try {
    const body = { url };
    if (alias) body.custom_alias = alias;

    const res  = await fetch(`${API_BASE}/shorten`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(6000),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Something went wrong. Please try again.");
    } else {
      showResult(data);
      await loadHistory();
    }
  } catch (err) {
    if (err.name === "TimeoutError") {
      showError("Request timed out. Make sure the GenURL server is running.");
    } else {
      showError("Could not reach the GenURL server at localhost:5000.");
    }
  } finally {
    setLoading(false);
  }
});

// Allow Enter key on inputs
urlInput.addEventListener("keydown",   e => e.key === "Enter" && shortenBtn.click());
aliasInput.addEventListener("keydown", e => e.key === "Enter" && shortenBtn.click());

// ── Copy to Clipboard ─────────────────────────────────────────────────────────
copyBtn.addEventListener("click", () => {
  const url = resultUrl.textContent;
  if (!url) return;
  copyToClipboard(url, copyIcon, checkIcon);
});

function copyToClipboard(text, iconHide, iconShow) {
  navigator.clipboard.writeText(text).then(() => {
    iconHide.classList.add("hidden");
    iconShow.classList.remove("hidden");
    setTimeout(() => {
      iconHide.classList.remove("hidden");
      iconShow.classList.add("hidden");
    }, 1800);
  });
}

// ── History ───────────────────────────────────────────────────────────────────
refreshBtn.addEventListener("click", async () => {
  refreshBtn.style.animation = "spin 0.5s linear";
  await loadHistory();
  setTimeout(() => (refreshBtn.style.animation = ""), 500);
});

async function loadHistory() {
  try {
    const res  = await fetch(`${API_BASE}/history?limit=${HISTORY_LIMIT}`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    renderHistory(data);
  } catch {
    historyList.innerHTML = `<div class="history-empty">Could not load history.</div>`;
  }
}

function renderHistory(items) {
  if (!items || items.length === 0) {
    historyList.innerHTML = `<div class="history-empty">No links yet — shorten your first URL!</div>`;
    return;
  }

  historyList.innerHTML = "";
  items.slice(0, HISTORY_LIMIT).forEach(item => {
    const shortUrl   = item.short_url || `${API_BASE}/${item.short_code}`;
    const original   = item.original_url || "";
    const clicks     = item.clicks ?? 0;
    const shortDisp  = shortUrl.replace(/^https?:\/\//, "");
    const origDisp   = original.replace(/^https?:\/\//, "").substring(0, 40);

    const row = document.createElement("div");
    row.className = "history-item";
    row.title     = original;

    row.innerHTML = `
      <div class="history-item-content">
        <div class="history-short">${escapeHtml(shortDisp)}</div>
        <div class="history-original">${escapeHtml(origDisp)}${original.length > 40 ? "…" : ""}</div>
      </div>
      <span class="history-clicks">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
        </svg>
        ${clicks}
      </span>
      <button class="history-copy-btn" data-url="${escapeAttr(shortUrl)}" title="Copy short URL">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    `;

    // Clicking the row opens the short URL
    row.addEventListener("click", e => {
      if (e.target.closest(".history-copy-btn")) return;
      chrome.tabs.create({ url: shortUrl });
    });

    // Copy button in history row
    row.querySelector(".history-copy-btn").addEventListener("click", e => {
      e.stopPropagation();
      const btn      = e.currentTarget;
      const origSvg  = btn.innerHTML;
      navigator.clipboard.writeText(btn.dataset.url).then(() => {
        btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <polyline points="20 6 9 17 4 12" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        setTimeout(() => (btn.innerHTML = origSvg), 1500);
      });
    });

    historyList.appendChild(row);
  });
}

// ── UI Helpers ────────────────────────────────────────────────────────────────
function showResult(data) {
  resultUrl.textContent   = data.short_url;
  clicksCount.textContent = data.clicks ?? 0;
  shortCodeLabel.textContent = data.short_code;

  alreadyBadge.classList.toggle("hidden", !data.already_exists);
  resultBox.classList.remove("hidden");
}

function hideResult() { resultBox.classList.add("hidden"); }

function showError(msg) {
  errorText.textContent = msg;
  errorBox.classList.remove("hidden");
}

function hideError() { errorBox.classList.add("hidden"); }

function setLoading(loading) {
  shortenBtn.disabled = loading;
  btnText.classList.toggle("hidden", loading);
  btnSpinner.classList.toggle("hidden", !loading);
}

// ── Sanitize ──────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

// ── Dynamic Footer Links ──────────────────────────────────────────────────────
function setupFooterLinks() {
  if (footerApiLink) {
    footerApiLink.href = `${API_BASE}/health`;
  }
  if (footerDashLink) {
    // If running locally, point to Vite dev server port 5173.
    // If API_BASE is a production host (e.g. https://api.genurl.com), point to the production frontend root (https://genurl.com).
    if (API_BASE.includes("localhost") || API_BASE.includes("127.0.0.1")) {
      footerDashLink.href = "http://localhost:5173";
    } else {
      // Convert backend API host to frontend domain (e.g. removing api. subdomain or using base)
      const urlObj = new URL(API_BASE);
      let host = urlObj.host;
      if (host.startsWith("api.")) {
        host = host.replace("api.", "");
      }
      footerDashLink.href = `${urlObj.protocol}//${host}`;
    }
  }
}

