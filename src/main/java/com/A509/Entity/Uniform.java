package com.A509.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "uniforms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Uniform {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "uniform_id")
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String history;

    private String material;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "uniform", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<Image> images;

    @OneToMany(mappedBy = "uniform", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<Comment> comments;
}