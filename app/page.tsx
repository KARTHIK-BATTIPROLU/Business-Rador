import React from 'react';
import Link from 'next/link';
import {
  Radar,
  ArrowRight,
  Compass,
  Sparkles,
  Phone,
  MessageCircle,
  Database,
  Github,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  TrendingUp,
  Layers,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-clay-canvas text-clay-text flex flex-col font-sans selection:bg-blue-100 selection:text-accent-blue">
      {/* Navigation Header */}
      <header className="h-16 border-b border-clay-border/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-clay-sm bg-blue-50 text-accent-blue shadow-clay-btn border border-blue-100">
            <Radar className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-clay-text text-base tracking-tight">Business Founder Radar</span>
            <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              v0.0.1
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <Link
            href="/radar"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-clay-sm bg-white hover:bg-slate-50 text-xs font-semibold text-clay-text border border-clay-border shadow-clay-btn transition active:translate-y-0.5"
          >
            <Compass className="w-3.5 h-3.5 text-accent-blue" />
            <span>Map Radar</span>
          </Link>

          <Link
            href="/todos"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-clay-sm bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 shadow-clay-btn transition"
          >
            <Database className="w-3.5 h-3.5 text-accent-blue" />
            <span>Supabase SSR</span>
          </Link>

          <Link
            href="/radar"
            className="flex items-center gap-2 px-4 py-2 rounded-clay-sm bg-accent-blue hover:bg-blue-600 text-white text-xs font-bold shadow-clay-btn transition active:translate-y-0.5"
          >
            <span>Launch Radar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-accent-blue text-xs font-semibold shadow-clay-pill">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hyderabad MSME Intelligence Radar • Scans Every 8h</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-clay-text leading-[1.15]">
          Spot newly launched businesses in Hyderabad{' '}
          <span className="text-accent-blue underline decoration-blue-200 decoration-wavy">
            before they have websites.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-clay-muted leading-relaxed font-normal">
          An automated intelligence crawler discovering fresh cafes, boutiques, salons, and retail startups across
          Kokapet, Gachibowli, and HITECH City during their critical 30-day launch window — when they need agency services most.
        </p>

        {/* CTA Group */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/radar"
            className="w-full sm:w-auto px-7 py-3.5 rounded-clay bg-accent-blue hover:bg-blue-600 text-white font-bold text-sm shadow-clay-card flex items-center justify-center gap-2.5 transition transform active:translate-y-0.5"
          >
            <Radar className="w-4 h-4 animate-spin" />
            <span>Open Interactive Radar Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="https://github.com/KARTHIK-BATTIPROLU/Business-Rador"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-clay bg-white hover:bg-slate-50 text-clay-text border border-clay-border font-semibold text-sm shadow-clay-btn flex items-center justify-center gap-2 transition active:translate-y-0.5"
          >
            <Github className="w-4 h-4 text-slate-800" />
            <span>GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5 text-clay-faint" />
          </a>
        </div>

        {/* Quick Stats Pill Strip */}
        <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
          <div className="p-3.5 rounded-clay bg-white border border-clay-border/80 shadow-clay-card">
            <div className="text-[11px] font-semibold text-clay-muted uppercase tracking-wider">Cron Schedule</div>
            <div className="text-xl font-bold text-clay-text mt-0.5">Every 8 Hours</div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Automated GitHub Actions
            </div>
          </div>

          <div className="p-3.5 rounded-clay bg-white border border-clay-border/80 shadow-clay-card">
            <div className="text-[11px] font-semibold text-clay-muted uppercase tracking-wider">Key Corridors</div>
            <div className="text-xl font-bold text-clay-text mt-0.5">12+ Hotspots</div>
            <div className="text-[11px] text-clay-muted mt-1">Kokapet to Jubilee Hills</div>
          </div>

          <div className="p-3.5 rounded-clay bg-white border border-clay-border/80 shadow-clay-card">
            <div className="text-[11px] font-semibold text-clay-muted uppercase tracking-wider">AI Scoring</div>
            <div className="text-xl font-bold text-clay-text mt-0.5">0 – 100 Score</div>
            <div className="text-[11px] text-blue-600 font-medium mt-1">Grok AI Pitch Briefs</div>
          </div>

          <div className="p-3.5 rounded-clay bg-white border border-clay-border/80 shadow-clay-card">
            <div className="text-[11px] font-semibold text-clay-muted uppercase tracking-wider">Outreach</div>
            <div className="text-xl font-bold text-clay-text mt-0.5">1-Click Direct</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">WhatsApp & Phone Links</div>
          </div>
        </div>
      </section>

      {/* Hotspots Section */}
      <section className="py-10 bg-white border-y border-clay-border/80 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-accent-blue">Active Radar Coverage</h2>
            <p className="text-lg font-bold text-clay-text">Monitored Hyderabad Commercial Growth Belts</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {[
              { name: 'Kokapet SEZ', count: 'High Density F&B' },
              { name: 'Gachibowli Financial District', count: 'Corporate Wellness & Cafes' },
              { name: 'HITECH City & Madhapur', count: 'Retail & Quick Serve' },
              { name: 'Jubilee Hills Road 36', count: 'Designer Boutiques & Salons' },
              { name: 'Kondapur & Narsingi', count: 'New High-Rise Commercial' },
              { name: 'Nanakramguda Circle', count: 'Specialty QSR & Coffee' }
            ].map((spot) => (
              <div
                key={spot.name}
                className="px-4 py-2.5 rounded-clay-sm bg-clay-canvas border border-clay-border/70 shadow-clay-pill flex items-center gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-xs font-bold text-clay-text">{spot.name}</span>
                <span className="text-[11px] text-clay-muted">({spot.count})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-accent-blue">The 3-Step Pipeline</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-clay-text tracking-tight">
            How Business Radar Discovers Leads First
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-clay bg-white border border-clay-border shadow-clay-card space-y-3">
            <div className="w-10 h-10 rounded-clay-sm bg-blue-50 text-accent-blue flex items-center justify-center font-bold text-base shadow-clay-btn">
              1
            </div>
            <h3 className="font-bold text-base text-clay-text">Automated Multi-Source Scans</h3>
            <p className="text-xs text-clay-muted leading-relaxed">
              Every 8 hours, autonomous Python crawlers query OpenStreetMap Overpass nodes, Google Places radial grids,
              and local Instagram hashtags for newly registered or posted businesses.
            </p>
          </div>

          <div className="p-6 rounded-clay bg-white border border-clay-border shadow-clay-card space-y-3">
            <div className="w-10 h-10 rounded-clay-sm bg-emerald-50 text-accent-emerald flex items-center justify-center font-bold text-base shadow-clay-btn">
              2
            </div>
            <h3 className="font-bold text-base text-clay-text">AI Launch Age Verification</h3>
            <p className="text-xs text-clay-muted leading-relaxed">
              Differentiates between crawler discovery time and actual store opening dates. Grok AI and Instagram post
              histories verify whether a store is <em>Opening Soon</em>, <em>Launched &lt;14 Days Ago</em>, or established.
            </p>
          </div>

          <div className="p-6 rounded-clay bg-white border border-clay-border shadow-clay-card space-y-3">
            <div className="w-10 h-10 rounded-clay-sm bg-amber-50 text-accent-amber flex items-center justify-center font-bold text-base shadow-clay-btn">
              3
            </div>
            <h3 className="font-bold text-base text-clay-text">Instant 1-Click Outreach</h3>
            <p className="text-xs text-clay-muted leading-relaxed">
              Reaches founders directly via pre-filled WhatsApp greetings, click-to-call phone numbers, and built-in
              CRM call status logs (Contacted, Interested, Closed, Skip).
            </p>
          </div>
        </div>
      </section>

      {/* Live Preview Teaser Card */}
      <section className="py-12 bg-blue-50/50 border-y border-blue-100 px-6">
        <div className="max-w-4xl mx-auto rounded-clay bg-white border border-blue-200/80 p-8 shadow-clay-card flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              <Zap className="w-3 h-3" /> Live Pipeline Ready
            </div>
            <h3 className="text-xl font-bold text-clay-text">Explore Discovered Leads on the Vector Map</h3>
            <p className="text-xs text-clay-muted max-w-lg leading-relaxed">
              Interactive MapLibre GL radar with GPU-accelerated pin clustering, hot-grid fly-to controls, and direct
              WhatsApp contact cards.
            </p>
          </div>

          <Link
            href="/radar"
            className="shrink-0 px-6 py-3 rounded-clay bg-accent-blue hover:bg-blue-600 text-white font-bold text-xs shadow-clay-btn flex items-center gap-2 transition active:translate-y-0.5"
          >
            <span>Open Radar Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Monetization / Plans Preview (Inspired by Hyderabad & Bangalore Maps) */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-accent-blue">Platform Tiers</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-clay-text tracking-tight">
            Plans for Agencies, Freelancers & Founders
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className="p-6 rounded-clay bg-white border border-clay-border shadow-clay-card space-y-4">
            <div>
              <h4 className="font-bold text-base text-clay-text">Community Explorer</h4>
              <p className="text-xs text-clay-muted mt-1">Free forever for basic research</p>
              <div className="text-2xl font-extrabold text-clay-text mt-3">₹0</div>
            </div>
            <ul className="text-xs text-clay-muted space-y-2 pt-2 border-t border-clay-border/70">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Browse all interactive map clusters</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Leads older than 7 days</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Area & category filtering</span>
              </li>
            </ul>
            <Link
              href="/radar"
              className="block text-center py-2 px-3 rounded-clay-sm bg-slate-100 hover:bg-slate-200 text-clay-text font-bold text-xs transition"
            >
              Start Free
            </Link>
          </div>

          {/* Agency Pro */}
          <div className="p-6 rounded-clay bg-white border-2 border-accent-blue shadow-clay-card space-y-4 relative">
            <div className="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full bg-accent-blue text-white text-[10px] font-bold uppercase tracking-wide">
              Most Popular
            </div>
            <div>
              <h4 className="font-bold text-base text-clay-text">Agency Pro</h4>
              <p className="text-xs text-clay-muted mt-1">For web design & marketing agencies</p>
              <div className="text-2xl font-extrabold text-clay-text mt-3">
                ₹999 <span className="text-xs font-normal text-clay-muted">/ month</span>
              </div>
            </div>
            <ul className="text-xs text-clay-muted space-y-2 pt-2 border-t border-clay-border/70">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-blue shrink-0" />
                <span className="font-medium text-clay-text">Instant &lt;24h fresh launch alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-blue shrink-0" />
                <span>Unmasked WhatsApp & direct phone numbers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-blue shrink-0" />
                <span>Grok AI tailored 2-sentence pitch generator</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-blue shrink-0" />
                <span>1-Click CSV / Excel export</span>
              </li>
            </ul>
            <Link
              href="/radar"
              className="block text-center py-2 px-3 rounded-clay-sm bg-accent-blue hover:bg-blue-600 text-white font-bold text-xs transition shadow-clay-btn"
            >
              Access Pro Radar
            </Link>
          </div>

          {/* Featured Boost */}
          <div className="p-6 rounded-clay bg-white border border-clay-border shadow-clay-card space-y-4">
            <div>
              <h4 className="font-bold text-base text-clay-text">Featured Radar Boost</h4>
              <p className="text-xs text-clay-muted mt-1">For new cafes & stores wanting footfall</p>
              <div className="text-2xl font-extrabold text-clay-text mt-3">
                ₹1,499 <span className="text-xs font-normal text-clay-muted">/ 7 days</span>
              </div>
            </div>
            <ul className="text-xs text-clay-muted space-y-2 pt-2 border-t border-clay-border/70">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>2× Glowing Amber Marker on map</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Unclustered priority across all zoom levels</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Featured pinned card at top of list</span>
              </li>
            </ul>
            <Link
              href="/radar"
              className="block text-center py-2 px-3 rounded-clay-sm bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition"
            >
              Boost a Business
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-clay-border/80 bg-white py-8 px-6 text-xs text-clay-muted">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-accent-blue" />
            <span className="font-bold text-clay-text">Business Founder Radar</span>
            <span>•</span>
            <span>v0.0.1</span>
            <span>•</span>
            <span>Hyderabad MSME Pipeline</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/radar" className="hover:text-clay-text underline">
              Interactive Radar
            </Link>
            <Link href="/todos" className="hover:text-clay-text underline">
              Supabase SSR
            </Link>
            <a
              href="https://github.com/KARTHIK-BATTIPROLU/Business-Rador"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-clay-text"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
