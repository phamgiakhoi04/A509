USE a509_db;

-- Period cards are real categories under each country's force.  They are no
-- longer hard-coded in the frontend, so administrators can add/edit/delete
-- them from Quản lý Phục dựng.
SET @has_slug = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'uniform_categories'
      AND COLUMN_NAME = 'slug'
);
SET @add_slug = IF(@has_slug = 0,
    'ALTER TABLE uniform_categories ADD COLUMN slug VARCHAR(255) NULL',
    'SELECT 1');
PREPARE stmt FROM @add_slug;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Keep this migration usable on a database that has not yet run the country
-- scoping script.  Existing forces are assigned to the existing Vietnam row;
-- newly-created forces must be assigned by the admin UI.
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

INSERT INTO uniform_categories
    (category_name, slug, description, parent_id, country_id, category_type, sort_order)
SELECT periods.category_name, periods.slug, periods.description,
       force_category.category_id, force_category.country_id,
       'REENACTMENT', periods.sort_order
FROM (
    SELECT 'Thời kỳ tiền khởi nghĩa (1944–1945)' AS category_name, 'thoi-ky-tien-khoi-nghia' AS slug, 'Giai đoạn phục dựng' AS description, 1 AS sort_order
    UNION ALL SELECT 'Kháng chiến chống Pháp (1945–1954)', 'khang-chien-chong-phap', 'Giai đoạn phục dựng', 2
    UNION ALL SELECT 'Kháng chiến chống Mỹ (1955–1975)', 'khang-chien-chong-my', 'Giai đoạn phục dựng', 3
    UNION ALL SELECT 'Chiến tranh biên giới Tây Nam (1978–1989)', 'chien-tranh-bien-gioi-tay-nam', 'Giai đoạn phục dựng', 4
    UNION ALL SELECT 'Chiến tranh biên giới phía Bắc (1979)', 'chien-tranh-bien-gioi-phia-bac', 'Giai đoạn phục dựng', 5
    UNION ALL SELECT 'Thời kỳ đổi mới và phát triển (1986–nay)', 'thoi-ky-doi-moi-va-phat-trien', 'Giai đoạn phục dựng', 6
) periods
JOIN uniform_categories force_category
  ON force_category.category_type = 'REENACTMENT'
 AND force_category.parent_id IS NOT NULL
 AND force_category.country_id IS NOT NULL
JOIN uniform_categories root_category
  ON root_category.category_id = force_category.parent_id
 AND root_category.parent_id IS NULL
 AND root_category.category_type = 'REENACTMENT'
LEFT JOIN uniform_categories existing
  ON existing.parent_id = force_category.category_id
 AND existing.slug = periods.slug
WHERE existing.category_id IS NULL;
