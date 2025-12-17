package com.A509.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @Column(name = "country_id")
    private Long id;

    @Column(name = "country_name", nullable = false, unique = true)
    private String countryName;

    @Column(name = "continent")
    private String continent;

    @Column(name = "flag_image_url")
    private String flagImageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "country", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Uniform> uniforms;
}