'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FileSearch, Mail, MessageCircle, Phone, Instagram } from 'lucide-react';
import type { Business, DeepResearchResult } from '@/lib/types';
import { Badge } from '@/components/ui/primitives';
import { buttonClass } from '@/components/ui/Button';
import { SectionHead } from './Sections';
import { cn } from '@/lib/utils';

const STAGES = ['Nearby competitors', 'Google and Instagram check', 'Who to contact', 'Outreach drafts'];

const CHANNEL: Record<string, { label: string; icon: React.ReactNode }> = {
  email: { label: 'Email', icon: <Mail aria-hidden /> },
  instagram: { label: 'Instagram DM', icon: <Instagram aria-hidden /> },
  whatsapp: { label: 'WhatsApp', icon: <MessageCircle aria-hidden /> },
  phone: { label: 'Phone', icon: <Phone aria-hidden /> },
};

/**
 * On-demand "deep research": calls /api/businesses/[id]/deep-research, shows who to
 * contact, what's missing online and why now, and hands the drafts to the pitch kit.
 */
export function DeepResearch({ b, onResult }: { b: Business; onResult: (r: DeepResearchResult) => void }) {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const r = b.deep_research;

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setError(null);
    setStep(0);
    timer.current = setInterval(() => setStep((s) => Math.min(s + 1, STAGES.length - 1)), 650);
    try {
      const res = await fetch(`/api/businesses/${b.id}/deep-research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business: b }),
      });
      const data = await res.json();
      if (data.success && data.deep_research) {
        onResult(data.deep_research);
      } else {
        setError(data.error || 'The research step returned nothing.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error.');
    } finally {
      if (timer.current) clearInterval(timer.current);
      setRunning(false);
    }
  };

  const ch = r ? CHANNEL[r.target_decision_maker.preferred_channel] : null;

  return (
    <section aria-labelledby="research">
      <SectionHead
        id="research"
        title="Research"
        note={r ? `Last run ${new Date(r.researched_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}` : undefined}
      />

      {!r && !running && (
        <div className="rounded-panel border border-dashed border-hairline p-6 sm:p-8 grid sm:grid-cols-[1fr_auto] gap-5 items-center">
          <div>
            <p className="text-ink max-w-prose">
              Work out who to contact, what {b.name} is missing online and which nearby shops already do it better. The results also fill in the
              pitch kit below.
            </p>
            {error && (
              <p role="alert" className="mt-2 text-sm text-status-interested">
                Research didn&apos;t finish: {error}
              </p>
            )}
          </div>
          <button type="button" onClick={run} className={buttonClass('primary', 'lg')}>
            <FileSearch aria-hidden /> Research this lead
          </button>
        </div>
      )}

      {running && (
        <div role="status" className="rounded-panel border border-hairline bg-surface p-5 sm:p-6">
          <p className="text-ink">
            <span className="font-mono text-xs text-walnut tabular mr-2">
              {step + 1}/{STAGES.length}
            </span>
            {STAGES[step]}…
          </p>
          <ol className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {STAGES.map((s, i) => (
              <li key={s} className={cn('h-9 px-2.5 rounded-ctl border flex items-center', i <= step ? 'border-ink text-ink' : 'border-hairline text-walnut')}>
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}

      {r && !running && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] gap-6">
            {/* Who to contact — the most useful thing, so the biggest cell */}
            <div className="rounded-panel border border-ink bg-surface p-5 sm:p-6">
              <p className="text-sm text-walnut">Who to contact</p>
              <p className="mt-1 font-display text-2xl leading-tight">{r.target_decision_maker.probable_role}</p>
              <dl className="mt-4 divide-y divide-hairline border-y border-hairline text-sm">
                {r.target_decision_maker.contact_name && (
                  <div className="grid grid-cols-[7rem_1fr] gap-3 py-2.5">
                    <dt className="text-walnut">Name</dt>
                    <dd>{r.target_decision_maker.contact_name}</dd>
                  </div>
                )}
                {r.target_decision_maker.contact_email && (
                  <div className="grid grid-cols-[7rem_1fr] gap-3 py-2.5">
                    <dt className="text-walnut">Email</dt>
                    <dd className="font-mono text-[13px] break-all">
                      {r.target_decision_maker.contact_email}
                      {!b.email && <span className="block font-sans text-xs text-walnut mt-0.5">A guess from the shop name. Check it before sending.</span>}
                    </dd>
                  </div>
                )}
                {r.target_decision_maker.contact_phone && (
                  <div className="grid grid-cols-[7rem_1fr] gap-3 py-2.5">
                    <dt className="text-walnut">Phone</dt>
                    <dd className="font-mono text-[13px]">{r.target_decision_maker.contact_phone}</dd>
                  </div>
                )}
                {ch && (
                  <div className="grid grid-cols-[7rem_1fr] gap-3 py-2.5 items-center">
                    <dt className="text-walnut">Best channel</dt>
                    <dd className="inline-flex items-center gap-1.5 [&_svg]:size-4 [&_svg]:stroke-[1.5]">
                      {ch.icon} {ch.label}
                    </dd>
                  </div>
                )}
              </dl>
              <p className="mt-4 text-sm text-walnut max-w-prose">{r.business_overview}</p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg">Why now</h3>
                <p className="mt-2 text-sm text-ink max-w-prose">{r.corridor_competition.vulnerability_gap}</p>
              </div>
              <div>
                <h3 className="text-lg">What&apos;s missing online</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {r.google_presence.missing_elements.map((m, i) => (
                    <li key={i} className="flex gap-2">
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                      {m}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-walnut">Instagram: {r.social_presence.instagram_status}</p>
              </div>
            </div>
          </div>

          {r.corridor_competition.nearby_competitors.length > 0 && (
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg">Shops it competes with</h3>
                <Badge tone="sample" className="font-mono text-2xs">
                  typical examples, not a live lookup
                </Badge>
              </div>
              <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
                {r.corridor_competition.nearby_competitors.map((c) => (
                  <li key={c.name} className="grid sm:grid-cols-[minmax(0,14rem)_5rem_1fr] gap-x-6 gap-y-0.5 py-3 text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="font-mono text-xs text-walnut tabular sm:pt-0.5">{c.distance}</span>
                    <span className="text-walnut">{c.advantage}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={run} className={buttonClass('outline', 'sm')}>
              <FileSearch aria-hidden /> Run again
            </button>
            <p className="text-xs text-walnut max-w-prose">
              Drafted from what the radar knows about this shop plus built-in templates. Read it as a starting point, not as checked facts.
            </p>
            {error && (
              <p role="alert" className="text-sm text-status-interested">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
