package com.A509.Repository;

import com.A509.Entity.Uniform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UniformRepository extends JpaRepository<Uniform, Long> {

    // 1. Tìm kiếm theo tên (gần đúng)
    List<Uniform> findByNameContainingIgnoreCase(String name);

    // 2. Lấy danh sách quân phục theo Quốc gia (dựa vào country_id)
    List<Uniform> findByCountryId(Long countryId);

    // 3. Kiểm tra trùng tên
    boolean existsByName(String name);
}