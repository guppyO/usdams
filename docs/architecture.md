# US Dams - Architecture Document

## Project Overview

**Dataset**: National Inventory of Dams (NID) from U.S. Army Corps of Engineers
**Data Source**: https://nid.sec.usace.army.mil/api/nation/csv
**Records**: 92,591 dams
**Fields**: 83 data fields per dam
**License**: Public Domain (U.S. Government data)
**Last Updated**: 2026-01-20

---

## Feature Decisions (Research-Backed)

### 1. Location-Based Search & Filtering

**What competitors do:**
- NID official site: State/county dropdown selection, requires multiple clicks
- Wisconsin DNR: Has "Dam Data Viewer" with map interface
- California DSOD: State-specific, limited filtering

**What users expect (from research):**
- "Find dams near me" is a common search query
- Users want to see dams in their area for flood risk awareness
- Location search tied to flood zone/hazard understanding

**My decision:**
Build comprehensive location hierarchy with:
- State browse pages (`/state/california`)
- County pages (`/state/california/los-angeles-county`)
- City-level pages where data supports it
- "Nearby dams" feature using lat/lng proximity

### 2. Hazard Classification Display

**What competitors do:**
- NID: Shows classification but buried in data table
- FEMA: Explains classifications but doesn't link to specific dams
- ASDSO: Educational content about hazard levels

**What users expect:**
- Clear understanding of High/Significant/Low hazard meanings
- Filter to see only High Hazard dams (99.9% fill rate in data)
- Visual differentiation (color coding)

**My decision:**
- Prominent hazard badge on every dam card/page
- Dedicated hazard filter pages (`/hazard/high`, `/hazard/significant`)
- Color-coded badges (Red=High, Orange=Significant, Green=Low)
- Educational tooltip explaining each classification

### 3. Dam Purpose Categorization

**Available data:**
- Primary Purpose: Recreation, Water Supply, Flood Control, etc.
- 90.1% fill rate, 10 unique values

**What users expect:**
- Find recreational dams for fishing/boating
- Find hydroelectric dams
- Understand dam's function

**My decision:**
- Purpose browse pages (`/purpose/recreation`, `/purpose/hydropower`)
- Purpose displayed prominently on dam cards
- Multi-purpose dams show all purposes

### 4. Emergency Action Plan (EAP) Status

**What competitors do:**
- NID: Has EAP Prepared field (Yes/No/Not Required)
- State agencies: Link to actual EAP documents (when available)

**What users expect:**
- Know if their nearby dam has emergency plan
- 5.3% have EAP Last Revision Date

**My decision:**
- Show EAP status on dam page
- Filter for dams with/without EAP
- Link to state dam safety office for EAP requests
- Explain what EAP means for public safety

### 5. Inspection & Condition Data

**Available data:**
- Last Inspection Date: 37% fill rate
- Inspection Frequency: 51.5% fill rate
- Condition Assessment: 58.1% fill rate
- Hazard Potential: 99.9% fill rate

**What competitors do:**
- Hearst Television: Built tool showing dam conditions with warnings
- State agencies: Show inspection dates

**My decision:**
- Show last inspection date prominently
- Color-coded condition status
- Filter for "Not Rated" vs rated dams
- Alert styling for dams not inspected recently

### 6. Physical Characteristics

**Available data:**
- Dam Height, Length, Volume
- Storage capacity (NID Storage 100% filled)
- Year completed (69.6% fill rate)

**My decision:**
- Visual comparison (height relative to known landmarks)
- Age calculator (years since completion)
- Storage volume in understandable units
- Height category pages (`/height/over-100-feet`)

### 7. Ownership & Regulation

**Available data:**
- Owner Type: Federal/Private/State/Local Government (99.9% filled)
- State Regulated Dam: Yes/No (100% filled)
- Federally Regulated Dam: Yes/No (100% filled)

**My decision:**
- Owner type filter pages (`/owner/federal`, `/owner/private`)
- Show regulation status for public accountability
- Link federal dams to agency pages

---

## Database Schema

### Tables

