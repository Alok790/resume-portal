package com.portal.service;

import com.portal.dto.AuthResponse;
import com.portal.dto.LoginRequest;
import com.portal.dto.RegisterRequest;
import com.portal.model.Role;
import com.portal.model.User;
import com.portal.repository.UserRepository;
import com.portal.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @InjectMocks AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .name("Alice")
                .email("alice@example.com")
                .passwordHash("hashed_pw")
                .role(Role.STUDENT)
                .phone("9876543210")
                .institution("MIT")
                .build();
    }

    // ── register ──────────────────────────────────────────────────────────────

    @Test
    void register_success_returnsAuthResponse() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Alice");
        req.setEmail("alice@example.com");
        req.setPassword("secret");
        req.setRole("STUDENT");
        req.setPhone("9876543210");
        req.setInstitution("MIT");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("hashed_pw");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtUtil.generateToken(1L, "alice@example.com", "STUDENT")).thenReturn("token123");

        AuthResponse resp = authService.register(req);

        assertThat(resp.getToken()).isEqualTo("token123");
        assertThat(resp.getRole()).isEqualTo("STUDENT");
        assertThat(resp.getUserId()).isEqualTo(1L);
        assertThat(resp.getName()).isEqualTo("Alice");
        assertThat(resp.getEmail()).isEqualTo("alice@example.com");
        assertThat(resp.getPhone()).isEqualTo("9876543210");
        assertThat(resp.getInstitution()).isEqualTo("MIT");
    }

    @Test
    void register_duplicateEmail_throwsException() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("alice@example.com");
        req.setPassword("secret");
        req.setRole("STUDENT");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email already registered");
    }

    @Test
    void register_recruiterRole_succeeds() {
        User recruiter = User.builder()
                .id(2L).name("Bob").email("bob@corp.com")
                .passwordHash("hash").role(Role.RECRUITER)
                .phone("1234567890").institution("Corp Inc")
                .build();

        RegisterRequest req = new RegisterRequest();
        req.setName("Bob");
        req.setEmail("bob@corp.com");
        req.setPassword("pass");
        req.setRole("RECRUITER");
        req.setPhone("1234567890");
        req.setInstitution("Corp Inc");

        when(userRepository.existsByEmail("bob@corp.com")).thenReturn(false);
        when(passwordEncoder.encode("pass")).thenReturn("hash");
        when(userRepository.save(any(User.class))).thenReturn(recruiter);
        when(jwtUtil.generateToken(2L, "bob@corp.com", "RECRUITER")).thenReturn("tokenRecruiter");

        AuthResponse resp = authService.register(req);

        assertThat(resp.getRole()).isEqualTo("RECRUITER");
        assertThat(resp.getToken()).isEqualTo("tokenRecruiter");
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    void login_validCredentials_returnsAuthResponse() {
        LoginRequest req = new LoginRequest();
        req.setEmail("alice@example.com");
        req.setPassword("secret");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("secret", "hashed_pw")).thenReturn(true);
        when(jwtUtil.generateToken(1L, "alice@example.com", "STUDENT")).thenReturn("token456");

        AuthResponse resp = authService.login(req);

        assertThat(resp.getToken()).isEqualTo("token456");
        assertThat(resp.getRole()).isEqualTo("STUDENT");
        assertThat(resp.getUserId()).isEqualTo(1L);
    }

    @Test
    void login_userNotFound_throwsInvalidCredentials() {
        LoginRequest req = new LoginRequest();
        req.setEmail("ghost@example.com");
        req.setPassword("secret");

        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void login_wrongPassword_throwsInvalidCredentials() {
        LoginRequest req = new LoginRequest();
        req.setEmail("alice@example.com");
        req.setPassword("wrong");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrong", "hashed_pw")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Invalid credentials");
    }
}
