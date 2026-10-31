import React from 'react';
import { Business } from '@/lib/types';
import { Building2, Sparkles, PhoneCall, MapPin, Globe2, Rocket, Target } from 'lucide-react';

interface StatsBarProps {
  businesses: Business[];
  selectedArea: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({ businesses, selectedArea }) => {
  const total = businesses.length;

  const now = Date.now();
  const MS_DAY = 24 * 60 * 60 * 1000;

  // Real store launch recency (< 30 days or opening soon)
  const launchedThisMonth = businesses.filter((b) => {
    if (b.is_opening_soon) return true;
    const dateStr = b.actual_launch_date || b.estimated_open_date;
    if (!dateStr) return false;
    const diffDays = Math.round((now - new Date(dateStr).getTime()) / MS_DAY);
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  // Radar crawler detection in the last 24h
  const spottedToday = businesses.filter((b) => {
    return now - new Date(b.first_seen_at).getTime() <= 24 * 60 * 60 * 1000;
  }).length;

  const contacted = businesses.filter((b) => b.outreach_status === 'contacted').length;
  const noWebsite = businesses.filter((b) => !b.website).length;
  const dailyTarget = 10;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3.5 bg-clay-canvas border-b border-clay-border/80">
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-clay bg-white shadow-clay-card border border-clay-border/60">
        <div className="p-2 rounded-clay-sm bg-blue-50 text-accent-blue shadow-clay-btn">
          <Building2 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-medium text-clay-muted">Total Pipeline</div>
          <div className="text-base font-bold text-clay-text leading-tight">{total}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-clay bg-white shadow-clay-card border border-emerald-100">
        <div className="p-2 rounded-clay-sm bg-emerald-50 text-accent-emerald shadow-clay-btn">
          <Rocket className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-medium text-emerald-700">Launched &lt;30d</div>
          <div className="text-base font-bold text-emerald-900 leading-tight">{launchedThisMonth}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-clay bg-white shadow-clay-card border border-clay-border/60">
        <div className="p-2 rounded-clay-sm bg-purple-50 text-purple-600 shadow-clay-btn">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-medium text-clay-muted">Radar Spotted 24h</div>
          <div className="text-base font-bold text-clay-text leading-tight">{spottedToday}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-clay bg-white shadow-clay-card border border-amber-100">
        <div className="p-2 rounded-clay-sm bg-amber-50 text-accent-amber shadow-clay-btn">
          <Globe2 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-medium text-amber-700">No Website (Hot)</div>
          <div className="text-base font-bold text-amber-900 leading-tight">{noWebsite}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-clay bg-white shadow-clay-card border border-clay-border/60 col-span-2 md:col-span-1">
        <div className="p-2 rounded-clay-sm bg-cyan-50 text-cyan-600 shadow-clay-btn">
          <Target className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-medium text-clay-muted">Daily Goal ({contacted}/{dailyTarget})</div>
          <div className="text-base font-bold text-clay-text leading-tight">
            {Math.round((contacted / dailyTarget) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};
