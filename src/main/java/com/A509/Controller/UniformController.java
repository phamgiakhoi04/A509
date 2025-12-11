package com.A509.Controller;

import com.A509.Entity.Uniform;
import com.A509.Service.UniformService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/uniforms")
public class UniformController {

    @Autowired
    private UniformService uniformService;

    // GET: Lấy tất cả (Public)
    @GetMapping
    public List<Uniform> getAll() {
        return uniformService.getAllUniforms();
    }

    // GET: Tìm kiếm theo tên (Ví dụ: /api/uniforms/search?keyword=mu)
    @GetMapping("/search")
    public List<Uniform> search(@RequestParam String keyword) {
        return uniformService.searchUniforms(keyword);
    }

    // GET: Lấy theo Quốc gia (Ví dụ: /api/uniforms/country/1)
    @GetMapping("/country/{countryId}")
    public List<Uniform> getByCountry(@PathVariable Long countryId) {
        return uniformService.getUniformsByCountry(countryId);
    }

    // GET: Chi tiết 1 bộ
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return uniformService.getUniformById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST: Thêm mới (JSON gửi lên phải có { "country": { "id": 1 } })
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Uniform uniform) {
        try {
            return ResponseEntity.ok(uniformService.addUniform(uniform));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT: Sửa
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Uniform uniform) {
        try {
            return ResponseEntity.ok(uniformService.updateUniform(id, uniform));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE: Xóa
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            uniformService.deleteUniform(id);
            return ResponseEntity.ok("Xóa thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}