package com.A509.Controller;

import com.A509.Service.ForgotPasswordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class ForgotPasswordController {

    @Autowired
    private ForgotPasswordService forgotPasswordService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email").trim();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body("Vui lòng nhập email!");
            }

            String response = forgotPasswordService.forgotPassword(email);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            String token = body.get("token");
            String newPassword = body.get("newPassword");

            if (token == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Thiếu thông tin token hoặc mật khẩu mới!");
            }

            forgotPasswordService.resetPassword(token, newPassword);
            return ResponseEntity.ok("Đổi mật khẩu thành công! Hãy đăng nhập lại.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}