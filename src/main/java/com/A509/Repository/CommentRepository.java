package com.A509.Repository;

import com.A509.Entity.Comment; // Nhớ import Entity số ít
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 1. Lấy tất cả bình luận của một bộ quân phục (Để hiển thị dưới bài viết)
    List<Comment> findByUniformId(Long uniformId);

    // 2. Lấy tất cả bình luận của một người dùng (Để xem lịch sử comment của user đó)
    List<Comment> findByUserId(Long userId);
}