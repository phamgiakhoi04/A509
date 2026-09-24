package com.A509.DTO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ActivityLogDTO {

    private Long id;

    private String action;
    private String description;

    private LocalDateTime createdAt;

    private Long articleId;
    private String articleSlug;
    private String articleTitle;

    private Long userId;
    private String username;
}
