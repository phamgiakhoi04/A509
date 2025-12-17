package com.A509.Controller;

import com.A509.DTO.UniformDTO;
import com.A509.Entity.Uniform;
import com.A509.Service.UniformService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/uniforms")
public class UniformController {

    @Autowired
    private UniformService uniformService;

    @GetMapping
    public List<Uniform> getAll() {
        return uniformService.getAllUniforms();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Optional<Uniform> uniform = uniformService.getUniformById(id);
        if (uniform.isPresent()) {
            return ResponseEntity.ok(uniform.get());
        } else {
            return ResponseEntity.status(404).body("Không tìm thấy quân phục với ID: " + id);
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(@ModelAttribute UniformDTO uniformDTO) {
        try {
            Uniform result = uniformService.addUniform(uniformDTO);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Lỗi khi upload ảnh: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UniformDTO uniformDTO) {
        try {
            Uniform updatedUniform = uniformService.updateUniform(id, uniformDTO);
            return ResponseEntity.ok(updatedUniform);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            uniformService.deleteUniform(id);
            return ResponseEntity.ok("Đã xóa thành công quân phục có ID: " + id);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}