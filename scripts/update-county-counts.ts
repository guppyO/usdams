import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function updateCountyCounts() {
  console.log('Fetching all counties...');

  // Get all counties with their state info
  const { data: counties, error: countiesError } = await supabase
    .from('counties')
    .select('id, name, state_id, states(name)');

  if (countiesError) {
    console.error('Error fetching counties:', countiesError);
    return;
  }

  console.log(`Found ${counties?.length || 0} counties. Updating counts...`);

  let updated = 0;
  for (const county of counties || []) {
    const stateName = (county.states as any)?.name;
    if (!stateName) continue;

    // Count dams in this county
    const { count } = await supabase
      .from('dams')
      .select('*', { count: 'exact', head: true })
      .eq('state', stateName)
      .eq('county', county.name);

    // Update county dam_count
    const { error: updateError } = await supabase
      .from('counties')
      .update({ dam_count: count || 0 })
      .eq('id', county.id);

    if (updateError) {
      console.error(`Error updating county ${county.name}:`, updateError);
    } else {
      updated++;
    }

    if (updated % 500 === 0) {
      console.log(`  Updated ${updated} counties...`);
    }
  }

  console.log(`Done! Updated ${updated} counties.`);

  // Verify some counts
  const { data: sampleCounties } = await supabase
    .from('counties')
    .select('name, dam_count, states(name)')
    .order('dam_count', { ascending: false })
    .limit(10);

  console.log('\nTop 10 counties by dam count:');
  sampleCounties?.forEach(c => {
    console.log(`  ${c.name}, ${(c.states as any)?.name}: ${c.dam_count} dams`);
  });
}

updateCountyCounts().catch(console.error);
