package com.A509.Controller;

import com.A509.DTO.ArticleDTO;
import com.A509.Service.ArticleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

        // =========================
        // PUBLIC
        // =========================

        @GetMapping
        public ResponseEntity<List<ArticleDTO>> getPublished() {
        return ResponseEntity.ok(articleService.getPublishedArticles());
        }

        @GetMapping("/admin")
        public ResponseEntity<List<ArticleDTO>> getAllForAdmin() {
        return ResponseEntity.ok(articleService.getAllForAdmin());
        }

        @GetMapping("/latest")
        public ResponseEntity<List<ArticleDTO>> getLatest() {

        return ResponseEntity.ok(
                articleService.getLatestArticles()
        );
        }

        @GetMapping("/featured")
        public ResponseEntity<List<ArticleDTO>> getFeatured() {

        return ResponseEntity.ok(
                articleService.getFeaturedArticles()
        );
        }

        @GetMapping("/category/{categorySlug}")
        public ResponseEntity<List<ArticleDTO>> getByCategory(
                @PathVariable String categorySlug
        ) {

        return ResponseEntity.ok(
                articleService.getArticlesByCategory(categorySlug)
        );
        }

        @GetMapping("/{slug}")
        public ResponseEntity<ArticleDTO> getBySlug(
                @PathVariable String slug
        ) {

        return ResponseEntity.ok(
                articleService.getBySlug(slug)
        );
        }

    // =========================
    // ADMIN / USER CÓ QUYỀN
    // =========================

    @PostMapping
    public ResponseEntity<ArticleDTO> create(
            @RequestBody ArticleDTO dto
    ) {

        String username =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        return ResponseEntity.ok(
                articleService.create(dto, username)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArticleDTO> update(
            @PathVariable Long id,
            @RequestBody ArticleDTO dto
    ) {

        return ResponseEntity.ok(
                articleService.update(id, dto)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        articleService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
