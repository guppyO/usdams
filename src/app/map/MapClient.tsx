'use client';

import dynamic from 'next/dynamic';

const DamMap = dynamic(() => import('@/components/DamMap').then(mod => mod.DamMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-accent border-t-transparent" />
    </div>
  ),
});

export function MapClient() {
  return (
    <div className="w-full h-[calc(100vh-64px)]">
      <DamMap />
    </div>
  );
}
