package com.A509.Controller;

import com.A509.DTO.RegisterDTO;
import com.A509.DTO.UserDTO;
import com.A509.Service.RegisterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class RegisterController {

    @Autowired
    private RegisterService registerService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDTO registerDTO) {
        try {
            // Gọi service xử lý, nhận về UserDTO (đã ẩn password)
            UserDTO newUser = registerService.registerNewUser(registerDTO);

            // Trả về JSON thông tin user mới tạo
            return ResponseEntity.ok(newUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}