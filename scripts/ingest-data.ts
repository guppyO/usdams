import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const CSV_PATH = path.join(__dirname, '../data/nation.csv');
const BATCH_SIZE = 500; // Supabase has 1000 limit, use 500 for safety

// Slugify helper
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

// Parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parse date from MM/DD/YYYY format
function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr === 'N/A' || dateStr === '') return null;
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return null;
}

// Parse number
function parseNumber(val: string): number | null {
  if (!val || val === 'N/A' || val === '') return null;
  const num = parseFloat(val.replace(/,/g, ''));
  return isNaN(num) ? null : num;
}

// Parse boolean
function parseBoolean(val: string): boolean | null {
  if (!val || val === 'N/A') return null;
  return val.toLowerCase() === 'yes' || val.toLowerCase() === 'true';
}

// Clean string
function cleanString(val: string): string | null {
  if (!val || val === 'N/A' || val === '') return null;
  return val.trim();
}

interface DamRow {
  [key: string]: any;
}

async function ingestData() {
  console.log('='.repeat(70));
  console.log('US DAMS DATA INGESTION');
  console.log('='.repeat(70));
  console.log();

  // Read CSV
  console.log('Reading CSV file...');
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  // Skip metadata row (line 0), header is line 1
  const headerLine = lines[1];
  const headers = parseCSVLine(headerLine);

  console.log(`Total lines: ${lines.length}`);
  console.log(`Headers: ${headers.length} columns`);
  console.log(`Data rows: ${lines.length - 2}`);
  console.log();

  // Column index mapping based on actual CSV headers
  const colIndex: { [key: string]: number } = {};
  headers.forEach((h, i) => { colIndex[h] = i; });

  // Parse all data rows
  console.log('Parsing data rows...');
  const allDams: DamRow[] = [];

  for (let i = 2; i < lines.length; i++) {
    if (i % 10000 === 0) {
      console.log(`  Parsed ${i - 2} rows...`);
    }

    const values = parseCSVLine(lines[i]);
    if (values.length < 10) continue; // Skip malformed rows

    const dam: DamRow = {
      nid_id: cleanString(values[colIndex['NID ID']]),
      name: cleanString(values[colIndex['Dam Name']]),
      other_names: cleanString(values[colIndex['Other Names']]),
      former_names: cleanString(values[colIndex['Former Names']]),
      federal_id: cleanString(values[colIndex['Federal ID']]),

      // Location
      latitude: parseNumber(values[colIndex['Latitude']]),
      longitude: parseNumber(values[colIndex['Longitude']]),
      state: cleanString(values[colIndex['State']]),
      county: cleanString(values[colIndex['County']]),
      city: cleanString(values[colIndex['City']]),
      distance_to_city: parseNumber(values[colIndex['Distance to Nearest City (Miles)']]),
      river_name: cleanString(values[colIndex['River or Stream Name']]),
      congressional_district: cleanString(values[colIndex['Congressional District']]),
      tribal_land: cleanString(values[colIndex['American Indian/Alaska Native/Native Hawaiian']]),

      // Ownership
      owner_names: cleanString(values[colIndex['Owner Names']]),
      owner_types: cleanString(values[colIndex['Owner Types']]),
      primary_owner_type: cleanString(values[colIndex['Primary Owner Type']]),
      non_federal_on_federal: parseBoolean(values[colIndex['Non-Federal Dam on Federal Property']]),

      // Purpose
      primary_purpose: cleanString(values[colIndex['Primary Purpose']]),
      purposes: cleanString(values[colIndex['Purposes']]),

      // Source
      source_agency: cleanString(values[colIndex['Source Agency']]),
      state_agency_id: cleanString(values[colIndex['State or Federal Agency ID']]),

      // Physical Characteristics
      primary_dam_type: cleanString(values[colIndex['Primary Dam Type']]),
      dam_types: cleanString(values[colIndex['Dam Types']]),
      core_types: cleanString(values[colIndex['Core Types']]),
      foundation: cleanString(values[colIndex['Foundation']]),
      dam_height_ft: parseNumber(values[colIndex['Dam Height (Ft)']]),
      hydraulic_height_ft: parseNumber(values[colIndex['Hydraulic Height (Ft)']]),
      structural_height_ft: parseNumber(values[colIndex['Structural Height (Ft)']]),
      nid_height_ft: parseNumber(values[colIndex['NID Height (Ft)']]),
      nid_height_category: cleanString(values[colIndex['NID Height Category']]),
      dam_length_ft: parseNumber(values[colIndex['Dam Length (Ft)']]),
      volume_cubic_yards: parseNumber(values[colIndex['Volume (Cubic Yards)']]),

      // Dates
      year_completed: parseNumber(values[colIndex['Year Completed']]),
      year_completed_category: cleanString(values[colIndex['Year Completed Category']]),
      years_modified: cleanString(values[colIndex['Years Modified']]),
      data_last_updated: parseDate(values[colIndex['Data Last Updated']]),

      // Storage
      nid_storage_acre_ft: parseNumber(values[colIndex['NID Storage (Acre-Ft)']]),
      max_storage_acre_ft: parseNumber(values[colIndex['Max Storage (Acre-Ft)']]),
      normal_storage_acre_ft: parseNumber(values[colIndex['Normal Storage (Acre-Ft)']]),
      surface_area_acres: parseNumber(values[colIndex['Surface Area (Acres)']]),
      drainage_area_sq_miles: parseNumber(values[colIndex['Drainage Area (Sq Miles)']]),

      // Spillway
      max_discharge_cfs: parseNumber(values[colIndex['Max Discharge (Cubic Ft/Second)']]),
      spillway_type: cleanString(values[colIndex['Spillway Type']]),
      spillway_width_ft: parseNumber(values[colIndex['Spillway Width (Ft)']]),
      outlet_gate_type: cleanString(values[colIndex['Outlet Gate Type']]),

      // Locks
      number_of_locks: parseNumber(values[colIndex['Number of Locks']]),
      lock_length_ft: parseNumber(values[colIndex['Length of Locks (ft)']]),
      lock_width_ft: parseNumber(values[colIndex['Lock Width (Ft)']]),

      // Regulation
      state_regulated: parseBoolean(values[colIndex['State Regulated Dam']]),
      state_jurisdictional: parseBoolean(values[colIndex['State Jurisdictional Dam']]),
      state_regulatory_agency: cleanString(values[colIndex['State Regulatory Agency']]),
      federally_regulated: parseBoolean(values[colIndex['Federally Regulated Dam']]),

      // Safety
      hazard_potential: cleanString(values[colIndex['Hazard Potential Classification']]),
      condition_assessment: cleanString(values[colIndex['Condition Assessment']]),
      condition_assessment_date: parseDate(values[colIndex['Condition Assessment Date']]),
      last_inspection_date: parseDate(values[colIndex['Last Inspection Date']]),
      inspection_frequency: parseNumber(values[colIndex['Inspection Frequency']]),
      operational_status: cleanString(values[colIndex['Operational Status']]),

      // Emergency
      eap_prepared: cleanString(values[colIndex['EAP Prepared']]),
      eap_last_revision: parseDate(values[colIndex['EAP Last Revision Date']]),
      inundation_maps_in_nid: parseBoolean(values[colIndex['Inundation Maps Added to NID?']]),

      // Meta
      website_url: cleanString(values[colIndex['Website URL']]),
    };

    // Generate slug
    if (dam.nid_id) {
      const namePart = dam.name ? slugify(dam.name) : 'dam';
      dam.slug = `${namePart}-${dam.nid_id.toLowerCase()}`;
    }

    if (dam.nid_id) {
      allDams.push(dam);
    }
  }

  console.log(`Parsed ${allDams.length} valid dams (before dedup)`);

  // Deduplicate by NID ID (keep first occurrence)
  const seenNidIds = new Set<string>();
  const dedupedDams: DamRow[] = [];

  for (const dam of allDams) {
    if (!seenNidIds.has(dam.nid_id)) {
      seenNidIds.add(dam.nid_id);
      dedupedDams.push(dam);
    }
  }

  console.log(`After dedup: ${dedupedDams.length} unique dams`);
  allDams.length = 0;
  allDams.push(...dedupedDams);
  console.log();

  // Extract unique values for lookup tables
  console.log('Building lookup tables...');

  const uniqueStates = [...new Set(allDams.map(d => d.state).filter(Boolean))];
  const uniquePurposes = [...new Set(allDams.map(d => d.primary_purpose).filter(Boolean))];
  const uniqueOwnerTypes = [...new Set(allDams.map(d => d.primary_owner_type).filter(Boolean))];

  console.log(`  States: ${uniqueStates.length}`);
  console.log(`  Purposes: ${uniquePurposes.length}`);
  console.log(`  Owner Types: ${uniqueOwnerTypes.length}`);
  console.log();

  // Insert states
  console.log('Inserting states...');
  const stateMap = new Map<string, number>();

  for (const state of uniqueStates) {
    const { data, error } = await supabase
      .from('states')
      .upsert({ name: state, slug: slugify(state) }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      console.error(`  Error upserting state ${state}: ${error.message}`);
    } else if (data) {
      stateMap.set(state, data.id);
    }
  }
  console.log(`  Inserted ${stateMap.size} states`);

  // Insert purposes
  console.log('Inserting purposes...');
  const purposeMap = new Map<string, number>();

  for (const purpose of uniquePurposes) {
    const { data, error } = await supabase
      .from('purposes')
      .upsert({ name: purpose, slug: slugify(purpose) }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      console.error(`  Error upserting purpose ${purpose}: ${error.message}`);
    } else if (data) {
      purposeMap.set(purpose, data.id);
    }
  }
  console.log(`  Inserted ${purposeMap.size} purposes`);

  // Insert owner types
  console.log('Inserting owner types...');
  const ownerTypeMap = new Map<string, number>();

  for (const ownerType of uniqueOwnerTypes) {
    const { data, error } = await supabase
      .from('owner_types')
      .upsert({ name: ownerType, slug: slugify(ownerType) }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      console.error(`  Error upserting owner type ${ownerType}: ${error.message}`);
    } else if (data) {
      ownerTypeMap.set(ownerType, data.id);
    }
  }
  console.log(`  Inserted ${ownerTypeMap.size} owner types`);

  // Extract unique counties (need state association)
  console.log('Inserting counties...');
  const countyMap = new Map<string, number>();
  const seenCounties = new Set<string>();

  for (const dam of allDams) {
    if (dam.county && dam.state) {
      const key = `${dam.state}|${dam.county}`;
      if (!seenCounties.has(key)) {
        seenCounties.add(key);
        const stateId = stateMap.get(dam.state);
        if (stateId) {
          const slug = `${slugify(dam.state)}-${slugify(dam.county)}`;
          const { data, error } = await supabase
            .from('counties')
            .upsert({ name: dam.county, state_id: stateId, slug }, { onConflict: 'slug' })
            .select('id')
            .single();

          if (error && !error.message.includes('duplicate')) {
            console.error(`  Error inserting county ${dam.county}: ${error.message}`);
          } else if (data) {
            countyMap.set(key, data.id);
          }
        }
      }
    }
  }
  console.log(`  Inserted ${countyMap.size} counties`);
  console.log();

  // Add foreign key IDs to dams
  console.log('Adding foreign key references...');
  for (const dam of allDams) {
    if (dam.state) dam.state_id = stateMap.get(dam.state) || null;
    if (dam.state && dam.county) {
      dam.county_id = countyMap.get(`${dam.state}|${dam.county}`) || null;
    }
    if (dam.primary_purpose) {
      dam.primary_purpose_id = purposeMap.get(dam.primary_purpose) || null;
    }
    if (dam.primary_owner_type) {
      dam.primary_owner_type_id = ownerTypeMap.get(dam.primary_owner_type) || null;
    }
  }

  // Insert dams in batches
  console.log(`Inserting ${allDams.length} dams in batches of ${BATCH_SIZE}...`);
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < allDams.length; i += BATCH_SIZE) {
    const batch = allDams.slice(i, i + BATCH_SIZE);

    const { error } = await supabase.from('dams').upsert(batch, { onConflict: 'nid_id' });

    if (error) {
      console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} error: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += batch.length;
    }

    if ((i + BATCH_SIZE) % 10000 === 0 || i + BATCH_SIZE >= allDams.length) {
      console.log(`  Progress: ${Math.min(i + BATCH_SIZE, allDams.length)} / ${allDams.length}`);
    }
  }

  console.log();
  console.log('='.repeat(70));
  console.log('INGESTION COMPLETE');
  console.log('='.repeat(70));
  console.log(`  Dams inserted: ${inserted}`);
  console.log(`  Errors: ${errors}`);
  console.log();

  // Verify counts
  console.log('Verifying counts...');
  const { count: damCount } = await supabase.from('dams').select('*', { count: 'exact', head: true });
  const { count: stateCount } = await supabase.from('states').select('*', { count: 'exact', head: true });
  const { count: countyCount } = await supabase.from('counties').select('*', { count: 'exact', head: true });
  const { count: purposeCount } = await supabase.from('purposes').select('*', { count: 'exact', head: true });
  const { count: ownerCount } = await supabase.from('owner_types').select('*', { count: 'exact', head: true });

  console.log(`  dams: ${damCount}`);
  console.log(`  states: ${stateCount}`);
  console.log(`  counties: ${countyCount}`);
  console.log(`  purposes: ${purposeCount}`);
  console.log(`  owner_types: ${ownerCount}`);

  // Update counts in lookup tables
  console.log('\nUpdating dam counts in lookup tables...');

  // Update state counts
  for (const [stateName, stateId] of stateMap) {
    const { count } = await supabase
      .from('dams')
      .select('*', { count: 'exact', head: true })
      .eq('state', stateName);

    const { count: highHazardCount } = await supabase
      .from('dams')
      .select('*', { count: 'exact', head: true })
      .eq('state', stateName)
      .eq('hazard_potential', 'High');

    await supabase
      .from('states')
      .update({ dam_count: count || 0, high_hazard_count: highHazardCount || 0 })
      .eq('id', stateId);
  }

  // Update purpose counts
  for (const [purposeName, purposeId] of purposeMap) {
    const { count } = await supabase
      .from('dams')
      .select('*', { count: 'exact', head: true })
      .eq('primary_purpose', purposeName);

    await supabase
      .from('purposes')
      .update({ dam_count: count || 0 })
      .eq('id', purposeId);
  }

  // Update owner type counts
  for (const [ownerName, ownerId] of ownerTypeMap) {
    const { count } = await supabase
      .from('dams')
      .select('*', { count: 'exact', head: true })
      .eq('primary_owner_type', ownerName);

    await supabase
      .from('owner_types')
      .update({ dam_count: count || 0 })
      .eq('id', ownerId);
  }

  console.log('Done!');
}

ingestData().catch(console.error);
