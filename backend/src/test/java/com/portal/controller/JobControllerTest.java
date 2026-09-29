package com.portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portal.dto.JobRequest;
import com.portal.dto.JobResponse;
import com.portal.security.JwtAuthFilter;
import com.portal.security.JwtUtil;
import com.portal.service.JobService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    controllers = JobController.class,
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = JwtAuthFilter.class
    )
)
class JobControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean JobService jobService;
    @MockBean JwtUtil jwtUtil;

    /** Builds an Authentication whose principal is a Long (matching JwtAuthFilter behaviour) */
    private static UsernamePasswordAuthenticationToken longAuth(Long userId, String role) {
        return new UsernamePasswordAuthenticationToken(
                userId, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role)));
    }

    @Test
    void createJob_success_returns201() throws Exception {
        JobRequest req = new JobRequest();
        req.setTitle("Backend Dev");
        req.setDescription("Spring Boot role");
        req.setRequiredSkills(List.of("Java", "Spring"));

        JobResponse resp = JobResponse.builder()
                .id(1L).recruiterId(1L).recruiterName("HR Bob")
                .title("Backend Dev").description("Spring Boot role")
                .requiredSkills(List.of("Java", "Spring"))
                .postedAt("2024-01-01T00:00:00")
                .build();

        when(jobService.createJob(any(JobRequest.class), eq(1L))).thenReturn(resp);

        mockMvc.perform(post("/api/jobs")
                        .with(csrf())
                        .with(authentication(longAuth(1L, "RECRUITER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Backend Dev"))
                .andExpect(jsonPath("$.requiredSkills[0]").value("Java"))
                .andExpect(jsonPath("$.requiredSkills[1]").value("Spring"));
    }

    @Test
    void getAllJobs_success_returnsList() throws Exception {
        JobResponse j1 = JobResponse.builder()
                .id(1L).title("Java Dev").requiredSkills(List.of("Java")).build();
        JobResponse j2 = JobResponse.builder()
                .id(2L).title("Python Dev").requiredSkills(List.of("Python")).build();

        when(jobService.getAllJobs()).thenReturn(List.of(j1, j2));

        mockMvc.perform(get("/api/jobs")
                        .with(authentication(longAuth(1L, "STUDENT"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Java Dev"))
                .andExpect(jsonPath("$[1].title").value("Python Dev"));
    }

    @Test
    void getAllJobs_emptyList_returnsEmptyArray() throws Exception {
        when(jobService.getAllJobs()).thenReturn(List.of());

        mockMvc.perform(get("/api/jobs")
                        .with(authentication(longAuth(2L, "RECRUITER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
