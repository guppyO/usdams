import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verify() {
  console.log('='.repeat(70));
  console.log('US DAMS DATABASE VERIFICATION');
  console.log('='.repeat(70));
  console.log();

  // 1. Table counts
  console.log('TABLE COUNTS:');
  const tables = ['dams', 'states', 'counties', 'purposes', 'owner_types'];
  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`  ${table}: ${count}`);
  }
  console.log();

  // 2. Sample dam data
  console.log('SAMPLE DAM:');
  const { data: sampleDam } = await supabase
    .from('dams')
    .select('nid_id, name, state, county, city, hazard_potential, primary_purpose, dam_height_ft, year_completed')
    .limit(1)
    .single();
  console.log(sampleDam);
  console.log();

  // 3. States with most dams
  console.log('TOP 5 STATES BY DAM COUNT:');
  const { data: topStates } = await supabase
    .from('states')
    .select('name, dam_count, high_hazard_count')
    .order('dam_count', { ascending: false })
    .limit(5);
  console.table(topStates);

  // 4. Hazard classification breakdown
  console.log('\nHAZARD CLASSIFICATION BREAKDOWN:');
  for (const hazard of ['High', 'Significant', 'Low', 'Undetermined']) {
    const { count } = await supabase
      .from('dams')
      .select('*', { count: 'exact', head: true })
      .eq('hazard_potential', hazard);
    console.log(`  ${hazard}: ${count}`);
  }

  // 5. Purpose breakdown
  console.log('\nDAMS BY PURPOSE:');
  const { data: purposes } = await supabase
    .from('purposes')
    .select('name, dam_count')
    .order('dam_count', { ascending: false });
  console.table(purposes);

  // 6. Owner type breakdown
  console.log('\nDAMS BY OWNER TYPE:');
  const { data: owners } = await supabase
    .from('owner_types')
    .select('name, dam_count')
    .order('dam_count', { ascending: false });
  console.table(owners);

  // 7. Verify location data
  console.log('\nLOCATION DATA COVERAGE:');
  const { count: withLatLng } = await supabase
    .from('dams')
    .select('*', { count: 'exact', head: true })
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);
  console.log(`  Dams with lat/lng: ${withLatLng}`);

  console.log('\n' + '='.repeat(70));
  console.log('VERIFICATION COMPLETE');
  console.log('='.repeat(70));
}

verify();
