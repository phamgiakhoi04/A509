package com.A509.Service;

import com.A509.Entity.Role;
import com.A509.Repository.RoleRepository;
import com.A509.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Optional<Role> getRoleById(Long id) {
        return roleRepository.findById(id);
    }

    public Role createRole(Role role) {
        // Kiểm tra trùng tên trong DB
        if (roleRepository.existsByName(role.getName())) {
            throw new RuntimeException("Tên quyền '" + role.getName() + "' đã tồn tại!");
        }
        return roleRepository.save(role);
    }

    public Role updateRole(Long id, Role roleDetails) {
        Role existingRole = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role không tồn tại"));

        // Nếu người dùng đổi tên, kiểm tra xem tên mới có bị trùng không
        if (!existingRole.getName().equals(roleDetails.getName())) {
            if (roleRepository.existsByName(roleDetails.getName())) {
                throw new RuntimeException("Tên quyền '" + roleDetails.getName() + "' đã được sử dụng!");
            }
        }

        existingRole.setName(roleDetails.getName());
        // Đã xóa dòng setDescription vì DB không có cột này

        return roleRepository.save(existingRole);
    }

    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role không tồn tại"));

        // 1. Bảo vệ Role hệ thống (ADMIN/USER)
        // Kiểm tra ID 1, 2 HOẶC tên là ADMIN, USER (không phân biệt hoa thường)
        if (id == 1 || id == 2 || "ADMIN".equalsIgnoreCase(role.getName()) || "USER".equalsIgnoreCase(role.getName())) {
            throw new RuntimeException("Không thể xóa các quyền mặc định của hệ thống!");
        }

        // 2. Bảo vệ dữ liệu: Không xóa nếu đang có User dùng Role này
        if (userRepository.existsByRole(role)) {
            throw new RuntimeException("Không thể xóa quyền này vì đang có Users sử dụng nó.");
        }

        roleRepository.delete(role);
    }
}