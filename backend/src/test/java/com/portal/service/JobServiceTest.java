package com.portal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portal.dto.JobRequest;
import com.portal.dto.JobResponse;
import com.portal.model.Job;
import com.portal.model.Role;
import com.portal.model.User;
import com.portal.repository.JobRepository;
import com.portal.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock JobRepository jobRepository;
    @Mock UserRepository userRepository;
    @Spy  ObjectMapper objectMapper;
    @InjectMocks JobService jobService;

    private User recruiter;
    private Job sampleJob;

    @BeforeEach
    void setUp() {
        recruiter = User.builder()
                .id(10L).name("HR Bob").email("hr@corp.com")
                .passwordHash("hash").role(Role.RECRUITER)
                .build();

        sampleJob = Job.builder()
                .id(1L)
                .recruiter(recruiter)
                .title("Java Developer")
                .description("Build Spring Boot apps")
                .requiredSkills("[\"Java\",\"Spring\"]")
                .postedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createJob_success() {
        JobRequest req = new JobRequest();
        req.setTitle("Java Developer");
        req.setDescription("Build Spring Boot apps");
        req.setRequiredSkills(List.of("Java", "Spring"));

        when(userRepository.findById(10L)).thenReturn(Optional.of(recruiter));
        when(jobRepository.save(any(Job.class))).thenReturn(sampleJob);

        JobResponse resp = jobService.createJob(req, 10L);

        assertThat(resp.getId()).isEqualTo(1L);
        assertThat(resp.getTitle()).isEqualTo("Java Developer");
        assertThat(resp.getRequiredSkills()).containsExactly("Java", "Spring");
        assertThat(resp.getRecruiterId()).isEqualTo(10L);
        assertThat(resp.getRecruiterName()).isEqualTo("HR Bob");
    }

    @Test
    void createJob_userNotFound_throwsException() {
        JobRequest req = new JobRequest();
        req.setTitle("Test Job");
        req.setRequiredSkills(List.of("Python"));

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobService.createJob(req, 99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");
    }

    @Test
    void getAllJobs_returnsList() {
        when(jobRepository.findAll()).thenReturn(List.of(sampleJob));

        List<JobResponse> jobs = jobService.getAllJobs();

        assertThat(jobs).hasSize(1);
        assertThat(jobs.get(0).getTitle()).isEqualTo("Java Developer");
    }

    @Test
    void getAllJobs_emptyList() {
        when(jobRepository.findAll()).thenReturn(List.of());

        List<JobResponse> jobs = jobService.getAllJobs();

        assertThat(jobs).isEmpty();
    }

    @Test
    void toResponse_invalidSkillsJson_returnsEmptyList() {
        Job badJob = Job.builder()
                .id(2L).recruiter(recruiter)
                .title("Dev").description("Desc")
                .requiredSkills("not-json-array")
                .build();

        JobResponse resp = jobService.toResponse(badJob);

        assertThat(resp.getRequiredSkills()).isEmpty();
    }

    @Test
    void createJob_emptySkillsList_succeeds() {
        Job emptyJob = Job.builder()
                .id(3L).recruiter(recruiter)
                .title("Any Role").description("Open role")
                .requiredSkills("[]")
                .postedAt(LocalDateTime.now())
                .build();

        JobRequest req = new JobRequest();
        req.setTitle("Any Role");
        req.setDescription("Open role");
        req.setRequiredSkills(List.of());

        when(userRepository.findById(10L)).thenReturn(Optional.of(recruiter));
        when(jobRepository.save(any(Job.class))).thenReturn(emptyJob);

        JobResponse resp = jobService.createJob(req, 10L);

        assertThat(resp.getRequiredSkills()).isEmpty();
    }
}
