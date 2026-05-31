"""
GenURL Icon Generator — uses your EXACT custom brand icon.
Resizes the exact user-selected image directly into icons/icon16.png, icon48.png, icon128.png
Also saves a copy as source_icon.png in the extension folder for consistency.

Requirements: pip install Pillow
Run:          python make_icons.py
"""
import os, sys

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons")
os.makedirs(OUT, exist_ok=True)

# ── Source icon — using the exact artifact path from your request ─────
EXACT_SOURCE = r"C:\Users\baps\.gemini\antigravity\brain\59db640b-dd18-4a62-acad-4b6e40660938\genurl_brand_icon_1779021804503.png"
LOCAL_COPY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "source_icon.png")

if not os.path.exists(EXACT_SOURCE):
    print(f"❌ Exact source icon not found at: {EXACT_SOURCE}")
    sys.exit(1)

try:
    from PIL import Image
except ImportError:
    print("❌ Pillow not installed. Please run: pip install Pillow")
    sys.exit(1)

# Open the exact image
img = Image.open(EXACT_SOURCE).convert("RGBA")

# Save a local backup copy in the extension directory
img.save(LOCAL_COPY, "PNG")
print(f"📁 Saved backup copy of exact logo to: {LOCAL_COPY}")

# Generate the 3 Chrome extension icon sizes
for size in (16, 48, 128):
    print(f"Resizing exact logo to {size}×{size} ...", end=" ", flush=True)
    resized  = img.resize((size, size), Image.LANCZOS)
    out_path = os.path.join(OUT, f"icon{size}.png")
    resized.save(out_path, "PNG")
    print("✅")

print(f"\n🎉 Exact logo successfully resized and saved to: {OUT}")
