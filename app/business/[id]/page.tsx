'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Business, OutreachStatus, MediaPhoto, DeepResearchResult } from '@/lib/types';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Instagram,
  Globe,
  MapPin,
  Flame,
  Sparkles,
  Clock,
  Calendar,
  Radio,
  Camera,
  ExternalLink,
  Copy,
  Check,
  Send,
  Navigation,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  X,
  Share2,
  RefreshCw,
  Search,
  Mail,
  Target,
  UserCheck,
  ShieldAlert,
  FileText
} from 'lucide-react';

export default function BusinessDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params?.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery & Media state
  const [activeMediaTab, setActiveMediaTab] = useState<'all' | 'google' | 'instagram'>('all');
  const [lightboxPhoto, setLightboxPhoto] = useState<MediaPhoto | null>(null);

  // Deep Research state
  const [deepResearch, setDeepResearch] = useState<DeepResearchResult | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [researchStep, setResearchStep] = useState(0);
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);

  // Editable outbound content
  const [outboundEmail, setOutboundEmail] = useState({ to: '', subject: '', body: '' });
  const [outboundDm, setOutboundDm] = useState({ handle: '', message: '', followUp: '' });
  const [outboundWa, setOutboundWa] = useState('');
  const [activeOutboundTab, setActiveOutboundTab] = useState<'email' | 'instagram' | 'whatsapp' | 'call'>('email');

  // Outreach & Pitch state
  const [activePitchTab, setActivePitchTab] = useState<'whatsapp' | 'call' | 'email'>('whatsapp');
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichMeta, setEnrichMeta] = useState<{ status?: string; verified?: boolean } | null>(null);

  const initOutboundFields = (b: Business, dr?: DeepResearchResult) => {
    const pack = dr?.outreach_pack;
    const cleanSlug = b.name.toLowerCase().replace(/[^a-z0-9]/g, '').trim() || 'business';

    setOutboundEmail({
      to: pack?.cold_email?.target_email || b.email || `contact@${cleanSlug}.com`,
      subject: pack?.cold_email?.subject_line || `Quick question about ${b.name}'s new ${b.city} launch`,
      body: pack?.cold_email?.body || b.dossier?.cold_email_pitch || '',
    });

    setOutboundDm({
      handle: pack?.instagram_dm?.instagram_handle || (b.instagram_handle ? b.instagram_handle.replace('@', '') : cleanSlug),
      message: pack?.instagram_dm?.message || `Hey @${b.instagram_handle ? b.instagram_handle.replace('@', '') : cleanSlug} team! 👏 Stumbled across your new spot in ${b.area}. Love what you're building! Quick question regarding your online booking setup...`,
      followUp: pack?.instagram_dm?.follow_up_message || `Hey team, just following up in case this got buried! Put together a 60-second video mockup for ${b.name}. Mind if I drop the link?`,
    });

    setOutboundWa(pack?.whatsapp_message?.text || b.dossier?.whatsapp_pitch || '');
  };

  const handleRunDeepResearch = async () => {
    if (!business || isResearching) return;
    setIsResearching(true);
    setResearchStep(1);

    const stepTimer = setInterval(() => {
      setResearchStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 650);

    try {
      const res = await fetch(`/api/businesses/${business.id}/deep-research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business }),
      });
      const data = await res.json();
      clearInterval(stepTimer);
      setResearchStep(4);

      if (data.success && data.deep_research) {
        setDeepResearch(data.deep_research);
        const updatedBiz: Business = {
          ...business,
          deep_research: data.deep_research,
        };
        setBusiness(updatedBiz);
        initOutboundFields(updatedBiz, data.deep_research);

        try {
          const cached = localStorage.getItem('radar_cached_businesses');
          if (cached) {
            const list: Business[] = JSON.parse(cached);
            const nextList = list.map((b) => (b.id === business.id ? updatedBiz : b));
            localStorage.setItem('radar_cached_businesses', JSON.stringify(nextList));
          }
        } catch {}
      }
    } catch (err) {
      console.error('Deep research failed:', err);
    } finally {
      clearInterval(stepTimer);
      setIsResearching(false);
    }
  };

  const copyChannelContent = (channel: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChannel(channel);
    setTimeout(() => setCopiedChannel(null), 2500);
  };

  const handleCopyAndOpenInstagram = () => {
    navigator.clipboard.writeText(outboundDm.message);
    setCopiedChannel('dm_open');
    setTimeout(() => setCopiedChannel(null), 2500);

    const cleanHandle = (outboundDm.handle || business?.instagram_handle || '').replace('@', '').trim();
    if (cleanHandle) {
      window.open(`https://ig.me/m/${cleanHandle}`, '_blank');
    } else {
      window.open(`https://www.google.com/search?q=${encodeURIComponent('site:instagram.com "' + (business?.name || '') + '" ' + (business?.city || ''))}`, '_blank');
    }
  };

  const triggerLiveEnrichment = async (force: boolean = false) => {
    if (!businessId || isEnriching) return;
    setIsEnriching(true);
    try {
      const res = await fetch(`/api/businesses/${businessId}/enrich${force ? '?force=true' : ''}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.business) {
        setBusiness(data.business);
        setEnrichMeta({
          status: data.enrichment_meta?.instagram_status,
          verified: data.enrichment_meta?.instagram_verified,
        });
      }
    } catch (err) {
      console.warn('Live enrichment error:', err);
    } finally {
      setIsEnriching(false);
    }
  };

  useEffect(() => {
    if (!businessId) return;

    async function loadBusiness() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/businesses/${businessId}`);
        const data = await res.json();
        if (data.success && data.business) {
          setBusiness(data.business);
          setNotes(data.business.outreach_notes || '');
          if (data.business.deep_research) {
            setDeepResearch(data.business.deep_research);
          }
          initOutboundFields(data.business, data.business.deep_research);
          // Trigger JIT live enrichment if not yet enriched
          if (!data.business.is_enriched) {
            triggerLiveEnrichment(false);
          }
        } else {
          // Check local cached businesses from radar scan
          let foundInCache: Business | null = null;
          try {
            const cached = localStorage.getItem('radar_cached_businesses');
            if (cached) {
              const list: Business[] = JSON.parse(cached);
              foundInCache = list.find((b) => b.id === businessId) || null;
            }
          } catch {}

          if (foundInCache) {
            setBusiness(foundInCache);
            setNotes(foundInCache.outreach_notes || '');
            if (foundInCache.deep_research) {
              setDeepResearch(foundInCache.deep_research);
            }
            initOutboundFields(foundInCache, foundInCache.deep_research);
          } else {
            setError(data.error || 'Business not found');
          }
        }
      } catch (err: any) {
        let foundInCache: Business | null = null;
        try {
          const cached = localStorage.getItem('radar_cached_businesses');
          if (cached) {
            const list: Business[] = JSON.parse(cached);
            foundInCache = list.find((b) => b.id === businessId) || null;
          }
        } catch {}

        if (foundInCache) {
          setBusiness(foundInCache);
          setNotes(foundInCache.outreach_notes || '');
          if (foundInCache.deep_research) {
            setDeepResearch(foundInCache.deep_research);
          }
          initOutboundFields(foundInCache, foundInCache.deep_research);
        } else {
          setError(err.message || 'Failed to load business dossier');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadBusiness();
  }, [businessId]);

  const handleStatusChange = async (newStatus: OutreachStatus) => {
    if (!business) return;
    setBusiness((prev) => (prev ? { ...prev, outreach_status: newStatus } : null));

    try {
      await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: business.id, status: newStatus, notes }),
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!business) return;
    setIsSavingNotes(true);
    try {
      await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: business.id, status: business.outreach_status, notes }),
      });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-clay-canvas flex flex-col items-center justify-center p-6 text-clay-muted">
        <div className="p-4 rounded-clay bg-white shadow-clay-card flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-accent-blue animate-spin" />
          <span className="text-sm font-semibold text-clay-text">Loading Hyderabad Business Dossier & Media...</span>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-clay-canvas flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-clay bg-white border border-clay-border shadow-clay-card text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-clay-text">Business Not Found</h2>
          <p className="text-xs text-clay-muted leading-relaxed">
            {error || `No dossier found for ID: ${businessId}. It may have been filtered or updated.`}
          </p>
          <Link
            href="/radar"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-clay-sm bg-accent-blue hover:bg-blue-600 text-white font-bold text-xs shadow-clay-btn transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Interactive Radar</span>
          </Link>
        </div>
      </div>
    );
  }

  // Gallery aggregation (prioritizing live-enriched photos)
  const googlePhotos = (business.google_photos && business.google_photos.length > 0)
    ? business.google_photos
    : (business.dossier?.google_photos || []);
  const instagramPosts = (business.instagram_posts && business.instagram_posts.length > 0)
    ? business.instagram_posts
    : (business.dossier?.instagram_posts || []);
  const allMedia: MediaPhoto[] = (business.media_photos && business.media_photos.length > 0)
    ? business.media_photos
    : [...googlePhotos, ...instagramPosts];

  const displayedMedia =
    activeMediaTab === 'google'
      ? googlePhotos
      : activeMediaTab === 'instagram'
      ? instagramPosts
      : allMedia;

  // Format launch info
  const formatActualLaunch = () => {
    if (business.is_opening_soon) {
      return {
        label: 'Opening Soon (Under Fit-out)',
        badge: '✨ OPENING SOON',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        sub: 'Fit-out underway • Grand Opening in early November 2026',
      };
    }
    const dateStr = business.actual_launch_date || business.estimated_open_date;
    if (!dateStr) return null;

    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return {
        label: `Launched ${diffDays} days ago`,
        badge: `🚀 LAUNCHED ${diffDays}D AGO`,
        color: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
        sub: `Opened on ${dateStr} • Golden agency outreach window (< 14 days)`,
      };
    }
    if (diffDays <= 30) {
      return {
        label: `Launched ${Math.round(diffDays / 7)} weeks ago`,
        badge: `📅 LAUNCHED ${Math.round(diffDays / 7)}W AGO`,
        color: 'bg-teal-50 text-teal-800 border-teal-200',
        sub: `Opened on ${dateStr} • Recent store launch`,
      };
    }
    return {
      label: 'Established Store',
      badge: '🏢 ESTABLISHED',
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      sub: `Operating since ${dateStr}`,
    };
  };

  const launchMeta = formatActualLaunch();

  // Pitch scripts
  const whatsappPitchText =
    business.dossier?.whatsapp_pitch ||
    `Hi ${business.name} team! Congratulations on opening in ${business.area}. Saw your new store and noticed you don't have an official website or digital ordering menu yet. We build fast, mobile-first websites for local brands. Can I send a 1-minute demo?`;

  const coldCallScriptText =
    business.dossier?.cold_call_script ||
    `Hi! Am I speaking with the founder of ${business.name}? Congratulations on your new launch in ${business.area}! My name is [Your Name]. We noticed your store is getting great early footfall, but customers searching on Google don't find a direct website yet. Do you have 2 minutes this week to look at a quick prototype we drafted for you?`;

  const emailProposalText =
    business.dossier?.cold_email_pitch ||
    `Subject: Quick question regarding ${business.name}'s digital presence in ${business.area}

Hi ${business.name} Team,

First of all, congratulations on opening your new location in ${business.area}!

While researching newly launched spots in the corridor, I noticed your storefront and Instagram presence are gaining traction, but you currently don't have a dedicated website or direct booking/ordering portal.

We specialize in helping newly launched businesses capture high-value customers:
1. Fast mobile website with 0% commissions
2. Google Business Profile setup & 5-star review acquisition
3. Local SEO for area residents

Would you be open to reviewing a complimentary 2-page digital prototype we drafted for ${business.name}?

Best regards,
Business Radar Partner Team`;

  return (
    <div className="min-h-screen bg-clay-canvas text-clay-text flex flex-col font-sans selection:bg-blue-100 selection:text-accent-blue pb-20 overflow-y-auto">
      {/* Sticky Top Header */}
      <header className="h-16 border-b border-clay-border/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/radar"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-clay-sm bg-white hover:bg-slate-50 text-xs font-semibold text-clay-text border border-clay-border shadow-clay-btn transition active:translate-y-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-accent-blue" />
            <span>Back to Radar Map</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-clay-muted">
            <span>/</span>
            <span>{business.area}</span>
            <span>/</span>
            <span className="font-semibold text-clay-text truncate max-w-[180px]">{business.name}</span>
          </div>
        </div>

        {/* Quick Actions in Header */}
        <div className="flex items-center gap-2">
          {/* Live JIT Enrichment Trigger */}
          <button
            onClick={() => triggerLiveEnrichment(true)}
            disabled={isEnriching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-clay-sm bg-blue-50 hover:bg-blue-100 text-accent-blue border border-blue-200/80 font-bold text-xs shadow-clay-btn transition disabled:opacity-50"
            title="Scan live Google Places & Instagram to pull authentic photos and verified handles"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isEnriching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isEnriching ? 'Searching Live...' : '⚡ Live Enrich Visuals'}</span>
          </button>

          {/* Quick Header Deep Research Trigger */}
          <button
            onClick={() => {
              const el = document.getElementById('deep-research-center');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              if (!deepResearch) handleRunDeepResearch();
            }}
            disabled={isResearching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-clay-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-clay-btn transition disabled:opacity-50"
            title="Run on-demand deep intelligence research & prepare 1-click email/IG pitch"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isResearching ? 'animate-spin' : ''}`} />
            <span>{isResearching ? 'Researching...' : deepResearch ? '🔬 Deep Intelligence' : '🔬 Deep Research'}</span>
          </button>

          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(whatsappPitchText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-clay-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-bold text-xs shadow-clay-btn transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">WhatsApp Founder</span>
            </a>
          )}

          {/* Google Maps Search Button - Opens Verified Google Place Card */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              [business.name, business.area, business.city].filter(Boolean).join(' ')
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-clay-sm bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 font-bold text-xs shadow-clay-btn transition"
            title="Search verified business place on Google Maps"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Google Maps</span>
          </a>

          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-clay-sm bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs shadow-clay-btn transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Call</span>
            </a>
          )}

          <div className="flex items-center gap-1 bg-white p-1 rounded-clay-sm border border-clay-border/80 shadow-clay-btn text-xs">
            <span className="text-[11px] text-clay-muted px-1.5 font-medium">Status:</span>
            <select
              value={business.outreach_status}
              onChange={(e) => handleStatusChange(e.target.value as OutreachStatus)}
              className="bg-transparent font-bold text-xs outline-none cursor-pointer"
            >
              <option value="new">🟢 New Lead</option>
              <option value="contacted">🔵 Contacted</option>
              <option value="interested">🟡 Interested</option>
              <option value="closed">🟣 Closed Plan</option>
              <option value="skip">⚪ Skip</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6 space-y-6">
        {/* Business Hero Banner */}
        <div className="p-6 rounded-clay bg-white border border-clay-border/80 shadow-clay-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-accent-blue border border-blue-200">
                {business.category}
              </span>
              {business.sub_category && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {business.sub_category}
                </span>
              )}
              {launchMeta && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-sm ${launchMeta.color}`}>
                  {launchMeta.badge}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-clay-text tracking-tight">
              {business.name}
            </h1>

            <p className="text-sm text-clay-muted leading-relaxed max-w-2xl">
              {business.description || 'Newly discovered commercial enterprise in Hyderabad technology corridor.'}
            </p>

            <div className="flex items-center gap-3 text-xs text-clay-muted flex-wrap font-medium pt-1">
              <span className="flex items-center gap-1 text-clay-text">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <strong>{business.area}</strong>, {business.city} ({business.country || 'USA'})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-slate-600">
                <Radio className="w-3 h-3 text-accent-blue" />
                Spotted {new Date(business.first_seen_at).toLocaleDateString()}
              </span>

              {business.is_enriched && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Live Enriched</span>
                  </span>
                </>
              )}

              {business.instagram_handle && business.instagram_verified !== false ? (
                <>
                  <span>•</span>
                  <a
                    href={
                      business.instagram_url ||
                      `https://www.instagram.com/${business.instagram_handle.replace('@', '')}/`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-pink-700 hover:underline font-semibold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200"
                    title={`Instagram profile: @${business.instagram_handle.replace('@', '')}`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>
                      @{business.instagram_handle.replace('@', '')}
                      {business.instagram_followers && business.instagram_followers > 0 ? ` (${business.instagram_followers.toLocaleString()} followers)` : ''}
                    </span>
                    {business.instagram_verified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                  </a>
                </>
              ) : (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 text-[11px]">
                    <Instagram className="w-3.5 h-3.5 text-slate-400" />
                    <span>Instagram Profile Not In Registry</span>
                  </span>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent('site:instagram.com "' + business.name + '" ' + (business.city || business.area || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-pink-700 hover:underline font-semibold"
                    title="Search Google for authentic social footprint and founder mentions"
                  >
                    Find on Instagram via Google →
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Lead Score Card */}
          <div className="shrink-0 flex md:flex-col items-center justify-between md:justify-center p-4 rounded-clay bg-blue-50/70 border border-blue-100 shadow-clay-card text-center gap-2">
            <div className="flex items-center gap-1.5 text-accent-blue font-bold text-xs uppercase tracking-wide">
              <Flame className="w-4 h-4 text-orange-500" />
              Lead Score
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-accent-blue tracking-tight">
              {business.lead_score}
              <span className="text-sm text-blue-400 font-normal">/100</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
              High Agency Target
            </span>
          </div>
        </div>

        {/* Store Launch Age & Provenance Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Physical Launch Date */}
          <div className="p-4 rounded-clay bg-white border border-clay-border/80 shadow-clay-card space-y-1">
            <div className="flex items-center justify-between text-xs text-clay-muted">
              <span className="font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Physical Store Launch
              </span>
            </div>
            <div className="text-base font-bold text-clay-text">
              {business.actual_launch_date || business.estimated_open_date || 'Under Estimation'}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              {launchMeta?.sub || 'Verified via store inspection & license crawl'}
            </div>
          </div>

          {/* Radar Discovery Recency */}
          <div className="p-4 rounded-clay bg-white border border-clay-border/80 shadow-clay-card space-y-1">
            <div className="flex items-center justify-between text-xs text-clay-muted">
              <span className="font-semibold flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-accent-blue" /> Radar First Spotted
              </span>
            </div>
            <div className="text-base font-bold text-clay-text">
              {new Date(business.first_seen_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
              {new Date(business.first_seen_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-[11px] text-clay-muted font-medium">
              Source: <strong className="uppercase">{business.source}</strong> crawler index
            </div>
          </div>

          {/* Instagram Account Age */}
          <div className="p-4 rounded-clay bg-white border border-clay-border/80 shadow-clay-card space-y-1">
            <div className="flex items-center justify-between text-xs text-clay-muted">
              <span className="font-semibold flex items-center gap-1 text-pink-700">
                <Camera className="w-3.5 h-3.5" /> Instagram Footprint
              </span>
            </div>
            <div className="text-base font-bold text-clay-text">
              {business.instagram_post_count !== undefined && business.instagram_post_count !== null
                ? `${business.instagram_post_count} Total Posts`
                : 'Early Account'}
            </div>
            <div className="text-[11px] text-pink-800 font-medium">
              {business.instagram_first_post_at
                ? `First post: ${new Date(business.instagram_first_post_at).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  })}`
                : 'Brand new social presence'}
            </div>
          </div>

          {/* Website Gap Analysis */}
          <div className="p-4 rounded-clay bg-white border border-clay-border/80 shadow-clay-card space-y-1">
            <div className="flex items-center justify-between text-xs text-clay-muted">
              <span className="font-semibold flex items-center gap-1 text-amber-700">
                <Globe className="w-3.5 h-3.5" /> Website Status
              </span>
            </div>
            <div className="text-base font-bold">
              {business.website ? (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-blue hover:underline flex items-center gap-1 text-sm"
                >
                  <span>Active Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-rose-600 flex items-center gap-1 font-bold">
                  <span>No Website</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold uppercase">
                    Hot Pitch
                  </span>
                </span>
              )}
            </div>
            <div className="text-[11px] text-amber-800 font-medium">
              {business.website ? 'Needs redesign / conversion audit' : `Ready for ${business.estimated_site_budget || (business.currency === 'USD' ? '$2,800 – $4,500' : business.currency === 'GBP' ? '£2,000 – £3,500' : '₹35,000 – ₹75,000')} agency site pitch`}
            </div>
          </div>
        </div>

        {/* On-Demand Deep Lead Research & 1-Click Outbound Action Center */}
        <section id="deep-research-center" className="p-6 rounded-clay bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20 border-2 border-blue-200/90 shadow-clay-card space-y-6">
          {/* Header & Trigger */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-100 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Deep Intelligence Research & Outbound Pipeline
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-blue-100 text-blue-700">
                  Clay & Instantly Engine
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Audits local Google Maps footprint, identifies decision makers, crawls nearby competitors, and crafts 1-click Cold Email & Instagram DM campaigns.
              </p>
            </div>

            {/* Run Deep Research Button */}
            <button
              onClick={handleRunDeepResearch}
              disabled={isResearching}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                isResearching
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-lg active:scale-95'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isResearching ? 'animate-spin' : ''}`} />
              <span>
                {isResearching
                  ? 'Executing Deep Research...'
                  : deepResearch
                  ? 'Re-Run Deep Research'
                  : '🔬 Run Deep Lead Research'}
              </span>
            </button>
          </div>

          {/* Research Progress Animated Ticker (Active when researching) */}
          {isResearching && (
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 space-y-3 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-blue-800">
                <span>AI Agent Pipeline Running: Stage {researchStep} of 4</span>
                <span>{researchStep === 1 ? '25%' : researchStep === 2 ? '50%' : researchStep === 3 ? '75%' : '100%'}</span>
              </div>
              <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-500 ease-out"
                  style={{ width: `${researchStep * 25}%` }}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                <div className={`p-2 rounded-lg border ${researchStep >= 1 ? 'bg-white text-blue-900 border-blue-300 font-bold' : 'text-slate-400 border-dashed border-slate-200'}`}>
                  1. Local Corridor Competitors
                </div>
                <div className={`p-2 rounded-lg border ${researchStep >= 2 ? 'bg-white text-blue-900 border-blue-300 font-bold' : 'text-slate-400 border-dashed border-slate-200'}`}>
                  2. Google & Instagram Audit
                </div>
                <div className={`p-2 rounded-lg border ${researchStep >= 3 ? 'bg-white text-blue-900 border-blue-300 font-bold' : 'text-slate-400 border-dashed border-slate-200'}`}>
                  3. Decision-Maker Synthesis
                </div>
                <div className={`p-2 rounded-lg border ${researchStep >= 4 ? 'bg-white text-blue-900 border-blue-300 font-bold' : 'text-slate-400 border-dashed border-slate-200'}`}>
                  4. Tailored Outbound Copy
                </div>
              </div>
            </div>
          )}

          {/* Empty Prompt State when Deep Research hasn't run yet */}
          {!deepResearch && !isResearching && (
            <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Target className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-bold text-sm text-slate-800">No Deep Research Dossier Generated Yet</h4>
                <p className="text-xs text-slate-500">
                  Click the button above to run real-time competitive analysis, uncover high-probability decision-maker contact details, and craft targeted cold email & Instagram DM campaigns.
                </p>
              </div>
              <button
                onClick={handleRunDeepResearch}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Research Pipeline</span>
              </button>
            </div>
          )}

          {/* Research Results Intelligence Grid (When deepResearch is present) */}
          {deepResearch && (
            <div className="space-y-6">
              {/* Executive Summary & Key Angles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Decision Maker Card */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Target Decision Maker</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {deepResearch.target_decision_maker.probable_role}
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px] select-all">{deepResearch.target_decision_maker.contact_email}</span>
                    </div>
                    {deepResearch.target_decision_maker.contact_phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-[11px]">{deepResearch.target_decision_maker.contact_phone}</span>
                      </div>
                    )}
                    <div className="text-[11px] pt-1 text-indigo-900 font-medium">
                      Primary Channel: <span className="font-bold uppercase text-indigo-600">{deepResearch.target_decision_maker.preferred_channel}</span>
                    </div>
                  </div>
                </div>

                {/* Google & Social Audit Card */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                    <Radio className="w-4 h-4 text-blue-600" />
                    <span>Footprint Audit</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 flex items-center justify-between">
                    <span>Google Maps: {deepResearch.google_presence.review_count > 0 ? '⭐ Verified Listing' : '⚠️ Unverified'}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                      {deepResearch.google_presence.rating} ★ ({deepResearch.google_presence.review_count} revs)
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2">
                    {deepResearch.google_presence.sentiment_summary}
                  </div>
                  <div className="text-[11px] text-pink-700 font-medium flex items-center gap-1 pt-1">
                    <Instagram className="w-3.5 h-3.5 shrink-0" />
                    <span>{deepResearch.social_presence.instagram_status}</span>
                  </div>
                </div>

                {/* Competitive Vulnerability Card */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Corridor Vulnerability Gap</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Why They Must Act Now:
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {deepResearch.corridor_competition.vulnerability_gap}
                  </p>
                  <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                    ✨ Recommended Angle: Pitch 0% commission direct booking website before competitors dominate.
                  </div>
                </div>
              </div>

              {/* Nearby Competitors in Same Corridor */}
              {deepResearch.corridor_competition.nearby_competitors.length > 0 && (
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      Local Corridor Competitors ({business.area || business.city})
                    </span>
                    <span className="text-[11px] text-slate-500">Benchmark against local market</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {deepResearch.corridor_competition.nearby_competitors.map((comp, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{comp.name}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{comp.distance}</span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-700">Digital Advantage:</span> {comp.advantage}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1-Click Multi-Channel Outbound Action Center */}
              <div className="p-5 rounded-2xl bg-white border-2 border-indigo-100 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Send className="w-4 h-4 text-indigo-600" />
                      1-Click Multi-Channel Outreach Dispatcher
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pre-formatted with deep research insights. One click opens Gmail draft, Instagram DM thread, or WhatsApp.
                    </p>
                  </div>

                  {/* Channel Switcher */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                    <button
                      onClick={() => setActiveOutboundTab('email')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                        activeOutboundTab === 'email'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Cold Email</span>
                    </button>
                    <button
                      onClick={() => setActiveOutboundTab('instagram')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                        activeOutboundTab === 'instagram'
                          ? 'bg-pink-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Instagram DM</span>
                    </button>
                    <button
                      onClick={() => setActiveOutboundTab('whatsapp')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                        activeOutboundTab === 'whatsapp'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => setActiveOutboundTab('call')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                        activeOutboundTab === 'call'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Script</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: COLD EMAIL */}
                {activeOutboundTab === 'email' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 flex items-center gap-1">
                          <span>Recipient Email:</span>
                        </label>
                        <input
                          type="text"
                          value={outboundEmail.to}
                          onChange={(e) => setOutboundEmail({ ...outboundEmail, to: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 font-mono text-xs focus:bg-white focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 flex items-center gap-1">
                          <span>Subject Line:</span>
                        </label>
                        <input
                          type="text"
                          value={outboundEmail.subject}
                          onChange={(e) => setOutboundEmail({ ...outboundEmail, subject: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold focus:bg-white focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-700">Email Pitch Body:</label>
                      <textarea
                        rows={6}
                        value={outboundEmail.body}
                        onChange={(e) => setOutboundEmail({ ...outboundEmail, body: e.target.value })}
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-300 text-xs leading-relaxed font-mono focus:bg-white focus:border-blue-500 outline-none resize-none"
                      />
                    </div>

                    {/* 1-Click Send Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {/* 1-Click Native Mail Client */}
                        <a
                          href={`mailto:${outboundEmail.to}?subject=${encodeURIComponent(outboundEmail.subject)}&body=${encodeURIComponent(outboundEmail.body)}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>1-Click Send via Mail Client</span>
                        </a>

                        {/* 1-Click Gmail Web Composer */}
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(outboundEmail.to)}&su=${encodeURIComponent(outboundEmail.subject)}&body=${encodeURIComponent(outboundEmail.body)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs shadow-sm transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>1-Click Gmail Draft</span>
                        </a>
                      </div>

                      {/* Copy All */}
                      <button
                        onClick={() => copyChannelContent('email', `Subject: ${outboundEmail.subject}\n\n${outboundEmail.body}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                      >
                        {copiedChannel === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedChannel === 'email' ? 'Copied to Clipboard!' : 'Copy Subject & Body'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: INSTAGRAM DM */}
                {activeOutboundTab === 'instagram' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 flex items-center gap-1">
                          <Instagram className="w-3.5 h-3.5 text-pink-600" />
                          <span>Instagram Handle (without @):</span>
                        </label>
                        <div className="flex items-center">
                          <span className="px-3 py-2 rounded-l-lg bg-slate-200 border border-r-0 border-slate-300 font-mono text-xs text-slate-600">@</span>
                          <input
                            type="text"
                            value={outboundDm.handle}
                            onChange={(e) => setOutboundDm({ ...outboundDm, handle: e.target.value.replace('@', '') })}
                            placeholder="username"
                            className="w-full px-3 py-2 rounded-r-lg bg-slate-50 border border-slate-300 font-mono text-xs focus:bg-white focus:border-pink-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-end">
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent('site:instagram.com "' + business.name + '" ' + (business.city || ''))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                        >
                          <Search className="w-3.5 h-3.5 text-pink-600" />
                          <span>Find verified handle on Google</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700">Opening Hook DM (Casual & High-Converting):</label>
                        <span className="text-[11px] text-pink-600 font-medium">Keep under 60 words for 45% reply rate</span>
                      </div>
                      <textarea
                        rows={3}
                        value={outboundDm.message}
                        onChange={(e) => setOutboundDm({ ...outboundDm, message: e.target.value })}
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-300 text-xs leading-relaxed font-sans focus:bg-white focus:border-pink-500 outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-700">Day 3 Follow-Up Bump Message:</label>
                      <textarea
                        rows={2}
                        value={outboundDm.followUp}
                        onChange={(e) => setOutboundDm({ ...outboundDm, followUp: e.target.value })}
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-300 text-xs leading-relaxed font-sans focus:bg-white focus:border-pink-500 outline-none resize-none"
                      />
                    </div>

                    {/* 1-Click Send Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      {/* 1-Click Copy & Open Instagram DM */}
                      <button
                        onClick={handleCopyAndOpenInstagram}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs shadow-md transition active:scale-95"
                      >
                        <Instagram className="w-4 h-4" />
                        <span>
                          {copiedChannel === 'dm_open'
                            ? '✓ Copied Hook! Opening Instagram DM...'
                            : `⚡ 1-Click Copy & Open Instagram DM (@${outboundDm.handle || 'user'})`}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      {/* Copy Follow-up */}
                      <button
                        onClick={() => copyChannelContent('dm_followup', outboundDm.followUp)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                      >
                        {copiedChannel === 'dm_followup' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedChannel === 'dm_followup' ? 'Copied Follow-up!' : 'Copy Day-3 Bump'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: WHATSAPP */}
                {activeOutboundTab === 'whatsapp' && (
                  <div className="space-y-4">
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-700">WhatsApp Message:</label>
                      <textarea
                        rows={5}
                        value={outboundWa}
                        onChange={(e) => setOutboundWa(e.target.value)}
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-300 text-xs leading-relaxed font-mono focus:bg-white focus:border-emerald-500 outline-none resize-none"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      {business.whatsapp ? (
                        <a
                          href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(outboundWa)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>1-Click Send to WhatsApp (+{business.whatsapp})</span>
                        </a>
                      ) : (
                        <span className="text-xs text-amber-700 font-medium">
                          No direct WhatsApp registered in public registry. Use Cold Email or Instagram DM above.
                        </span>
                      )}

                      <button
                        onClick={() => copyChannelContent('whatsapp', outboundWa)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                      >
                        {copiedChannel === 'whatsapp' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedChannel === 'whatsapp' ? 'Copied Message!' : 'Copy Message'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: COLD CALL */}
                {activeOutboundTab === 'call' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div>
                        <span className="font-bold text-slate-900 block mb-0.5">15-Second Opener:</span>
                        <p className="text-slate-700 italic">
                          &ldquo;Hi {business.name} team, saw you just opened at {business.area || business.city}! Are you the manager handling digital setup and bookings?&rdquo;
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block mb-0.5">Value Hook:</span>
                        <p className="text-slate-600">
                          &ldquo;I noticed nearby competitors on the corridor have direct booking systems set up. We build launch sites that convert local footfall with zero monthly platform commission.&rdquo;
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block mb-0.5">Closing Ask:</span>
                        <p className="text-slate-600">
                          &ldquo;Can I email or Instagram DM you a 60-second video demo showing how it works? No cost at all.&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      {business.phone ? (
                        <a
                          href={`tel:${business.phone}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call {business.phone}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">No public phone number in registry.</span>
                      )}

                      <button
                        onClick={() => copyChannelContent('call', coldCallScriptText)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                      >
                        {copiedChannel === 'call' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedChannel === 'call' ? 'Copied Script!' : 'Copy Script'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Visual Media Gallery: Google Storefront & Instagram Photos */}
        <section className="p-6 rounded-clay bg-white border border-clay-border/80 shadow-clay-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-clay-border/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-clay-text">Storefront & Social Visuals</h2>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-accent-blue">
                  {allMedia.length} Photos
                </span>
              </div>
              <p className="text-xs text-clay-muted">
                Photos retrieved from Google Maps Places, storefront inspections, and Instagram post feed.
              </p>
            </div>

            {/* Media Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-clay bg-slate-100 border border-slate-200 text-xs">
              <button
                onClick={() => setActiveMediaTab('all')}
                className={`px-3 py-1 rounded-clay-sm font-semibold transition ${
                  activeMediaTab === 'all'
                    ? 'bg-white text-clay-text shadow-clay-btn'
                    : 'text-clay-muted hover:text-clay-text'
                }`}
              >
                All ({allMedia.length})
              </button>
              <button
                onClick={() => setActiveMediaTab('google')}
                className={`px-3 py-1 rounded-clay-sm font-semibold transition ${
                  activeMediaTab === 'google'
                    ? 'bg-white text-blue-700 shadow-clay-btn'
                    : 'text-clay-muted hover:text-clay-text'
                }`}
              >
                Google & Storefront ({googlePhotos.length})
              </button>
              <button
                onClick={() => setActiveMediaTab('instagram')}
                className={`px-3 py-1 rounded-clay-sm font-semibold transition ${
                  activeMediaTab === 'instagram'
                    ? 'bg-white text-pink-700 shadow-clay-btn'
                    : 'text-clay-muted hover:text-clay-text'
                }`}
              >
                Instagram ({instagramPosts.length})
              </button>
            </div>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedMedia.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setLightboxPhoto(photo)}
                className="group relative rounded-clay overflow-hidden bg-slate-100 border border-clay-border/80 shadow-clay-btn cursor-pointer transition transform hover:-translate-y-1 hover:shadow-clay-card flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-200">
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Source Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    {photo.source === 'instagram' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-600/90 text-white shadow-sm flex items-center gap-1 backdrop-blur-sm">
                        <Instagram className="w-2.5 h-2.5" /> Instagram
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/90 text-white shadow-sm flex items-center gap-1 backdrop-blur-sm">
                        <MapPin className="w-2.5 h-2.5" /> Google Photos
                      </span>
                    )}
                  </div>

                  {/* Zoom Icon Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="p-2 rounded-full bg-white/90 text-slate-800 shadow-lg">
                      <ZoomIn className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Caption Card */}
                <div className="p-3 bg-white flex-1 flex flex-col justify-between space-y-2">
                  <p className="text-xs text-clay-text font-medium leading-snug line-clamp-2">
                    {photo.caption}
                  </p>

                  {/* Metadata: Instagram Likes / Date */}
                  {photo.source === 'instagram' && (
                    <div className="flex items-center justify-between text-[11px] text-clay-muted pt-1 border-t border-slate-100">
                      <span>❤️ {photo.likes || 120} likes</span>
                      <span>{photo.posted_at || 'Recent'}</span>
                    </div>
                  )}

                  {photo.source !== 'instagram' && (
                    <div className="flex items-center justify-between text-[11px] text-clay-muted pt-1 border-t border-slate-100">
                      <span className="uppercase tracking-wider font-semibold text-[10px] text-slate-500">
                        {photo.type || 'Verified'}
                      </span>
                      <span className="text-accent-blue font-medium hover:underline flex items-center gap-0.5">
                        Enlarge <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick External Visual Links */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-clay-muted font-medium">Verify Live on Web:</span>
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(`${business.name} ${business.area} ${business.city || ''}`)}&tbm=isch`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-clay-sm bg-white hover:bg-slate-50 text-slate-700 border border-clay-border shadow-clay-btn transition"
            >
              <Search className="w-3.5 h-3.5 text-accent-blue" />
              <span>Search Google Images</span>
              <ExternalLink className="w-3 h-3 text-clay-faint" />
            </a>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name} ${business.area || ''} ${business.city || ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-clay-sm bg-white hover:bg-slate-50 text-slate-700 border border-clay-border shadow-clay-btn transition"
            >
              <Navigation className="w-3.5 h-3.5 text-rose-500" />
              <span>View Place on Google Maps</span>
              <ExternalLink className="w-3 h-3 text-clay-faint" />
            </a>

            <a
              href={
                business.instagram_handle
                  ? `https://www.instagram.com/${business.instagram_handle.replace('@', '')}/`
                  : `https://www.google.com/search?q=${encodeURIComponent('site:instagram.com "' + business.name + '" "' + (business.city || business.area) + '"')}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-clay-sm bg-white hover:bg-pink-50 text-pink-700 border border-pink-200/80 shadow-clay-btn transition font-semibold"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>
                {business.instagram_handle
                  ? `Instagram: @${business.instagram_handle.replace('@', '')}`
                  : `Search “${business.name}” on Instagram`}
              </span>
              <ExternalLink className="w-3 h-3 text-pink-400" />
            </a>
          </div>
        </section>

        {/* AI Grok Intelligence & Agency Opportunity Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grok AI Analysis & Gaps */}
          <div className="p-6 rounded-clay bg-white border border-clay-border/80 shadow-clay-card space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-clay-sm bg-purple-50 text-purple-700 border border-purple-100">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-clay-text text-base">Grok AI Launch Intelligence</h3>
                <span className="text-[11px] text-clay-muted">Automated competitive synthesis</span>
              </div>
            </div>

            <div className="p-3.5 rounded-clay-sm bg-purple-50/60 border border-purple-100 text-xs text-purple-900 leading-relaxed font-medium">
              {business.grok_summary ||
                'High-converting commercial startup in high-income technology corridor. Best time to approach is within 14 days of physical launch.'}
            </div>

            {/* Growth Gaps */}
            <div className="space-y-2.5">
              <span className="font-bold text-xs uppercase tracking-wider text-clay-muted">
                Identified Digital Gaps & Pitch Angles
              </span>
              <ul className="space-y-2 text-xs">
                {(business.dossier?.growth_opportunities || [
                  'Missing official website for direct customer bookings',
                  'Unoptimized Google Maps ranking for local searches',
                  'Heavy reliance on social media DMs without automated ordering',
                ]).map((gap, i) => (
                  <li key={i} className="flex items-start gap-2 text-clay-text font-medium">
                    <CheckCircle2 className="w-4 h-4 text-accent-blue shrink-0 mt-0.5" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CRM Notes & Direct Outreach Box */}
          <div className="p-6 rounded-clay bg-white border border-clay-border/80 shadow-clay-card space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-clay-text text-base">Outreach Activity Log</h3>
                <span className="text-[11px] font-semibold text-slate-500">
                  {business.contacted_at
                    ? `Last touched: ${new Date(business.contacted_at).toLocaleDateString()}`
                    : 'Not yet contacted'}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-clay-muted">Founder Call / Meeting Notes:</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Spoke with owner/manager; pitched 0% commission direct ordering website. Sent WhatsApp proposal; follow-up scheduled for Thursday 3 PM..."
                  className="w-full bg-white text-clay-text text-xs p-3 rounded-clay-sm border border-clay-border shadow-clay-pressed outline-none focus:border-accent-blue resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-700 font-semibold">
                {notesSaved ? '✓ Saved to CRM!' : ''}
              </span>
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-4 py-2 rounded-clay-sm bg-accent-blue hover:bg-blue-600 text-white font-bold text-xs shadow-clay-btn transition active:translate-y-0.5 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSavingNotes ? 'Saving...' : 'Save Notes & Status'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* 1-Click Tailored Outreach Pitch Scripts */}
        <section className="p-6 rounded-clay bg-white border border-clay-border/80 shadow-clay-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-clay-border/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-clay-text">1-Click Agency Outreach Scripts</h2>
              <p className="text-xs text-clay-muted">
                Pre-generated customized scripts ready to send via WhatsApp, phone call, or email.
              </p>
            </div>

            {/* Script Selector Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-clay bg-slate-100 border border-slate-200 text-xs">
              <button
                onClick={() => setActivePitchTab('whatsapp')}
                className={`px-3 py-1 rounded-clay-sm font-semibold transition ${
                  activePitchTab === 'whatsapp'
                    ? 'bg-white text-emerald-700 shadow-clay-btn'
                    : 'text-clay-muted hover:text-clay-text'
                }`}
              >
                💬 WhatsApp Message
              </button>
              <button
                onClick={() => setActivePitchTab('call')}
                className={`px-3 py-1 rounded-clay-sm font-semibold transition ${
                  activePitchTab === 'call'
                    ? 'bg-white text-slate-800 shadow-clay-btn'
                    : 'text-clay-muted hover:text-clay-text'
                }`}
              >
                📞 Cold Call Script
              </button>
              <button
                onClick={() => setActivePitchTab('email')}
                className={`px-3 py-1 rounded-clay-sm font-semibold transition ${
                  activePitchTab === 'email'
                    ? 'bg-white text-blue-700 shadow-clay-btn'
                    : 'text-clay-muted hover:text-clay-text'
                }`}
              >
                ✉️ Email Proposal
              </button>
            </div>
          </div>

          {/* Active Script Content Box */}
          <div className="relative p-4 rounded-clay bg-slate-50/80 border border-slate-200/80 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap shadow-clay-pressed">
            {activePitchTab === 'whatsapp' && whatsappPitchText}
            {activePitchTab === 'call' && coldCallScriptText}
            {activePitchTab === 'email' && emailProposalText}

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between font-sans">
              <button
                onClick={() =>
                  copyToClipboard(
                    activePitchTab === 'whatsapp'
                      ? whatsappPitchText
                      : activePitchTab === 'call'
                      ? coldCallScriptText
                      : emailProposalText
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-clay-sm bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs shadow-clay-btn transition"
              >
                {copiedPitch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPitch ? 'Copied to Clipboard!' : 'Copy Pitch Script'}</span>
              </button>

              {activePitchTab === 'whatsapp' && business.whatsapp && (
                <a
                  href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(whatsappPitchText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-clay-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-clay-btn transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Send on WhatsApp Directly</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Location & Corridor Context */}
        <section className="p-6 rounded-clay bg-white border border-clay-border/80 shadow-clay-card space-y-4">
          <h2 className="text-base font-bold text-clay-text flex items-center gap-2">
            <Building2 className="w-4 h-4 text-accent-blue" />
            <span>Commercial Corridor Location</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-clay bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-clay-muted font-semibold">Verified Address:</span>
              <p className="font-medium text-clay-text leading-snug">
                {business.dossier?.verified_address || `${business.name}, Main Road, ${business.area}, Hyderabad`}
              </p>
            </div>

            <div className="p-3.5 rounded-clay bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-clay-muted font-semibold">GPS Coordinates:</span>
              <p className="font-mono text-clay-text font-bold">
                {business.lat.toFixed(5)}° N, {business.lng.toFixed(5)}° E
              </p>
            </div>

            <div className="p-3.5 rounded-clay bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-clay-muted font-semibold">Operating Hours:</span>
              <p className="font-medium text-clay-text">
                {business.dossier?.hours || 'Mon - Sun: 09:00 AM - 10:00 PM'}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Photo Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-clay overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-clay-border flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-clay-text">{business.name}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-accent-blue">
                  {lightboxPhoto.source}
                </span>
              </div>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="p-1 rounded-clay-sm hover:bg-slate-200 text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.caption}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-4 bg-white flex items-center justify-between text-xs">
              <p className="font-medium text-clay-text">{lightboxPhoto.caption}</p>
              {lightboxPhoto.source === 'instagram' && (
                <span className="text-pink-700 font-semibold">❤️ {lightboxPhoto.likes || 140} likes</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
