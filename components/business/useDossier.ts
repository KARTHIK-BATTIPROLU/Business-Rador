'use client';

// Data + actions for the lead dossier page. Behaviour is unchanged from the old
// single-file page: API first, then this browser's cached scan, then (new) the
// sample set for `sample-*` ids. Live enrichment runs once if the lead isn't enriched.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Business, DeepResearchResult, OutreachStatus } from '@/lib/types';
import { findSampleLead } from '@/lib/sample-leads';
import { isSample, STATUS_META } from '@/lib/lead';
import { useToast } from '@/components/ui/Toast';
import { enrichBusinessWithMedia } from '@/lib/media-helpers';

function fromCache(id: string): Business | null {
  try {
    const cached = localStorage.getItem('radar_cached_businesses');
    if (!cached) return null;
    const list: Business[] = JSON.parse(cached);
    return list.find((b) => b.id === id) || null;
  } catch {
    return null;
  }
}

export function useDossier(businessId: string | undefined) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichMeta, setEnrichMeta] = useState<{ status?: string; verified?: boolean } | null>(null);

  const enrichingRef = useRef(false);
  const triggerLiveEnrichment = useCallback(
    async (force = false) => {
      if (!businessId || isSample({ id: businessId }) || enrichingRef.current) return;
      enrichingRef.current = true;
      setIsEnriching(true);
      try {
        const res = await fetch(`/api/businesses/${businessId}/enrich${force ? '?force=true' : ''}`, { method: 'POST' });
        const data = await res.json();
        if (data.success && data.business) {
          setBusiness(data.business);
          setEnrichMeta({ status: data.enrichment_meta?.instagram_status, verified: data.enrichment_meta?.instagram_verified });
        }
      } catch (err) {
        console.warn('Live enrichment error:', err);
      } finally {
        enrichingRef.current = false;
        setIsEnriching(false);
      }
    },
    [businessId],
  );

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    const use = (b: Business) => {
      if (cancelled) return;
      setBusiness(b);
      setNotes(b.outreach_notes || '');
    };
    (async () => {
      setIsLoading(true);
      setError(null);
      const sample = findSampleLead(businessId);
      if (sample) {
        use(enrichBusinessWithMedia(sample));
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/businesses/${businessId}`);
        const data = await res.json();
        if (data.success && data.business) {
          use(data.business);
          if (!data.business.is_enriched) triggerLiveEnrichment(false);
        } else {
          const c = fromCache(businessId);
          if (c) use(c);
          else if (!cancelled) setError(data.error || 'Business not found');
        }
      } catch (err) {
        const c = fromCache(businessId);
        if (c) use(c);
        else if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load business dossier');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [businessId, triggerLiveEnrichment]);

  const post = async (status: OutreachStatus, n: string) => {
    if (!business || isSample(business)) return;
    await fetch('/api/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: business.id, status, notes: n }),
    });
  };

  const toast = useToast();
  const setStatus = async (s: OutreachStatus, opts?: { silent?: boolean }) => {
    if (!business) return;
    const prevStatus = business.outreach_status;
    if (!opts?.silent && prevStatus !== s) {
      toast({ text: `Marked ${STATUS_META[s].label.toLowerCase()}`, action: { label: 'Undo', run: () => setStatus(prevStatus, { silent: true }) } });
    }
    setBusiness((prev) => (prev ? { ...prev, outreach_status: s } : prev));
    try {
      await post(s, notes);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const saveNotes = async () => {
    if (!business) return;
    setIsSavingNotes(true);
    try {
      await post(business.outreach_status, notes);
      toast({ text: 'Notes saved' });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Store research on the lead (and in this browser's scan cache, like before).
  const applyResearch = (r: DeepResearchResult) => {
    setBusiness((prev) => {
      if (!prev) return prev;
      const next = { ...prev, deep_research: r };
      try {
        const cached = localStorage.getItem('radar_cached_businesses');
        if (cached) {
          const list: Business[] = JSON.parse(cached);
          localStorage.setItem('radar_cached_businesses', JSON.stringify(list.map((x) => (x.id === next.id ? next : x))));
        }
      } catch {}
      return next;
    });
  };

  return { business, applyResearch, isLoading, error, notes, setNotes, isSavingNotes, notesSaved, saveNotes, setStatus, isEnriching, enrichMeta, triggerLiveEnrichment };
}
