import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DamCard } from '@/components/DamCard';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ level: string }>;
  searchParams: Promise<{ page?: string; state?: string }>;
}

const PAGE_SIZE = 24;

const HAZARD_INFO: Record<string, { name: string; description: string; color: string }> = {
  high: {
    name: 'High',
    description: 'Failure would probably cause loss of human life',
    color: 'bg-hazard-high'
  },
  significant: {
    name: 'Significant',
    description: 'Failure could cause significant economic loss or environmental damage',
    color: 'bg-hazard-significant'
  },
  low: {
    name: 'Low',
    description: 'Failure would cause minimal damage with no probable loss of life',
    color: 'bg-hazard-low'
  }
};

async function getHazardData(level: string, page: number, stateFilter?: string) {
  const hazardInfo = HAZARD_INFO[level.toLowerCase()];
  if (!hazardInfo) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Build query
  let query = supabase
    .from('dams')
    .select('id, name, slug, state, county, hazard_potential, primary_purpose, nid_height_ft, year_completed', { count: 'exact' })
    .eq('hazard_potential', hazardInfo.name);

  if (stateFilter) {
    query = query.eq('state', stateFilter);
  }

  const { data: dams, count } = await query
    .order('name')
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  // Get states with this hazard level
  const { data: states } = await supabase
    .from('states')
    .select('name, slug, high_hazard_count')
    .gt(level === 'high' ? 'high_hazard_count' : 'dam_count', 0)
    .order('name');

  return {
    hazardInfo,
    dams: dams || [],
    totalDams: count || 0,
    states: states || []
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level } = await params;
  const hazardInfo = HAZARD_INFO[level.toLowerCase()];

  if (!hazardInfo) {
    return { title: 'Hazard Level Not Found' };
  }

  return {
    title: `${hazardInfo.name} Hazard Dams`,
    description: `Browse all ${hazardInfo.name.toLowerCase()} hazard potential dams in the United States. ${hazardInfo.description}.`,
  };
}

export default async function HazardLevelPage({ params, searchParams }: PageProps) {
  const { level } = await params;
  const { page: pageParam, state } = await searchParams;
  const page = parseInt(pageParam || '1', 10);

  const result = await getHazardData(level, page, state);

  if (!result) {
    notFound();
  }

  const { hazardInfo, dams, totalDams, states } = result;
  const totalPages = Math.ceil(totalDams / PAGE_SIZE);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[
          { label: 'Hazard', href: '/hazard' },
          { label: `${hazardInfo.name} Hazard` }
        ]} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium ${hazardInfo.color}`}>
              <AlertTriangle className="h-5 w-5" />
              {hazardInfo.name} Hazard
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {hazardInfo.name} Hazard Dams
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {hazardInfo.description}. There are {totalDams.toLocaleString()} {hazardInfo.name.toLowerCase()} hazard dams in the database.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* State Filter */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">Filter by State</h2>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                <Link
                  href={`/hazard/${level}`}
                  className={`block px-4 py-3 rounded-lg transition-colors text-base ${!state ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-muted'}`}
                >
                  All States
                </Link>
                {states.slice(0, 20).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/hazard/${level}?state=${encodeURIComponent(s.name)}`}
                    className={`block px-4 py-3 rounded-lg transition-colors ${state === s.name ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-muted'}`}
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Other Hazard Levels */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">Other Classifications</h2>
              <div className="space-y-2">
                {Object.entries(HAZARD_INFO).map(([slug, info]) => (
                  slug !== level.toLowerCase() && (
                    <Link
                      key={slug}
                      href={`/hazard/${slug}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className={`w-4 h-4 rounded-full ${info.color}`} />
                      <span className="text-base">{info.name} Hazard</span>
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, totalDams)} of {totalDams.toLocaleString()} dams
                {state && ` in ${state}`}
              </p>
            </div>

            {/* Dams Grid */}
            {dams.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {dams.map((dam) => (
                  <DamCard key={dam.id} dam={dam} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <p className="text-muted-foreground">No dams found matching your criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/hazard/${level}?page=${page - 1}${state ? `&state=${encodeURIComponent(state)}` : ''}`}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/hazard/${level}?page=${page + 1}${state ? `&state=${encodeURIComponent(state)}` : ''}`}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
