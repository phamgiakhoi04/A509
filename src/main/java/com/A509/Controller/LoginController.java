package com.A509.Controller;

import com.A509.DTO.AuthDTO;
import com.A509.DTO.LoginDTO;
import com.A509.Service.LoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    @Autowired
    private LoginService loginService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        try {
            AuthDTO response = loginService.authenticateAndGetToken(loginDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Đăng nhập thất bại: " + e.getMessage());
        }
    }
}