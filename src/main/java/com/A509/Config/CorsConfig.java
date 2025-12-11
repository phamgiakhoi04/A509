package com.A509.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Áp dụng cho tất cả API
                        .allowedOrigins("*") // Cho phép MỌI nguồn truy cập (Dùng cho dev)
                        // .allowedOrigins("http://localhost:3000") // Sau này làm thật thì dùng dòng này
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Cho phép các phương thức này
                        .allowedHeaders("*") // Cho phép mọi header
                        .allowCredentials(false) // Tắt credentials khi dùng "*"
                        .maxAge(3600);
            }
        };
    }
}