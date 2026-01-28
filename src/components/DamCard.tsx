'use client';

import Link from 'next/link';
import { MapPin, Activity, Ruler, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Dam {
  id: number;
  name: string;
  slug: string;
  state: string;
  county: string;
  hazard_potential: string;
  primary_purpose?: string;
  nid_height_ft?: number;
  year_completed?: number;
}

interface DamCardProps {
  dam: Dam;
  showHazard?: boolean;
}

export function DamCard({ dam, showHazard = false }: DamCardProps) {
  const getHazardColor = (hazard: string) => {
    switch (hazard?.toLowerCase()) {
      case 'high':
        return 'bg-hazard-high text-white';
      case 'significant':
        return 'bg-hazard-significant text-white';
      case 'low':
        return 'bg-hazard-low text-white';
      default:
        return 'bg-hazard-undetermined text-white';
    }
  };

  return (
    <Link
      href={`/dam/${dam.slug}`}
      className="group block p-5 rounded-lg border border-border bg-card hover:border-accent hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
          {dam.name || 'Unnamed Dam'}
        </h3>
        {showHazard && dam.hazard_potential && (
          <span className={cn(
            'shrink-0 px-2 py-0.5 rounded text-xs font-medium',
            getHazardColor(dam.hazard_potential)
          )}>
            {dam.hazard_potential}
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {dam.county}, {dam.state}
          </span>
        </div>

        {dam.primary_purpose && (
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 shrink-0" />
            <span className="truncate">{dam.primary_purpose}</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          {dam.nid_height_ft && (
            <div className="flex items-center gap-1">
              <Ruler className="h-4 w-4" />
              <span>{dam.nid_height_ft} ft</span>
            </div>
          )}
          {dam.year_completed && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{dam.year_completed}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
