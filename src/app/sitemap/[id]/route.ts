import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const ITEMS_PER_SITEMAP = 10000;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://usdamsdata.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const page = parseInt(id) || 0;
  const offset = page * ITEMS_PER_SITEMAP;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get dams for this sitemap page
  const { data: dams, error } = await supabase
    .from('dams')
    .select('slug, updated_at')
    .order('id')
    .range(offset, offset + ITEMS_PER_SITEMAP - 1);

  if (error) {
    console.error('Sitemap error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }

  const urls = (dams || []).map((dam) => ({
    loc: `${BASE_URL}/dam/${dam.slug}`,
    lastmod: dam.updated_at ? new Date(dam.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
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
