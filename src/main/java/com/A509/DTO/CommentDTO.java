package com.A509.DTO;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentDTO {
    private Long id;
    private String content;
    private Long uniformId;
    private String username;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}