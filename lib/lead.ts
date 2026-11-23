// Presentation helpers shared by the radar list, drawer, map and detail page.
// Pure functions over `Business` — no data fetching here.
import type { Business, OutreachStatus } from './types';

const MS_DAY = 86_400_000;

export const STATUS_META: Record<OutreachStatus, { label: string; dot: string; text: string }> = {
  new: { label: 'New', dot: 'bg-status-new', text: 'text-status-new-ink' },
  contacted: { label: 'Contacted', dot: 'bg-status-contacted', text: 'text-status-contacted-ink' },
  interested: { label: 'Interested', dot: 'bg-status-interested', text: 'text-status-interested' },
  closed: { label: 'Closed', dot: 'bg-status-closed', text: 'text-status-closed-ink' },
  skip: { label: 'Skipped', dot: 'bg-hairline', text: 'text-walnut' },
};

export const STATUS_ORDER: OutreachStatus[] = ['new', 'contacted', 'interested', 'closed', 'skip'];

/** Days since the shop opened (negative = opens in N days). Null if unknown. */
export function daysSinceLaunch(b: Business): number | null {
  const d = b.actual_launch_date || b.estimated_open_date;
  if (!d) return null;
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / MS_DAY);
}

/** Short human label for launch age, e.g. "11 days open", "Opens in 4 days". */
export function launchLabel(b: Business): string {
  if (b.is_opening_soon) return 'Opening soon';
  const d = daysSinceLaunch(b);
  if (d === null) return 'Opening date unknown';
  if (d < 0) return `Opens in ${Math.abs(d)} ${Math.abs(d) === 1 ? 'day' : 'days'}`;
  if (d === 0) return 'Opened today';
  if (d === 1) return 'Opened yesterday';
  if (d <= 45) return `${d} days open`;
  if (d <= 365) return `${Math.round(d / 30)} months open`;
  return 'Established';
}

/** Compact launch label for tight rows: "11d", "4mo", "soon". */
export function launchShort(b: Business): string {
  if (b.is_opening_soon) return 'soon';
  const d = daysSinceLaunch(b);
  if (d === null) return '—';
  if (d < 0) return `in ${Math.abs(d)}d`;
  if (d <= 60) return `${d}d`;
  if (d <= 365) return `${Math.round(d / 30)}mo`;
  return '1y+';
}

export function isFresh(b: Business): boolean {
  if (b.is_opening_soon) return true;
  const d = daysSinceLaunch(b);
  return d !== null && d <= 30;
}

export function spottedAgo(iso: string): string {
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d === 1) return 'yesterday';
  if (d < 30) return `${d} days ago`;
  return `${Math.round(d / 30)} months ago`;
}

/**
 * One line on why this is worth a message. Built from facts we actually hold,
 * in the order an agency cares about: no website, how new, how small online.
 */
export function leadReason(b: Business): string {
  const bits: string[] = [];
  if (!b.website) bits.push('no website');
  const d = daysSinceLaunch(b);
  if (b.is_opening_soon) bits.push('still fitting out');
  else if (d !== null && d >= 0 && d <= 45) bits.push(`opened ${d === 0 ? 'today' : `${d} days ago`}`);
  if (b.instagram_post_count != null && b.instagram_post_count <= 12) {
    bits.push(`${b.instagram_post_count} Instagram ${b.instagram_post_count === 1 ? 'post' : 'posts'}`);
  } else if (b.instagram_followers != null && b.instagram_followers < 500) {
    bits.push(`${b.instagram_followers} followers`);
  } else if (!b.instagram_handle) {
    bits.push('no Instagram found');
  }
  if (bits.length === 0) return b.website ? 'Has a site, may need a rebuild' : 'Listed recently';
  const s = bits.join(', ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function whatsappHref(b: Business, text?: string): string | null {
  if (!b.whatsapp) return null;
  const msg = text ?? `Hi ${b.name}, congratulations on opening in ${b.area}!`;
  return `https://wa.me/${b.whatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent(msg)}`;
}

export function mapsHref(b: Business): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${b.name} ${b.area || ''} ${b.city || ''}`.trim(),
  )}`;
}

export function instagramHref(b: Business): string {
  if (b.instagram_handle) {
    return b.instagram_url || `https://www.instagram.com/${b.instagram_handle.replace('@', '')}/`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(
    `site:instagram.com "${b.name}" "${b.city || b.area}"`,
  )}`;
}

export function siteBudget(b: Business): string {
  if (b.estimated_site_budget) return b.estimated_site_budget;
  if (b.currency === 'USD') return '$2,800 – $4,500';
  if (b.currency === 'GBP') return '£2,000 – £3,500';
  return '₹35,000 – ₹75,000';
}

export const isSample = (b: Pick<Business, 'id'>) => b.id.startsWith('sample-');
