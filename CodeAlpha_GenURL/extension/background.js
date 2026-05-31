/* ─── GenURL Chrome Extension — Background Service Worker ────────────────── */

const API_BASE = "https://codealpha-genurl.onrender.com";

// ── Context Menu Setup ────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id:       "genurl-shorten",
    title:    "⚡ Shorten with GenURL",
    contexts: ["link", "page", "selection"],
  });
});

// ── Context Menu Click Handler ────────────────────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "genurl-shorten") return;

  // Determine the URL to shorten:
  // 1. If user right-clicked a link  → use linkUrl
  // 2. If user selected text that looks like a URL → use selectionText
  // 3. Otherwise → use the current page URL
  let targetUrl = info.linkUrl || info.pageUrl || tab?.url;

  if (info.selectionText) {
    const trimmed = info.selectionText.trim();
    if (/^https?:\/\//i.test(trimmed)) targetUrl = trimmed;
  }

  if (!targetUrl) {
    showNotification("GenURL Error", "No URL detected to shorten.");
    return;
  }

  try {
    const res  = await fetch(`${API_BASE}/shorten`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ url: targetUrl }),
      signal:  AbortSignal.timeout(6000),
    });

    const data = await res.json();

    if (!res.ok) {
      showNotification("GenURL — Error", data.error || "Could not shorten URL.");
    } else {
      // Copy the short URL to clipboard via offscreen or content script
      await copyToClipboardViaTab(tab, data.short_url);
      showNotification(
        "GenURL — Link Shortened! 🎉",
        `${data.short_url}\nCopied to clipboard.`,
      );
    }
  } catch (err) {
    const msg = err.name === "TimeoutError"
      ? "Request timed out. Is the GenURL server running?"
      : "Could not reach the GenURL server at localhost:5000.";
    showNotification("GenURL — Error", msg);
  }
});

// ── Copy to Clipboard (injected into active tab) ──────────────────────────────
async function copyToClipboardViaTab(tab, text) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func:   (str) => navigator.clipboard.writeText(str),
      args:   [text],
    });
  } catch {
    // If scripting fails (e.g. chrome:// pages), silently ignore
  }
}

// ── Notifications ─────────────────────────────────────────────────────────────
function showNotification(title, message) {
  chrome.notifications.create({
    type:    "basic",
    iconUrl: "icons/icon128.png",
    title,
    message,
  });
}
