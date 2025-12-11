package com.A509.Service;

import com.A509.Entity.Image;
import com.A509.Entity.Uniform;
import com.A509.Repository.ImageRepository;
import com.A509.Repository.UniformRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ImageService {

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private UniformRepository uniformRepository;

    // 1. Lấy tất cả ảnh (ít dùng, thường dùng get theo Uniform hơn)
    public List<Image> getAllImages() {
        return imageRepository.findAll();
    }

    // 2. Lấy danh sách ảnh của một bộ quân phục (Dùng để hiển thị Album ảnh)
    public List<Image> getImagesByUniformId(Long uniformId) {
        // Kiểm tra xem uniform có tồn tại không cho chắc chắn
        if (!uniformRepository.existsById(uniformId)) {
            throw new RuntimeException("Quân phục không tồn tại!");
        }
        return imageRepository.findByUniformId(uniformId);
    }

    // 3. Lấy chi tiết 1 tấm ảnh
    public Optional<Image> getImageById(Long id) {
        return imageRepository.findById(id);
    }

    // 4. Thêm ảnh mới (Lưu đường dẫn URL ảnh)
    public Image addImage(Image image) {
        // Validation: Phải có uniform_id gửi kèm
        if (image.getUniform() == null || image.getUniform().getId() == null) {
            throw new RuntimeException("Lỗi: Hình ảnh phải thuộc về một bộ quân phục nào đó (thiếu uniform_id).");
        }

        // Kiểm tra Uniform có tồn tại trong DB không
        Uniform uniform = uniformRepository.findById(image.getUniform().getId())
                .orElseThrow(() -> new RuntimeException("Bộ quân phục (Uniform) không tồn tại!"));

        // Gán object Uniform vào Image để Hibernate lưu khóa ngoại
        image.setUniform(uniform);

        return imageRepository.save(image);
    }

    // 5. Cập nhật thông tin ảnh (Ví dụ: sửa mô tả, sửa link ảnh)
    public Image updateImage(Long id, Image imageDetails) {
        Image existingImage = imageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hình ảnh không tồn tại"));

        existingImage.setImageUrl(imageDetails.getImageUrl());
        existingImage.setDescription(imageDetails.getDescription());

        // Nếu muốn cho phép chuyển ảnh sang bộ quân phục khác:
        if (imageDetails.getUniform() != null && imageDetails.getUniform().getId() != null) {
            Uniform newUniform = uniformRepository.findById(imageDetails.getUniform().getId())
                    .orElseThrow(() -> new RuntimeException("Bộ quân phục mới không tồn tại!"));
            existingImage.setUniform(newUniform);
        }

        return imageRepository.save(existingImage);
    }

    // 6. Xóa ảnh
    public void deleteImage(Long id) {
        if (!imageRepository.existsById(id)) {
            throw new RuntimeException("Hình ảnh không tồn tại");
        }
        imageRepository.deleteById(id);
    }
}