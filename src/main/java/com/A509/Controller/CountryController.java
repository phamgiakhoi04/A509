package com.A509.Controller;

import com.A509.Entity.Country;
import com.A509.Service.CountryService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/countries")
public class CountryController {

    @Autowired
    private CountryService countryService;

    @Autowired
    private Cloudinary cloudinary;

    @GetMapping
    public List<Country> getAllCountries() {
        return countryService.getAllCountries();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCountryById(@PathVariable Long id) {
        return countryService.getCountryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> addCountry(
            @RequestParam("countryName") String countryName,
            @RequestParam(value = "continent", required = false) String continent,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "flagFile", required = false) MultipartFile flagFile
    ) {
        try {
            Country country = new Country();
            country.setCountryName(countryName);
            country.setContinent(continent);
            country.setDescription(description);

            if (flagFile != null && !flagFile.isEmpty()) {
                Map uploadResult = cloudinary.uploader().upload(flagFile.getBytes(),
                        ObjectUtils.asMap("folder", "countries/flags", "resource_type", "auto"));
                country.setFlagImageUrl(uploadResult.get("secure_url").toString());
            }

            return ResponseEntity.ok(countryService.addCountry(country));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Lỗi khi upload file: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCountry(
            @PathVariable Long id,
            @RequestParam("countryName") String countryName,
            @RequestParam(value = "continent", required = false) String continent,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "flagFile", required = false) MultipartFile flagFile
    ) {
        try {
            Country existingCountry = countryService.getCountryById(id)
                    .orElseThrow(() -> new RuntimeException("Quốc gia không tồn tại"));

            existingCountry.setCountryName(countryName);
            existingCountry.setContinent(continent);
            existingCountry.setDescription(description);

            if (flagFile != null && !flagFile.isEmpty()) {
                if (existingCountry.getFlagImageUrl() != null && existingCountry.getFlagImageUrl().contains("cloudinary.com")) {
                    String publicId = extractPublicId(existingCountry.getFlagImageUrl());
                    if (publicId != null) {
                        try {
                            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                        } catch (IOException e) {
                            System.err.println("Không thể xóa ảnh cũ: " + e.getMessage());
                        }
                    }
                }

                Map uploadResult = cloudinary.uploader().upload(flagFile.getBytes(),
                        ObjectUtils.asMap("folder", "countries/flags", "resource_type", "auto"));
                existingCountry.setFlagImageUrl(uploadResult.get("secure_url").toString());
            }

            return ResponseEntity.ok(countryService.updateCountry(id, existingCountry));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Lỗi khi upload file: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCountry(@PathVariable Long id) {
        try {
            Country country = countryService.getCountryById(id)
                    .orElseThrow(() -> new RuntimeException("Quốc gia không tồn tại"));

            if (country.getFlagImageUrl() != null && country.getFlagImageUrl().contains("cloudinary.com")) {
                String publicId = extractPublicId(country.getFlagImageUrl());
                if (publicId != null) {
                    try {
                        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                    } catch (IOException e) {
                        System.err.println("Không thể xóa ảnh: " + e.getMessage());
                    }
                }
            }

            countryService.deleteCountry(id);
            return ResponseEntity.ok("Xóa quốc gia thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private String extractPublicId(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("cloudinary.com")) {
            return null;
        }
        String[] parts = imageUrl.split("/upload/");
        if (parts.length < 2) return null;
        String pathAfterUpload = parts[1];
        int extensionIndex = pathAfterUpload.lastIndexOf('.');
        if (extensionIndex > 0) {
            return pathAfterUpload.substring(0, extensionIndex);
        }
        return pathAfterUpload;
    }
}