package com.A509.DTO;
import lombok.Data;

@Data
public class RegisterDTO {
    private String username;
    private String email;
    private String password;
    private String fullName;
    private String phoneNumber;
}