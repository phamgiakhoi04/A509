package com.A509.Repository;

import com.A509.Entity.ArticleImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleImageRepository
        extends JpaRepository<ArticleImage, Long> {

    List<ArticleImage> findByArticleIdOrderBySortOrderAsc(Long articleId);
}