'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, Copy, ExternalLink, Instagram, Mail, MapPin, MessageCircle, Phone, Search, X, Globe } from 'lucide-react';
import type { Business, MediaPhoto, OutreachStatus } from '@/lib/types';
import { Badge, StatusSelect } from '@/components/ui/primitives';
import { ScoreStamp } from '@/components/ui/Score';
import { buttonClass } from '@/components/ui/Button';
import { BlurFade } from '@/components/motion/BlurFade';
import { instagramHref, isSample, knownFollowers, launchLabel, leadReason, mapsHref, siteBudget, whatsappHref } from '@/lib/lead';
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
    ['Handle', b.instagram_handle ? <a className="underline underline-offset-2" href={instagramHref(b)} target="_blank" rel="noopener noreferrer">@{b.instagram_handle.replace('@', '')}</a> : 'None found'],
    ['Followers', knownFollowers(b) != null ? Intl.NumberFormat('en-IN').format(knownFollowers(b)!) : 'Not measured'],
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
        <div className="rounded-panel border border-ink bg-surface p-5 sm:p-6 self-start">
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
        <Block title="On the map" rows={place} />
        <Block title="Instagram" rows={ig} />
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
            className="fixed inset-0 z-50 bg-scrim/85 p-4 grid place-items-center"
            onClick={() => setOpen(null)}
            onKeyDown={(e) => e.key === 'Escape' && setOpen(null)}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="relative w-full max-w-3xl rounded-panel overflow-hidden border border-ink bg-surface" onClick={(e) => e.stopPropagation()}>
              <div className="relative w-full h-[65vh] bg-sunk">
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
type Channel = 'whatsapp' | 'email' | 'instagram' | 'call';

function emailParts(b: Business) {
  const pack = b.deep_research?.outreach_pack?.cold_email;
  if (pack) return { to: pack.target_email || b.email || '', subject: pack.subject_line, body: pack.body };
  const raw = emailPitch(b);
  const m = raw.match(/^Subject:\s*(.*)\n+([\s\S]*)$/);
  return { to: b.email || '', subject: m ? m[1] : `A website for ${b.name}?`, body: m ? m[2] : raw };
}

const igHandleOf = (b: Business) => (b.deep_research?.outreach_pack?.instagram_dm?.instagram_handle || b.instagram_handle || '').replace('@', '').trim();

/**
 * Editable drafts for every channel with one-tap send. Seeded from deep research
 * when it has run, otherwise from the dossier / default scripts.
 */
