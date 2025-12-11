package com.A509.Service;

import com.A509.DTO.AuthDTO;
import com.A509.DTO.LoginDTO;
import com.A509.DTO.UserDTO;
import com.A509.Entity.User;
import com.A509.Repository.UserRepository;
import com.A509.Untils.JwtUntilHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class LoginService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUntilHelper jwtUntilHelper;

    @Autowired
    private UserRepository userRepository;

    public AuthDTO authenticateAndGetToken(LoginDTO loginDTO) {
        // 1. Xác thực Username/Password
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDTO.getUsername(), loginDTO.getPassword())
        );

        if (authentication.isAuthenticated()) {
            // 2. Nếu đúng -> Tạo Token
            String token = jwtUntilHelper.generateToken(loginDTO.getUsername());

            // 3. Lấy thông tin User từ DB
            User user = userRepository.findByUsername(loginDTO.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 4. Map Entity -> UserDTO
            UserDTO userDTO = UserDTO.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .phoneNumber(user.getPhoneNumber())
                    .status(user.isStatus())
                    .roleName(user.getRole().getName()) // Map Role Object -> String Name
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .build();

            // 5. Trả về Token kèm UserDTO
            return AuthDTO.builder()
                    .token(token)
                    .userInfo(userDTO)
                    .build();
        } else {
            throw new RuntimeException("Xác thực thất bại");
        }
    }
}