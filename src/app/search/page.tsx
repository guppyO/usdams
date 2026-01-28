import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DamCard } from '@/components/DamCard';
import { SearchBar } from '@/components/SearchBar';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const PAGE_SIZE = 1000;

async function searchDams(query: string, page: number) {
  if (!query || query.length < 2) {
    return { dams: [], totalDams: 0 };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: dams, count } = await supabase
    .from('dams')
    .select('id, name, slug, state, county, hazard_potential, primary_purpose, nid_height_ft, year_completed', { count: 'exact' })
    .ilike('name', `%${query}%`)
    .order('name')
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  return {
    dams: dams || [],
    totalDams: count || 0
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;

  return {
    title: q ? `Search results for "${q}"` : 'Search Dams',
    description: q
      ? `Search results for "${q}" in the US Dams Database`
      : 'Search over 91,000 dams across the United States',
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1', 10);
  const query = q || '';

  const { dams, totalDams } = await searchDams(query, page);
  const totalPages = Math.ceil(totalDams / PAGE_SIZE);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Search' }]} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Search Dams
          </h1>
          <p className="text-muted-foreground mb-6">
            Search over 91,000 dams across the United States by name
          </p>
          <div className="max-w-xl">
            <SearchBar />
          </div>
        </div>

        {/* Results */}
        {query && (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {totalDams > 0 ? (
                    <>Results for &quot;{query}&quot;</>
                  ) : (
                    <>No results for &quot;{query}&quot;</>
                  )}
                </h2>
                {totalDams > 0 && (
                  <p className="text-muted-foreground text-sm mt-1">
                    Showing {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, totalDams)} of {totalDams.toLocaleString()} dams
                  </p>
                )}
              </div>
            </div>

            {/* Dams Grid */}
            {dams.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {dams.map((dam) => (
                  <DamCard key={dam.id} dam={dam} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No dams found matching &quot;{query}&quot;
                </p>
                <p className="text-sm text-muted-foreground">
                  Try a different search term or{' '}
                  <Link href="/state" className="text-accent hover:underline">
                    browse by state
                  </Link>
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
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
                    href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!query && (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Enter a dam name to search
            </p>
            <p className="text-sm text-muted-foreground">
              Or{' '}
              <Link href="/state" className="text-accent hover:underline">
                browse by state
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
