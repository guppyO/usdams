'use client';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

export function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
  // Returns placeholder until AdSense is approved
  // After approval, replace with actual AdSense code

  const getMinHeight = () => {
    switch (format) {
      case 'rectangle':
        return '250px';
      case 'horizontal':
        return '90px';
      case 'vertical':
        return '600px';
      default:
        return '100px';
    }
  };

  return (
    <div
      className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm border border-dashed border-gray-300 dark:border-gray-700 ${className}`}
      style={{ minHeight: getMinHeight() }}
      data-ad-slot={slot}
    >
      <span className="sr-only">Advertisement</span>
      <span aria-hidden="true">Ad Space</span>
    </div>
  );
}

// Sidebar ad (sticky on desktop, hidden on mobile)
export function SidebarAd() {
  return (
    <div className="hidden lg:block sticky top-20">
      <AdUnit slot="sidebar-1" format="rectangle" className="w-[300px] h-[250px]" />
    </div>
  );
}

// In-content ad (shows on all devices, compact horizontal)
export function InContentAd({ className = '' }: { className?: string }) {
  return (
    <div className={`my-8 ${className}`}>
      <AdUnit slot="in-content-1" format="horizontal" className="w-full h-[90px]" />
    </div>
  );
}

// Below hero / leaderboard ad (horizontal, full width)
export function LeaderboardAd({ className = '' }: { className?: string }) {
  return (
    <div className={`my-4 ${className}`}>
      <AdUnit slot="leaderboard-1" format="horizontal" className="w-full h-[90px]" />
    </div>
  );
}
