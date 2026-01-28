import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DamCard } from '@/components/DamCard';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; state?: string }>;
}

const PAGE_SIZE = 100;

async function getPurposeData(slug: string, page: number, stateFilter?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get purpose info
  const { data: purpose } = await supabase
    .from('purposes')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!purpose) return null;

  // Build query
  let query = supabase
    .from('dams')
    .select('id, name, slug, state, county, hazard_potential, primary_purpose, nid_height_ft, year_completed', { count: 'exact' })
    .eq('primary_purpose', purpose.name);

  if (stateFilter) {
    query = query.eq('state', stateFilter);
  }

  const { data: dams, count } = await query
    .order('name')
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  // Get states with this purpose
  const { data: statesData } = await supabase
    .from('dams')
    .select('state')
    .eq('primary_purpose', purpose.name);

  const uniqueStates = [...new Set(statesData?.map(d => d.state) || [])].sort();

  return {
    purpose,
    dams: dams || [],
    totalDams: count || 0,
    states: uniqueStates
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: purpose } = await supabase
    .from('purposes')
    .select('name, dam_count')
    .eq('slug', slug)
    .single();

  if (!purpose) {
    return { title: 'Purpose Not Found' };
  }

  return {
    title: `${purpose.name} Dams`,
    description: `Browse ${purpose.dam_count?.toLocaleString() || 0} ${purpose.name.toLowerCase()} dams across the United States.`,
  };
}

export default async function PurposePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam, state } = await searchParams;
  const page = parseInt(pageParam || '1', 10);

  const result = await getPurposeData(slug, page, state);

  if (!result) {
    notFound();
  }

  const { purpose, dams, totalDams, states } = result;
  const totalPages = Math.ceil(totalDams / PAGE_SIZE);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[
          { label: 'Purpose', href: '/purpose' },
          { label: purpose.name }
        ]} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-accent/10 text-accent">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {purpose.name} Dams
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {purpose.description || `Browse ${totalDams.toLocaleString()} dams with ${purpose.name.toLowerCase()} as their primary purpose.`}
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
                  href={`/purpose/${slug}`}
                  className={`block px-4 py-3 rounded-lg transition-colors text-base ${!state ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-muted'}`}
                >
                  All States
                </Link>
                {states.slice(0, 20).map((s) => (
                  <Link
                    key={s}
                    href={`/purpose/${slug}?state=${encodeURIComponent(s)}`}
                    className={`block px-4 py-3 rounded-lg transition-colors ${state === s ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-muted'}`}
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>

            {/* Back Link */}
            <Link
              href="/purpose"
              className="block px-4 py-4 bg-card rounded-xl border border-border hover:border-accent transition-colors text-center"
            >
              <span className="text-accent font-medium text-base">← All Purposes</span>
            </Link>
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
                    href={`/purpose/${slug}?page=${page - 1}${state ? `&state=${encodeURIComponent(state)}` : ''}`}
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
                    href={`/purpose/${slug}?page=${page + 1}${state ? `&state=${encodeURIComponent(state)}` : ''}`}
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
