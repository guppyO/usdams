import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DamCard } from '@/components/DamCard';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string; county: string }>;
  searchParams: Promise<{ page?: string; hazard?: string }>;
}

const PAGE_SIZE = 100;

async function getCountyData(stateSlug: string, countySlug: string, page: number, hazardFilter?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get state info
  const { data: state } = await supabase
    .from('states')
    .select('*')
    .eq('slug', stateSlug)
    .single();

  if (!state) {
    return null;
  }

  // Get county info - slug is stored as "{state}-{county}" format
  const fullCountySlug = `${stateSlug}-${countySlug}`;
  const { data: county } = await supabase
    .from('counties')
    .select('*')
    .eq('slug', fullCountySlug)
    .eq('state_id', state.id)
    .single();

  if (!county) {
    return null;
  }

  // Build dams query
  let damsQuery = supabase
    .from('dams')
    .select('id, name, slug, state, county, hazard_potential, primary_purpose, nid_height_ft, year_completed', { count: 'exact' })
    .eq('state', state.name)
    .eq('county', county.name);

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
    supabase.from('dams').select('*', { count: 'exact', head: true }).eq('state', state.name).eq('county', county.name).eq('hazard_potential', 'High'),
    supabase.from('dams').select('*', { count: 'exact', head: true }).eq('state', state.name).eq('county', county.name).eq('hazard_potential', 'Significant'),
    supabase.from('dams').select('*', { count: 'exact', head: true }).eq('state', state.name).eq('county', county.name).eq('hazard_potential', 'Low')
  ]);

  return {
    state,
    county,
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
  const { slug, county: countySlug } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: state } = await supabase
    .from('states')
    .select('id, name')
    .eq('slug', slug)
    .single();

  if (!state) {
    return { title: 'County Not Found' };
  }

  const fullCountySlug = `${slug}-${countySlug}`;
  const { data: county } = await supabase
    .from('counties')
    .select('name, dam_count')
    .eq('slug', fullCountySlug)
    .eq('state_id', state.id)
    .single();

  if (!county) {
    return { title: 'County Not Found' };
  }

  return {
    title: `Dams in ${county.name}, ${state.name}`,
    description: `Explore ${county.dam_count?.toLocaleString() || 0} dams in ${county.name}, ${state.name}. View dam locations, hazard classifications, and safety information.`,
  };
}

export default async function CountyPage({ params, searchParams }: PageProps) {
  const { slug, county: countySlug } = await params;
  const { page: pageParam, hazard } = await searchParams;
  const page = parseInt(pageParam || '1', 10);

  const result = await getCountyData(slug, countySlug, page, hazard);

  if (!result) {
    notFound();
  }

  const { state, county, dams, totalDams, hazardCounts } = result;
  const totalPages = Math.ceil(totalDams / PAGE_SIZE);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[
          { label: 'States', href: '/state' },
          { label: state.name, href: `/state/${slug}` },
          { label: county.name }
        ]} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Dams in {county.name}, {state.name}
          </h1>
          <p className="text-muted-foreground">
            Explore {county.dam_count?.toLocaleString() || totalDams} dams in {county.name}.
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
                  href={`/state/${slug}/${countySlug}`}
                  active={!hazard}
                  count={county.dam_count || totalDams}
                  label="All Dams"
                />
                <FilterLink
                  href={`/state/${slug}/${countySlug}?hazard=High`}
                  active={hazard === 'High'}
                  count={hazardCounts.high}
                  label="High Hazard"
                  color="text-hazard-high"
                />
                <FilterLink
                  href={`/state/${slug}/${countySlug}?hazard=Significant`}
                  active={hazard === 'Significant'}
                  count={hazardCounts.significant}
                  label="Significant Hazard"
                  color="text-hazard-significant"
                />
                <FilterLink
                  href={`/state/${slug}/${countySlug}?hazard=Low`}
                  active={hazard === 'Low'}
                  count={hazardCounts.low}
                  label="Low Hazard"
                  color="text-hazard-low"
                />
              </div>
            </div>

            {/* Back to State */}
            <Link
              href={`/state/${slug}`}
              className="block px-4 py-4 bg-card rounded-xl border border-border hover:border-accent transition-colors text-center"
            >
              <span className="text-accent font-medium text-base">← Back to {state.name}</span>
            </Link>
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
                    href={`/state/${slug}/${countySlug}?page=${page - 1}${hazard ? `&hazard=${hazard}` : ''}`}
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
                    href={`/state/${slug}/${countySlug}?page=${page + 1}${hazard ? `&hazard=${hazard}` : ''}`}
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
