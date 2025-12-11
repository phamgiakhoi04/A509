package com.A509.Controller;

import com.A509.Entity.Comment;
import com.A509.Service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // GET: Lấy bình luận theo Uniform
    @GetMapping("/uniform/{uniformId}")
    public List<Comment> getComments(@PathVariable Long uniformId) {
        return commentService.getCommentsByUniformId(uniformId);
    }

    // POST: Viết bình luận (JSON cần { "user": {"id": 1}, "uniform": {"id": 1}, "content": "..." })
    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody Comment comment) {
        try {
            return ResponseEntity.ok(commentService.addComment(comment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE: Xóa bình luận
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        try {
            commentService.deleteComment(id);
            return ResponseEntity.ok("Đã xóa bình luận");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}