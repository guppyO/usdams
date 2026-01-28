import Link from 'next/link';
import { Waves, RefreshCw } from 'lucide-react';

const footerLinks = {
  browse: [
    { name: 'All Dams', href: '/browse' },
    { name: 'High Hazard Dams', href: '/hazard/high' },
    { name: 'By State', href: '/states' },
    { name: 'By Purpose', href: '/purpose' },
    { name: 'By Owner Type', href: '/owner-type' },
  ],
  states: [
    { name: 'Texas', href: '/state/texas' },
    { name: 'California', href: '/state/california' },
    { name: 'Ohio', href: '/state/ohio' },
    { name: 'Kansas', href: '/state/kansas' },
    { name: 'All States', href: '/states' },
  ],
  resources: [
    { name: 'About', href: '/about' },
    { name: 'Data Source', href: '/about#data-source' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Use', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Waves className="h-6 w-6 text-accent" />
              <span>US Dams Database</span>
            </Link>
            <p className="mt-4 text-sm text-foreground-secondary">
              Comprehensive database of 91,000+ dams across the United States,
              sourced from the National Inventory of Dams.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Browse</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.browse.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-secondary hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top States */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Top States</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.states.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-secondary hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-secondary hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Data Freshness */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm">
            <RefreshCw className="h-4 w-4 text-accent" />
            <span className="text-foreground-secondary">
              Data updated weekly from{' '}
              <a
                href="https://nid.sec.usace.army.mil/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                NID
              </a>
            </span>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-foreground-secondary">
              Data sourced from the U.S. Army Corps of Engineers National Inventory of Dams (NID).
              This is not an official government website.
            </p>
            <p className="text-sm text-foreground-secondary">
              © {new Date().getFullYear()} US Dams Database. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
