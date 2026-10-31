"""
Instagram Business Profile & Hashtag Agent for Hyderabad.
Monitors new business hashtags, scans bio for contact numbers, WhatsApp, addresses in Hyderabad,
and detects new businesses with early profiles (<20 posts, <500 followers).
"""

import os
import re
import time
import logging
from datetime import datetime
from supabase_client import get_supabase

logging.basicConfig(level=logging.INFO, format="%(asctime)s [INSTA] %(message)s")
log = logging.getLogger(__name__)

HYDERABAD_HASHTAGS = [
    "hyderabadbusiness",
    "hyderabadcafe",
    "hyderabadfoodie",
    "kokapet",
    "gachibowli",
    "hitechcity",
    "jubileehillsfood",
    "hyderabadclothing",
    "hyderabadboutique",
    "hyderabadstartup"
]

PHONE_REGEX = re.compile(r"(\+?91[\s-]?)?[6789]\d{9}")
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")

def extract_contacts_from_bio(text: str) -> dict:
    contacts = {"phone": None, "email": None, "whatsapp": None}
    if not text:
        return contacts
    phone_match = PHONE_REGEX.search(text)
    if phone_match:
        raw_phone = phone_match.group(0).replace(" ", "").replace("-", "")
        contacts["phone"] = raw_phone
        if "wa" in text.lower() or "whatsapp" in text.lower():
            contacts["whatsapp"] = raw_phone

    email_match = EMAIL_REGEX.search(text)
    if email_match:
        contacts["email"] = email_match.group(0)

    return contacts

def guess_area(text: str) -> str:
    lower = text.lower() if text else ""
    areas = [
        "kokapet", "gachibowli", "hitech city", "madhapur",
        "jubilee hills", "banjara hills", "kondapur", "narsingi",
        "financial district", "manikonda", "kukatpally"
    ]
    for area in areas:
        if area in lower:
            return area.title()
    return "Hyderabad"

def run():
    try:
        import instaloader
    except ImportError:
        log.warning("instaloader not installed. Run `pip install instaloader`.")
        return

    supabase = get_supabase()
    run_log = supabase.table("scrape_runs").insert({
        "source": "instagram",
        "status": "running"
    }).execute()
    run_id = run_log.data[0]["id"]

    L = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_comments=False,
        save_metadata=False,
        compress_json=False
    )

    total_new = 0
    errors = 0

    log.info("Starting Instagram hashtag scanner for Hyderabad businesses...")
    for tag in HYDERABAD_HASHTAGS:
        log.info(f"Scanning #{tag}...")
        try:
            posts = instaloader.Hashtag.from_name(L.context, tag).get_posts()
            count = 0
            for post in posts:
                count += 1
                if count > 25:  # limit per hashtag to stay within rate limit budget
                    break

                owner = post.owner_username
                if not owner:
                    continue

                # Check if seen
                seen = supabase.table("business_sources") \
                    .select("id") \
                    .eq("source", "instagram") \
                    .eq("source_id", owner) \
                    .execute()

                if seen.data:
                    continue

                try:
                    profile = instaloader.Profile.from_username(L.context, owner)
                except Exception as ex:
                    log.warning(f"Could not fetch profile @{owner}: {ex}")
                    continue

                if not profile.is_business_account:
                    continue

                bio = profile.biography or ""
                contacts = extract_contacts_from_bio(bio)
                area = guess_area(bio)

                is_opening_soon = bool(re.search(r"(opening soon|coming soon|soft launch|doors open soon)", bio, re.IGNORECASE))
                mediacount = getattr(profile, "mediacount", None)
                first_post_at = None
                actual_launch_date = None

                # For early-stage accounts (< 15 posts), fetch earliest post date without hitting rate limits
                if mediacount is not None and 0 < mediacount <= 15:
                    try:
                        posts = list(profile.get_posts())
                        if posts:
                            oldest_post = posts[-1]
                            first_post_at = oldest_post.date_utc.isoformat()
                            actual_launch_date = oldest_post.date_utc.date().isoformat()
                    except Exception as ex:
                        log.debug(f"Could not inspect earliest post for @{owner}: {ex}")

                lead_score = 40
                if is_opening_soon or (actual_launch_date and "2026" in actual_launch_date):
                    lead_score += 35 # Fresh launch priority
                if not profile.external_url:
                    lead_score += 25  # No website!
                if profile.followers < 1000:
                    lead_score += 15  # Early profile
                if contacts["phone"]:
                    lead_score += 5

                category = profile.business_category_name or "Retail"

                biz_data = {
                    "name": profile.full_name or profile.username,
                    "category": category,
                    "area": area,
                    "city": "Hyderabad",
                    "phone": contacts["phone"],
                    "email": contacts["email"],
                    "whatsapp": contacts["whatsapp"],
                    "website": profile.external_url,
                    "instagram_handle": profile.username,
                    "instagram_url": f"https://instagram.com/{profile.username}",
                    "instagram_followers": profile.followers,
                    "instagram_first_post_at": first_post_at,
                    "instagram_post_count": mediacount,
                    "actual_launch_date": actual_launch_date,
                    "is_opening_soon": is_opening_soon,
                    "launch_source": "instagram_first_post" if actual_launch_date else ("instagram_bio" if is_opening_soon else None),
                    "source": "instagram",
                    "lead_score": min(lead_score, 100),
                    "description": bio[:280] if bio else None,
                    "outreach_status": "new"
                }

                inserted = supabase.table("businesses").insert(biz_data).execute()
                if inserted.data:
                    biz_id = inserted.data[0]["id"]
                    supabase.table("business_sources").insert({
                        "business_id": biz_id,
                        "source": "instagram",
                        "source_id": owner,
                        "source_url": f"https://instagram.com/{owner}"
                    }).execute()
                    total_new += 1
                    log.info(f"  [+] Discovered new IG business: @{owner} ({area})")

                time.sleep(3)  # Gentle on Instagram API
        except Exception as e:
            errors += 1
            log.error(f"Error scanning #{tag}: {e}")

    supabase.table("scrape_runs").update({
        "status": "completed",
        "finished_at": datetime.utcnow().isoformat(),
        "new_found": total_new,
        "errors": errors
    }).eq("id", run_id).execute()

    log.info(f"Done Instagram scan. Discovered {total_new} new business profiles.")

if __name__ == "__main__":
    run()
