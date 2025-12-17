package com.A509.DTO;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String avatarUrl;
    private boolean status;
    private String roleName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}