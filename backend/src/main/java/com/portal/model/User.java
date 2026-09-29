package com.portal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;          // null for OAuth-only accounts

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(length = 30)
    private String phone;

    @Column(length = 200)
    private String institution;

    @Column(name = "profile_picture_path", length = 500)
    private String profilePicturePath;    // relative path under uploads/

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "google_id", length = 200, unique = true)
    private String googleId;              // set for Google OAuth users

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
