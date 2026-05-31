"""
Database models for the URL Shortener application.
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class URLMapping(db.Model):
    """Model representing a URL mapping between original and shortened URLs."""

    __tablename__ = "url_mappings"

    id         = db.Column(db.Integer, primary_key=True)
    original_url = db.Column(db.Text, nullable=False)
    short_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    clicks     = db.Column(db.Integer, default=0)          # real click counter
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, base_url: str = "https://codealpha-genurl.onrender.com") -> dict:
        """Serialize the model to a dictionary."""
        return {
            "id":           self.id,
            "original_url": self.original_url,
            "short_code":   self.short_code,
            "short_url":    f"{base_url}/{self.short_code}",
            "clicks":       self.clicks,
            "created_at":   self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<URLMapping {self.short_code} -> {self.original_url[:50]}>"
