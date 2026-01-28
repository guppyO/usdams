import * as fs from 'fs';
import * as path from 'path';

const CSV_PATH = path.join(__dirname, '../data/nation.csv');

interface FieldAnalysis {
  name: string;
  index: number;
  nonEmptyCount: number;
  uniqueValues: Set<string>;
  sampleValues: string[];
  minLength: number;
  maxLength: number;
  isNumeric: boolean;
  isDate: boolean;
}

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
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function analyzeCSV(): void {
  console.log('='.repeat(80));
  console.log('NATIONAL DAM INVENTORY (NID) - CSV FIELD ANALYSIS');
  console.log('='.repeat(80));
  console.log();

  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  // Skip metadata row (first line)
  const headerLine = lines[1];
  const headers = parseCSVLine(headerLine);

  console.log(`Total Records: ${lines.length - 2} (excluding metadata and header)`);
  console.log(`Total Fields: ${headers.length}`);
  console.log();

  // Initialize field analysis
  const fields: FieldAnalysis[] = headers.map((name, index) => ({
    name: name.replace(/"/g, ''),
    index,
    nonEmptyCount: 0,
    uniqueValues: new Set<string>(),
    sampleValues: [],
    minLength: Infinity,
    maxLength: 0,
    isNumeric: true,
    isDate: true,
  }));

  // Analyze data rows (sample first 1000 for speed)
  const sampleSize = Math.min(1000, lines.length - 2);
  for (let i = 2; i < sampleSize + 2; i++) {
    const values = parseCSVLine(lines[i]);
    values.forEach((value, idx) => {
      if (idx >= fields.length) return;
      const field = fields[idx];
      const cleaned = value.replace(/"/g, '').trim();

      if (cleaned && cleaned !== 'N/A' && cleaned !== '') {
        field.nonEmptyCount++;
        field.uniqueValues.add(cleaned);

        if (field.sampleValues.length < 5 && !field.sampleValues.includes(cleaned)) {
          field.sampleValues.push(cleaned);
        }

        field.minLength = Math.min(field.minLength, cleaned.length);
        field.maxLength = Math.max(field.maxLength, cleaned.length);

        // Check if numeric
        if (field.isNumeric && isNaN(parseFloat(cleaned))) {
          field.isNumeric = false;
        }

        // Check if date (basic pattern)
        const datePattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        if (field.isDate && !datePattern.test(cleaned) && !cleaned.match(/^\d{4}$/)) {
          field.isDate = false;
        }
      }
    });
  }

  // Print field analysis
  console.log('FIELD DETAILS:');
  console.log('-'.repeat(80));

  fields.forEach((field, idx) => {
    const fillRate = ((field.nonEmptyCount / sampleSize) * 100).toFixed(1);
    const uniqueCount = field.uniqueValues.size;
    let dataType = 'TEXT';
    if (field.isNumeric && field.nonEmptyCount > 0) dataType = 'NUMERIC';
    else if (field.isDate && field.nonEmptyCount > 0) dataType = 'DATE';

    console.log(`[${idx + 1}] ${field.name}`);
    console.log(`    Type: ${dataType} | Fill Rate: ${fillRate}% | Unique Values: ${uniqueCount}`);
    if (field.sampleValues.length > 0) {
      const samples = field.sampleValues.slice(0, 3).map(s => s.length > 40 ? s.substring(0, 40) + '...' : s);
      console.log(`    Samples: ${samples.join(' | ')}`);
    }
    console.log();
  });

  // Summary by category
  console.log('='.repeat(80));
  console.log('FIELD CATEGORIES FOR DATABASE SCHEMA:');
  console.log('='.repeat(80));

  const categories: { [key: string]: string[] } = {
    'IDENTIFICATION': [],
    'LOCATION': [],
    'OWNERSHIP': [],
    'PHYSICAL_CHARACTERISTICS': [],
    'STORAGE_CAPACITY': [],
    'REGULATORY': [],
    'SAFETY_INSPECTION': [],
    'DATES': [],
    'OTHER': [],
  };

  fields.forEach(f => {
    const name = f.name.toLowerCase();
    if (name.includes('id') || name.includes('name')) {
      categories.IDENTIFICATION.push(f.name);
    } else if (name.includes('lat') || name.includes('long') || name.includes('state') ||
               name.includes('county') || name.includes('city') || name.includes('river') ||
               name.includes('congressional') || name.includes('distance')) {
      categories.LOCATION.push(f.name);
    } else if (name.includes('owner') || name.includes('federal') || name.includes('agency')) {
      categories.OWNERSHIP.push(f.name);
    } else if (name.includes('height') || name.includes('length') || name.includes('volume') ||
               name.includes('type') || name.includes('spillway') || name.includes('foundation') ||
               name.includes('core') || name.includes('discharge') || name.includes('lock')) {
      categories.PHYSICAL_CHARACTERISTICS.push(f.name);
    } else if (name.includes('storage') || name.includes('surface') || name.includes('drainage')) {
      categories.STORAGE_CAPACITY.push(f.name);
    } else if (name.includes('regulat') || name.includes('jurisd') || name.includes('permit') ||
               name.includes('enforcement') || name.includes('authority')) {
      categories.REGULATORY.push(f.name);
    } else if (name.includes('hazard') || name.includes('condition') || name.includes('inspection') ||
               name.includes('eap') || name.includes('inundation') || name.includes('operational')) {
      categories.SAFETY_INSPECTION.push(f.name);
    } else if (name.includes('date') || name.includes('year') || name.includes('updated')) {
      categories.DATES.push(f.name);
    } else {
      categories.OTHER.push(f.name);
    }
  });

  Object.entries(categories).forEach(([category, fieldNames]) => {
    if (fieldNames.length > 0) {
      console.log(`\n${category} (${fieldNames.length} fields):`);
      fieldNames.forEach(n => console.log(`  - ${n}`));
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('ANALYSIS COMPLETE');
  console.log('='.repeat(80));
}

analyzeCSV();
