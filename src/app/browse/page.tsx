import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, AlertTriangle, Activity, Building2, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InContentAd } from '@/components/AdUnit';

export const metadata: Metadata = {
  title: 'Browse Dams',
  description: 'Explore the US Dams Database. Browse by state, hazard classification, purpose, or owner type.',
};

const browseCategories = [
  {
    title: 'By State',
    description: 'Explore dams across all 50 states and territories',
    href: '/state',
    icon: MapPin,
    color: 'text-accent bg-accent/10'
  },
  {
    title: 'By Hazard Level',
    description: 'Filter dams by their hazard potential classification',
    href: '/hazard',
    icon: AlertTriangle,
    color: 'text-hazard-high bg-hazard-high/10'
  },
  {
    title: 'By Purpose',
    description: 'Find dams by their primary purpose: recreation, flood control, etc.',
    href: '/purpose',
    icon: Activity,
    color: 'text-green-600 bg-green-600/10'
  },
  {
    title: 'By Owner Type',
    description: 'Browse dams by ownership: federal, state, private, and more',
    href: '/owner',
    icon: Building2,
    color: 'text-purple-600 bg-purple-600/10'
  }
];

export default function BrowsePage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label: 'Browse' }]} />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Browse the Dam Database
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore over 91,000 dams across the United States. Browse by location, hazard classification,
            purpose, or ownership type.
          </p>
        </div>

        <InContentAd />

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl">
          {browseCategories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group p-6 rounded-xl border border-border bg-card hover:border-accent hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${category.color}`}>
                  <category.icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors mb-2">
                {category.title}
              </h2>
              <p className="text-muted-foreground text-sm">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
