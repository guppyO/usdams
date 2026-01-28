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
  console.log('='.repeat(70));
  console.log('UPDATE COUNTY DAM COUNTS');
  console.log('='.repeat(70));
  console.log();

  // Get all counties (paginate since Supabase returns 1000 max by default)
  console.log('Fetching all counties...');
  const allCounties: Array<{ id: number; name: string; state_id: number }> = [];
  let offset = 0;
  const batchSize = 1000;

  while (true) {
    const { data: batch, error: countyError } = await supabase
      .from('counties')
      .select('id, name, state_id')
      .range(offset, offset + batchSize - 1);

    if (countyError) {
      console.error('Error fetching counties:', countyError.message);
      return;
    }

    if (!batch || batch.length === 0) break;

    allCounties.push(...batch);
    console.log(`  Fetched ${allCounties.length} counties...`);

    if (batch.length < batchSize) break;
    offset += batchSize;
  }

  const counties = allCounties;
  console.log(`Found ${counties?.length || 0} counties total`);
  console.log();

  // Get state names for lookup
  const { data: states } = await supabase
    .from('states')
    .select('id, name');

  const stateIdToName = new Map<number, string>();
  states?.forEach(s => stateIdToName.set(s.id, s.name));

  // Update each county's dam_count
  console.log('Updating county dam counts...');
  let updated = 0;
  let errors = 0;

  for (const county of counties || []) {
    const stateName = stateIdToName.get(county.state_id);
    if (!stateName) continue;

    // Count dams in this county
    const { count } = await supabase
      .from('dams')
      .select('*', { count: 'exact', head: true })
      .eq('state', stateName)
      .eq('county', county.name);

    // Update the county
    const { error: updateError } = await supabase
      .from('counties')
      .update({ dam_count: count || 0 })
      .eq('id', county.id);

    if (updateError) {
      console.error(`  Error updating ${county.name}: ${updateError.message}`);
      errors++;
    } else {
      updated++;
      if (updated % 100 === 0) {
        console.log(`  Updated ${updated} counties...`);
      }
    }
  }

  console.log();
  console.log('='.repeat(70));
  console.log('COMPLETE');
  console.log('='.repeat(70));
  console.log(`  Counties updated: ${updated}`);
  console.log(`  Errors: ${errors}`);

  // Verify a sample
  console.log();
  console.log('Sample of updated counties:');
  const { data: sample } = await supabase
    .from('counties')
    .select('name, dam_count')
    .order('dam_count', { ascending: false })
    .limit(10);

  sample?.forEach(c => {
    console.log(`  ${c.name}: ${c.dam_count} dams`);
  });
}

updateCountyCounts().catch(console.error);
