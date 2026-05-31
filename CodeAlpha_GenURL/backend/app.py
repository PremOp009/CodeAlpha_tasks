"""
Flask backend for the URL Shortener application.
Endpoints:
  POST /shorten        — shorten a URL (supports custom alias)
  GET  /<short_code>   — redirect to original URL
  GET  /stats/<code>   — return stats for a code
  GET  /history        — return all shortened URLs
  GET  /health         — health check
"""

import os
import random
import socket
import string
import re
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from models import db, URLMapping

# ─── App Configuration ───────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(BASE_DIR, 'urls.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
# Force create database tables on Render before the first request
with app.app_context():
    db.create_all()

# ─── Helpers ─────────────────────────────────────────────────────────────────

URL_REGEX = re.compile(
    r"^(https?://)"
    r"(([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})"
    r"(:\d+)?"
    r"(/[^\s]*)?$",
    re.IGNORECASE,
)

# Valid alias: 2-30 chars, letters/numbers/hyphens only
ALIAS_REGEX = re.compile(r"^[a-zA-Z0-9\-]{2,30}$")

# Reserved paths that cannot be used as aliases
RESERVED = {"shorten", "history", "stats", "health", "favicon.ico", "static"}


def get_local_ip() -> str:
    """Detect the machine's LAN IP so QR codes are reachable from phones on the same Wi-Fi."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"


BASE_URL = "https://codealpha-genurl.onrender.com"


def is_valid_url(url: str) -> bool:
    return bool(URL_REGEX.match(url.strip()))


def generate_short_code(length: int = 6) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(random.choices(chars, k=length))


def unique_short_code() -> str:
    """Generate a collision-free random short code."""
    while True:
        code = generate_short_code()
        if not URLMapping.query.filter_by(short_code=code).first():
            return code


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.route("/shorten", methods=["POST"])
def shorten_url():
    """
    POST /shorten
    Body: { "url": "https://example.com", "custom_alias": "mylink" }
    """
    data = request.get_json()

    if not data or "url" not in data:
        return jsonify({"error": "Request body must contain a 'url' field."}), 400

    original_url   = data["url"].strip()
    custom_alias   = (data.get("custom_alias") or "").strip().lower()

    # ── Validate URL ──────────────────────────────────────────────────────
    if not is_valid_url(original_url):
        return jsonify({"error": "Invalid URL. Please include http:// or https://."}), 422

    # ── Handle Custom Alias ───────────────────────────────────────────────
    if custom_alias:
        # Validate alias format
        if not ALIAS_REGEX.match(custom_alias):
            return jsonify({
                "error": "Alias must be 2–30 characters and contain only letters, numbers, or hyphens."
            }), 422

        # Block reserved paths
        if custom_alias in RESERVED:
            return jsonify({"error": f"'{custom_alias}' is a reserved word. Please choose another."}), 422

        # Check collision
        if URLMapping.query.filter_by(short_code=custom_alias).first():
            return jsonify({"error": f"Alias '{custom_alias}' is already taken. Try a different one."}), 409

        short_code = custom_alias

    else:
        # No alias — check if this URL was already shortened
        existing = URLMapping.query.filter_by(original_url=original_url).first()
        if existing:
            return jsonify({
                "short_url":     f"{BASE_URL}/{existing.short_code}",
                "short_code":    existing.short_code,
                "clicks":        existing.clicks,
                "already_exists": True,
            }), 200

        short_code = unique_short_code()

    # ── Save to DB ────────────────────────────────────────────────────────
    new_mapping = URLMapping(original_url=original_url, short_code=short_code)
    db.session.add(new_mapping)
    db.session.commit()

    return jsonify({
        "short_url":     f"{BASE_URL}/{short_code}",
        "short_code":    short_code,
        "clicks":        0,
        "already_exists": False,
    }), 201


@app.route("/<short_code>", methods=["GET"])
def redirect_to_original(short_code: str):
    """GET /<short_code> — redirect and increment click counter."""
    mapping = URLMapping.query.filter_by(short_code=short_code).first()
    if not mapping:
        return jsonify({"error": f"Short code '{short_code}' not found."}), 404

    mapping.clicks += 1
    db.session.commit()

    return redirect(mapping.original_url, code=302)


@app.route("/stats/<short_code>", methods=["GET"])
def get_stats(short_code: str):
    """GET /stats/<short_code> — return metadata for a short code."""
    mapping = URLMapping.query.filter_by(short_code=short_code).first()
    if not mapping:
        return jsonify({"error": "Short code not found."}), 404
    return jsonify(mapping.to_dict(BASE_URL)), 200


@app.route("/history", methods=["GET"])
def get_history():
    """
    GET /history
    Returns all shortened URLs ordered by most recent first.
    Optional query param: ?limit=20 (default 50)
    """
    limit = min(int(request.args.get("limit", 50)), 200)
    mappings = (
        URLMapping.query
        .order_by(URLMapping.created_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify([m.to_dict(BASE_URL) for m in mappings]), 200


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "URL Shortener API is running."}), 200


# ─── Startup ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    with app.app_context():
        db.drop_all()  # Drops old tables to perform clean schema migration
        db.create_all()  # Creates new tables with 'clicks' column
        print("✅ Database tables successfully migrated and created.")
    print(f"🌐 Server accessible on your network at: http://{LOCAL_IP}:5000")
    print(f"📱 QR codes will use: {BASE_URL}")
    app.run(debug=True, host="0.0.0.0", port=5000)
