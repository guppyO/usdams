import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role key (for admin operations)
export function createServerClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
  );
}

// Stats interface for type safety
export interface DamStats {
  totalDams: number;
  highHazard: number;
  significantHazard: number;
  states: Array<{ name: string; slug: string; dam_count: number; high_hazard_count: number }>;
  purposes: Array<{ name: string; slug: string; dam_count: number }>;
  ownerTypes: Array<{ name: string; slug: string; dam_count: number }>;
}

// Shared stats function for all pages
export async function getStats(): Promise<DamStats> {
  const [
    { count: totalDams },
    { count: highHazard },
    { count: significantHazard },
    { data: states },
    { data: purposes },
    { data: ownerTypes }
  ] = await Promise.all([
    supabase.from('dams').select('*', { count: 'exact', head: true }),
    supabase.from('dams').select('*', { count: 'exact', head: true }).eq('hazard_potential', 'High'),
    supabase.from('dams').select('*', { count: 'exact', head: true }).eq('hazard_potential', 'Significant'),
    supabase.from('states').select('name, slug, dam_count, high_hazard_count').order('dam_count', { ascending: false }).limit(12),
    supabase.from('purposes').select('name, slug, dam_count').order('dam_count', { ascending: false }).limit(6),
    supabase.from('owner_types').select('name, slug, dam_count').order('dam_count', { ascending: false }).limit(6)
  ]);

  return {
    totalDams: totalDams || 0,
    highHazard: highHazard || 0,
    significantHazard: significantHazard || 0,
    states: states || [],
    purposes: purposes || [],
    ownerTypes: ownerTypes || []
  };
}
