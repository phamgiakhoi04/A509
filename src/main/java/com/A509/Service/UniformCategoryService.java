package com.A509.Service;

import com.A509.Entity.UniformCategory;
import com.A509.Repository.UniformCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UniformCategoryService {

    @Autowired
    private UniformCategoryRepository categoryRepository;

    public List<UniformCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<UniformCategory> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    // Get root categories (parent categories)
    public List<UniformCategory> getRootCategories() {
        return categoryRepository.findRootCategories();
    }

    // Get root categories by type (REENACTMENT, UNIFORM, DOCUMENT)
    public List<UniformCategory> getRootCategoriesByType(UniformCategory.CategoryType type) {
        return categoryRepository.findRootCategoriesByType(type);
    }

    // Get child categories of a parent
    public List<UniformCategory> getChildCategories(Long parentId) {
        return categoryRepository.findByParentId(parentId);
    }

    // Get all categories by type
    public List<UniformCategory> getCategoriesByType(UniformCategory.CategoryType type) {
        return categoryRepository.findByCategoryType(type);
    }

    public UniformCategory addCategory(UniformCategory category) {
        // Check for duplicate name within same parent (if parent exists)
        if (category.getParent() != null) {
            List<UniformCategory> siblings = categoryRepository.findByParentId(category.getParent().getId());
            boolean exists = siblings.stream()
                    .anyMatch(c -> c.getCategoryName().equalsIgnoreCase(category.getCategoryName()));
            if (exists) {
                throw new RuntimeException("Loại quân phục '" + category.getCategoryName() + "' đã tồn tại trong danh mục này!");
            }
        } else {
            if (categoryRepository.existsByCategoryName(category.getCategoryName())) {
                throw new RuntimeException("Loại quân phục '" + category.getCategoryName() + "' đã tồn tại!");
            }
        }
        return categoryRepository.save(category);
    }

    public UniformCategory updateCategory(Long id, UniformCategory categoryDetails) {
        UniformCategory existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loại quân phục không tồn tại"));

        // Check for duplicate name
        if (!existingCategory.getCategoryName().equals(categoryDetails.getCategoryName())) {
            boolean exists;
            if (categoryDetails.getParent() != null) {
                List<UniformCategory> siblings = categoryRepository.findByParentId(categoryDetails.getParent().getId());
                exists = siblings.stream()
                        .anyMatch(c -> c.getCategoryName().equalsIgnoreCase(categoryDetails.getCategoryName()) 
                                    && !c.getId().equals(id));
            } else {
                exists = categoryRepository.existsByCategoryName(categoryDetails.getCategoryName());
            }
            if (exists) {
                throw new RuntimeException("Tên loại quân phục '" + categoryDetails.getCategoryName() + "' đã được sử dụng!");
            }
        }

        existingCategory.setCategoryName(categoryDetails.getCategoryName());
        existingCategory.setDescription(categoryDetails.getDescription());
        existingCategory.setCategoryType(categoryDetails.getCategoryType());
        existingCategory.setSortOrder(categoryDetails.getSortOrder());
        existingCategory.setIcon(categoryDetails.getIcon());
        
        // Handle parent relationship
        if (categoryDetails.getParent() != null && !categoryDetails.getParent().getId().equals(id)) {
            existingCategory.setParent(categoryDetails.getParent());
        }

        return categoryRepository.save(existingCategory);
    }

    public List<UniformCategory> searchCategories(String keyword) {
        return categoryRepository.findByCategoryNameContainingIgnoreCase(keyword);
    }

    @Transactional
    public void deleteCategory(Long id) {
        UniformCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loại quân phục không tồn tại"));

        // Check if category has children
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            throw new RuntimeException("Không thể xóa danh mục này vì có danh mục con bên trong.");
        }

        // Check if category has uniforms
        if (category.getUniforms() != null && !category.getUniforms().isEmpty()) {
            throw new RuntimeException("Không thể xóa loại quân phục này vì đã có dữ liệu liên quan.");
        }

        categoryRepository.deleteById(id);
    }
}
