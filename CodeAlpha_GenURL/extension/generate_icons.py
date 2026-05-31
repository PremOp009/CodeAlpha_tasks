"""
Standalone icon generator — no external dependencies beyond Pillow.
Run: python generate_icons.py
"""
import struct, zlib, os, math

OUT_DIR = os.path.join(os.path.dirname(__file__), "icons")
os.makedirs(OUT_DIR, exist_ok=True)

def make_png(size):
    """Generate a purple-gradient chain-link icon as raw PNG bytes."""
    w = h = size
    img = []

    for y in range(h):
        row = []
        for x in range(w):
            # Normalised coords
            nx = x / (w - 1)
            ny = y / (h - 1)

            # Background gradient: deep purple (#0f0c29) → indigo (#302b63)
            r_bg = int(0x0f + (0x30 - 0x0f) * nx)
            g_bg = int(0x0c + (0x2b - 0x0c) * ny)
            b_bg = int(0x29 + (0x63 - 0x29) * (nx * 0.5 + ny * 0.5))

            # Soft radial glow at top-right
            gx, gy = nx - 0.75, ny - 0.25
            glow = max(0, 1 - math.sqrt(gx*gx + gy*gy) / 0.5)
            r_bg = min(255, r_bg + int(40 * glow))
            g_bg = min(255, g_bg + int(10 * glow))
            b_bg = min(255, b_bg + int(80 * glow))

            # Draw a simple chain-link "G" mark using two circles
            cx, cy = nx - 0.5, ny - 0.5  # centre-relative
            # outer ring of top-left link
            d1 = math.sqrt((nx - 0.35)**2 + (ny - 0.38)**2)
            # outer ring of bottom-right link
            d2 = math.sqrt((nx - 0.65)**2 + (ny - 0.62)**2)
            inner_t = 0.12
            outer_t = 0.22
            # scale radii by size ratio
            s = size / 128

            on_ring1 = inner_t * s < d1 < outer_t * s and ny < 0.60
            on_ring2 = inner_t * s < d2 < outer_t * s and ny > 0.40

            if on_ring1 or on_ring2:
                # Violet-to-blue gradient on the link icon
                t = nx
                r = int(0xa7 + (0x60 - 0xa7) * t)
                g = int(0x8b + (0xa5 - 0x8b) * t)
                b = int(0xfa + (0xfa - 0xfa) * t)
                # anti-alias edge
                if on_ring1:
                    edge = min(abs(d1 - inner_t*s), abs(d1 - outer_t*s)) / (0.03*s)
                else:
                    edge = min(abs(d2 - inner_t*s), abs(d2 - outer_t*s)) / (0.03*s)
                alpha = min(255, int(edge * 255))
                row += [r, g, b, alpha]
            else:
                row += [r_bg, g_bg, b_bg, 255]
        img.append(bytes(row))

    def png_chunk(tag, data):
        c = zlib.crc32(tag + data) & 0xffffffff
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", c)

    raw = b""
    for row in img:
        raw += b"\x00" + row  # filter type None

    compressed = zlib.compress(raw, 9)

    sig    = b"\x89PNG\r\n\x1a\n"
    ihdr_d = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)  # 8-bit RGBA... wait, type 6=RGBA
    ihdr_d = struct.pack(">II", w, h) + bytes([8, 6, 0, 0, 0])
    ihdr   = png_chunk(b"IHDR", ihdr_d)
    idat   = png_chunk(b"IDAT", compressed)
    iend   = png_chunk(b"IEND", b"")

    return sig + ihdr + idat + iend

for size in (16, 48, 128):
    data = make_png(size)
    path = os.path.join(OUT_DIR, f"icon{size}.png")
    with open(path, "wb") as f:
        f.write(data)
    print(f"✅  icon{size}.png  ({size}×{size})")

print("\n🎉  All icons generated — no external dependencies needed!")
