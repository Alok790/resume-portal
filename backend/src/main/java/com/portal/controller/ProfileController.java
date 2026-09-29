package com.portal.controller;

import com.portal.dto.ProfileResponse;
import com.portal.dto.ProfileUpdateRequest;
import com.portal.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(profileService.updateProfile(userId, request));
    }

    @PostMapping("/picture")
    public ResponseEntity<ProfileResponse> uploadPicture(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(profileService.uploadPicture(userId, file));
    }

    /** Serve profile pictures directly */
    @GetMapping("/picture/{userId}")
    public ResponseEntity<Resource> getPicture(@PathVariable Long userId) {
        try {
            ProfileResponse profile = profileService.getProfile(userId);
            if (profile.getProfilePictureUrl() == null) {
                return ResponseEntity.notFound().build();
            }
            // Resolve the actual filesystem path from the service
            Path filePath = profileService.getPicturePath(userId);
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) return ResponseEntity.notFound().build();

            String contentType = "image/jpeg";
            String name = filePath.getFileName().toString().toLowerCase();
            if (name.endsWith(".png"))  contentType = "image/png";
            if (name.endsWith(".gif"))  contentType = "image/gif";
            if (name.endsWith(".webp")) contentType = "image/webp";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
