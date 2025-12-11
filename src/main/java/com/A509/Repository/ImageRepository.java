package com.A509.Repository;

import com.A509.Entity.Image; // Nhớ import Entity số ít
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    // Logic quan trọng nhất: Lấy danh sách ảnh của một bộ quân phục cụ thể
    // Hibernate sẽ tự động map theo cột uniform_id
    List<Image> findByUniformId(Long uniformId);
}