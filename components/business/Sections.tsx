'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, Copy, ExternalLink, Instagram, MapPin, MessageCircle, Search, X, Globe } from 'lucide-react';
import type { Business, MediaPhoto, OutreachStatus } from '@/lib/types';
import { Badge, StatusSelect } from '@/components/ui/primitives';
import { ScoreStamp } from '@/components/ui/Score';
import { buttonClass } from '@/components/ui/Button';
import { BlurFade } from '@/components/motion/BlurFade';
import { instagramHref, isSample, launchLabel, leadReason, mapsHref, siteBudget, whatsappHref } from '@/lib/lead';
import { callScript, emailPitch, whatsappPitch } from './pitch';
import { cn } from '@/lib/utils';

export function SectionHead({ id, title, note }: { id: string; title: string; note?: string }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
      <h2 id={id} className="text-2xl sm:text-3xl scroll-mt-28">
        {title}
      </h2>
      {note && <p className="text-sm text-walnut">{note}</p>}
    </div>
  );
}

/* ——— Overview ——— */
export function Overview({ b, enriched }: { b: Business; enriched?: boolean }) {
  return (
    <section aria-labelledby="overview" className="grid lg:grid-cols-[minmax(0,1fr)_auto] gap-8 items-start">
      <div>
        <p className="text-sm text-walnut">
          {b.category}
          {b.sub_category ? ` · ${b.sub_category}` : ''} · {b.area}, {b.city}
        </p>
        <h1 id="overview" className="mt-2 text-4xl sm:text-5xl max-w-[18ch] scroll-mt-28">
          {b.name}
        </h1>
        <p className="mt-5 text-lg leading-snug max-w-prose">{leadReason(b)}.</p>
        <p className="mt-3 text-walnut max-w-prose">
          {b.grok_summary || b.description || `Spotted by the radar in ${b.area}. No summary has been written for this shop yet.`}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {isSample(b) && (
            <Badge tone="sample" className="font-mono text-2xs">
              sample lead, not a real shop
            </Badge>
          )}
          {!b.website && <Badge tone="flag">No website</Badge>}
          <Badge>{launchLabel(b)}</Badge>
          {enriched && <Badge tone="quiet">Photos and handles checked live</Badge>}
        </div>
      </div>
      <div className="lg:pt-8 lg:pr-4">
        <ScoreStamp score={b.lead_score} />
      </div>
    </section>
  );
}

