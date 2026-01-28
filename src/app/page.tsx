import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { MapPin, AlertTriangle, Droplets, Building2, ArrowRight, Shield, Activity, Waves } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { NumberTicker } from '@/components/NumberTicker';
import { LeaderboardAd, InContentAd } from '@/components/AdUnit';

export const dynamic = 'force-dynamic';

async function getStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [
    { count: totalDams },
    { count: highHazard },
    { count: significantHazard },
    { data: states },
    { data: purposes },
    { data: ownerTypes }
  ] = await Promise.all([
    supabase.from('dams').select('*', { count: 'exact', head: true }),
    supabase.from('dams').select('*', { count: 'exact', head: true }).eq('hazard_potential', 'High'),
    supabase.from('dams').select('*', { count: 'exact', head: true }).eq('hazard_potential', 'Significant'),
    supabase.from('states').select('name, slug, dam_count, high_hazard_count').order('dam_count', { ascending: false }).limit(12),
    supabase.from('purposes').select('name, slug, dam_count').order('dam_count', { ascending: false }).limit(6),
    supabase.from('owner_types').select('name, slug, dam_count').order('dam_count', { ascending: false }).limit(6)
  ]);

  return {
    totalDams: totalDams || 0,
    highHazard: highHazard || 0,
    significantHazard: significantHazard || 0,
    states: states || [],
    purposes: purposes || [],
    ownerTypes: ownerTypes || []
  };
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white py-20 lg:py-32 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1548877935-507f65f0b91c?auto=format&fit=crop&w=2000&q=80')`
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/85 to-primary/80" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent mb-6">
              <Waves className="h-4 w-4" />
              <span className="text-sm font-medium">National Inventory of Dams</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Explore <span className="text-accent">91,000+</span> Dams Across America
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              The most comprehensive database of U.S. dams. Search by location, hazard level, purpose, and more. Access safety data, inspection records, and dam specifications.
            </p>
            <div className="max-w-xl mx-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Ad - Below Hero */}
      <div className="container mx-auto px-4 py-6">
        <LeaderboardAd />
      </div>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <StatCard
              icon={<Droplets className="h-6 w-6" />}
              value={stats.totalDams}
              label="Total Dams"
              color="text-accent"
            />
            <StatCard
              icon={<AlertTriangle className="h-6 w-6" />}
              value={stats.highHazard}
              label="High Hazard"
              color="text-hazard-high"
            />
            <StatCard
              icon={<Shield className="h-6 w-6" />}
              value={stats.significantHazard}
              label="Significant Hazard"
              color="text-hazard-significant"
            />
            <StatCard
              icon={<MapPin className="h-6 w-6" />}
              value={stats.states.length > 0 ? 52 : 0}
              label="States & Territories"
              color="text-accent"
            />
          </div>
        </div>
      </section>

      {/* Browse by State */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Browse by State</h2>
              <p className="text-muted-foreground mt-1">Explore dams in all 50 states and territories</p>
            </div>
            <Link
              href="/state"
              className="hidden sm:flex items-center gap-2 text-accent hover:text-accent/80 font-medium transition-colors"
            >
              View all states
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stats.states.map((state) => (
              <Link
                key={state.slug}
                href={`/state/${state.slug}`}
                className="group p-4 rounded-lg border border-border bg-card hover:border-accent hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                  {state.name}
                </h3>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-muted-foreground">{state.dam_count?.toLocaleString()} dams</span>
                  {state.high_hazard_count > 0 && (
                    <span className="text-hazard-high text-xs">{state.high_hazard_count} high</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/state"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium"
            >
              View all states
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Hazard Level */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Dam Hazard Classifications</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Hazard potential classification indicates the potential consequences of dam failure, not the condition of the dam
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <HazardCard
              level="High"
              description="Failure would likely cause loss of human life"
              count={stats.highHazard}
              color="bg-hazard-high"
              href="/hazard/high"
            />
            <HazardCard
              level="Significant"
              description="Failure could cause significant economic loss"
              count={stats.significantHazard}
              color="bg-hazard-significant"
              href="/hazard/significant"
            />
            <HazardCard
              level="Low"
              description="Failure would cause minimal damage"
              count={stats.totalDams - stats.highHazard - stats.significantHazard}
              color="bg-hazard-low"
              href="/hazard/low"
            />
          </div>
        </div>
      </section>

      {/* Browse by Purpose & Owner Type */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Purpose */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Browse by Purpose</h2>
                <Link href="/purpose" className="text-sm text-accent hover:text-accent/80 flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {stats.purposes.map((purpose) => (
                  <Link
                    key={purpose.slug}
                    href={`/purpose/${purpose.slug}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-accent transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                      <span className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {purpose.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {purpose.dam_count?.toLocaleString()} dams
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Owner Type */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Browse by Owner Type</h2>
                <Link href="/owner" className="text-sm text-accent hover:text-accent/80 flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {stats.ownerTypes.map((owner) => (
                  <Link
                    key={owner.slug}
                    href={`/owner/${owner.slug}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-accent transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                      <span className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {owner.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {owner.dam_count?.toLocaleString()} dams
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad - Before CTA */}
      <div className="container mx-auto px-4 py-6">
        <InContentAd />
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Find Dams Near You
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Search our database of over 91,000 dams to find safety information, inspection records, and detailed specifications.
          </p>
          <Link
            href="/state"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            Start Exploring
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  color
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border text-center">
      <div className={`inline-flex p-3 rounded-lg bg-muted ${color} mb-4`}>
        {icon}
      </div>
      <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
        <NumberTicker value={value} />
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function HazardCard({
  level,
  description,
  count,
  color,
  href
}: {
  level: string;
  description: string;
  count: number;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all"
    >
      <div className={`inline-flex px-3 py-1 rounded-full text-white text-sm font-medium mb-4 ${color}`}>
        {level} Hazard
      </div>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-foreground">{count.toLocaleString()}</span>
        <span className="text-accent group-hover:translate-x-1 transition-transform">
          <ArrowRight className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}
