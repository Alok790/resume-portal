package com.portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portal.dto.AuthResponse;
import com.portal.dto.LoginRequest;
import com.portal.dto.RegisterRequest;
import com.portal.security.JwtAuthFilter;
import com.portal.security.JwtUtil;
import com.portal.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = AuthController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = JwtAuthFilter.class
    )
)
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean AuthService authService;
    @MockBean JwtUtil jwtUtil;

    @Test
    @WithMockUser
    void register_success_returns201() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("Alice");
        req.setEmail("alice@uni.edu");
        req.setPassword("secret");
        req.setRole("STUDENT");
        req.setPhone("9876543210");
        req.setInstitution("MIT");

        AuthResponse resp = AuthResponse.builder()
                .token("tok123").role("STUDENT").userId(1L)
                .name("Alice").email("alice@uni.edu")
                .phone("9876543210").institution("MIT")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("tok123"))
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.name").value("Alice"))
                .andExpect(jsonPath("$.email").value("alice@uni.edu"))
                .andExpect(jsonPath("$.phone").value("9876543210"))
                .andExpect(jsonPath("$.institution").value("MIT"));
    }

    @Test
    @WithMockUser
    void register_duplicateEmail_returns400() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("Alice");
        req.setEmail("alice@uni.edu");
        req.setPassword("secret");
        req.setRole("STUDENT");

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new RuntimeException("Email already registered"));

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email already registered"));
    }

    @Test
    @WithMockUser
    void login_success_returns200() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("alice@uni.edu");
        req.setPassword("secret");

        AuthResponse resp = AuthResponse.builder()
                .token("loginTok").role("STUDENT").userId(1L)
                .name("Alice").email("alice@uni.edu")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("loginTok"))
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }

    @Test
    @WithMockUser
    void login_invalidCredentials_returns400() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("alice@uni.edu");
        req.setPassword("wrong");

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new RuntimeException("Invalid credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }
}
