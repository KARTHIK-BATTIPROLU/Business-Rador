'use client';

import React from 'react';
import Link from 'next/link';
import { Business, OutreachStatus } from '@/lib/types';
import { MessageCircle, Phone, MoreHorizontal, MapPin, Instagram, Globe, FileText, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge, StatusSelect } from '@/components/ui/primitives';
import { ScoreDial } from '@/components/ui/Score';
import { Popover, MenuItem } from '@/components/ui/Popover';
import { buttonClass } from '@/components/ui/Button';
import { instagramHref, isSample, launchShort, launchLabel, leadReason, mapsHref, whatsappHref } from '@/lib/lead';

interface BusinessCardProps {
  business: Business;
  isSelected?: boolean;
  onSelect?: () => void;
  onStatusChange: (status: OutreachStatus, notes?: string) => void;
  /** Static rendering for the landing page: no menu, no status select. */
  preview?: boolean;
}

/**
 * Lead card. One primary action (WhatsApp, or Call when there is no WhatsApp),
 * everything else in the menu. Status changes inline.
 */
export const BusinessCard: React.FC<BusinessCardProps> = ({ business: b, isSelected, onSelect, onStatusChange, preview }) => {
  const wa = whatsappHref(b);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <article
      onClick={onSelect}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
          e.preventDefault();
          onSelect?.();
        }
      }}
      tabIndex={onSelect ? 0 : undefined}
      aria-current={isSelected ? 'true' : undefined}
      aria-label={`${b.name}, ${b.area}, score ${b.lead_score}`}
      className={cn(
        'group relative rounded-panel border bg-surface p-4 text-left transition-[box-shadow,border-color,transform] duration-200 ease-out',
        onSelect && 'cursor-pointer',
        isSelected ? 'border-ink shadow-hard nudge' : 'border-hairline hover:border-tan',
        b.outreach_status === 'skip' && !isSelected && 'opacity-70',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg leading-tight truncate">{b.name}</h3>
          <p className="mt-1 text-xs text-walnut flex flex-wrap items-center gap-x-1.5">
            <span className="text-ink font-medium">{b.area}</span>
            <span aria-hidden>·</span>
            <span>{b.sub_category || b.category}</span>
            {isSample(b) && (
              <Badge tone="sample" className="ml-1 h-5 font-mono text-2xs">
                sample
              </Badge>
            )}
          </p>
        </div>
        <ScoreDial score={b.lead_score} />
      </div>

      <p className="mt-3 text-sm text-ink leading-snug">{leadReason(b)}.</p>

      <dl className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <div title={launchLabel(b)} className="inline-flex items-center gap-1.5 h-6 px-2 rounded-ctl bg-sunk text-walnut">
          <dt className="sr-only">Open for</dt>
          <dd className="font-mono tabular text-ink">{launchShort(b)}</dd>
          <span aria-hidden>open</span>
        </div>
        {!b.website ? (
          <Badge tone="flag">
            <Globe aria-hidden /> No website
          </Badge>
        ) : (
          <Badge tone="quiet">
            <Globe aria-hidden /> Has site
          </Badge>
        )}
        {b.instagram_followers != null && (
          <span className="font-mono tabular text-walnut">{Intl.NumberFormat('en-IN').format(b.instagram_followers)} IG</span>
        )}
      </dl>

      {!preview && (
        <div className="mt-4 flex items-center gap-2" onClick={stop} onKeyDown={stop}>
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClass('ink', 'sm', 'flex-1 sm:flex-none')}>
              <MessageCircle aria-hidden /> WhatsApp
            </a>
          ) : b.phone ? (
            <a href={`tel:${b.phone}`} className={buttonClass('ink', 'sm', 'flex-1 sm:flex-none')}>
              <Phone aria-hidden /> Call
            </a>
          ) : (
            <a href={mapsHref(b)} target="_blank" rel="noopener noreferrer" className={buttonClass('outline', 'sm', 'flex-1 sm:flex-none')}>
              <MapPin aria-hidden /> Find on Maps
            </a>
          )}

          <Popover
            label={`More actions for ${b.name}`}
            role="menu"
            align="end"
            trigger={({ props }) => (
              <button {...props} className={buttonClass('outline', 'sm', 'w-11 px-0')} aria-label={`More actions for ${b.name}`}>
                <MoreHorizontal aria-hidden />
              </button>
            )}
          >
            {b.phone && (
              <MenuItem href={`tel:${b.phone}`}>
                <Phone aria-hidden /> Call {b.phone}
              </MenuItem>
            )}
            {b.email && (
              <MenuItem href={`mailto:${b.email}`}>
                <Mail aria-hidden /> Email
              </MenuItem>
            )}
            <MenuItem href={mapsHref(b)} external>
              <MapPin aria-hidden /> Google Maps
            </MenuItem>
            <MenuItem href={instagramHref(b)} external>
              <Instagram aria-hidden /> {b.instagram_handle ? `@${b.instagram_handle.replace('@', '')}` : 'Look for Instagram'}
            </MenuItem>
            {b.website && (
              <MenuItem href={b.website} external>
                <Globe aria-hidden /> Their website
              </MenuItem>
            )}
            <div className="my-1 border-t border-hairline" />
            <Link role="menuitem" href={`/business/${b.id}`} className="flex w-full items-center gap-2.5 h-10 px-2.5 rounded-ctl text-sm text-ink hover:bg-sunk focus:bg-sunk outline-none">
              <FileText aria-hidden className="size-4 stroke-[1.5] text-walnut" /> Full dossier and pitch kit
            </Link>
          </Popover>

          <StatusSelect value={b.outreach_status} onChange={(s) => onStatusChange(s)} className="ml-auto" />
        </div>
      )}
    </article>
  );
};
