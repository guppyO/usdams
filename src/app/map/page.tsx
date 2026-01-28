import { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dam Map - Interactive Map of All US Dams',
  description: 'Explore an interactive map of over 91,000 dams across the United States. Filter by hazard potential, ownership, purpose, and more.',
};

export default function MapPage() {
  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col">
      <div className="bg-background border-b border-border px-4 py-2 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Interactive map powered by the{' '}
          <a
            href="https://nid.sec.usace.army.mil/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline inline-flex items-center gap-1"
          >
            National Inventory of Dams
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
        <Link href="/browse" className="text-sm text-accent hover:underline">
          Browse all dams →
        </Link>
      </div>
      <iframe
        src="https://nid.sec.usace.army.mil/#/"
        className="w-full flex-1 border-0"
        title="National Inventory of Dams Interactive Map"
        allow="geolocation"
      />
    </div>
  );
}
