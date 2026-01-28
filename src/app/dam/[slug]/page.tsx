import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin, AlertTriangle, Ruler, Calendar, Droplets, Building2,
  Activity, Shield, FileText, ExternalLink, Navigation, Clock
} from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DamCard } from '@/components/DamCard';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getDam(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: dam, error } = await supabase
    .from('dams')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !dam) {
    return null;
  }

  // Get related dams (same county, limit 4)
  const { data: relatedDams } = await supabase
    .from('dams')
    .select('id, name, slug, state, county, hazard_potential, primary_purpose, nid_height_ft, year_completed')
    .eq('county', dam.county)
    .eq('state', dam.state)
    .neq('id', dam.id)
    .limit(4);

  return { dam, relatedDams: relatedDams || [] };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getDam(slug);

  if (!result) {
    return {
      title: 'Dam Not Found',
    };
  }

  const { dam } = result;
  const title = `${dam.name || 'Unnamed Dam'} - ${dam.city || dam.county}, ${dam.state}`;
  const description = `View detailed information about ${dam.name || 'this dam'} in ${dam.county}, ${dam.state}. Hazard classification: ${dam.hazard_potential || 'Not rated'}. Height: ${dam.nid_height_ft || 'N/A'} ft. Purpose: ${dam.primary_purpose || 'N/A'}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
  };
}

export default async function DamPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getDam(slug);

  if (!result) {
    notFound();
  }

  const { dam, relatedDams } = result;

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

  const stateSlug = dam.state?.toLowerCase().replace(/\s+/g, '-');
  const countySlug = dam.county?.toLowerCase().replace(/\s+/g, '-');

  const breadcrumbs = [
    { label: 'States', href: '/state' },
    { label: dam.state, href: `/state/${stateSlug}` },
    { label: dam.county, href: `/state/${stateSlug}/${countySlug}` },
    { label: dam.name || 'Unnamed Dam' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {dam.name || 'Unnamed Dam'}
            </h1>
            {dam.hazard_potential && (
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                getHazardColor(dam.hazard_potential)
              )}>
                {dam.hazard_potential} Hazard
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <span>
              {dam.city && `${dam.city}, `}
              <Link href={`/state/${stateSlug}/${countySlug}`} className="hover:text-accent">
                {dam.county}
              </Link>
              {', '}
              <Link href={`/state/${stateSlug}`} className="hover:text-accent">
                {dam.state}
              </Link>
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox
                icon={<Ruler className="h-5 w-5" />}
                label="Height"
                value={dam.nid_height_ft ? `${dam.nid_height_ft} ft` : 'N/A'}
              />
              <StatBox
                icon={<Calendar className="h-5 w-5" />}
                label="Year Built"
                value={dam.year_completed || 'Unknown'}
              />
              <StatBox
                icon={<Droplets className="h-5 w-5" />}
                label="Storage"
                value={dam.nid_storage_acre_ft ? `${dam.nid_storage_acre_ft.toLocaleString()} acre-ft` : 'N/A'}
              />
              <StatBox
                icon={<Activity className="h-5 w-5" />}
                label="Purpose"
                value={dam.primary_purpose || 'N/A'}
              />
            </div>

            {/* Physical Characteristics */}
            <section className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Ruler className="h-5 w-5 text-accent" />
                Physical Characteristics
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <DataRow label="NID Height" value={dam.nid_height_ft ? `${dam.nid_height_ft} ft` : null} />
                <DataRow label="Structural Height" value={dam.structural_height_ft ? `${dam.structural_height_ft} ft` : null} />
                <DataRow label="Hydraulic Height" value={dam.hydraulic_height_ft ? `${dam.hydraulic_height_ft} ft` : null} />
                <DataRow label="Dam Length" value={dam.dam_length_ft ? `${dam.dam_length_ft.toLocaleString()} ft` : null} />
                <DataRow label="Volume" value={dam.volume_cubic_yards ? `${dam.volume_cubic_yards.toLocaleString()} cubic yards` : null} />
                <DataRow label="Dam Type" value={dam.primary_dam_type} />
                <DataRow label="Foundation" value={dam.foundation} />
                <DataRow label="Height Category" value={dam.nid_height_category} />
              </div>
            </section>

            {/* Storage & Hydrology */}
            <section className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Droplets className="h-5 w-5 text-accent" />
                Storage & Hydrology
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <DataRow label="NID Storage" value={dam.nid_storage_acre_ft ? `${dam.nid_storage_acre_ft.toLocaleString()} acre-ft` : null} />
                <DataRow label="Max Storage" value={dam.max_storage_acre_ft ? `${dam.max_storage_acre_ft.toLocaleString()} acre-ft` : null} />
                <DataRow label="Normal Storage" value={dam.normal_storage_acre_ft ? `${dam.normal_storage_acre_ft.toLocaleString()} acre-ft` : null} />
                <DataRow label="Surface Area" value={dam.surface_area_acres ? `${dam.surface_area_acres.toLocaleString()} acres` : null} />
                <DataRow label="Drainage Area" value={dam.drainage_area_sq_miles ? `${dam.drainage_area_sq_miles.toLocaleString()} sq miles` : null} />
                <DataRow label="Max Discharge" value={dam.max_discharge_cfs ? `${dam.max_discharge_cfs.toLocaleString()} cfs` : null} />
                <DataRow label="Spillway Type" value={dam.spillway_type} />
                <DataRow label="River/Stream" value={dam.river_name} />
              </div>
            </section>

            {/* Safety & Inspection */}
            <section className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                Safety & Inspection
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <DataRow label="Hazard Potential" value={dam.hazard_potential} highlight />
                <DataRow label="Condition Assessment" value={dam.condition_assessment} />
                <DataRow label="Last Inspection" value={dam.last_inspection_date} />
                <DataRow label="Inspection Frequency" value={dam.inspection_frequency ? `Every ${dam.inspection_frequency} years` : null} />
                <DataRow label="Operational Status" value={dam.operational_status} />
                <DataRow label="EAP Prepared" value={dam.eap_prepared} />
                <DataRow label="EAP Last Revision" value={dam.eap_last_revision} />
                <DataRow label="State Regulated" value={dam.state_regulated ? 'Yes' : dam.state_regulated === false ? 'No' : null} />
              </div>
            </section>

            {/* Ownership */}
            <section className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-accent" />
                Ownership & Regulation
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <DataRow label="Owner Type" value={dam.primary_owner_type} />
                <DataRow label="Owner Names" value={dam.owner_names} />
                <DataRow label="Federally Regulated" value={dam.federally_regulated ? 'Yes' : dam.federally_regulated === false ? 'No' : null} />
                <DataRow label="State Regulatory Agency" value={dam.state_regulatory_agency} />
                <DataRow label="Source Agency" value={dam.source_agency} />
                <DataRow label="Congressional District" value={dam.congressional_district} />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location Info */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Navigation className="h-5 w-5 text-accent" />
                Location
              </h2>
              <div className="space-y-3 text-sm">
                {dam.latitude && dam.longitude && (
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <a
                      href={`https://www.google.com/maps?q=${dam.latitude},${dam.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline inline-flex items-center gap-1"
                    >
                      {dam.latitude.toFixed(6)}, {dam.longitude.toFixed(6)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">State: </span>
                  <Link href={`/state/${stateSlug}`} className="text-accent hover:underline">
                    {dam.state}
                  </Link>
                </div>
                <div>
                  <span className="text-muted-foreground">County: </span>
                  <Link href={`/state/${stateSlug}/${countySlug}`} className="text-accent hover:underline">
                    {dam.county}
                  </Link>
                </div>
                {dam.city && (
                  <div>
                    <span className="text-muted-foreground">Nearest City: </span>
                    <span>{dam.city}</span>
                    {dam.distance_to_city && (
                      <span className="text-muted-foreground"> ({dam.distance_to_city} mi)</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Browse Similar</h2>
              <div className="space-y-2">
                {dam.hazard_potential && (
                  <Link
                    href={`/hazard/${dam.hazard_potential.toLowerCase()}`}
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors text-sm"
                  >
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    All {dam.hazard_potential} Hazard Dams
                  </Link>
                )}
                {dam.primary_purpose && (
                  <Link
                    href={`/purpose/${dam.primary_purpose.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors text-sm"
                  >
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    All {dam.primary_purpose} Dams
                  </Link>
                )}
                {dam.primary_owner_type && (
                  <Link
                    href={`/owner/${dam.primary_owner_type.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors text-sm"
                  >
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    All {dam.primary_owner_type} Dams
                  </Link>
                )}
              </div>
            </div>

            {/* NID ID */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Official Records
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">NID ID: </span>
                  <span className="font-mono">{dam.nid_id}</span>
                </div>
                {dam.federal_id && (
                  <div>
                    <span className="text-muted-foreground">Federal ID: </span>
                    <span className="font-mono">{dam.federal_id}</span>
                  </div>
                )}
                {dam.data_last_updated && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Updated: </span>
                    <span>{new Date(dam.data_last_updated).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Dams */}
        {relatedDams.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Other Dams in {dam.county}, {dam.state}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedDams.map((related) => (
                <DamCard key={related.id} dam={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 text-center">
      <div className="inline-flex p-2 rounded-lg bg-muted text-accent mb-2">
        {icon}
      </div>
      <div className="text-lg font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function DataRow({
  label,
  value,
  highlight
}: {
  label: string;
  value: string | number | null | undefined;
  highlight?: boolean;
}) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(
        'font-medium text-right',
        highlight ? 'text-accent' : 'text-foreground'
      )}>
        {value}
      </span>
    </div>
  );
}
