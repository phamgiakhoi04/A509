package com.A509.DTO;

import lombok.Data;

@Data
public class ArticleImageDTO {

    private Long id;

    private Long articleId;

    private String imageUrl;

    private String description;

    private Integer sortOrder;
}