```sql
-- Main dams table
CREATE TABLE dams (
  id SERIAL PRIMARY KEY,
  nid_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  other_names TEXT,
  former_names TEXT,
  federal_id VARCHAR(50),

  -- Location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  state VARCHAR(100),
  county VARCHAR(100),
  city VARCHAR(100),
  distance_to_city DECIMAL(6, 2),
  river_name VARCHAR(255),
  congressional_district VARCHAR(100),
  tribal_land VARCHAR(255),

  -- Ownership
  owner_names TEXT,
  owner_types VARCHAR(100),
  primary_owner_type VARCHAR(50),
  non_federal_on_federal BOOLEAN,

  -- Purpose
  primary_purpose VARCHAR(50),
  purposes TEXT,

  -- Physical Characteristics
  primary_dam_type VARCHAR(50),
  dam_types TEXT,
  core_types TEXT,
  foundation VARCHAR(100),
  dam_height_ft DECIMAL(8, 2),
  hydraulic_height_ft DECIMAL(8, 2),
  structural_height_ft DECIMAL(8, 2),
  nid_height_ft DECIMAL(8, 2),
  nid_height_category VARCHAR(50),
  dam_length_ft DECIMAL(10, 2),
  volume_cubic_yards DECIMAL(15, 2),

  -- Dates
  year_completed INTEGER,
  year_completed_category VARCHAR(50),
  years_modified TEXT,
  data_last_updated DATE,

  -- Storage
  nid_storage_acre_ft DECIMAL(12, 2),
  max_storage_acre_ft DECIMAL(12, 2),
  normal_storage_acre_ft DECIMAL(12, 2),
  surface_area_acres DECIMAL(10, 2),
  drainage_area_sq_miles DECIMAL(10, 2),

  -- Spillway
  max_discharge_cfs DECIMAL(12, 2),
  spillway_type VARCHAR(50),
  spillway_width_ft DECIMAL(8, 2),
  outlet_gate_type VARCHAR(100),

  -- Locks (navigation)
  number_of_locks INTEGER,
  lock_length_ft DECIMAL(8, 2),
  lock_width_ft DECIMAL(8, 2),

  -- Regulation
  source_agency VARCHAR(100),
  state_agency_id VARCHAR(100),
  state_regulated BOOLEAN,
  state_jurisdictional BOOLEAN,
  state_regulatory_agency VARCHAR(255),
  federally_regulated BOOLEAN,

  -- Safety & Inspection
  hazard_potential VARCHAR(20),
  condition_assessment VARCHAR(50),
  condition_assessment_date DATE,
  last_inspection_date DATE,
  inspection_frequency INTEGER,
  operational_status VARCHAR(100),

  -- Emergency
  eap_prepared VARCHAR(20),
  eap_last_revision DATE,
  inundation_maps_in_nid BOOLEAN,

  -- Meta
  website_url VARCHAR(500),
  slug VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- States lookup table (for counts, metadata)
CREATE TABLE states (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  abbreviation VARCHAR(10),
  slug VARCHAR(100) UNIQUE NOT NULL,
  dam_count INTEGER DEFAULT 0,
  high_hazard_count INTEGER DEFAULT 0,
  dam_safety_url VARCHAR(500)
);

-- Counties lookup table
CREATE TABLE counties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state_id INTEGER REFERENCES states(id),
  slug VARCHAR(200) UNIQUE NOT NULL,
  dam_count INTEGER DEFAULT 0,
  UNIQUE(name, state_id)
);

-- Purposes lookup table
CREATE TABLE purposes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  dam_count INTEGER DEFAULT 0
);

-- Owner types lookup table
CREATE TABLE owner_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  dam_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_dams_state ON dams(state);
CREATE INDEX idx_dams_county ON dams(county);
CREATE INDEX idx_dams_hazard ON dams(hazard_potential);
CREATE INDEX idx_dams_purpose ON dams(primary_purpose);
CREATE INDEX idx_dams_owner_type ON dams(primary_owner_type);
CREATE INDEX idx_dams_lat_lng ON dams(latitude, longitude);
CREATE INDEX idx_dams_slug ON dams(slug);
CREATE INDEX idx_dams_height ON dams(nid_height_ft);
CREATE INDEX idx_dams_year ON dams(year_completed);
```

---

## Route Architecture

### Page Types & URLs

```
/                                    -> Homepage (featured stats, search)
|
+-- /browse                          -> Master browse hub
|   +-- /state                       -> All states list
|   |   +-- /state/[state-slug]      -> State page (California)
|   |       +-- /state/[state]/[county] -> County page
|   |
|   +-- /hazard                      -> Hazard classification hub
|   |   +-- /hazard/[level]          -> High/Significant/Low pages
|   |
|   +-- /purpose                     -> Dam purposes hub
|   |   +-- /purpose/[slug]          -> Recreation, Flood Control, etc.
|   |
|   +-- /owner                       -> Owner types hub
|       +-- /owner/[type]            -> Federal, Private, State, Local
|
+-- /dam/[slug]                      -> Individual dam page (MONEY PAGE)
|
+-- /search                          -> Search results page
|
+-- /about                           -> About the database
+-- /resources                       -> Dam safety resources
+-- /glossary                        -> Dam terminology glossary
```

