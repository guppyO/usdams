import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const ITEMS_PER_SITEMAP = 10000;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://usdamsdata.com';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get total dam count
  const { count: damCount } = await supabase
    .from('dams')
    .select('*', { count: 'exact', head: true });

  // Get state and county counts for additional sitemaps
  const { count: stateCount } = await supabase
    .from('states')
    .select('*', { count: 'exact', head: true });

  const { count: countyCount } = await supabase
    .from('counties')
    .select('*', { count: 'exact', head: true });

  // Calculate number of sitemap pages needed for dams
  const damSitemapCount = Math.ceil((damCount || 0) / ITEMS_PER_SITEMAP);

  const sitemaps: string[] = [];

  // Add dam sitemaps (paginated)
  for (let i = 0; i < damSitemapCount; i++) {
    sitemaps.push(`${BASE_URL}/sitemap/${i}`);
  }

  // Add static pages sitemap
  sitemaps.push(`${BASE_URL}/sitemap/static`);

  // Add states sitemap
  sitemaps.push(`${BASE_URL}/sitemap/states`);

  // Add counties sitemap
  sitemaps.push(`${BASE_URL}/sitemap/counties`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
