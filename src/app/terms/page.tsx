import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for US Dams Database - guidelines for using our dam information service.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Use</h1>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">
          Last updated: January 2026
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Acceptance of Terms</h2>
          <p className="text-foreground-secondary">
            By accessing and using US Dams Database (&quot;the Website&quot;), you accept and agree to be
            bound by these Terms of Use. If you do not agree to these terms, please do not use
            the Website.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Purpose and Use</h2>
          <p className="text-foreground-secondary">
            US Dams Database provides publicly available information about dams in the United
            States for informational and educational purposes only. The Website is intended to
            help users learn about dam infrastructure, locations, and safety classifications.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Data Source and Accuracy</h2>
          <p className="text-foreground-secondary">
            The dam information displayed on this Website is sourced from the U.S. Army Corps
            of Engineers National Inventory of Dams (NID). While we strive to keep information
            current:
          </p>
          <ul className="list-disc pl-6 text-foreground-secondary space-y-2">
            <li>
              We make no guarantees about the accuracy, completeness, or timeliness of the data.
            </li>
            <li>
              Dam conditions, ownership, and other details may change without notice.
            </li>
            <li>
              For official or critical decision-making, please refer to the official NID database
              or contact relevant authorities directly.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Disclaimer</h2>
          <p className="text-foreground-secondary">
            <strong>This is not an official government website.</strong> US Dams Database is an
            independent project that aggregates publicly available data. We are not affiliated
            with the U.S. Army Corps of Engineers, FEMA, or any government agency.
          </p>
          <p className="text-foreground-secondary">
            THE WEBSITE AND ALL INFORMATION ARE PROVIDED &quot;AS IS&quot; WITHOUT WARRANTY OF ANY KIND,
            EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS
            FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Emergency Information</h2>
          <p className="text-foreground-secondary">
            This Website should NOT be used for emergency response or evacuation planning.
            In case of a dam-related emergency:
          </p>
          <ul className="list-disc pl-6 text-foreground-secondary space-y-2">
            <li>Follow instructions from local emergency management officials</li>
            <li>Call 911 or your local emergency number</li>
            <li>Monitor local news and official emergency channels</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Limitation of Liability</h2>
          <p className="text-foreground-secondary">
            In no event shall US Dams Database, its operators, or contributors be liable for
            any damages arising from the use or inability to use this Website, including but
            not limited to direct, indirect, incidental, consequential, or punitive damages.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Permitted Use</h2>
          <p className="text-foreground-secondary">
            You may use this Website for:
          </p>
          <ul className="list-disc pl-6 text-foreground-secondary space-y-2">
            <li>Personal, educational, and research purposes</li>
            <li>Non-commercial reference and citation</li>
            <li>Linking to our content with proper attribution</li>
          </ul>
          <p className="text-foreground-secondary">
            You may NOT:
          </p>
          <ul className="list-disc pl-6 text-foreground-secondary space-y-2">
            <li>Scrape or bulk download data without permission</li>
            <li>Use automated tools that overload our servers</li>
            <li>Republish our content as your own without attribution</li>
            <li>Use the Website for any illegal purpose</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Intellectual Property</h2>
          <p className="text-foreground-secondary">
            The underlying dam data from the NID is public domain. The Website&apos;s design,
            layout, and original content are protected by copyright. The US Dams Database
            name and logo are our trademarks.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Changes to Terms</h2>
          <p className="text-foreground-secondary">
            We reserve the right to modify these terms at any time. Continued use of the
            Website after changes constitutes acceptance of the new terms. We will update
            the &quot;Last updated&quot; date when changes are made.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Governing Law</h2>
          <p className="text-foreground-secondary">
            These terms shall be governed by and construed in accordance with the laws of
            the United States, without regard to conflict of law provisions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Data Source</h2>
          <p className="text-foreground-secondary">
            For questions about specific dam data or to report data inaccuracies, please contact
            the{' '}
            <a
              href="https://nid.sec.usace.army.mil/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2 hover:text-accent/80"
            >
              U.S. Army Corps of Engineers National Inventory of Dams
            </a>
            {' '}directly.
          </p>
        </section>
      </div>
    </div>
  );
}
