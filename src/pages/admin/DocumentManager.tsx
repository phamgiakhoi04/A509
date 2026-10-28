import NewsManager from "./NewsManager";

/**
 * Tài liệu đang dùng chung kho bài viết để admin có thể đăng nội dung/ảnh
 * ngay. Giữ component riêng để sau này tách sang document API không ảnh hưởng route.
 */
export default function DocumentManager() {
  return <NewsManager title="Quản lý tài liệu" itemLabel="tài liệu" scope="documents" />;
}
