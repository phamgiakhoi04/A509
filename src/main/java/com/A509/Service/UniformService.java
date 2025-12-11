package com.A509.Service;

import com.A509.Entity.Country;
import com.A509.Entity.Uniform;
import com.A509.Repository.CountryRepository;
import com.A509.Repository.UniformRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UniformService {

    @Autowired
    private UniformRepository uniformRepository;

    @Autowired
    private CountryRepository countryRepository;

    // 1. Lấy tất cả
    public List<Uniform> getAllUniforms() {
        return uniformRepository.findAll();
    }

    // 2. Lấy chi tiết 1 bộ theo ID
    public Optional<Uniform> getUniformById(Long id) {
        return uniformRepository.findById(id);
    }

    // 3. Lấy list quân phục theo ID quốc gia
    public List<Uniform> getUniformsByCountry(Long countryId) {
        return uniformRepository.findByCountryId(countryId);
    }

    // 4. Tìm kiếm quân phục
    public List<Uniform> searchUniforms(String keyword) {
        return uniformRepository.findByNameContainingIgnoreCase(keyword);
    }

    // 5. Thêm mới quân phục
    public Uniform addUniform(Uniform uniform) {
        // Kiểm tra trùng tên
        if (uniformRepository.existsByName(uniform.getName())) {
            throw new RuntimeException("Tên quân phục '" + uniform.getName() + "' đã tồn tại!");
        }

        // Kiểm tra xem người dùng có gửi kèm ID quốc gia không
        if (uniform.getCountry() == null || uniform.getCountry().getId() == null) {
            throw new RuntimeException("Vui lòng chọn quốc gia cho bộ quân phục này!");
        }

        // Kiểm tra xem ID quốc gia đó có tồn tại trong DB không
        Country country = countryRepository.findById(uniform.getCountry().getId())
                .orElseThrow(() -> new RuntimeException("Quốc gia đã chọn không tồn tại!"));

        // Gán object Country chính xác vào Uniform để Hibernate lưu khóa ngoại
        uniform.setCountry(country);

        return uniformRepository.save(uniform);
    }

    // 6. Cập nhật quân phục
    public Uniform updateUniform(Long id, Uniform uniformDetails) {
        Uniform existingUniform = uniformRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quân phục không tồn tại"));

        // Kiểm tra trùng tên (nếu có thay đổi tên)
        if (!existingUniform.getName().equals(uniformDetails.getName())) {
            if (uniformRepository.existsByName(uniformDetails.getName())) {
                throw new RuntimeException("Tên quân phục '" + uniformDetails.getName() + "' đã được sử dụng!");
            }
        }

        // Cập nhật thông tin text
        existingUniform.setName(uniformDetails.getName());
        existingUniform.setDescription(uniformDetails.getDescription());
        existingUniform.setHistory(uniformDetails.getHistory());
        existingUniform.setMaterial(uniformDetails.getMaterial());

        // Cập nhật Quốc gia (nếu muốn chuyển bộ này sang nước khác)
        if (uniformDetails.getCountry() != null && uniformDetails.getCountry().getId() != null) {
            // Chỉ cập nhật nếu ID quốc gia khác với cái hiện tại
            if (!existingUniform.getCountry().getId().equals(uniformDetails.getCountry().getId())) {
                Country newCountry = countryRepository.findById(uniformDetails.getCountry().getId())
                        .orElseThrow(() -> new RuntimeException("Quốc gia mới không tồn tại!"));
                existingUniform.setCountry(newCountry);
            }
        }

        return uniformRepository.save(existingUniform);
    }

    // 7. Xóa quân phục
    public void deleteUniform(Long id) {
        if (!uniformRepository.existsById(id)) {
            throw new RuntimeException("Quân phục không tồn tại");
        }
        // Vì bên Entity Uniform ta đã để cascade = CascadeType.ALL cho Images và Comments
        // Nên khi xóa Uniform, nó sẽ tự động xóa sạch ảnh và comment của bộ đó.
        uniformRepository.deleteById(id);
    }
}