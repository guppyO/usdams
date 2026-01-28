import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://usdams.com';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Counties can be large (3000+), but still under 10K so single sitemap is fine
  const { data: counties } = await supabase
    .from('counties')
    .select('slug, created_at')
    .order('slug');

  const urls = (counties || []).map((county) => ({
    loc: `${BASE_URL}/county/${county.slug}`,
    lastmod: county.created_at ? new Date(county.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.7,
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
