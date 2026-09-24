-- Xóa dữ liệu mẫu phục dựng để bắt đầu nhập lại từ Admin.
-- Không xóa users, roles, articles hoặc categories (bài viết).
-- Chạy trong MySQL Workbench khi đã sao lưu database.
USE a509_db;
START TRANSACTION;

-- Xóa quan hệ phụ thuộc trước khi xóa hiện vật/quốc gia.
DELETE FROM comments WHERE uniform_id IS NOT NULL;
DELETE FROM images WHERE uniform_id IS NOT NULL;
DELETE FROM uniforms;

-- Remove reenactment periods/forces before countries because their
-- country_id and parent_id foreign keys must be cleared first.
DELETE FROM uniform_categories
WHERE category_type = 'REENACTMENT' AND parent_id IS NOT NULL;
DELETE FROM uniform_categories
WHERE category_type = 'REENACTMENT' AND parent_id IS NULL;
DELETE FROM countries;

-- uniform_categories chỉ còn danh mục phục dựng và quân trang.
DELETE FROM uniform_categories WHERE category_type = 'DOCUMENT';

COMMIT;

-- Kiểm tra sau khi chạy:
-- SELECT * FROM countries;
-- SELECT * FROM uniforms;
-- SELECT category_id, category_name, category_type, parent_id
-- FROM uniform_categories ORDER BY category_id;
