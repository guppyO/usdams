-- US Dams Database Schema
-- Created: 2026-01-28

-- Drop existing tables if they exist (for fresh start)
DROP TABLE IF EXISTS dams CASCADE;
DROP TABLE IF EXISTS counties CASCADE;
DROP TABLE IF EXISTS states CASCADE;
DROP TABLE IF EXISTS purposes CASCADE;
DROP TABLE IF EXISTS owner_types CASCADE;

-- States lookup table
CREATE TABLE states (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  abbreviation VARCHAR(10),
  slug VARCHAR(100) UNIQUE NOT NULL,
  dam_count INTEGER DEFAULT 0,
  high_hazard_count INTEGER DEFAULT 0,
  dam_safety_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Counties lookup table
CREATE TABLE counties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
  slug VARCHAR(200) UNIQUE NOT NULL,
  dam_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, state_id)
);

-- Purposes lookup table
CREATE TABLE purposes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  dam_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Owner types lookup table
CREATE TABLE owner_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  dam_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

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
  state_id INTEGER REFERENCES states(id),
  county VARCHAR(100),
  county_id INTEGER REFERENCES counties(id),
  city VARCHAR(100),
  distance_to_city DECIMAL(6, 2),
  river_name VARCHAR(255),
  congressional_district VARCHAR(100),
  tribal_land VARCHAR(255),

  -- Ownership
  owner_names TEXT,
  owner_types VARCHAR(100),
  primary_owner_type VARCHAR(50),
  primary_owner_type_id INTEGER REFERENCES owner_types(id),
  non_federal_on_federal BOOLEAN,

  -- Purpose
  primary_purpose VARCHAR(50),
  primary_purpose_id INTEGER REFERENCES purposes(id),
  purposes TEXT,

  -- Source
  source_agency VARCHAR(100),
  state_agency_id VARCHAR(100),

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

  -- Spillway & Discharge
  max_discharge_cfs DECIMAL(12, 2),
  spillway_type VARCHAR(50),
  spillway_width_ft DECIMAL(8, 2),
  outlet_gate_type VARCHAR(100),

  -- Locks (navigation)
  number_of_locks INTEGER,
  lock_length_ft DECIMAL(8, 2),
  lock_width_ft DECIMAL(8, 2),

  -- Regulation
  state_regulated BOOLEAN,
  state_jurisdictional BOOLEAN,
  state_regulatory_agency VARCHAR(255),
  federally_regulated BOOLEAN,

  -- Safety & Inspection
  hazard_potential VARCHAR(20),
  condition_assessment VARCHAR(50),
  condition_assessment_date DATE,
  last_inspection_date DATE,
  inspection_frequency DECIMAL(6, 2),
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

-- Create indexes for performance
CREATE INDEX idx_dams_state ON dams(state);
CREATE INDEX idx_dams_state_id ON dams(state_id);
CREATE INDEX idx_dams_county ON dams(county);
CREATE INDEX idx_dams_county_id ON dams(county_id);
CREATE INDEX idx_dams_hazard ON dams(hazard_potential);
CREATE INDEX idx_dams_purpose ON dams(primary_purpose);
CREATE INDEX idx_dams_purpose_id ON dams(primary_purpose_id);
CREATE INDEX idx_dams_owner_type ON dams(primary_owner_type);
CREATE INDEX idx_dams_owner_type_id ON dams(primary_owner_type_id);
CREATE INDEX idx_dams_lat_lng ON dams(latitude, longitude);
CREATE INDEX idx_dams_slug ON dams(slug);
CREATE INDEX idx_dams_height ON dams(nid_height_ft);
CREATE INDEX idx_dams_year ON dams(year_completed);
CREATE INDEX idx_dams_nid_id ON dams(nid_id);

-- Enable RLS (Row Level Security) but allow public read
ALTER TABLE dams ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_types ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read on dams" ON dams FOR SELECT USING (true);
CREATE POLICY "Allow public read on states" ON states FOR SELECT USING (true);
CREATE POLICY "Allow public read on counties" ON counties FOR SELECT USING (true);
CREATE POLICY "Allow public read on purposes" ON purposes FOR SELECT USING (true);
CREATE POLICY "Allow public read on owner_types" ON owner_types FOR SELECT USING (true);
