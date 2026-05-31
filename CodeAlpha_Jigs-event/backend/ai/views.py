"""
AI views — Hugging Face-powered event description generation.
POST /api/ai/generate-description
"""
import os
import json
import re
import random
import hashlib
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings


# ── Category-specific content pools for smart fallback ──────────────
CATEGORY_DATA = {
    "music": {
        "verbs": ["groove", "vibe", "jam", "celebrate", "dance"],
        "adjectives": ["electrifying", "soul-stirring", "rhythmic", "melodic", "pulsating"],
        "activities": [
            "Live performances by acclaimed artists",
            "Interactive jam sessions and open mics",
            "Sound engineering masterclass",
            "Genre-blending musical collaborations",
            "Curated vinyl listening lounge",
        ],
        "audiences": ["music lovers", "musicians", "audiophiles", "DJs", "performers"],
    },
    "tech": {
        "verbs": ["innovate", "build", "hack", "disrupt", "create"],
        "adjectives": ["cutting-edge", "groundbreaking", "futuristic", "transformative", "next-gen"],
        "activities": [
            "Hands-on coding workshops",
            "AI and machine learning demos",
            "Startup pitch competitions",
            "Tech panel with industry leaders",
            "Networking with top engineers",
        ],
        "audiences": ["developers", "founders", "engineers", "tech enthusiasts", "innovators"],
    },
    "sports": {
        "verbs": ["compete", "train", "conquer", "push limits", "champion"],
        "adjectives": ["adrenaline-pumping", "fierce", "thrilling", "action-packed", "high-energy"],
        "activities": [
            "Live competitive matches",
            "Training sessions with pro athletes",
            "Sports science and nutrition talks",
            "Team-building tournaments",
            "Fan zones with exclusive merchandise",
        ],
        "audiences": ["athletes", "fitness enthusiasts", "sports fans", "coaches", "competitors"],
    },
    "art": {
        "verbs": ["create", "inspire", "express", "imagine", "discover"],
        "adjectives": ["breathtaking", "immersive", "visionary", "captivating", "thought-provoking"],
        "activities": [
            "Live art installations and exhibits",
            "Interactive painting and sculpting workshops",
            "Art critique sessions with curators",
            "Digital art and NFT showcases",
            "Artist portfolio reviews",
        ],
        "audiences": ["artists", "designers", "creatives", "collectors", "art enthusiasts"],
    },
    "food": {
        "verbs": ["savor", "taste", "indulge", "explore flavors", "feast"],
        "adjectives": ["mouth-watering", "gourmet", "artisanal", "delectable", "flavorful"],
        "activities": [
            "Chef-led cooking demonstrations",
            "Curated food and wine tasting",
            "Farm-to-table dining experience",
            "Culinary competition and cook-offs",
            "Exotic cuisine exploration stations",
        ],
        "audiences": ["foodies", "home cooks", "chefs", "food bloggers", "culinary enthusiasts"],
    },
    "business": {
        "verbs": ["network", "strategize", "scale", "lead", "invest"],
        "adjectives": ["high-impact", "strategic", "empowering", "industry-leading", "game-changing"],
        "activities": [
            "Keynote by Fortune 500 leaders",
            "Investor pitch sessions",
            "Growth hacking workshops",
            "B2B networking roundtables",
            "Market trend analysis panels",
        ],
        "audiences": ["entrepreneurs", "executives", "investors", "marketers", "business leaders"],
    },
    "education": {
        "verbs": ["learn", "grow", "master", "explore", "discover"],
        "adjectives": ["enlightening", "transformative", "comprehensive", "hands-on", "insightful"],
        "activities": [
            "Expert-led masterclasses",
            "Peer-to-peer learning circles",
            "Research showcases and poster sessions",
            "Career guidance and mentorship meetups",
            "Interactive skill-building labs",
        ],
        "audiences": ["students", "educators", "lifelong learners", "researchers", "professionals"],
    },
    "health": {
        "verbs": ["heal", "rejuvenate", "thrive", "transform", "restore"],
        "adjectives": ["revitalizing", "holistic", "rejuvenating", "wellness-focused", "life-changing"],
        "activities": [
            "Guided meditation and yoga sessions",
            "Nutrition and meal-planning workshops",
            "Mental health awareness panels",
            "Fitness challenge and bootcamp",
            "Wellness product expo",
        ],
        "audiences": ["wellness seekers", "fitness enthusiasts", "health professionals", "yoga practitioners", "mindfulness advocates"],
    },
}

DEFAULT_CATEGORY = {
    "verbs": ["experience", "enjoy", "celebrate", "connect", "discover"],
    "adjectives": ["extraordinary", "unforgettable", "inspiring", "dynamic", "remarkable"],
    "activities": [
        "Engaging keynote presentations",
        "Interactive breakout sessions",
        "Premium networking opportunities",
        "Live demonstrations and showcases",
        "Exclusive giveaways and prizes",
    ],
    "audiences": ["enthusiasts", "professionals", "community members", "curious minds", "passionate individuals"],
}


