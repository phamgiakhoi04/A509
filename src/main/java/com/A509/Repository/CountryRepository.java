package com.A509.Repository;

import com.A509.Entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {

    boolean existsByCountryName(String countryName);

    List<Country> findByCountryNameContainingIgnoreCase(String name);
}