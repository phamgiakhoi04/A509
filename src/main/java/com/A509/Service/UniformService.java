package com.A509.Service;

import com.A509.DTO.UniformDTO;
import com.A509.Entity.Country;
import com.A509.Entity.Image;
import com.A509.Entity.Uniform;
import com.A509.Repository.CountryRepository;
import com.A509.Repository.ImageRepository;
import com.A509.Repository.UniformRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UniformService {

    @Autowired
    private UniformRepository uniformRepository;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private ImageService imageService;

    public List<Uniform> getAllUniforms() {
        return uniformRepository.findAll();
    }

    public Page<Uniform> getAllUniforms(Pageable pageable) {
        return uniformRepository.findAll(pageable);
    }

    @Transactional
    public Uniform addUniform(UniformDTO dto) throws IOException {
        if (uniformRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Tên quân phục '" + dto.getName() + "' đã tồn tại!");
        }

        Country country = countryRepository.findById(dto.getCountryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Quốc gia với ID: " + dto.getCountryId()));

        Uniform uniform = new Uniform();
        uniform.setName(dto.getName());
        uniform.setDescription(dto.getDescription());
        uniform.setHistory(dto.getHistory());
        uniform.setMaterial(dto.getMaterial());
        uniform.setCountry(country);

        Uniform savedUniform = uniformRepository.save(uniform);

        if (dto.getImageFiles() != null && !dto.getImageFiles().isEmpty()) {
            for (MultipartFile file : dto.getImageFiles()) {
                if (!file.isEmpty()) {
                    String imageUrl = imageService.uploadImage(file);
                    Image image = new Image();
                    image.setUniform(savedUniform);
                    image.setImageUrl(imageUrl);
                    image.setDescription("Ảnh chi tiết của " + savedUniform.getName());

                    imageRepository.save(image);
                }
            }
        }

        return savedUniform;
    }

    public Optional<Uniform> getUniformById(Long id) {
        return uniformRepository.findById(id);
    }

    public List<Uniform> searchUniforms(String keyword) {
        return uniformRepository.findByNameContainingIgnoreCase(keyword);
    }

    @Transactional
    public Uniform updateUniform(Long id, UniformDTO dto) throws IOException {
        Uniform existingUniform = uniformRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quân phục ID: " + id));

        existingUniform.setName(dto.getName());
        existingUniform.setDescription(dto.getDescription());
        existingUniform.setHistory(dto.getHistory());
        existingUniform.setMaterial(dto.getMaterial());

        if (dto.getCountryId() != null) {
            Country country = countryRepository.findById(dto.getCountryId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Quốc gia ID: " + dto.getCountryId()));
            existingUniform.setCountry(country);
        }

        if (dto.getImageFiles() != null && !dto.getImageFiles().isEmpty()) {
            for (MultipartFile file : dto.getImageFiles()) {
                if (!file.isEmpty()) {
                    String imageUrl = imageService.uploadImage(file);
                    Image image = new Image();
                    image.setUniform(existingUniform);
                    image.setImageUrl(imageUrl);
                    image.setDescription("Ảnh chi tiết của " + existingUniform.getName());

                    imageRepository.save(image);
                }
            }
        }

        return uniformRepository.save(existingUniform);
    }

    @Transactional
    public void deleteUniform(Long id) {
        Uniform uniform = uniformRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quân phục không tồn tại để xóa!"));

        Set<Image> images = uniform.getImages();
        if (images != null && !images.isEmpty()) {
            for (Image img : images) {
                imageService.deleteImageFromCloud(img.getImageUrl());
            }
        }
        uniformRepository.delete(uniform);
    }
}