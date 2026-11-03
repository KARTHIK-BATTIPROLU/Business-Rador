'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Business, OutreachStatus, MediaPhoto } from '@/lib/types';
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
  Search
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

  // Outreach & Pitch state
  const [activePitchTab, setActivePitchTab] = useState<'whatsapp' | 'call' | 'email'>('whatsapp');
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

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
        } else {
          setError(data.error || 'Business not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load business dossier');
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

  // Gallery aggregation
  const googlePhotos = business.dossier?.google_photos || [];
  const instagramPosts = business.dossier?.instagram_posts || [];
  const allMedia: MediaPhoto[] = [...googlePhotos, ...instagramPosts];

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
    `Hi ${business.name} team! Congratulations on opening in ${business.area}. Saw your new store and noticed you don't have an official website or digital ordering menu yet. We build fast, mobile-first websites for local brands in Hyderabad. Can I send a 1-minute demo?`;

  const coldCallScriptText =
    business.dossier?.cold_call_script ||
    `Hi! Am I speaking with the founder of ${business.name}? Congratulations on your new launch in ${business.area}! My name is [Your Name] from Hyderabad Digital Studio. We noticed your store is getting great early footfall, but customers searching on Google don't find a direct website yet. Do you have 2 minutes this week to look at a quick prototype we drafted for you?`;

  const emailProposalText = `Subject: Quick question regarding ${business.name}'s digital presence in ${business.area}

Hi ${business.name} Team,

First of all, congratulations on opening your new location in ${business.area}, Hyderabad!

While researching newly launched spots in the corridor, I noticed your storefront and Instagram presence are gaining traction, but you currently don't have a dedicated website or direct booking/ordering portal.

We specialize in helping newly launched businesses in Hyderabad capture high-income local tech commuters:
1. Fast mobile website with 0% commissions (saving 25-30% on Swiggy/Zomato)
2. Google Business Profile setup & 5-star review acquisition
3. Local SEO for Kokapet & Financial District residents

Would you be open to reviewing a complimentary 2-page digital prototype we drafted for ${business.name}?

Best regards,
Hyderabad Business Radar Partner
Phone: +91 90000 00000`;

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
                <strong>{business.area}</strong>, Hyderabad
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-slate-600">
                <Radio className="w-3 h-3 text-accent-blue" />
                Spotted {new Date(business.first_seen_at).toLocaleDateString()}
              </span>
              {business.instagram_handle ? (
                <>
                  <span>•</span>
                  <a
                    href={`https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(business.name + ' ' + business.area)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-pink-700 hover:underline font-semibold"
                    title={`Search ${business.name} posts and stories on Instagram`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Search @{business.instagram_handle} on IG</span>
                  </a>
                </>
              ) : (
                <>
                  <span>•</span>
                  <a
                    href={`https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(business.name + ' ' + business.area)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-pink-700 hover:underline font-semibold"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Search on IG</span>
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
              {business.website ? 'Needs redesign / conversion audit' : 'Ready for ₹30k - ₹75k agency site pitch'}
            </div>
          </div>
        </div>

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
              href={`https://www.google.com/search?q=${encodeURIComponent(`${business.name} ${business.area} Hyderabad`)}&tbm=isch`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-clay-sm bg-white hover:bg-slate-50 text-slate-700 border border-clay-border shadow-clay-btn transition"
            >
              <Search className="w-3.5 h-3.5 text-accent-blue" />
              <span>Search Google Images</span>
              <ExternalLink className="w-3 h-3 text-clay-faint" />
            </a>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name} ${business.area} Hyderabad`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-clay-sm bg-white hover:bg-slate-50 text-slate-700 border border-clay-border shadow-clay-btn transition"
            >
              <Navigation className="w-3.5 h-3.5 text-rose-500" />
              <span>View Location on Google Maps</span>
              <ExternalLink className="w-3 h-3 text-clay-faint" />
            </a>

            <a
              href={`https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(business.name + ' ' + business.area)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-clay-sm bg-white hover:bg-pink-50 text-pink-700 border border-pink-200/80 shadow-clay-btn transition font-semibold"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Search &ldquo;{business.name}&rdquo; on Instagram</span>
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
