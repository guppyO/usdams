import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import Link from 'next/link';
import { Activity, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Browse Dams by Purpose',
  description: 'Explore dams by their primary purpose including recreation, water supply, flood control, hydroelectric, and more.',
};

async function getPurposes() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: purposes } = await supabase
    .from('purposes')
    .select('*')
    .order('dam_count', { ascending: false });

  return purposes || [];
}

export default async function PurposesPage() {
  const purposes = await getPurposes();

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Dam Purposes' }]} />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Browse Dams by Purpose
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Dams serve many purposes including recreation, water supply, flood control,
            and hydroelectric power generation. Explore dams by their primary purpose.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {purposes.map((purpose) => (
            <Link
              key={purpose.slug}
              href={`/purpose/${purpose.slug}`}
              className="group p-6 rounded-xl border border-border bg-card hover:border-accent hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-muted text-accent">
                  <Activity className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors mb-2">
                {purpose.name}
              </h2>
              {purpose.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {purpose.description}
                </p>
              )}
              <p className="text-2xl font-bold text-foreground">
                {purpose.dam_count?.toLocaleString() || 0}
                <span className="text-sm font-normal text-muted-foreground ml-2">dams</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
