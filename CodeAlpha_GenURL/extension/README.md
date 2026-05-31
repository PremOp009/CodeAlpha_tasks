# GenURL Chrome Extension

A premium Chrome extension that integrates with your **GenURL** Flask backend to shorten URLs in one click.

---

## ⚡ Quick Setup (2 minutes)

### Step 1 — Generate the icons

Open a terminal in `GenURL/extension/` and run:

```bash
python generate_icons.py
```

This creates `icons/icon16.png`, `icons/icon48.png`, and `icons/icon128.png` using only Python's built-in libraries.

---

### Step 2 — Load the extension in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Toggle **Developer mode** ON (top-right corner)
3. Click **"Load unpacked"**
4. Select the folder: `C:\Users\baps\Desktop\GenURL\extension`
5. The **GenURL** extension will appear in your toolbar 🎉

---

### Step 3 — Make sure the backend is running

The extension connects to `https://codealpha-genurl.onrender.com`. Your backend should already be running:

```bash
# In GenURL/backend/
python app.py
```

The green dot in the extension popup confirms the API is reachable.

---

## 🧩 Features

| Feature | How |
|---|---|
| **Auto-fill URL** | Opens with the current tab's URL pre-filled |
| **One-click shorten** | Hit "Shorten URL" or press Enter |
| **Custom alias** | Type a custom alias (e.g. `my-link`) |
| **Copy to clipboard** | Click the copy icon next to the result |
| **Recent links** | Last 5 shortened URLs shown at the bottom |
| **Right-click shorten** | Right-click any link/page → "⚡ Shorten with GenURL" |
| **Status indicator** | Green/red dot shows if your API is online |

---

## 📁 File Structure

```
extension/
├── manifest.json        ← Chrome Manifest V3
├── popup.html           ← Extension popup UI
├── popup.css            ← Premium dark glassmorphism styles
├── popup.js             ← Popup logic
├── background.js        ← Service worker (context menu)
├── generate_icons.py    ← Run once to create icons
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🔄 After making changes

If you edit any extension file, go to `chrome://extensions/` and click the **↺ refresh** button on the GenURL card to reload the extension.

---

## 🚀 Production note

Currently configured for `https://codealpha-genurl.onrender.com`. To deploy publicly, change `API_BASE` in `popup.js` and `background.js` to your hosted backend URL, and update `host_permissions` in `manifest.json`.
