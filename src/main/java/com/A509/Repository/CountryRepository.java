package com.A509.Repository;

import com.A509.Entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {

    // 1. Kiểm tra tồn tại theo tên
    boolean existsByCountryName(String countryName);

    // 2. Tìm kiếm quốc gia theo tên
    List<Country> findByCountryNameContainingIgnoreCase(String name);
}