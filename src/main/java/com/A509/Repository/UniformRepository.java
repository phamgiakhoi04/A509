package com.A509.Repository;

import com.A509.Entity.Uniform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UniformRepository extends JpaRepository<Uniform, Long> {

    List<Uniform> findByNameContainingIgnoreCase(String name);

    List<Uniform> findByCountryId(Long countryId);

    boolean existsByName(String name);
}