'use client';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

/**
 * Google AdSense Ad Unit Component
 *
 * Usage:
 * - slot: Your AdSense ad slot ID (e.g., "1234567890")
 * - format: Ad format type
 * - className: Additional CSS classes
 *
 * IMPORTANT: Replace 'ca-pub-XXXXXXXXXX' in layout.tsx with your publisher ID
 * and update the slot IDs below once AdSense is approved.
 */
export function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
  // Don't render ads in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        className={`bg-muted/50 border border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm ${className}`}
        style={{ minHeight: format === 'horizontal' ? '90px' : format === 'rectangle' ? '250px' : '100px' }}
      >
        <span>Ad Placeholder</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXX" // Replace with your publisher ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

/**
 * In-content ad for articles and long content pages
 */
export function InContentAd({ className = '' }: { className?: string }) {
  return (
    <div className={`my-8 ${className}`}>
      <AdUnit slot="in-content-ad" format="auto" />
    </div>
  );
}

/**
 * Sidebar ad unit for list pages
 */
export function SidebarAd({ className = '' }: { className?: string }) {
  return (
    <div className={`${className}`}>
      <AdUnit slot="sidebar-ad" format="rectangle" className="min-h-[250px]" />
    </div>
  );
}

/**
 * Leaderboard ad for top of pages
 */
export function LeaderboardAd({ className = '' }: { className?: string }) {
  return (
    <div className={`my-4 ${className}`}>
      <AdUnit slot="leaderboard-ad" format="horizontal" className="min-h-[90px]" />
    </div>
  );
}
