import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for US Dams Database - how we collect, use, and protect your information.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">
          Last updated: January 2026
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
          <p className="text-foreground-secondary">
            US Dams Database is a publicly accessible informational website. We collect minimal data
            to improve our services:
          </p>
          <ul className="list-disc pl-6 text-foreground-secondary space-y-2">
            <li>
              <strong>Usage Data:</strong> We use Vercel Analytics to collect anonymous usage statistics
              such as page views, device types, and general geographic regions. This data does not
              personally identify you.
            </li>
            <li>
              <strong>Performance Data:</strong> We use Vercel Speed Insights to monitor website
              performance and loading times.
            </li>
            <li>
              <strong>Search Queries:</strong> Search terms entered on our site may be logged to
              improve search functionality. These are not linked to personal identifiers.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Cookies and Tracking</h2>
          <p className="text-foreground-secondary">
            We use essential cookies to remember your theme preference (light/dark mode).
            Third-party services we use may set their own cookies:
          </p>
          <ul className="list-disc pl-6 text-foreground-secondary space-y-2">
            <li>
              <strong>Vercel Analytics:</strong> Anonymous analytics tracking
            </li>
            <li>
              <strong>Google AdSense:</strong> May use cookies to serve personalized ads
              (when implemented)
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Data Source</h2>
          <p className="text-foreground-secondary">
            The dam information displayed on this website is sourced from the U.S. Army Corps of
            Engineers National Inventory of Dams (NID), which is public domain data. We do not
            collect or store personal information about dam owners or operators beyond what is
            publicly available in the NID database.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Third-Party Services</h2>
          <p className="text-foreground-secondary">
            Our website uses the following third-party services:
          </p>
          <ul className="list-disc pl-6 text-foreground-secondary space-y-2">
            <li>Vercel (hosting and analytics)</li>
            <li>Supabase (database)</li>
            <li>Google AdSense (advertising, when implemented)</li>
          </ul>
          <p className="text-foreground-secondary">
            Each service has its own privacy policy governing how they handle data.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Your Rights</h2>
          <p className="text-foreground-secondary">
            Since we do not collect personal information, there is no personal data to access,
            correct, or delete. If you have questions about your data or wish to opt out of
            analytics tracking, you can use browser extensions that block analytics scripts.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Children&apos;s Privacy</h2>
          <p className="text-foreground-secondary">
            Our website is intended for general audiences and does not knowingly collect
            information from children under 13 years of age.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Changes to This Policy</h2>
          <p className="text-foreground-secondary">
            We may update this privacy policy from time to time. We will notify users of any
            material changes by updating the &quot;Last updated&quot; date at the top of this page.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
          <p className="text-foreground-secondary">
            If you have questions about this privacy policy or our data practices, please contact
            us at{' '}
            <a
              href="mailto:contact@usdamsdata.com"
              className="text-accent underline underline-offset-2 hover:text-accent/80"
            >
              contact@usdamsdata.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
