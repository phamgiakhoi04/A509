USE a509_db;

-- Country cards only need a name, optional continent and flag image.
SET @drop_country_description = (
    SELECT IF(
        EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'countries'
              AND COLUMN_NAME = 'description'
        ),
        'ALTER TABLE countries DROP COLUMN description',
        'SELECT 1'
    )
);
PREPARE stmt FROM @drop_country_description;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Uniform descriptions contain the descriptive content; material is not used.
SET @drop_uniform_material = (
    SELECT IF(
        EXISTS(
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'uniforms'
              AND COLUMN_NAME = 'material'
        ),
        'ALTER TABLE uniforms DROP COLUMN material',
        'SELECT 1'
    )
);
PREPARE stmt FROM @drop_uniform_material;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
