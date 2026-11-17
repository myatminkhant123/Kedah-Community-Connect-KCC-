-- Migration: 0002_seed_categories.sql
-- Seed initial issue categories and fictional demo departments for Kedah Community Connect

INSERT OR IGNORE INTO categories (id, name, description, is_active) VALUES
  ('cat_roads', 'Roads and footpaths', 'Potholes, damaged tarmac, cracked pavements, and road markings', 1),
  ('cat_lighting', 'Street lighting', 'Malfunctioning, flickering, or unlit street lamps and walkway lights', 1),
  ('cat_drainage', 'Drainage and flooding', 'Blocked drains, flash flooding hotspots, and broken culverts', 1),
  ('cat_waste', 'Waste and cleanliness', 'Illegal dumping, overflowing bins, and uncollected refuse', 1),
  ('cat_facilities', 'Public facilities', 'Damaged bus shelters, community halls, signage, and public toilets', 1),
  ('cat_parks', 'Parks and public spaces', 'Overgrown grass, fallen trees, and playground maintenance', 1),
  ('cat_other', 'Other', 'Community issues not covered by standard categories', 1);

INSERT OR IGNORE INTO departments (id, name, description, is_active, created_at) VALUES
  ('dept_public_works', 'Kedah Public Works Unit (Demo)', 'Handles road surfaces, footpaths, and structural public facilities', 1, '2026-01-01T00:00:00.000Z'),
  ('dept_lighting', 'Street Lighting & Electrical Unit (Demo)', 'Maintains public street lamps and electrical poles', 1, '2026-01-01T00:00:00.000Z'),
  ('dept_drainage', 'Drainage & Flood Mitigation Unit (Demo)', 'Maintains storm drains, culverts, and flood-prone corridors', 1, '2026-01-01T00:00:00.000Z'),
  ('dept_sanitation', 'Waste & Environmental Cleanliness Unit (Demo)', 'Manages municipal waste collection and cleanliness response', 1, '2026-01-01T00:00:00.000Z'),
  ('dept_parks', 'Parks & Landscaping Unit (Demo)', 'Maintains recreational parks, trees, and green spaces', 1, '2026-01-01T00:00:00.000Z');
