ALTER TABLE schools ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

UPDATE schools
SET profile_completed = TRUE
WHERE name IS NOT NULL AND TRIM(name) != ''
  AND email IS NOT NULL AND TRIM(email) != ''
  AND phone IS NOT NULL AND TRIM(phone) != ''
  AND address IS NOT NULL AND TRIM(address) != ''
  AND city IS NOT NULL AND TRIM(city) != ''
  AND region IS NOT NULL AND TRIM(region) != ''
  AND school_type IS NOT NULL AND TRIM(school_type) != '';
