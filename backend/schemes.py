"""Read-only access to the checked-in government scheme snapshots."""

import json
import os
from typing import Dict, List, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLEANED_DIR = os.path.join(BASE_DIR, "data", "cleaned")


def _category_for(portal: str, slug: str) -> str:
    portal_categories = {"pmkisan": "Agriculture", "pmjay": "Health", "scholarships": "Education", "eshram": "Workers", "pmjdy": "Finance"}
    if portal in portal_categories:
        return portal_categories[portal]
    if "housing" in slug or "awas" in slug:
        return "Housing"
    if any(term in slug for term in ("mudra", "bima", "pension", "jyoti")):
        return "Finance"
    return "General"


def load_all_schemes() -> List[Dict]:
    schemes = []
    if not os.path.exists(CLEANED_DIR):
        return schemes
    for portal in os.listdir(CLEANED_DIR):
        portal_path = os.path.join(CLEANED_DIR, portal)
        if not os.path.isdir(portal_path):
            continue
        for filename in os.listdir(portal_path):
            if not filename.endswith(".json") or filename == ".gitkeep":
                continue
            try:
                with open(os.path.join(portal_path, filename), "r", encoding="utf-8") as handle:
                    scheme = json.load(handle)
                slug = filename[:-5]
                scheme.update({"slug": slug, "portal": portal, "category": _category_for(portal, slug)})
                schemes.append(scheme)
            except (OSError, json.JSONDecodeError):
                # A malformed local snapshot must not take down discovery.
                continue
    return schemes


def get_scheme_by_slug(slug: str) -> Optional[Dict]:
    return next((scheme for scheme in load_all_schemes() if scheme.get("slug") == slug), None)
