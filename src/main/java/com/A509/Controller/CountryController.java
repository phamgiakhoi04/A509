package com.A509.Controller;

import com.A509.Entity.Country;
import com.A509.Service.CountryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/countries")
public class CountryController {

    @Autowired
    private CountryService countryService;

    // GET: Lấy danh sách tất cả quốc gia (Ai cũng xem được)
    @GetMapping
    public List<Country> getAllCountries() {
        return countryService.getAllCountries();
    }

    // GET: Lấy chi tiết 1 quốc gia
    @GetMapping("/{id}")
    public ResponseEntity<?> getCountryById(@PathVariable Long id) {
        return countryService.getCountryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST: Thêm quốc gia (Cần Login)
    @PostMapping
    public ResponseEntity<?> addCountry(@RequestBody Country country) {
        try {
            return ResponseEntity.ok(countryService.addCountry(country));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT: Sửa quốc gia
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCountry(@PathVariable Long id, @RequestBody Country country) {
        try {
            return ResponseEntity.ok(countryService.updateCountry(id, country));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE: Xóa quốc gia
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCountry(@PathVariable Long id) {
        try {
            countryService.deleteCountry(id);
            return ResponseEntity.ok("Xóa quốc gia thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}