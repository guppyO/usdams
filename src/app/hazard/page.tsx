import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dam Hazard Classifications',
  description: 'Explore dams by hazard potential classification. High, Significant, and Low hazard dams across the United States.',
};

async function getHazardStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [
    { count: highCount },
    { count: significantCount },
    { count: lowCount },
    { count: undeterminedCount }
  ] = await Promise.all([
    supabase.from('dams').select('*', { count: 'exact', head: true }).eq('hazard_potential', 'High'),
    supabase.from('dams').select('*', { count: 'exact', head: true }).eq('hazard_potential', 'Significant'),
    supabase.from('dams').select('*', { count: 'exact', head: true }).eq('hazard_potential', 'Low'),
    supabase.from('dams').select('*', { count: 'exact', head: true }).is('hazard_potential', null)
  ]);

  return {
    high: highCount || 0,
    significant: significantCount || 0,
    low: lowCount || 0,
    undetermined: undeterminedCount || 0
  };
}

export default async function HazardPage() {
  const stats = await getHazardStats();

  const hazardLevels = [
    {
      level: 'High',
      slug: 'high',
      description: 'Dams where failure or mis-operation will probably cause loss of human life.',
      count: stats.high,
      color: 'bg-hazard-high',
      textColor: 'text-hazard-high'
    },
    {
      level: 'Significant',
      slug: 'significant',
      description: 'Dams where failure or mis-operation results in no probable loss of human life but can cause economic loss, environment damage, disruption of lifeline facilities, or can impact other concerns.',
      count: stats.significant,
      color: 'bg-hazard-significant',
      textColor: 'text-hazard-significant'
    },
    {
      level: 'Low',
      slug: 'low',
      description: 'Dams where failure or mis-operation results in no probable loss of human life and low economic and/or environmental losses.',
      count: stats.low,
      color: 'bg-hazard-low',
      textColor: 'text-hazard-low'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Hazard Classifications' }]} />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Dam Hazard Classifications
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Hazard potential classification indicates the potential consequences of dam failure,
            <strong> not the condition of the dam</strong>. A dam classified as "High Hazard" is
            not necessarily in poor condition—rather, failure would likely cause loss of human life
            due to the dam's location.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {hazardLevels.map((hazard) => (
            <Link
              key={hazard.slug}
              href={`/hazard/${hazard.slug}`}
              className="group p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all"
            >
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium mb-4 ${hazard.color}`}>
                <AlertTriangle className="h-4 w-4" />
                {hazard.level} Hazard
              </div>
              <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                {hazard.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-foreground">
                  {hazard.count.toLocaleString()}
                </span>
                <span className="text-accent group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">dams</p>
            </Link>
          ))}
        </div>

        {/* Additional Info */}
        <div className="bg-muted/50 rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Understanding Hazard Potential
          </h2>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              The hazard potential classification system is used by federal and state dam safety
              programs to prioritize inspections and regulatory oversight. It is based on the
              potential consequences of dam failure, considering factors such as:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Population at risk downstream</li>
              <li>Economic infrastructure in the flood zone</li>
              <li>Environmental resources that could be impacted</li>
              <li>Critical facilities such as hospitals, schools, and emergency services</li>
            </ul>
            <p className="mt-4">
              A high hazard classification does not mean the dam is unsafe—many high hazard dams
              are in excellent condition with regular inspections and emergency action plans in place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
