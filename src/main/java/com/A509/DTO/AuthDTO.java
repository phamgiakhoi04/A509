package com.A509.DTO;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthDTO {
    private String token;
    private UserDTO userInfo;
}