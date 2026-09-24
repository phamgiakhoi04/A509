USE a509_db;

-- A force is a child of the REENACTMENT root and must belong to one country.
-- The root category itself remains country-independent.
SET @has_country_id = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'uniform_categories'
      AND COLUMN_NAME = 'country_id'
);
SET @add_country_id = IF(@has_country_id = 0,
    'ALTER TABLE uniform_categories ADD COLUMN country_id BIGINT NULL',
    'SELECT 1');
PREPARE stmt FROM @add_country_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_country_fk = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'uniform_categories'
      AND CONSTRAINT_NAME = 'fk_uniform_categories_country'
);
SET @add_country_fk = IF(@has_country_fk = 0,
    'ALTER TABLE uniform_categories ADD CONSTRAINT fk_uniform_categories_country FOREIGN KEY (country_id) REFERENCES countries(country_id)',
    'SELECT 1');
PREPARE stmt FROM @add_country_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Existing force rows belong to the existing Vietnam country.  New rows must
-- always be created with an explicit country from the admin UI.
SET @vietnam_id = (
    SELECT country_id FROM countries
    WHERE country_name IN ('Việt Nam', 'Vietnam')
    ORDER BY country_id
    LIMIT 1
);
UPDATE uniform_categories
SET country_id = @vietnam_id
WHERE category_type = 'REENACTMENT'
  AND parent_id IS NOT NULL
  AND country_id IS NULL
  AND @vietnam_id IS NOT NULL;
