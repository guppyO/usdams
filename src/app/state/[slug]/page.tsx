import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DamCard } from '@/components/DamCard';
import { SidebarAd } from '@/components/AdUnit';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; hazard?: string }>;
}

const PAGE_SIZE = 100;

async function getStateData(slug: string, page: number, hazardFilter?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get state info
  const { data: state, error: stateError } = await supabase
    .from('states')
    .select('*')
    .eq('slug', slug)
    .single();

  if (stateError || !state) {
    return null;
  }

  // Get counties for this state
  const { data: counties } = await supabase
    .from('counties')
    .select('id, name, slug, dam_count')
    .eq('state_id', state.id)
    .order('dam_count', { ascending: false });

  // Build dams query
  let damsQuery = supabase
    .from('dams')
    .select('id, name, slug, state, county, hazard_potential, primary_purpose, nid_height_ft, year_completed', { count: 'exact' })
    .eq('state', state.name);

  if (hazardFilter) {
    damsQuery = damsQuery.eq('hazard_potential', hazardFilter);
  }

  const { data: dams, count } = await damsQuery
    .order('name')
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  // Get hazard counts
  const [
    { count: highCount },
    { count: significantCount },
    { count: lowCount }
  ] = await Promise.all([
    supabase.from('dams').select('*', { count: 'exact', head: true }).eq('state', state.name).eq('hazard_potential', 'High'),
    supabase.from('dams').select('*', { count: 'exact', head: true }).eq('state', state.name).eq('hazard_potential', 'Significant'),
    supabase.from('dams').select('*', { count: 'exact', head: true }).eq('state', state.name).eq('hazard_potential', 'Low')
  ]);

  return {
    state,
    counties: counties || [],
    dams: dams || [],
    totalDams: count || 0,
    hazardCounts: {
      high: highCount || 0,
      significant: significantCount || 0,
      low: lowCount || 0
    }
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: state } = await supabase
    .from('states')
    .select('name, dam_count, high_hazard_count')
    .eq('slug', slug)
    .single();

  if (!state) {
    return { title: 'State Not Found' };
  }

  return {
    title: `Dams in ${state.name} - ${state.dam_count?.toLocaleString()} Dams`,
    description: `Explore ${state.dam_count?.toLocaleString()} dams in ${state.name}. View hazard classifications, dam locations, and safety information. ${state.high_hazard_count || 0} high hazard dams.`,
  };
}

export default async function StatePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam, hazard } = await searchParams;
  const page = parseInt(pageParam || '1', 10);

  const result = await getStateData(slug, page, hazard);

  if (!result) {
    notFound();
  }

  const { state, counties, dams, totalDams, hazardCounts } = result;
  const totalPages = Math.ceil(totalDams / PAGE_SIZE);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[
          { label: 'States', href: '/state' },
          { label: state.name }
        ]} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Dams in {state.name}
          </h1>
          <p className="text-muted-foreground">
            Explore {state.dam_count?.toLocaleString()} dams across {counties.length} counties in {state.name}.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Hazard Filter */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">Filter by Hazard</h2>
              <div className="space-y-2">
                <FilterLink
                  href={`/state/${slug}`}
                  active={!hazard}
                  count={state.dam_count || 0}
                  label="All Dams"
                />
                <FilterLink
                  href={`/state/${slug}?hazard=High`}
                  active={hazard === 'High'}
                  count={hazardCounts.high}
                  label="High Hazard"
                  color="text-hazard-high"
                />
                <FilterLink
                  href={`/state/${slug}?hazard=Significant`}
                  active={hazard === 'Significant'}
                  count={hazardCounts.significant}
                  label="Significant Hazard"
                  color="text-hazard-significant"
                />
                <FilterLink
                  href={`/state/${slug}?hazard=Low`}
                  active={hazard === 'Low'}
                  count={hazardCounts.low}
                  label="Low Hazard"
                  color="text-hazard-low"
                />
              </div>
            </div>

            {/* Counties */}
            {counties.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-5">
                <h2 className="text-lg font-semibold text-foreground mb-4">Counties</h2>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {counties.slice(0, 20).map((county) => (
                    <Link
                      key={county.id}
                      href={`/state/${slug}/${slugify(county.name)}`}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="text-foreground">{county.name}</span>
                      <span className="text-muted-foreground font-medium">{county.dam_count}</span>
                    </Link>
                  ))}
                  {counties.length > 20 && (
                    <p className="text-sm text-muted-foreground pt-3">
                      + {counties.length - 20} more counties
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Ad Unit */}
            <SidebarAd />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, totalDams)} of {totalDams.toLocaleString()} dams
                {hazard && ` (${hazard} hazard)`}
              </p>
            </div>

            {/* Dams Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {dams.map((dam) => (
                <DamCard key={dam.id} dam={dam} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/state/${slug}?page=${page - 1}${hazard ? `&hazard=${hazard}` : ''}`}
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
                    href={`/state/${slug}?page=${page + 1}${hazard ? `&hazard=${hazard}` : ''}`}
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

function FilterLink({
  href,
  active,
  count,
  label,
  color
}: {
  href: string;
  active: boolean;
  count: number;
  label: string;
  color?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
        active ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-muted'
      }`}
    >
      <span className={`text-base ${color || 'text-foreground'}`}>{label}</span>
      <span className="text-muted-foreground font-medium">{count.toLocaleString()}</span>
    </Link>
  );
}
