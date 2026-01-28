import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Browse Dams by Owner Type',
  description: 'Explore dams by ownership type including federal, state, local government, private, and public utility.',
};

async function getOwnerTypes() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: ownerTypes } = await supabase
    .from('owner_types')
    .select('*')
    .order('dam_count', { ascending: false });

  return ownerTypes || [];
}

export default async function OwnerTypesPage() {
  const ownerTypes = await getOwnerTypes();

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Owner Types' }]} />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Browse Dams by Owner Type
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Dams in the United States are owned by various entities including federal agencies,
            state governments, local authorities, private individuals and corporations, and public utilities.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownerTypes.map((owner) => (
            <Link
              key={owner.slug}
              href={`/owner/${owner.slug}`}
              className="group p-6 rounded-xl border border-border bg-card hover:border-accent hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-muted text-accent">
                  <Building2 className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors mb-4">
                {owner.name}
              </h2>
              <p className="text-2xl font-bold text-foreground">
                {owner.dam_count?.toLocaleString() || 0}
                <span className="text-sm font-normal text-muted-foreground ml-2">dams</span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
