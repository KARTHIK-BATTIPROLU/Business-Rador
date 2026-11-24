import React from 'react';
import { TransitionLink as Link } from '@/components/motion/ViewTransitions';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Wordmark } from '@/components/ui/primitives';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { HeroMap } from '@/components/landing/HeroMap';
import { HandUnderline } from '@/components/landing/HandUnderline';
import { WordReveal } from '@/components/motion/WordReveal';
import { BlurFade } from '@/components/motion/BlurFade';
import { ExampleLead } from '@/components/landing/ExampleLead';
import { WorldMap, CITY_COUNT, MARKET_COUNT } from '@/components/landing/WorldMap';
import { GLOBAL_MARKETS } from '@/lib/geocoding';

// A line per market. Kept short and factual: which cities have presets and what
// a first site usually costs there (the scanner's own budget ranges).
const MARKET_NOTES: Record<string, string> = {
  india: 'Where Business Radar was built, and the corridors it has watched longest.',
  usa: 'In Texas, leads also come from state sales-tax permit filings, often before the shop opens.',
};
const MARKET_ORDER = ['india', 'usa', 'uk', 'japan', 'uae', 'australia', 'canada', 'germany', 'france', 'singapore'];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-[60] bg-surface border border-ink px-3 py-2 rounded-ctl">
        Skip to content
      </a>

      <header className="border-b border-hairline">
        <div className="mx-auto max-w-[1240px] h-16 px-4 sm:px-8 flex items-center justify-between gap-3">
          <Link href="/" aria-label="Business Radar home">
            <Wordmark />
          </Link>
          <nav aria-label="Main" className="flex items-center gap-0.5 sm:gap-2">
            <a href="#how" className="hidden md:inline-flex h-11 items-center px-3 text-sm text-walnut hover:text-ink">
              How it finds leads
            </a>
            <a href="#coverage" className="hidden md:inline-flex h-11 items-center px-3 text-sm text-walnut hover:text-ink">
              Coverage
            </a>
            <ThemeToggle />
            <Button href="/radar" variant="ink" size="sm">
              Open the map
            </Button>
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">
        {/* Hero: headline and copy over a full-width world map, with the street-level crop pinned on top */}
        <section className="mx-auto max-w-[1240px] px-5 sm:px-8 pt-12 sm:pt-16 lg:pt-20 pb-20 lg:pb-28">
          <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-8 lg:gap-16 items-end">
            <h1 className="text-[2.6rem] leading-[1.02] sm:text-5xl lg:text-[4.1rem]">
              <WordReveal text="Find the world's newest shops" />{' '}
              <HandUnderline>
                <WordReveal text="before anyone" start={5} />
              </HandUnderline>{' '}
              <WordReveal text="builds their website." start={7} />
            </h1>
            <div className="lg:pb-2">
              <p className="text-lg text-walnut max-w-prose leading-[1.55]">
                Somewhere today a cafe in Shoreditch, a barber in Williamsburg and a ramen bar in Shibuya opened with an
                Instagram account and no website. Business Radar finds shops like that, scores them, and puts them on one map
                for your agency.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button href="/radar" variant="primary" size="lg">
                  Open the map <ArrowRight aria-hidden />
                </Button>
                <Link href="/radar?tour=1" className="text-sm text-ink underline decoration-hairline underline-offset-4 hover:decoration-ink min-h-11 inline-flex items-center">
                  Take the one-minute tour
                </Link>
              </div>
            </div>
          </div>

          <div className="relative mt-12 lg:mt-16">
            <div className="rounded-panel border border-hairline bg-surface px-3 pt-6 pb-4 sm:px-6 lg:pr-[38%]">
              <WorldMap className="block w-full h-auto" />
              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 px-1 text-sm text-walnut">
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">Countries</dt>
                  <dd className="font-mono tabular text-ink text-lg">{MARKET_COUNT}</dd>
                  <span>countries</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">Preset cities</dt>
                  <dd className="font-mono tabular text-ink text-lg">{CITY_COUNT}</dd>
                  <span>cities with presets</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">Anywhere else</dt>
                  <dd className="text-ink">Anywhere else</dd>
                  <span>by typing its name</span>
                </div>
              </dl>
            </div>
            {/* Street-level crop: one neighbourhood up close */}
            <div className="mt-10 mx-auto max-w-[560px] lg:mt-0 lg:absolute lg:right-6 lg:-top-10 lg:w-[38%] lg:max-w-none">
              <HeroMap />
            </div>
          </div>
        </section>

        {/* How it finds leads: one worked example, not a three-card pipeline */}
        <section id="how" className="border-y border-hairline bg-surface/60">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-20 lg:py-28 grid lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] gap-12 lg:gap-20">
            <div>
              <h2 className="text-3xl sm:text-4xl max-w-[16ch]">How one cafe ends up on your list</h2>
              <p className="mt-3 text-sm text-walnut">The example is a sample shop in Kokapet, Hyderabad. It works the same in Austin or Osaka.</p>
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
                <p className="font-mono text-xs text-walnut pt-1.5">On demand</p>
                <div>
                  <h3 className="text-xl">It reads the map.</h3>
                  <p className="mt-2 text-walnut max-w-prose">
                    Pick a neighbourhood anywhere, or drag the map and press &ldquo;Scan this area&rdquo;. The scan asks
                    OpenStreetMap and Google Places what&apos;s there and keeps anything with a shopfront that wasn&apos;t there
                    last time.
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
                    One tap opens WhatsApp, Gmail or an Instagram DM with a short hello already written. The dossier has a call
                    script and a budget range in local money (₹35,000 to ₹75,000 in Hyderabad, $2,800 to $5,500 in the US,
                    £2,200 to £4,200 in the UK), and you mark the lead contacted when you&apos;re done.
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
                {MARKET_COUNT} countries have ready-made city and neighbourhood presets. Anywhere else, type the place, like
                &ldquo;Bandra West&rdquo; or &ldquo;Kreuzberg&rdquo;, and the radar finds it and scans it.
              </p>
            </div>
            <ul className="divide-y divide-hairline border-y border-hairline">
              {MARKET_ORDER.map((id, i) => {
                const m = GLOBAL_MARKETS[id];
                if (!m) return null;
                return (
                  <li key={id} className={`py-6 grid sm:grid-cols-[minmax(0,14rem)_1fr_auto] gap-x-8 gap-y-1 items-baseline ${i === 0 ? 'sm:py-8' : ''}`}>
                    <span className={`font-display tracking-display ${i === 0 ? 'text-3xl' : 'text-2xl'}`}>{m.name}</span>
                    <span className="text-walnut max-w-prose">
                      <span className="text-ink">{m.cities.map((c) => c.name).join(', ')}.</span>
                      {MARKET_NOTES[id] && <> {MARKET_NOTES[id]}</>}
                    </span>
                    <span className="font-mono text-2xs text-walnut sm:text-right whitespace-nowrap" title="Typical first-site budget">
                      {m.defaultBudget.replace(' – ', '–')}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border border-ink rounded-panel bg-accent-fill text-on-accent p-6 sm:p-10 shadow-hard">
            <p className="font-display text-3xl sm:text-4xl max-w-[18ch] leading-[1.02] tracking-display">Somewhere near you, a shop opened this week without a website.</p>
            <Button href="/radar" variant="ink" size="lg" className="self-start sm:self-auto">
              Open the map <ArrowRight aria-hidden />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-8 grid gap-6 sm:grid-cols-[1fr_auto] text-xs text-walnut">
          <div className="space-y-2">
            <Wordmark compact />
            <p className="text-ink">Designed and built in Hyderabad, India.</p>
            <p className="max-w-prose">
              About the data: places come from OpenStreetMap (Overpass), Google Places and, for Texas, the Comptroller&apos;s open
              sales-tax permits. Typed place names are located with the Photon geocoder. A scheduled job also rescans the original Hyderabad corridors every 8 hours. Leads and outreach notes are stored in Supabase. Pitch
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