### Estimated Page Counts

| Page Type | Count | Notes |
|-----------|-------|-------|
| Homepage | 1 | |
| State pages | 55 | All states + territories |
| County pages | ~2,800 | 278 unique counties in sample * ~10 |
| Hazard pages | 4 | High, Significant, Low, Undetermined |
| Purpose pages | 10 | Recreation, Water Supply, etc. |
| Owner pages | 7 | Federal, Private, Local, State, etc. |
| Dam pages | 92,591 | Individual dam profiles |
| **Total** | ~95,500 | |

### Rendering Strategy

Given 95K+ pages, use `force-dynamic` on all database-driven pages:
- Prevents build timeout issues
- Ensures data freshness
- Required for 10K+ page sites

---

## Internal Link Architecture

```
                        [Homepage]
                            |
                   Search + Featured Stats
                            |
         +--------+---------+---------+--------+
         |        |         |         |        |
      [States] [Hazard] [Purpose] [Owner] [Search]
         |        |         |         |
    +----+----+   |    +----+----+   |
    |    |    |   |    |    |    |   |
   [CA] [TX] [FL] |   [Rec][WS][FC] [Federal]
    |             |         |           |
+---+---+     +---+---+ +---+---+   +---+---+
|   |   |     |   |   | |   |   |   |   |   |
[LA][SF][SD] [High][Sig] [Dam][Dam] [Dam][Dam]
 |            Hazard      Pages     Pages
[Dam Pages]   Dams
```

### Link Requirements

1. **Every dam page links to:**
   - Parent state and county
   - Same hazard level page
   - Same purpose page
   - Same owner type page
   - 3-5 nearby dams (by lat/lng)
   - State dam safety office

2. **Every hub page links to:**
   - All child pages (with pagination if >50)
   - Parent hub
   - Related hubs

3. **Breadcrumbs on every page:**
   - Home > States > California > Los Angeles County > [Dam Name]
   - Home > Hazard > High > [Dam Name]

---

## SEO Considerations

### Title Templates

- Homepage: `US Dams Database - 92,000+ Dams Across America`
- State: `Dams in [State] - [Count] Dams, Safety Info & Map`
- County: `Dams in [County], [State] - Complete Database`
- Dam: `[Dam Name] - [City], [State] | Dam Info & Safety Data`
- Hazard: `[Level] Hazard Dams in the US - [Count] Dams`
- Purpose: `[Purpose] Dams - US Dam Database`

### Meta Descriptions

Focus on:
- Number of records (authority signal)
- Safety information (user intent)
- Location specificity
- Actionable information

### Schema.org Markup

- Place schema for dam locations
- Dataset schema for the database
- BreadcrumbList for navigation
- FAQPage for common questions

---

## Component Library

### Cards
- DamCard: Preview with name, location, hazard badge, key stats
- StateCard: State with dam count, high hazard count
- CountyCard: County with dam count

### Data Display
- HazardBadge: Color-coded (High=red, Significant=orange, Low=green)
- StatBlock: Key metrics with labels
- ConditionIndicator: Visual assessment display
- AgeDisplay: Years since construction

### Navigation
- Breadcrumbs: Hierarchical navigation
- FilterSidebar: Multi-facet filtering
- SearchAutocomplete: Type-ahead dam search
- NearbyDams: Location-based suggestions

### Maps
- DamLocationMap: Single dam pin with basic info
- RegionMap: State/county overview with dam pins

---

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: magic-ui + shadcn/ui
- **Maps**: Leaflet or Mapbox (TBD based on usage)
- **Hosting**: Vercel

---

## Data Freshness Strategy

1. **Initial Load**: Full CSV import via batch script
2. **Updates**: Check NID API monthly for new data
3. **Automation**: GitHub Actions workflow to:
   - Check for CSV update date
   - Download if newer
   - Run delta import
   - Trigger revalidation

---

## Phase Checklist

- [x] Data downloaded and analyzed (83 fields, 92,591 records)
- [x] Feature decisions documented with research
- [x] Database schema designed
- [x] Route architecture planned
- [x] Internal link structure defined
- [ ] Next.js project initialized
- [ ] Supabase project created
- [ ] Tables created and data ingested
