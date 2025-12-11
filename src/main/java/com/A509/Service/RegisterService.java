package com.A509.Service;

import com.A509.DTO.RegisterDTO;
import com.A509.DTO.UserDTO;
import com.A509.Entity.Role;
import com.A509.Entity.User;
import com.A509.Repository.RoleRepository;
import com.A509.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RegisterService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    public UserDTO registerNewUser(RegisterDTO registerDTO) {
        // 1. Validate
        if (userRepository.existsByUsername(registerDTO.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }
        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        // 2. Lấy Role USER mặc định
        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Lỗi hệ thống: Không tìm thấy quyền USER."));

        // 3. Tạo Entity User từ RegisterDTO
        User newUser = new User();
        newUser.setUsername(registerDTO.getUsername());
        newUser.setEmail(registerDTO.getEmail());
        newUser.setPassword(registerDTO.getPassword()); // Lưu ý: Chưa mã hóa (Demo)
        newUser.setFullName(registerDTO.getFullName());
        newUser.setPhoneNumber(registerDTO.getPhoneNumber());
        newUser.setRole(userRole);
        newUser.setStatus(true); // Mặc định true như trong Entity

        // 4. Lưu vào DB
        User savedUser = userRepository.save(newUser);

        // 5. Chuyển đổi Entity sang UserDTO để trả về
        return convertToUserDTO(savedUser);
    }

    // Hàm tiện ích: Map Entity -> DTO
    private UserDTO convertToUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .status(user.isStatus())
                .roleName(user.getRole().getName()) // Lấy tên Role
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}