'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Globe, Instagram, Mail, MapPin, MessageCircle, Phone, X } from 'lucide-react';
import { Business, OutreachStatus } from '@/lib/types';
import { Badge, StatusSelect } from '@/components/ui/primitives';
import { ScoreDial } from '@/components/ui/Score';
import { buttonClass } from '@/components/ui/Button';
import { instagramHref, isSample, knownFollowers, launchLabel, leadReason, mapsHref, siteBudget, spottedAgo, whatsappHref } from '@/lib/lead';
import { cn } from '@/lib/utils';

/** Lead detail shown beside the map (desktop drawer) or inside the bottom sheet (mobile). */
export function LeadDetail({
  business: b,
  onClose,
  onStatusChange,
  className,
}: {
  business: Business;
  onClose: () => void;
  onStatusChange: (id: string, status: OutreachStatus, notes?: string) => void;
  className?: string;
}) {
  const [notes, setNotes] = useState(b.outreach_notes || '');
  const [saved, setSaved] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setNotes(b.outreach_notes || '');
    setSaved(false);
  }, [b.id, b.outreach_notes]);

  const wa = whatsappHref(b);
  const facts: [string, React.ReactNode][] = [
    ['Open for', launchLabel(b)],
    ['Spotted', spottedAgo(b.first_seen_at)],
    ['Website', b.website ? <a href={b.website} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">has one</a> : <span className="text-accent-strong">none found</span>],
    ['Instagram', knownFollowers(b) != null ? `${Intl.NumberFormat('en-IN').format(knownFollowers(b)!)} followers${b.instagram_post_count != null ? `, ${b.instagram_post_count} posts` : ''}` : b.instagram_handle ? `@${b.instagram_handle.replace('@', '')}` : 'not found'],
    ['Site budget', siteBudget(b)],
  ];

  const save = () => {
    onStatusChange(b.id, b.outreach_status, notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className={cn('flex flex-col min-h-0', className)}>
      <div className="flex items-start gap-3 px-5 pt-5">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-walnut">
            {b.area}
            {b.city && b.city !== b.area ? `, ${b.city}` : ''} · {b.sub_category || b.category}
          </p>
          <h2 className="mt-1 text-2xl leading-tight">{b.name}</h2>
          {isSample(b) && (
            <Badge tone="sample" className="mt-2 font-mono text-2xs">
              sample lead, not a real shop
            </Badge>
          )}
        </div>
        <ScoreDial score={b.lead_score} size={52} animate />
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close lead" className="-mr-2 -mt-1 size-11 grid place-items-center rounded-ctl text-walnut hover:text-ink hover:bg-sunk">
          <X aria-hidden className="size-5 stroke-[1.5]" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5">
        <p className="mt-4 text-base leading-snug">{leadReason(b)}.</p>
        {(b.grok_summary || b.description) && <p className="mt-2 text-sm text-walnut max-w-prose">{b.grok_summary || b.description}</p>}

        <dl className="mt-5 divide-y divide-hairline border-y border-hairline text-sm">
          {facts.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5">
              <dt className="text-walnut">{k}</dt>
              <dd className="text-right font-mono tabular text-[13px] text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClass('primary', 'md', 'col-span-2')}>
              <MessageCircle aria-hidden /> Message on WhatsApp
            </a>
          ) : (
            <p className="col-span-2 text-sm text-walnut">No WhatsApp number on file.</p>
          )}
          {b.phone && (
            <a href={`tel:${b.phone}`} className={buttonClass('outline', 'md')}>
              <Phone aria-hidden /> Call
            </a>
          )}
          {b.email && (
            <a href={`mailto:${b.email}`} className={buttonClass('outline', 'md')}>
              <Mail aria-hidden /> Email
            </a>
          )}
          <a href={mapsHref(b)} target="_blank" rel="noopener noreferrer" className={buttonClass('outline', 'md')}>
            <MapPin aria-hidden /> Maps
          </a>
          <a href={instagramHref(b)} target="_blank" rel="noopener noreferrer" className={buttonClass('outline', 'md')}>
            <Instagram aria-hidden /> Instagram
          </a>
          {b.website && (
            <a href={b.website} target="_blank" rel="noopener noreferrer" className={buttonClass('outline', 'md')}>
              <Globe aria-hidden /> Site
            </a>
          )}
        </div>

        <div className="mt-6">
          <label htmlFor="drawer-status" className="block text-xs font-medium text-walnut mb-1.5">
            Status
          </label>
          <StatusSelect id="drawer-status" value={b.outreach_status} onChange={(s) => onStatusChange(b.id, s, notes)} />
        </div>

        <div className="mt-5">
          <label htmlFor="drawer-notes" className="block text-xs font-medium text-walnut mb-1.5">
            Notes
          </label>
          <textarea
            id="drawer-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Spoke to the owner's brother. Call back after 4pm on Thursday."
            className="w-full rounded-ctl border border-hairline bg-sunk/60 p-3 text-sm leading-relaxed outline-none focus:border-ink focus:bg-surface resize-y"
          />
          <div className="mt-2 flex items-center justify-between">
            <span role="status" className="text-xs text-status-new-ink inline-flex items-center gap-1">
              {saved && (
                <>
                  <Check aria-hidden className="size-3.5 stroke-[1.5]" /> Saved
                </>
              )}
            </span>
            <button type="button" onClick={save} className={buttonClass('ink', 'sm')}>
              Save note
            </button>
          </div>
        </div>

        <Link href={`/business/${b.id}`} className="mt-6 flex items-center justify-between gap-2 rounded-panel border border-hairline bg-paper px-4 py-3 text-sm hover:border-ink">
          <span>
            <span className="block font-medium">Full dossier</span>
            <span className="text-walnut text-xs">Photos, call script, email, WhatsApp pitch</span>
          </span>
          <ArrowRight aria-hidden className="size-4 stroke-[1.5]" />
        </Link>
      </div>
    </div>
  );
}
