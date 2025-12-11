package com.A509.Service;

import com.A509.DTO.LoginDTO;
import com.A509.DTO.RegisterDTO;
import com.A509.Entity.Role;
import com.A509.Entity.User;
import com.A509.Repository.RoleRepository;
import com.A509.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Đang là NoOp (không mã hóa)

    // --- ĐĂNG KÝ ---
    public User registerUser(RegisterDTO registerDTO) {
        // 1. Kiểm tra trùng lặp
        if (userRepository.existsByUsername(registerDTO.getUsername())) {
            throw new RuntimeException("Username đã tồn tại!");
        }
        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        // 2. Tạo User mới
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setFullName(registerDTO.getFullName());
        user.setPhoneNumber(registerDTO.getPhoneNumber());

        // 3. Lưu mật khẩu (Do dùng NoOp nên nó sẽ lưu y nguyên text thô)
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));

        // 4. Gán Role mặc định (ID 1 - USER)
        Role defaultRole = roleRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Lỗi: Chưa có Role ID=1 trong Database!"));
        user.setRole(defaultRole);

        user.setStatus(true); // Active

        return userRepository.save(user);
    }

    // --- ĐĂNG NHẬP ---
    public User loginUser(LoginDTO loginDTO) {
        // 1. Tìm user
        User user = userRepository.findByUsername(loginDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("Sai tên đăng nhập hoặc mật khẩu!"));

        // 2. So sánh mật khẩu
        // .matches() của NoOp sẽ so sánh chuỗi thường (String.equals)
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new RuntimeException("Sai tên đăng nhập hoặc mật khẩu!");
        }

        // 3. Kiểm tra khóa
        if (!user.isStatus()) {
            throw new RuntimeException("Tài khoản đã bị khóa!");
        }

        return user;
    }
}