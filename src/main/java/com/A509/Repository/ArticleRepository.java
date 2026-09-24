package com.A509.Repository;

import com.A509.Entity.Article;
import com.A509.Entity.ArticleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    Optional<Article> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Article> findByStatusAndDeletedAtIsNullOrderByPublishedAtDesc(
            ArticleStatus status
    );

    List<Article> findTop5ByStatusAndDeletedAtIsNullOrderByPublishedAtDesc(
            ArticleStatus status
    );

    List<Article> findTop5ByStatusAndFeaturedTrueAndDeletedAtIsNullOrderByFeaturedOrderAscPublishedAtDesc(
            ArticleStatus status
    );

    List<Article> findTop5ByStatusAndCategoriesSlugAndDeletedAtIsNullOrderByPublishedAtDesc(
            ArticleStatus status,
            String categorySlug
    );
}
