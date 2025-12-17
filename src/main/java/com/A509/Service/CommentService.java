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
            throw new RuntimeException("Bộ quân phục không tồn tại!");
        }

        List<Comment> comments = commentRepository.findByUniform_IdOrderByCreatedAtDesc(uniformId);
        return comments.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public CommentDTO addComment(CommentDTO dto) {
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new RuntimeException("Nội dung bình luận không được để trống!");
        }

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        Uniform uniform = uniformRepository.findById(dto.getUniformId())
                .orElseThrow(() -> new RuntimeException("Bộ quân phục không tồn tại!"));

        Comment comment = new Comment();
        comment.setContent(dto.getContent());
        comment.setUser(user);
        comment.setUniform(uniform);

        Comment savedComment = commentRepository.save(comment);
        return convertToDTO(savedComment);
    }

    @Transactional
    public CommentDTO updateComment(Long id, String newContent) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bình luận không tồn tại"));

        if (newContent == null || newContent.trim().isEmpty()) {
            throw new RuntimeException("Nội dung không được để trống!");
        }

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!comment.getUser().getUsername().equals(currentUsername)) {
            throw new RuntimeException("Bạn chỉ có thể sửa bình luận của chính mình!");
        }

        comment.setContent(newContent);

        Comment updatedComment = commentRepository.save(comment);
        return convertToDTO(updatedComment);
    }

    @Transactional
    public void deleteComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bình luận không tồn tại"));

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN") || a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !comment.getUser().getUsername().equals(currentUsername)) {
            throw new RuntimeException("Bạn không có quyền xóa bình luận này!");
        }

        commentRepository.delete(comment);
    }

    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setUsername(comment.getUser().getUsername());
        dto.setUniformId(comment.getUniform().getId());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }
}