/* ——— Presence ——— */
export function Presence({ b }: { b: Business }) {
  const d = b.dossier;
  const rows: [string, React.ReactNode][] = [
    ['Opened', b.is_opening_soon ? 'Not yet, fitting out' : b.actual_launch_date || b.estimated_open_date || 'Unknown'],
    ['How we know', b.launch_source ? b.launch_source.replace(/_/g, ' ') : 'Estimated from listing'],
    ['First spotted', new Date(b.first_seen_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
    ['Source', b.source.replace(/_/g, ' ')],
  ];
  const ig: [string, React.ReactNode][] = [
    ['Handle', b.instagram_handle && b.instagram_verified !== false ? <a className="underline underline-offset-2" href={instagramHref(b)} target="_blank" rel="noopener noreferrer">@{b.instagram_handle.replace('@', '')}</a> : 'None found'],
    ['Followers', b.instagram_followers != null ? Intl.NumberFormat('en-IN').format(b.instagram_followers) : '—'],
    ['Posts', b.instagram_post_count ?? '—'],
    ['First post', b.instagram_first_post_at ? new Date(b.instagram_first_post_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'],
  ];
  const place: [string, React.ReactNode][] = [
    ['Address', d?.verified_address || `${b.area}, ${b.city}`],
    ['Hours', d?.hours || 'Not listed'],
    ['Google rating', d?.google_rating ? `${d.google_rating} (${d.google_reviews_count ?? 0} reviews)` : 'No reviews yet'],
    ['Coordinates', `${b.lat.toFixed(5)}, ${b.lng.toFixed(5)}`],
  ];
  const Block = ({ title, rows, className }: { title: string; rows: [string, React.ReactNode][]; className?: string }) => (
    <div className={className}>
      <h3 className="text-lg">{title}</h3>
      <dl className="mt-3 divide-y divide-hairline border-y border-hairline text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5">
            <dt className="text-walnut">{k}</dt>
            <dd className="text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
  return (
    <section aria-labelledby="presence">
      <SectionHead id="presence" title="Presence" note="What exists online today, and what doesn't." />
      <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] gap-x-10 gap-y-10">
        <div className="rounded-panel border border-ink bg-surface p-5 sm:p-6 md:row-span-2">
          <div className="flex items-center gap-2 text-sm text-walnut">
            <Globe aria-hidden className="size-4 stroke-[1.5]" /> Website
          </div>
          {b.website ? (
            <>
              <p className="mt-2 font-display text-2xl">Has a site.</p>
              <p className="mt-2 text-walnut text-sm max-w-prose">Pitch a rebuild or a conversion audit. Check it on a phone first.</p>
              <a href={b.website} target="_blank" rel="noopener noreferrer" className={buttonClass('outline', 'sm', 'mt-4')}>
                Open their site <ExternalLink aria-hidden />
              </a>
            </>
          ) : (
            <>
              <p className="mt-2 font-display text-2xl">No website.</p>
              <p className="mt-2 text-walnut text-sm max-w-prose">
                This is the pitch. A typical first site for a shop like this runs <span className="font-mono text-ink whitespace-nowrap">{siteBudget(b)}</span>.
              </p>
            </>
          )}
          {d?.growth_opportunities && d.growth_opportunities.length > 0 && (
            <>
              <h3 className="mt-6 text-lg">Other gaps worth mentioning</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {d.growth_opportunities.map((g, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    {g}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <Block title="Opening" rows={rows} />
        <Block title="Instagram" rows={ig} />
        <Block title="On the map" rows={place} className="md:col-start-1" />
      </div>
    </section>
  );
}

/* ——— Photos ——— */
const RATIOS = ['aspect-[4/5]', 'aspect-square', 'aspect-[4/3]', 'aspect-[3/4]', 'aspect-[5/4]', 'aspect-[4/5]', 'aspect-[3/2]'];

export function Photos({ b }: { b: Business }) {
  const [tab, setTab] = useState<'all' | 'google' | 'instagram'>('all');
  const [open, setOpen] = useState<MediaPhoto | null>(null);
  const reduce = useReducedMotion();
  const google = b.google_photos?.length ? b.google_photos : b.dossier?.google_photos || [];
  const insta = b.instagram_posts?.length ? b.instagram_posts : b.dossier?.instagram_posts || [];
  const all = b.media_photos?.length ? b.media_photos : [...google, ...insta];
  const shown = tab === 'google' ? google : tab === 'instagram' ? insta : all;

  const tabs: [typeof tab, string, number][] = [
    ['all', 'All', all.length],
    ['google', 'Google and storefront', google.length],
    ['instagram', 'Instagram', insta.length],
  ];

  return (
    <section aria-labelledby="photos">
      <SectionHead id="photos" title="Photos" note={all.length ? 'Some photos are stand-ins until a live check finds the real ones.' : undefined} />
      <div role="tablist" aria-label="Photo source" className="mb-5 inline-flex rounded-ctl border border-hairline bg-surface p-0.5">
        {tabs.map(([k, l, n]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={cn('h-10 px-3 rounded-[4px] text-sm', tab === k ? 'bg-ink text-surface' : 'text-walnut hover:text-ink')}
          >
            {l} <span className="font-mono text-xs tabular">{n}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-panel border border-dashed border-hairline p-8 text-walnut">
          <p className="text-ink">No photos yet.</p>
          <p className="mt-1 text-sm">Run a live check from the top bar, or look the shop up yourself:</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={`https://www.google.com/search?q=${encodeURIComponent(`${b.name} ${b.area} ${b.city || ''}`)}&tbm=isch`} target="_blank" rel="noopener noreferrer" className={buttonClass('outline', 'sm')}>
              <Search aria-hidden /> Google Images
            </a>
          </div>
        </div>
      ) : (
        <ul className="columns-2 md:columns-3 gap-3 [column-fill:_balance]">
          {shown.map((p, i) => (
            <li key={p.id} className="mb-3 break-inside-avoid">
              <BlurFade delay={Math.min(i, 6) * 0.04}>
                <button type="button" onClick={() => setOpen(p)} className="group block w-full text-left rounded-panel overflow-hidden border border-hairline bg-surface hover:border-ink">
                  <span className={cn('relative block w-full bg-sunk', RATIOS[i % RATIOS.length])}>
                    <Image src={p.thumbnail_url || p.url} alt={p.caption || `Photo of ${b.name}`} fill sizes="(min-width: 768px) 30vw, 48vw" className="object-cover" />
                  </span>
                  <span className="flex items-start justify-between gap-2 p-2.5">
                    <span className="text-xs text-ink leading-snug line-clamp-2">{p.caption}</span>
                    <span className="shrink-0 text-2xs font-mono text-walnut">{p.source === 'instagram' ? 'IG' : 'Maps'}</span>
                  </span>
                </button>
              </BlurFade>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <a className="inline-flex items-center gap-1.5 min-h-11 text-walnut hover:text-ink underline underline-offset-4 decoration-hairline" href={mapsHref(b)} target="_blank" rel="noopener noreferrer">
          <MapPin aria-hidden className="size-4 stroke-[1.5]" /> See the place on Google Maps
        </a>
        <a className="inline-flex items-center gap-1.5 min-h-11 text-walnut hover:text-ink underline underline-offset-4 decoration-hairline" href={instagramHref(b)} target="_blank" rel="noopener noreferrer">
          <Instagram aria-hidden className="size-4 stroke-[1.5]" /> {b.instagram_handle ? `@${b.instagram_handle.replace('@', '')} on Instagram` : `Look for ${b.name} on Instagram`}
        </a>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={open.caption || 'Photo'}
            className="fixed inset-0 z-50 bg-ink/80 p-4 grid place-items-center"
            onClick={() => setOpen(null)}
            onKeyDown={(e) => e.key === 'Escape' && setOpen(null)}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="relative w-full max-w-3xl rounded-panel overflow-hidden border border-ink bg-surface" onClick={(e) => e.stopPropagation()}>
              <div className="relative w-full h-[65vh] bg-ink">
                <Image src={open.url} alt={open.caption || `Photo of ${b.name}`} fill sizes="90vw" className="object-contain" />
              </div>
              <div className="flex items-center justify-between gap-3 p-3 text-sm">
                <p className="text-ink">{open.caption}</p>
                <button type="button" autoFocus onClick={() => setOpen(null)} aria-label="Close photo" className="size-11 grid place-items-center rounded-ctl hover:bg-sunk">
                  <X aria-hidden className="size-5 stroke-[1.5]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ——— Pitch kit ——— */
export function PitchKit({ b }: { b: Business }) {
  const [tab, setTab] = useState<'whatsapp' | 'call' | 'email'>('whatsapp');
  const [copied, setCopied] = useState<string | null>(null);
  const text = tab === 'whatsapp' ? whatsappPitch(b) : tab === 'call' ? callScript(b) : emailPitch(b);
  const wa = whatsappHref(b, whatsappPitch(b));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard can be blocked; the text is still selectable */
    }
    setCopied(tab);
    setTimeout(() => setCopied(null), 1800);
  };

  const tabs: [typeof tab, string][] = [
    ['whatsapp', 'WhatsApp'],
    ['call', 'Call script'],
    ['email', 'Email'],
  ];

  return (
    <section aria-labelledby="pitch">
      <SectionHead id="pitch" title="Pitch kit" note="Drafted for this shop. Read it once before you send it." />
      <div className="grid lg:grid-cols-[12rem_minmax(0,1fr)] gap-6">
        <div role="tablist" aria-label="Script" className="flex lg:flex-col gap-1">
          {tabs.map(([k, l]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              aria-controls="pitch-panel"
              onClick={() => setTab(k)}
              className={cn('h-11 px-3 rounded-ctl text-left text-sm border', tab === k ? 'border-ink bg-surface text-ink' : 'border-transparent text-walnut hover:text-ink')}
            >
              {l}
            </button>
          ))}
        </div>
        <div id="pitch-panel" role="tabpanel" className="rounded-panel border border-hairline bg-surface">
          <pre className="whitespace-pre-wrap font-sans text-[15px] leading-[1.6] text-ink p-5 sm:p-6 max-w-prose">{text}</pre>
          <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-5 sm:px-6 py-3">
            <button type="button" onClick={copy} className={buttonClass('outline', 'sm')}>
              {copied === tab ? <Check aria-hidden /> : <Copy aria-hidden />}
              {copied === tab ? 'Copied' : 'Copy'}
            </button>
            <span role="status" className="sr-only">
              {copied === tab ? 'Copied to clipboard' : ''}
            </span>
            {tab === 'whatsapp' && wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClass('ink', 'sm')}>
                <MessageCircle aria-hidden /> Open in WhatsApp
              </a>
            )}
            {tab === 'email' && b.email && (
              <a href={`mailto:${b.email}?body=${encodeURIComponent(text)}`} className={buttonClass('ink', 'sm')}>
                Open in mail
              </a>
            )}
            <span className="ml-auto font-mono text-2xs text-walnut">{text.split(/\s+/).length} words</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ——— Notes ——— */
export function Notes({
  b,
  notes,
  setNotes,
  onSave,
  saving,
  saved,
  onStatus,
}: {
  b: Business;
  notes: string;
  setNotes: (s: string) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  onStatus: (s: OutreachStatus) => void;
}) {
  return (
    <section aria-labelledby="notes">
      <SectionHead id="notes" title="Notes" note={b.contacted_at ? `Last contacted ${new Date(b.contacted_at).toLocaleDateString('en-IN')}` : 'Not contacted yet'} />
      <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
        <div>
          <label htmlFor="dossier-notes" className="sr-only">
            Notes on this lead
          </label>
          <textarea
            id="dossier-notes"
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Owner is Ravi. Prefers WhatsApp voice notes. Wants online ordering before Sankranti."
            className="w-full rounded-panel border border-hairline bg-surface p-4 text-[15px] leading-relaxed outline-none focus:border-ink resize-y"
          />
          <div className="mt-3 flex items-center gap-3">
            <button type="button" onClick={onSave} disabled={saving} className={buttonClass('ink', 'md')}>
              {saving ? 'Saving…' : 'Save notes'}
            </button>
            <span role="status" className="text-sm text-status-new-ink inline-flex items-center gap-1">
              {saved && (
                <>
                  <Check aria-hidden className="size-4 stroke-[1.5]" /> Saved
                </>
              )}
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="dossier-status" className="block text-sm text-walnut mb-2">
            Where this lead stands
          </label>
          <StatusSelect id="dossier-status" value={b.outreach_status} onChange={onStatus} className="h-11" />
          <p className="mt-3 text-sm text-walnut max-w-[32ch]">Changing the status saves straight away. Notes save when you press the button.</p>
        </div>
      </div>
    </section>
  );
}
