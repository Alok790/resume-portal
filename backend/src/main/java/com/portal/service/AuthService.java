package com.portal.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.portal.dto.*;
import com.portal.model.*;
import com.portal.repository.UserRepository;
import com.portal.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${google.client.id:}")
    private String googleClientId;

    // ── Email/password register ────────────────────────────────────────────────

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.valueOf(request.getRole().toUpperCase()))
                .phone(request.getPhone())
                .institution(request.getInstitution())
                .build();

        user = userRepository.save(user);
        return toAuthResponse(user);
    }

    // ── Email/password login ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (user.getPasswordHash() == null) {
            throw new RuntimeException("This account uses Google Sign-In. Please sign in with Google.");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        return toAuthResponse(user);
    }

    // ── Google OAuth ───────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse googleAuth(GoogleAuthRequest request) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new RuntimeException("Google Sign-In is not configured on this server.");
        }

        GoogleIdToken.Payload payload = verifyGoogleToken(request.getCredential());

        String googleId = payload.getSubject();
        String email    = payload.getEmail();
        String name     = (String) payload.get("name");
        String picture  = (String) payload.get("picture");

        // Find existing user by googleId or email
        Optional<User> existing = userRepository.findByGoogleId(googleId);
        if (existing.isEmpty()) {
            existing = userRepository.findByEmail(email);
        }

        User user;
        if (existing.isPresent()) {
            // Returning user — link googleId if not already set
            user = existing.get();
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user = userRepository.save(user);
            }
        } else {
            // New user via Google — create account
            String role = request.getRole() != null ? request.getRole().toUpperCase() : "STUDENT";
            user = User.builder()
                    .name(name != null ? name : email)
                    .email(email)
                    .googleId(googleId)
                    .role(Role.valueOf(role))
                    .build();
            user = userRepository.save(user);
        }

        return toAuthResponse(user);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private GoogleIdToken.Payload verifyGoogleToken(String credential) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null) {
                throw new RuntimeException("Invalid Google token");
            }
            return idToken.getPayload();
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google token verification failed: {}", e.getMessage());
            throw new RuntimeException("Google authentication failed");
        }
    }

    public AuthResponse toAuthResponse(User user) {
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .institution(user.getInstitution())
                .build();
    }
}
