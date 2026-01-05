package com.A509.Controller;

import com.A509.DTO.ProfileDTO;
import com.A509.DTO.UserDTO;
import com.A509.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getMyProfile() {
        return ResponseEntity.ok(userService.getMyProfile(getCurrentUsername()));
    }

    @PostMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfile(
            @RequestPart(value = "fullName", required = false) String fullName,
            @RequestPart(value = "phoneNumber", required = false) String phoneNumber,
            @RequestPart(value = "email", required = false) String email,
            @RequestPart(value = "avatarFile", required = false) MultipartFile avatarFile) {

        ProfileDTO dto = new ProfileDTO();
        dto.setFullName(fullName);
        dto.setPhoneNumber(phoneNumber);
        dto.setEmail(email);
        dto.setAvatarFile(avatarFile);

        try {
            UserDTO updatedUser = userService.updateProfile(getCurrentUsername(), dto);
            return ResponseEntity.ok(updatedUser);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Lỗi upload ảnh: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}