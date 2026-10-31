"""
OSM Agent — Overpass API business discovery for Hyderabad.
100% free, no API key required. Run every 8h via GitHub Actions.
"""

import os
import json
import time
import logging
import warnings
from pathlib import Path
from datetime import datetime
import requests

warnings.filterwarnings("ignore")
from supabase_client import get_supabase

logging.basicConfig(level=logging.INFO, format="%(asctime)s [OSM] %(message)s")
log = logging.getLogger(__name__)

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
]
OVERPASS_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BusinessRadar/1.0"
}


def query_overpass(query: str) -> list:
    for endpoint in OVERPASS_ENDPOINTS:
        try:
            resp = requests.post(endpoint, data={"data": query}, headers=OVERPASS_HEADERS, timeout=45)
            if resp.status_code == 200:
                return resp.json().get("elements", [])
        except Exception:
            continue
    return []

HYDERABAD_AREAS = {
    "Kokapet":       (17.4156, 78.3298, 3000),
    "Gachibowli":    (17.4400, 78.3489, 3000),
    "HITECH City":   (17.4486, 78.3908, 3000),
    "Madhapur":      (17.4484, 78.3908, 2500),
    "Kondapur":      (17.4600, 78.3550, 2500),
    "Banjara Hills": (17.4312, 78.4072, 3000),
    "Jubilee Hills": (17.4239, 78.4082, 3000),
    "Kukatpally":    (17.4947, 78.3996, 3000),
    "Secunderabad":  (17.4399, 78.4983, 3000),
    "Uppal":         (17.4042, 78.5598, 3000),
    "Miyapur":       (17.4947, 78.3500, 2500),
    "Narsingi":      (17.3883, 78.3588, 3000),
}

OSM_CATEGORY_MAP = {
    "restaurant": "Food & Beverage",
    "cafe":        "Food & Beverage",
    "fast_food":   "Food & Beverage",
    "bar":         "Food & Beverage",
    "pub":         "Food & Beverage",
    "clothes":     "Clothing & Fashion",
    "boutique":    "Clothing & Fashion",
    "beauty":      "Beauty & Wellness",
    "hairdresser": "Beauty & Wellness",
    "gym":         "Fitness",
    "pharmacy":    "Health",
    "supermarket": "Retail",
    "bakery":      "Food & Beverage",
}


def build_overpass_query(lat: float, lng: float, radius: int) -> str:
    return f"""
[out:json][timeout:60];
(
  node["amenity"~"restaurant|cafe|fast_food|bar|pub|bakery|pharmacy"](around:{radius},{lat},{lng});
  node["shop"~"clothes|beauty|hairdresser|supermarket|gift|electronics"](around:{radius},{lat},{lng});
  node["leisure"~"gym|fitness_centre"](around:{radius},{lat},{lng});
);
out body;
"""


def parse_osm_element(el: dict, area_name: str) -> dict | None:
    tags = el.get("tags", {})
    name = tags.get("name") or tags.get("name:en")
    if not name:
        return None

    amenity = tags.get("amenity", "")
    shop = tags.get("shop", "")
    category_key = amenity or shop
    category = OSM_CATEGORY_MAP.get(category_key, "Other")
    start_date = tags.get("start_date") or tags.get("opening_date")

    return {
        "name": name,
        "osm_id": str(el["id"]),
        "lat": el.get("lat"),
        "lng": el.get("lon"),
        "area": area_name,
        "city": "Hyderabad",
        "category": category,
        "phone": tags.get("phone") or tags.get("contact:phone"),
        "website": tags.get("website") or tags.get("contact:website"),
        "actual_launch_date": start_date,
        "launch_source": "osm_tag" if start_date else None,
        "source": "osm",
        "raw_data": tags,
    }


def run():
    supabase = get_supabase()
    run_id = None
    if supabase:
        try:
            res = supabase.table("scrape_runs").insert({
                "source": "osm", "status": "running"
            }).execute()
            if res.data:
                run_id = res.data[0]["id"]
        except Exception as e:
            log.warning(f"Could not record scrape run in Supabase: {e}")
    else:
        log.warning("ℹ️ Supabase not configured or keys missing in .env.local — running OSM agent in local discovery mode!")

    total_new = 0
    errors = 0
    local_discovered = []
    seen_osm_ids = set()

    for area_name, (lat, lng, radius) in HYDERABAD_AREAS.items():
        log.info(f"Scanning {area_name}...")
        try:
            query = build_overpass_query(lat, lng, radius)
            elements = query_overpass(query)
            log.info(f"  → {len(elements)} elements found in {area_name}")

            for el in elements:
                business = parse_osm_element(el, area_name)
                if not business:
                    continue

                osm_id = business["osm_id"]

                if supabase:
                    # Check if already seen
                    existing = supabase.table("business_sources") \
                        .select("id") \
                        .eq("source", "osm") \
                        .eq("source_id", osm_id) \
                        .execute()

                    if existing.data:
                        continue  # Already in DB

                    # Insert new business
                    result = supabase.table("businesses").upsert(
                        {k: v for k, v in business.items() if k != "osm_id"},
                        on_conflict="osm_id"
                    ).execute()

                    if result.data:
                        biz_id = result.data[0]["id"]
                        supabase.table("business_sources").insert({
                            "business_id": biz_id,
                            "source": "osm",
                            "source_id": osm_id,
                        }).execute()
                        total_new += 1
                        log.info(f"  ✅ [DB] New: {business['name']} ({area_name})")
                else:
                    if osm_id in seen_osm_ids:
                        continue
                    seen_osm_ids.add(osm_id)
                    local_discovered.append(business)
                    total_new += 1
                    log.info(f"  ✅ [Discovered] {business['name']} ({area_name}) • {business['category']}")

            time.sleep(1)  # Be polite to Overpass

        except Exception as e:
            log.error(f"  ❌ Error scanning {area_name}: {e}")
            errors += 1

    if supabase and run_id:
        try:
            supabase.table("scrape_runs").update({
                "status": "completed",
                "finished_at": datetime.utcnow().isoformat(),
                "new_found": total_new,
                "errors": errors,
            }).eq("id", run_id).execute()
        except Exception as e:
            log.warning(f"Could not update scrape run: {e}")
    elif not supabase:
        out_path = Path(__file__).parent / "discovered_osm_businesses.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(local_discovered, f, indent=2, ensure_ascii=False)
        log.info(f"💾 Saved {len(local_discovered)} discovered businesses to {out_path}")

    log.info(f"🏁 OSM agent finished. Discovered: {total_new}, Errors: {errors}")


if __name__ == "__main__":
    run()
