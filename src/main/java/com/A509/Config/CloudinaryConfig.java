package com.A509.Config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "YOUR_CLOUD_NAME"); // Điền tên cloud của bạn
        config.put("api_key", "YOUR_API_KEY");       // Điền API Key
        config.put("api_secret", "YOUR_API_SECRET"); // Điền API Secret
        return new Cloudinary(config);
    }
}