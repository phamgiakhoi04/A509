package com.A509.DTO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ArticleUpdateDTO {

    private Long articleId;

    private String articleTitle;

    private LocalDateTime updatedAt;

    private int newArticles;

    private int updatedArticles;

    private int newImages;
}