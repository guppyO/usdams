import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Browse Dams by State',
  description: 'Explore dams across all 50 U.S. states and territories. View dam counts, hazard classifications, and safety information for each state.',
};

async function getStates() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: states } = await supabase
    .from('states')
    .select('*')
    .order('name');

  return states || [];
}

export default async function StatesPage() {
  const states = await getStates();

  const totalDams = states.reduce((acc, state) => acc + (state.dam_count || 0), 0);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'States' }]} />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Browse Dams by State
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore {totalDams.toLocaleString()} dams across all U.S. states and territories.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {states.map((state) => (
            <Link
              key={state.slug}
              href={`/state/${state.slug}`}
              className="group p-5 rounded-lg border border-border bg-card hover:border-accent hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-semibold text-lg text-foreground group-hover:text-accent transition-colors">
                  {state.name}
                </h2>
                {state.abbreviation && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {state.abbreviation}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{state.dam_count?.toLocaleString() || 0} dams</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
