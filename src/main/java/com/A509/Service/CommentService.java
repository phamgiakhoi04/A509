package com.A509.Service;

import com.A509.DTO.CommentDTO;
import com.A509.Entity.Comment;
import com.A509.Entity.Uniform;
import com.A509.Entity.User;
import com.A509.Repository.CommentRepository;
import com.A509.Repository.UniformRepository;
import com.A509.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UniformRepository uniformRepository;

    public List<CommentDTO> getCommentsByUniformId(Long uniformId) {
        if (!uniformRepository.existsById(uniformId)) {
            throw new RuntimeException("Quân trang không tồn tại!");
        }

        List<Comment> comments = commentRepository.findByUniform_IdOrderByCreatedAtDesc(uniformId);
        return comments.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public CommentDTO addComment(CommentDTO dto) {
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new RuntimeException("Nội dung bình luận không được để trống!");
        }

        User user = getCurrentUser();
        Uniform uniform = uniformRepository.findById(dto.getUniformId())
                .orElseThrow(() -> new RuntimeException("Quân trang không tồn tại!"));

        Comment comment = Comment.builder()
                .content(dto.getContent().trim())
                .user(user)
                .uniform(uniform)
                .build();

        Comment saved = commentRepository.save(comment);
        return convertToDTO(saved);
    }

    @Transactional
    public CommentDTO updateComment(Long id, String newContent) {
        if (newContent == null || newContent.trim().isEmpty()) {
            throw new RuntimeException("Nội dung không được để trống!");
        }

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bình luận không tồn tại"));

        User currentUser = getCurrentUser();

        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn chỉ có thể sửa bình luận của chính mình!");
        }

        comment.setContent(newContent.trim());
        Comment updated = commentRepository.save(comment);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bình luận không tồn tại"));

        User currentUser = getCurrentUser();
        boolean isAdmin = isCurrentUserAdmin();

        if (!isAdmin && !comment.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa bình luận này!");
        }

        commentRepository.delete(comment);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
    }

    private boolean isCurrentUserAdmin() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN") || a.getAuthority().equals("ROLE_ADMIN"));
    }

    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setUniformId(comment.getUniform().getId());
        dto.setUserId(comment.getUser().getId());
        dto.setUsername(comment.getUser().getUsername());
        dto.setUserAvatarUrl(comment.getUser().getAvatarUrl());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }
}