def _detect_category(idea: str) -> dict:
    """Detect the best category pool from the idea text."""
    idea_lower = idea.lower()
    scores = {}
    keywords_map = {
        "music": ["music", "concert", "band", "song", "dj", "festival", "beat", "melody", "sing", "rap", "jazz", "rock"],
        "tech": ["tech", "code", "software", "hack", "ai", "startup", "developer", "programming", "data", "cyber", "app", "digital"],
        "sports": ["sport", "fitness", "game", "match", "race", "run", "marathon", "gym", "football", "cricket", "basketball", "yoga"],
        "art": ["art", "paint", "draw", "gallery", "exhibit", "sculpture", "design", "creative", "photography", "film"],
        "food": ["food", "cook", "chef", "cuisine", "recipe", "restaurant", "taste", "bake", "culinary", "wine", "dinner"],
        "business": ["business", "startup", "entrepreneur", "invest", "marketing", "finance", "leadership", "corporate", "pitch", "revenue"],
        "education": ["education", "learn", "school", "workshop", "seminar", "training", "course", "university", "skill", "study"],
        "health": ["health", "wellness", "meditation", "mental", "fitness", "nutrition", "yoga", "mindful", "therapy", "healing"],
    }
    for cat, kws in keywords_map.items():
        scores[cat] = sum(1 for kw in kws if kw in idea_lower)
    best = max(scores, key=scores.get)
    if scores[best] > 0:
        return CATEGORY_DATA.get(best, DEFAULT_CATEGORY)
    return DEFAULT_CATEGORY


class GenerateEventDescriptionView(APIView):
    """
    POST /api/ai/generate-description
    Accepts: { "idea": "short event concept" }
    Returns: { "description", "tagline", "highlights", "seo_summary" }
    Uses Hugging Face Inference API with Mistral model.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        idea = request.data.get('idea', '').strip()
        if not idea:
            return Response({'error': 'Event idea is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(idea) > 500:
            return Response({'error': 'Idea must be under 500 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        api_key = settings.HUGGINGFACE_API_KEY
        if not api_key:
            print("[AI] No HUGGINGFACE_API_KEY set — using smart fallback.")
            return self._smart_fallback(idea)

        prompt = f"""[INST] You are an expert event copywriter. 
Given this event idea: "{idea}"

Generate the following strictly in JSON format without any other text or markdown:
{{
  "description": "A compelling 150-200 word event description",
  "tagline": "A catchy one-liner tagline (max 10 words)",
  "highlights": ["highlight 1", "highlight 2", "highlight 3", "highlight 4"],
  "seo_summary": "A 60-word SEO-friendly meta description"
}}
[/INST]"""

        try:
            print(f"[AI] Calling HF model: {settings.HUGGINGFACE_MODEL}")
            response = requests.post(
                f"https://api-inference.huggingface.co/models/{settings.HUGGINGFACE_MODEL}",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": 512,
                        "temperature": 0.7,
                        "return_full_text": False,
                    },
                    "options": {
                        "wait_for_model": True
                    }
                },
                timeout=60,
            )

            print(f"[AI] HF response status: {response.status_code}")
            if response.status_code != 200:
                print(f"[AI] HF error body: {response.text[:500]}")
                return self._smart_fallback(idea)

            result = response.json()
            generated_text = result[0].get('generated_text', '') if isinstance(result, list) else ''
            print(f"[AI] Generated text length: {len(generated_text)}")

            # Parse JSON from response
            json_match = re.search(r'\{.*\}', generated_text, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                # Validate expected keys
                required = {"description", "tagline", "highlights", "seo_summary"}
                if required.issubset(data.keys()):
                    print("[AI] Successfully parsed AI response.")
                    return Response(data)
                else:
                    print(f"[AI] Missing keys in parsed JSON: {required - data.keys()}")

            print(f"[AI] Could not parse JSON from response. Falling back.")
            return self._smart_fallback(idea)

        except json.JSONDecodeError as e:
            print(f"[AI] JSON parse error: {e}")
            return self._smart_fallback(idea)
        except requests.exceptions.Timeout:
            print("[AI] HF API request timed out.")
            return self._smart_fallback(idea)
        except Exception as e:
            print(f"[AI] Unexpected error: {e}")
            return self._smart_fallback(idea)

    def _smart_fallback(self, idea: str):
        """
        Generate varied, context-aware content based on the event idea.
        Uses keyword detection and seeded randomness for unique but
        deterministic-per-idea outputs.
        """
        cat = _detect_category(idea)

        # Seed randomness with idea hash so same idea = same output,
        # but different ideas = different output
        seed = int(hashlib.md5(idea.encode()).hexdigest(), 16) % (10**9)
        rng = random.Random(seed)

        verb1, verb2 = rng.sample(cat["verbs"], 2)
        adj1, adj2 = rng.sample(cat["adjectives"], 2)
        highlights = rng.sample(cat["activities"], 4)
        aud1, aud2 = rng.sample(cat["audiences"], 2)

        description = (
            f"Get ready to {verb1} at this {adj1} event — {idea}! "
            f"Designed for {aud1} and {aud2} alike, this is your chance to "
            f"{verb2} alongside a vibrant community of passionate people. "
            f"Expect {adj2} sessions, hands-on activities, and moments that "
            f"will leave you inspired long after the event ends. "
            f"From curated experiences to spontaneous connections, every detail "
            f"has been crafted to deliver maximum impact and genuine value. "
            f"Whether you're looking to level up your skills, expand your network, "
            f"or simply have an incredible time — this event has it all. "
            f"Spaces are limited, so grab your spot before it's gone!"
        )

        tagline_templates = [
            f"Where {aud1} come to {verb1}",
            f"{adj1.capitalize()} vibes. {adj2.capitalize()} moments.",
            f"Your next {adj1} experience awaits",
            f"Come {verb1}. Leave inspired.",
            f"Built for {aud1}. Loved by all.",
        ]
        tagline = rng.choice(tagline_templates)

        seo_summary = (
            f"Join {idea} — a {adj1} event for {aud1} and {aud2}. "
            f"Featuring {highlights[0].lower()} and {highlights[1].lower()}. "
            f"Register now on Jigs Events and secure your spot!"
        )

        return Response({
            "description": description,
            "tagline": tagline,
            "highlights": highlights,
            "seo_summary": seo_summary,
        })
