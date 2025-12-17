package com.A509.DTO;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProfileDTO {
    private String fullName;
    private String phoneNumber;
    private String email;
    private MultipartFile avatarFile;
}