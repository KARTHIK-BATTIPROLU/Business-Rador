'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Mail, MessageCircle, Phone, RefreshCw, MapPin } from 'lucide-react';
import { useDossier } from '@/components/business/useDossier';
import { Notes, Overview, Photos, PitchKit, Presence } from '@/components/business/Sections';
import { whatsappPitch, emailPitch } from '@/components/business/pitch';
import { Skeleton, StatusSelect, Wordmark } from '@/components/ui/primitives';
import { Button, buttonClass } from '@/components/ui/Button';
import { isSample, mapsHref, whatsappHref } from '@/lib/lead';

const NAV = [
  ['overview', 'Overview'],
  ['presence', 'Presence'],
  ['photos', 'Photos'],
  ['pitch', 'Pitch kit'],
  ['notes', 'Notes'],
] as const;

export default function BusinessDetailsPage() {
  const params = useParams();
  const businessId = params?.id as string;
  const d = useDossier(businessId);
  const b = d.business;

  if (d.isLoading) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 pt-24 space-y-5" aria-busy="true">
          <p role="status" className="text-sm text-walnut">
            Opening the dossier…
          </p>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-14 w-3/4 max-w-xl" />
          <Skeleton className="h-5 w-2/3 max-w-lg" />
          <div className="grid grid-cols-3 gap-3 pt-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (d.error || !b) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div role="alert" className="max-w-md">
          <Wordmark compact />
          <h1 className="mt-8 text-3xl">We couldn&apos;t find this lead.</h1>
          <p className="mt-3 text-walnut">
            It may have been removed in a newer scan, or the link is from another browser. {d.error ? `(${d.error})` : ''}
          </p>
          <Button href="/radar" variant="ink" className="mt-6">
            <ArrowLeft aria-hidden /> Back to the map
          </Button>
        </div>
      </div>
    );
  }

  const wa = whatsappHref(b, whatsappPitch(b));

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-30 border-b border-hairline bg-paper">
        <div className="mx-auto max-w-5xl px-3 sm:px-8 h-16 flex items-center gap-2">
          <Link href="/radar" className={buttonClass('ghost', 'sm', '-ml-2')}>
            <ArrowLeft aria-hidden /> <span className="hidden sm:inline">Map</span>
          </Link>
          <nav aria-label="Sections" className="flex-1 min-w-0 overflow-x-auto">
            <ul className="flex items-center gap-0.5 text-sm">
              {NAV.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="inline-flex items-center h-11 px-2.5 text-walnut hover:text-ink whitespace-nowrap">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {!isSample(b) && (
            <button
              type="button"
              onClick={() => d.triggerLiveEnrichment(true)}
              disabled={d.isEnriching}
              className={buttonClass('outline', 'sm', 'shrink-0')}
              title="Check Google Places and Instagram again for photos and handles"
            >
              <RefreshCw aria-hidden />
              <span className="hidden md:inline">{d.isEnriching ? 'Checking…' : 'Check again'}</span>
            </button>
          )}
        </div>
        {d.isEnriching && (
          <p role="status" className="border-t border-hairline bg-surface px-5 py-1.5 text-center text-xs text-walnut">
            Looking up {b.name} on Google Places and Instagram. Photos will update when it&apos;s done.
          </p>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-5 sm:px-8 pt-10 sm:pt-14 space-y-20 sm:space-y-24">
        <Overview b={b} enriched={b.is_enriched} />
        <Presence b={b} />
        <Photos b={b} />
        <PitchKit b={b} />
        <Notes b={b} notes={d.notes} setNotes={d.setNotes} onSave={d.saveNotes} saving={d.isSavingNotes} saved={d.notesSaved} onStatus={d.setStatus} />
      </main>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink bg-surface">
        <div className="mx-auto max-w-5xl px-3 sm:px-8 py-3 flex items-center gap-2">
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClass('primary', 'md', 'flex-1 sm:flex-none')}>
              <MessageCircle aria-hidden /> WhatsApp
            </a>
          ) : null}
          {b.phone && (
            <a href={`tel:${b.phone}`} className={buttonClass(wa ? 'outline' : 'primary', 'md', 'flex-1 sm:flex-none')}>
              <Phone aria-hidden /> Call
            </a>
          )}
          {b.email ? (
            <a href={`mailto:${b.email}?body=${encodeURIComponent(emailPitch(b))}`} className={buttonClass('outline', 'md', 'flex-1 sm:flex-none')}>
              <Mail aria-hidden /> Email
            </a>
          ) : (
            <a href={mapsHref(b)} target="_blank" rel="noopener noreferrer" className={buttonClass('outline', 'md', 'flex-1 sm:flex-none')}>
              <MapPin aria-hidden /> Maps
            </a>
          )}
          <StatusSelect value={b.outreach_status} onChange={d.setStatus} className="ml-auto h-11 hidden sm:inline-flex" />
        </div>
      </div>
    </div>
  );
}
