package com.portal.service;

import com.portal.dto.ProfileResponse;
import com.portal.dto.ProfileUpdateRequest;
import com.portal.model.User;
import com.portal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    @Value("${upload.path}")
    private String uploadPath;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toResponse(user);
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, ProfileUpdateRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getName() != null && !req.getName().isBlank())
            user.setName(req.getName().trim());
        if (req.getPhone() != null)
            user.setPhone(req.getPhone().trim());
        if (req.getInstitution() != null)
            user.setInstitution(req.getInstitution().trim());
        if (req.getBio() != null)
            user.setBio(req.getBio().trim());

        user = userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public ProfileResponse uploadPicture(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed for profile pictures");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("Profile picture must be under 5 MB");
        }

        Path dir = Paths.get(uploadPath, "profiles");
        Files.createDirectories(dir);

        // Delete old picture if exists
        if (user.getProfilePicturePath() != null) {
            try { Files.deleteIfExists(Paths.get(user.getProfilePicturePath())); } catch (Exception ignored) {}
        }

        String ext = getExtension(file.getOriginalFilename());
        String filename = "profile_" + userId + "_" + System.currentTimeMillis() + ext;
        Path dest = dir.resolve(filename);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        user.setProfilePicturePath(dest.toString());
        user = userRepository.save(user);
        return toResponse(user);
    }

    public Path getPicturePath(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getProfilePicturePath() == null) throw new RuntimeException("No picture");
        return Paths.get(user.getProfilePicturePath());
    }

    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot).toLowerCase() : ".jpg";
    }

    private ProfileResponse toResponse(User user) {
        String picUrl = null;
        if (user.getProfilePicturePath() != null) {
            // Convert filesystem path → URL path served by /api/profile/picture/{userId}
            picUrl = "/api/profile/picture/" + user.getId();
        }
        return ProfileResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .institution(user.getInstitution())
                .bio(user.getBio())
                .role(user.getRole().name())
                .profilePictureUrl(picUrl)
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .googleLinked(user.getGoogleId() != null)
                .build();
    }
}
