package com.A509.Service;

import com.A509.Entity.Comment;
import com.A509.Entity.Uniform;
import com.A509.Entity.User;
import com.A509.Repository.CommentRepository;
import com.A509.Repository.UniformRepository;
import com.A509.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UniformRepository uniformRepository;

    // 1. Lấy danh sách comment theo ID Quân phục (Dùng nhiều nhất)
    public List<Comment> getCommentsByUniformId(Long uniformId) {
        // Kiểm tra uniform có tồn tại không (Optional)
        if (!uniformRepository.existsById(uniformId)) {
            throw new RuntimeException("Bộ quân phục không tồn tại!");
        }
        return commentRepository.findByUniformId(uniformId);
    }

    // 2. Thêm bình luận mới
    public Comment addComment(Comment comment) {
        // --- VALIDATION (Kiểm tra dữ liệu đầu vào) ---

        // 1. Kiểm tra nội dung
        if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
            throw new RuntimeException("Nội dung bình luận không được để trống!");
        }

        // 2. Kiểm tra User (Người comment có tồn tại không?)
        if (comment.getUser() == null || comment.getUser().getId() == null) {
            throw new RuntimeException("Lỗi: Không xác định được người dùng (User ID thiếu).");
        }
        User user = userRepository.findById(comment.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        // 3. Kiểm tra Uniform (Comment vào bộ nào?)
        if (comment.getUniform() == null || comment.getUniform().getId() == null) {
            throw new RuntimeException("Lỗi: Không xác định được bộ quân phục (Uniform ID thiếu).");
        }
        Uniform uniform = uniformRepository.findById(comment.getUniform().getId())
                .orElseThrow(() -> new RuntimeException("Bộ quân phục không tồn tại!"));

        // --- GÁN DỮ LIỆU ĐẦY ĐỦ ---
        comment.setUser(user);
        comment.setUniform(uniform);

        // Lưu vào DB
        return commentRepository.save(comment);
    }

    // 3. Sửa bình luận (Chỉ cho sửa nội dung và rating)
    public Comment updateComment(Long id, Comment commentDetails) {
        Comment existingComment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bình luận không tồn tại"));

        // Lưu ý: Không cho phép đổi người comment (User) và đổi bộ quân phục (Uniform)
        // Chỉ cập nhật nội dung
        existingComment.setContent(commentDetails.getContent());
        existingComment.setRating(commentDetails.getRating());

        return commentRepository.save(existingComment);
    }

    // 4. Xóa bình luận
    public void deleteComment(Long id) {
        if (!commentRepository.existsById(id)) {
            throw new RuntimeException("Bình luận không tồn tại");
        }
        commentRepository.deleteById(id);
    }
}