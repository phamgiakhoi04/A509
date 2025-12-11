package com.A509.Repository;

import com.A509.Entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    // Tìm Role theo tên (trả về Optional để tránh NullPointerException)
    Optional<Role> findByName(String name);

    // Kiểm tra xem tên đã tồn tại chưa (Trả về true/false)
    boolean existsByName(String name);
}