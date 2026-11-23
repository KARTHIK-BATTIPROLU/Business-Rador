import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Wordmark } from '@/components/ui/primitives';
import { HeroMap } from '@/components/landing/HeroMap';
import { HandUnderline } from '@/components/landing/HandUnderline';
import { WordReveal } from '@/components/motion/WordReveal';
import { BlurFade } from '@/components/motion/BlurFade';
import { ExampleLead } from '@/components/landing/ExampleLead';

const COVERAGE: { name: string; note: string; coords: string }[] = [
  { name: 'Kokapet', note: 'New towers, empty ground floors filling up with cafes before the residents arrive.', coords: '17.41 N, 78.33 E' },
  { name: 'Gachibowli', note: 'Lunch crowd from the IT parks. Salons and quick food open here every month.', coords: '17.44 N, 78.35 E' },
  { name: 'Financial District', note: 'Office-tower retail and juice bars.', coords: '17.42 N, 78.34 E' },
  { name: 'Jubilee Hills', note: 'Road 36 and the lanes off it: designer boutiques, clinics, the occasional bakery with a queue.', coords: '17.43 N, 78.41 E' },
  { name: 'HITECH City and Madhapur', note: 'Dense, fast, takeaway-heavy.', coords: '17.45 N, 78.39 E' },
  { name: 'Kondapur and Narsingi', note: 'Gyms and studios in new mixed-use blocks.', coords: '17.46 N, 78.36 E' },
  { name: 'Nanakramguda', note: 'Small and quiet. Worth a scan every week.', coords: '17.42 N, 78.36 E' },
  { name: 'Banjara Hills', note: 'Older money, newer clinics.', coords: '17.42 N, 78.44 E' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-[60] bg-surface border border-ink px-3 py-2 rounded-ctl">
        Skip to content
      </a>

      <header className="border-b border-hairline">
        <div className="mx-auto max-w-[1240px] h-16 px-5 sm:px-8 flex items-center justify-between gap-4">
          <Link href="/" aria-label="Business Radar home">
            <Wordmark />
          </Link>
          <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
            <a href="#how" className="hidden md:inline-flex h-11 items-center px-3 text-sm text-walnut hover:text-ink">
              How it finds leads
            </a>
            <a href="#coverage" className="hidden md:inline-flex h-11 items-center px-3 text-sm text-walnut hover:text-ink">
              Coverage
            </a>
            <Button href="/radar" variant="ink" size="sm">
              Open the map
            </Button>
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">
        {/* Hero: copy left on a narrow column, the map crop takes the rest and bleeds right */}
        <section className="mx-auto max-w-[1240px] px-5 sm:px-8 pt-12 sm:pt-16 lg:pt-20 pb-20 lg:pb-28 grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-14 items-start">
          <div className="lg:pt-6 max-w-[34rem]">
            <h1 className="text-[2.5rem] leading-[1.04] sm:text-5xl lg:text-[3.5rem]">
              <WordReveal text="Find Hyderabad's new shops" />{' '}
              <HandUnderline>
                <WordReveal text="before anyone" start={4} />
              </HandUnderline>{' '}
              <WordReveal text="builds their website." start={6} />
            </h1>
            <p className="mt-7 text-lg text-walnut max-w-prose leading-[1.55]">
              A cafe in Kokapet opened 11 days ago. It has three Instagram posts, a WhatsApp number on Google Maps, and no
              site. Business Radar finds shops like that every eight hours and puts them on one map for your agency.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button href="/radar" variant="primary" size="lg">
                Open the map <ArrowRight aria-hidden />
              </Button>
              <a href="#how" className="text-sm text-ink underline decoration-hairline underline-offset-4 hover:decoration-ink min-h-11 inline-flex items-center">
                What makes a good lead
              </a>
            </div>
            <p className="mt-10 text-sm text-walnut">Built for small web and marketing studios in Hyderabad.</p>
          </div>

          <div className="lg:-mr-10 xl:-mr-16 lg:mt-2">
            <HeroMap />
          </div>
        </section>

        {/* How it finds leads: one worked example, not a three-card pipeline */}
        <section id="how" className="border-y border-hairline bg-surface/60">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-20 lg:py-28 grid lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] gap-12 lg:gap-20">
            <div>
              <h2 className="text-3xl sm:text-4xl max-w-[16ch]">How one cafe ends up on your list</h2>
              <p className="mt-5 text-walnut max-w-prose">
                The radar doesn&apos;t guess. Every lead comes with the facts behind it, so you can decide in a few seconds
                whether to send a message.
              </p>
              <div className="mt-10 max-w-sm lg:rotate-[0.6deg]">
                <ExampleLead />
              </div>
            </div>

            <ol className="space-y-12 lg:pt-3">
              <BlurFade as="li" className="grid sm:grid-cols-[9rem_1fr] gap-2 sm:gap-8">
                <p className="font-mono text-xs text-walnut pt-1.5">Every 8 hours</p>
                <div>
                  <h3 className="text-xl">It reads the map.</h3>
                  <p className="mt-2 text-walnut max-w-prose">
                    A scheduled scan queries OpenStreetMap and Google Places across the western corridors, from Narsingi up to
                    Kondapur, and keeps anything with a shopfront that wasn&apos;t there last time.
                  </p>
                </div>
              </BlurFade>
              <BlurFade as="li" delay={0.05} className="grid sm:grid-cols-[9rem_1fr] gap-2 sm:gap-8">
                <p className="font-mono text-xs text-walnut pt-1.5">Same pass</p>
                <div>
                  <h3 className="text-xl">It checks how new the shop really is.</h3>
                  <p className="mt-2 text-walnut max-w-prose">
                    Being spotted today is not the same as opening today. So it looks for an opening date: the first Instagram
                    post, the first Google review, or a permit filing. Kona Chai&apos;s first post is from 11
                    days ago.
                  </p>
                </div>
              </BlurFade>
              <BlurFade as="li" delay={0.1} className="grid sm:grid-cols-[9rem_1fr] gap-2 sm:gap-8">
                <p className="font-mono text-xs text-walnut pt-1.5">Score, 0 to 100</p>
                <div>
                  <h3 className="text-xl">No website counts most.</h3>
                  <p className="mt-2 text-walnut max-w-prose">
                    A shop without a site scores high almost by default. A shop with one scores lower and is marked as a possible
                    rebuild. Under 500 followers and a handful of posts tells you the owner is still doing everything by hand.
                  </p>
                </div>
              </BlurFade>
              <BlurFade as="li" delay={0.15} className="grid sm:grid-cols-[9rem_1fr] gap-2 sm:gap-8">
                <p className="font-mono text-xs text-walnut pt-1.5">You</p>
                <div>
                  <h3 className="text-xl">Then it gets out of the way.</h3>
                  <p className="mt-2 text-walnut max-w-prose">
                    One tap opens WhatsApp with a short hello already written. The dossier has a call script, an email and a
                    budget range (₹35,000 to ₹75,000 for a Hyderabad shop site), and you mark the lead contacted when you&apos;re
                    done.
                  </p>
                </div>
              </BlurFade>
            </ol>
          </div>
        </section>

        {/* Coverage as an editorial list, two uneven columns */}
        <section id="coverage" className="mx-auto max-w-[1240px] px-5 sm:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] gap-10 lg:gap-16">
            <div className="lg:sticky lg:top-10 self-start">
              <h2 className="text-3xl sm:text-4xl">Where it looks</h2>
              <p className="mt-5 text-walnut max-w-prose">
                West Hyderabad, where the new buildings are. The scanner also reads Texas permit filings (Austin, Dallas,
                Houston) and London high streets, but Hyderabad is home.
              </p>
            </div>
            <ul className="divide-y divide-hairline border-y border-hairline">
              {COVERAGE.map((c, i) => (
                <li key={c.name} className={`py-6 grid sm:grid-cols-[minmax(0,14rem)_1fr_auto] gap-x-8 gap-y-1 items-baseline ${i === 0 ? 'sm:py-8' : ''}`}>
                  <span className={`font-display tracking-display ${i === 0 ? 'text-3xl' : 'text-2xl'}`}>{c.name}</span>
                  <span className="text-walnut max-w-prose">{c.note}</span>
                  <span className="font-mono text-2xs text-walnut sm:text-right whitespace-nowrap">{c.coords}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border border-ink rounded-panel bg-surface p-6 sm:p-8">
            <p className="font-display text-2xl sm:text-3xl max-w-[22ch] leading-tight">The next shop on this list probably opened this week.</p>
            <Button href="/radar" variant="primary" size="lg" className="self-start sm:self-auto">
              Open the map <ArrowRight aria-hidden />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-8 grid gap-6 sm:grid-cols-[1fr_auto] text-xs text-walnut">
          <div className="space-y-2">
            <Wordmark compact />
            <p className="max-w-prose">
              About the data: places come from OpenStreetMap (Overpass), Google Places and, for Texas, the Comptroller&apos;s open
              sales-tax permits. A scheduled job scans every 8 hours. Leads and outreach notes are stored in Supabase. Pitch
              text is drafted by an AI model and should be read before sending.
            </p>
          </div>
          <nav aria-label="Footer" className="flex sm:flex-col gap-4 sm:gap-2 sm:text-right">
            <Link href="/radar" className="hover:text-ink underline-offset-4 hover:underline">
              Radar map
            </Link>
            <a
              href="https://github.com/KARTHIK-BATTIPROLU/Business-Rador"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink underline-offset-4 hover:underline inline-flex items-center gap-1 sm:justify-end"
            >
              Source code <ArrowUpRight aria-hidden className="size-3.5 stroke-[1.5]" />
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
