package com.A509.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "countries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "country_id") // Khớp với SQL
    private Long id;

    @Column(name = "country_name", nullable = false, unique = true) // Khớp với SQL
    private String countryName;

    // Sửa region -> continent cho khớp SQL
    @Column(name = "continent")
    private String continent;

    // Thêm cột này vì trong SQL mới có
    @Column(name = "flag_image_url")
    private String flagImageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "country", fetch = FetchType.LAZY)
    private Set<Uniform> uniforms;
}