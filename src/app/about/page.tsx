import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, Database, Shield, Clock, MapPin } from 'lucide-react';
import { getStats } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about US Dams Database - a comprehensive resource for dam information across the United States, sourced from the National Inventory of Dams.',
};

export default async function AboutPage() {
  const stats = await getStats();
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">About US Dams Database</h1>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        <section className="space-y-4">
          <p className="text-lg text-foreground-secondary">
            US Dams Database is a free, publicly accessible resource providing comprehensive
            information about dams across the United States. Our mission is to make dam safety
            information more accessible to researchers, engineers, policymakers, and the general public.
          </p>
        </section>

        <section className="space-y-4" id="data-source">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Database className="h-5 w-5 text-accent" />
            Data Source
          </h2>
          <p className="text-foreground-secondary">
            All dam information displayed on this website is sourced from the{' '}
            <a
              href="https://nid.sec.usace.army.mil/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2 hover:text-accent/80 inline-flex items-center gap-1"
            >
              National Inventory of Dams (NID)
              <ExternalLink className="h-4 w-4" />
            </a>
            , maintained by the U.S. Army Corps of Engineers.
          </p>
          <p className="text-foreground-secondary">
            The NID is the most comprehensive database of dams in the United States, containing
            information on over {stats.totalDams.toLocaleString()} dams. The database includes details such as dam location,
            dimensions, hazard classification, owner information, and inspection records.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Data Updates
          </h2>
          <p className="text-foreground-secondary">
            We update our database weekly from the official NID source to ensure you have
            access to the most current information available. Each update includes new dams,
            updated inspection records, and any changes to existing dam information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            Dam Hazard Classifications
          </h2>
          <p className="text-foreground-secondary">
            Dams are classified by their potential hazard level, which indicates the potential
            consequences of dam failure:
          </p>
          <ul className="list-disc pl-6 text-foreground-secondary space-y-2">
            <li>
              <strong className="text-hazard-high">High Hazard:</strong> Dam failure would likely
              cause loss of human life. These dams receive the most stringent inspection requirements.
            </li>
            <li>
              <strong className="text-hazard-significant">Significant Hazard:</strong> Dam failure
              could cause significant economic loss, environmental damage, or disruption of lifeline
              facilities, but loss of life is not expected.
            </li>
            <li>
              <strong className="text-hazard-low">Low Hazard:</strong> Dam failure would result in
              minimal economic loss and no expected loss of life.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            What You Can Find
          </h2>
          <ul className="list-disc pl-6 text-foreground-secondary space-y-2">
            <li>Search for dams by name, location, or other criteria</li>
            <li>Browse dams by state and county</li>
            <li>Filter by hazard classification level</li>
            <li>View dams by their primary purpose (flood control, recreation, water supply, etc.)</li>
            <li>Explore dams by owner type (federal, state, local, private)</li>
            <li>Access detailed information including dam dimensions, materials, and inspection dates</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Disclaimer</h2>
          <div className="bg-muted rounded-lg p-4 border border-border">
            <p className="text-foreground-secondary text-sm">
              <strong>This is not an official government website.</strong> US Dams Database is an
              independent project that aggregates publicly available data from the National Inventory
              of Dams. We are not affiliated with the U.S. Army Corps of Engineers, FEMA, or any
              government agency. For official information or emergency planning, please visit the{' '}
              <a
                href="https://nid.sec.usace.army.mil/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2 hover:text-accent/80"
              >
                official NID website
              </a>
              .
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Legal</h2>
          <p className="text-foreground-secondary">
            Please review our{' '}
            <Link href="/privacy" className="text-accent underline underline-offset-2 hover:text-accent/80">
              Privacy Policy
            </Link>
            {' '}and{' '}
            <Link href="/terms" className="text-accent underline underline-offset-2 hover:text-accent/80">
              Terms of Use
            </Link>
            {' '}for more information about how we handle data and your use of this website.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Official Resources</h2>
          <p className="text-foreground-secondary">
            For official dam safety information, emergency guidance, or to report issues with dam data,
            please contact the appropriate authorities:
          </p>
          <ul className="list-disc pl-6 text-foreground-secondary space-y-2">
            <li>
              <a
                href="https://nid.sec.usace.army.mil/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2 hover:text-accent/80"
              >
                U.S. Army Corps of Engineers - National Inventory of Dams
              </a>
            </li>
            <li>
              <a
                href="https://www.fema.gov/emergency-managers/risk-management/dam-safety"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2 hover:text-accent/80"
              >
                FEMA Dam Safety Program
              </a>
            </li>
            <li>
              <a
                href="https://damsafety.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2 hover:text-accent/80"
              >
                Association of State Dam Safety Officials (ASDSO)
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
