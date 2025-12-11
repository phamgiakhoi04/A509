package com.A509.Controller;

import com.A509.Entity.Image;
import com.A509.Service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Autowired
    private ImageService imageService;

    // GET: Lấy ảnh theo Uniform ID (Để hiển thị album)
    @GetMapping("/uniform/{uniformId}")
    public List<Image> getByUniform(@PathVariable Long uniformId) {
        return imageService.getImagesByUniformId(uniformId);
    }

    // POST: Thêm ảnh (JSON cần có { "uniform": { "id": 1 }, "imageUrl": "..." })
    @PostMapping
    public ResponseEntity<?> addImage(@RequestBody Image image) {
        try {
            return ResponseEntity.ok(imageService.addImage(image));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE: Xóa ảnh
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteImage(@PathVariable Long id) {
        try {
            imageService.deleteImage(id);
            return ResponseEntity.ok("Xóa ảnh thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}