export function PitchKit({ b }: { b: Business }) {
  const preferred = b.deep_research?.target_decision_maker?.preferred_channel;
  const [tab, setTab] = useState<Channel>(preferred === 'email' ? 'email' : preferred === 'instagram' ? 'instagram' : 'whatsapp');
  const [copied, setCopied] = useState<string | null>(null);
  const [wa, setWa] = useState('');
  const [mail, setMail] = useState({ to: '', subject: '', body: '' });
  const [dm, setDm] = useState({ handle: '', message: '', followUp: '' });
  const [call, setCall] = useState('');

  // Re-seed whenever the lead or its research changes.
  const researchedAt = b.deep_research?.researched_at;
  React.useEffect(() => {
    const pack = b.deep_research?.outreach_pack;
    setWa(pack?.whatsapp_message?.text || whatsappPitch(b));
    setMail(emailParts(b));
    const handle = igHandleOf(b);
    setDm({
      handle,
      message:
        pack?.instagram_dm?.message ||
        `Hi${handle ? ` @${handle}` : ''}! Saw your new place in ${b.area}. Are you taking bookings through DMs for now, or is a booking link coming soon?`,
      followUp:
        pack?.instagram_dm?.follow_up_message ||
        `Just bumping this in case it got buried. We sketched a one-page site for ${b.name}. Happy to send the link if you want a look.`,
    });
    const ps = pack?.phone_script;
    setCall(ps ? `${ps.opener}\n\n${ps.hook}\n\nAsk: ${ps.closing_ask}` : callScript(b));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b.id, researchedAt]);

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard can be blocked; the text is still selectable */
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const waHref = whatsappHref(b, wa);
  const igOpen = dm.handle
    ? `https://ig.me/m/${dm.handle}`
    : `https://www.google.com/search?q=${encodeURIComponent(`site:instagram.com "${b.name}" ${b.city || b.area || ''}`)}`;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(mail.to)}&su=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body)}`;
  const mailto = `mailto:${mail.to}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body)}`;

  const tabs: [Channel, string][] = [
    ['whatsapp', 'WhatsApp'],
    ['email', 'Email'],
    ['instagram', 'Instagram DM'],
    ['call', 'Call script'],
  ];

  const field = 'w-full rounded-ctl border border-hairline bg-paper px-3 text-sm text-ink outline-none focus:border-ink';
  const area = cn(field, 'py-3 text-[15px] leading-[1.6] resize-y');
  const CopyBtn = ({ k, text, label = 'Copy' }: { k: string; text: string; label?: string }) => (
    <button type="button" onClick={() => copy(k, text)} className={buttonClass('outline', 'sm')}>
      {copied === k ? <Check aria-hidden /> : <Copy aria-hidden />}
      {copied === k ? 'Copied' : label}
    </button>
  );
  const words = (t: string) => t.split(/\s+/).filter(Boolean).length;

  return (
    <section aria-labelledby="pitch">
      <SectionHead
        id="pitch"
        title="Pitch kit"
        note={b.deep_research ? 'Drafted from the research above. Edit before you send.' : 'Edit before you send. Run research above for sharper drafts.'}
      />
      <div className="grid lg:grid-cols-[12rem_minmax(0,1fr)] gap-6">
        <div role="tablist" aria-label="Channel" className="flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map(([k, l]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              aria-controls="pitch-panel"
              onClick={() => setTab(k)}
              className={cn('h-11 px-3 rounded-ctl text-left text-sm border whitespace-nowrap', tab === k ? 'border-ink bg-surface text-ink' : 'border-transparent text-walnut hover:text-ink')}
            >
              {l}
              {preferred && ((preferred === 'phone' && k === 'call') || preferred === k) && <span className="ml-1.5 text-2xs text-accent-strong">best</span>}
            </button>
          ))}
        </div>

        <div id="pitch-panel" role="tabpanel" className="rounded-panel border border-hairline bg-surface p-5 sm:p-6 space-y-3">
          {tab === 'whatsapp' && (
            <>
              <label htmlFor="pk-wa" className="sr-only">WhatsApp message</label>
              <textarea id="pk-wa" rows={5} value={wa} onChange={(e) => setWa(e.target.value)} className={area} />
              <div className="flex flex-wrap items-center gap-2">
                <CopyBtn k="wa" text={wa} />
                {waHref ? (
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className={buttonClass('ink', 'sm')}>
                    <MessageCircle aria-hidden /> Open in WhatsApp
                  </a>
                ) : (
                  <span className="text-xs text-walnut">No WhatsApp number on file.</span>
                )}
                <span className="ml-auto font-mono text-2xs text-walnut">{words(wa)} words</span>
              </div>
            </>
          )}

          {tab === 'email' && (
            <>
              <div className="grid sm:grid-cols-[5rem_1fr] gap-x-3 gap-y-2 items-center">
                <label htmlFor="pk-to" className="text-sm text-walnut">To</label>
                <input id="pk-to" value={mail.to} onChange={(e) => setMail({ ...mail, to: e.target.value })} placeholder="owner@example.com" className={cn(field, 'h-10 font-mono text-[13px]')} />
                <label htmlFor="pk-su" className="text-sm text-walnut">Subject</label>
                <input id="pk-su" value={mail.subject} onChange={(e) => setMail({ ...mail, subject: e.target.value })} className={cn(field, 'h-10')} />
              </div>
              {!b.email && mail.to && <p className="text-xs text-walnut">That address is a guess from the shop name. Check it before sending.</p>}
              <label htmlFor="pk-body" className="sr-only">Email body</label>
              <textarea id="pk-body" rows={12} value={mail.body} onChange={(e) => setMail({ ...mail, body: e.target.value })} className={area} />
              <div className="flex flex-wrap items-center gap-2">
                <CopyBtn k="mail" text={`Subject: ${mail.subject}\n\n${mail.body}`} />
                <a href={gmail} target="_blank" rel="noopener noreferrer" className={buttonClass('ink', 'sm')}>
                  <Mail aria-hidden /> Open in Gmail
                </a>
                <a href={mailto} className={buttonClass('outline', 'sm')}>
                  Open in mail app
                </a>
                <span className="ml-auto font-mono text-2xs text-walnut">{words(mail.body)} words</span>
              </div>
            </>
          )}

          {tab === 'instagram' && (
            <>
              <div className="grid sm:grid-cols-[5rem_1fr] gap-x-3 gap-y-2 items-center">
                <label htmlFor="pk-ig" className="text-sm text-walnut">Handle</label>
                <input id="pk-ig" value={dm.handle} onChange={(e) => setDm({ ...dm, handle: e.target.value.replace('@', '') })} placeholder="not found yet" className={cn(field, 'h-10 font-mono text-[13px]')} />
              </div>
              <label htmlFor="pk-dm" className="block text-sm text-walnut">First message</label>
              <textarea id="pk-dm" rows={4} value={dm.message} onChange={(e) => setDm({ ...dm, message: e.target.value })} className={area} />
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={igOpen}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => copy('dm', dm.message)}
                  className={buttonClass('ink', 'sm')}
                >
                  <Instagram aria-hidden /> {copied === 'dm' ? 'Copied, opening…' : dm.handle ? 'Copy and open DM' : 'Copy and find on Instagram'}
                </a>
                <CopyBtn k="dm2" text={dm.message} />
              </div>
              <label htmlFor="pk-fu" className="block text-sm text-walnut pt-2">Follow-up, if they don&apos;t answer in two days</label>
              <textarea id="pk-fu" rows={3} value={dm.followUp} onChange={(e) => setDm({ ...dm, followUp: e.target.value })} className={area} />
              <CopyBtn k="fu" text={dm.followUp} label="Copy follow-up" />
            </>
          )}

          {tab === 'call' && (
            <>
              <label htmlFor="pk-call" className="sr-only">Call script</label>
              <textarea id="pk-call" rows={9} value={call} onChange={(e) => setCall(e.target.value)} className={area} />
              <div className="flex flex-wrap items-center gap-2">
                <CopyBtn k="call" text={call} />
                {b.phone && (
                  <a href={`tel:${b.phone}`} className={buttonClass('ink', 'sm')}>
                    <Phone aria-hidden /> Call {b.phone}
                  </a>
                )}
              </div>
            </>
          )}
          <span role="status" className="sr-only">{copied ? 'Copied to clipboard' : ''}</span>
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
