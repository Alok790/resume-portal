package com.portal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portal.dto.MatchResponse;
import com.portal.model.*;
import com.portal.repository.JobMatchRepository;
import com.portal.repository.JobRepository;
import com.portal.repository.ResumeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

    @Mock JobMatchRepository jobMatchRepository;
    @Mock ResumeRepository resumeRepository;
    @Mock JobRepository jobRepository;
    @Mock RestTemplate restTemplate;
    @Spy  ObjectMapper objectMapper;
    @InjectMocks MatchService matchService;

    private User student;
    private User recruiter;
    private Resume processedResume;
    private Job job1;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(matchService, "aiServiceUrl", "http://localhost:5001");

        student = User.builder()
                .id(1L).name("Alice").email("alice@uni.edu")
                .passwordHash("h").role(Role.STUDENT).build();

        recruiter = User.builder()
                .id(2L).name("HR Bob").email("hr@corp.com")
                .passwordHash("h").role(Role.RECRUITER).build();

        processedResume = Resume.builder()
                .id(10L).student(student)
                .filePath("/tmp/resume.pdf")
                .extractedSkills("[\"Java\",\"Spring\"]")
                .status(ResumeStatus.PROCESSED)
                .uploadedAt(LocalDateTime.now())
                .build();

        job1 = Job.builder()
                .id(100L).recruiter(recruiter)
                .title("Java Dev").description("Build apps")
                .requiredSkills("[\"Java\",\"Spring\",\"Docker\"]")
                .postedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void runMatching_resumeNotFound_throwsException() {
        when(resumeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> matchService.runMatching(99L, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Resume not found");
    }

    @Test
    void runMatching_accessDenied_throwsException() {
        when(resumeRepository.findById(10L)).thenReturn(Optional.of(processedResume));

        assertThatThrownBy(() -> matchService.runMatching(10L, 999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Access denied");
    }

    @Test
    void runMatching_resumeStillPending_throwsException() {
        Resume pending = Resume.builder()
                .id(10L).student(student).filePath("/tmp/r.pdf")
                .status(ResumeStatus.PENDING).uploadedAt(LocalDateTime.now()).build();

        when(resumeRepository.findById(10L)).thenReturn(Optional.of(pending));

        assertThatThrownBy(() -> matchService.runMatching(10L, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("still being processed");
    }

    @Test
    void runMatching_flaskDown_stillReturnsMatches() {
        // Flask is down → callFlaskMatcher returns 0.0 fallback
        when(resumeRepository.findById(10L)).thenReturn(Optional.of(processedResume));
        when(jobRepository.findAll()).thenReturn(List.of(job1));
        doNothing().when(jobMatchRepository).deleteByResumeId(10L);

        JobMatch savedMatch = JobMatch.builder()
                .id(200L).resume(processedResume).job(job1)
                .matchPercentage(0.0).missingSkills("[\"Docker\"]")
                .matchedAt(LocalDateTime.now()).build();

        when(jobMatchRepository.save(any(JobMatch.class))).thenReturn(savedMatch);
        when(restTemplate.postForEntity(anyString(), any(), eq(java.util.Map.class)))
                .thenThrow(new RuntimeException("Connection refused"));

        List<MatchResponse> result = matchService.runMatching(10L, 1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getMatchPercentage()).isEqualTo(0.0);
    }

    @Test
    void getMatchesForResume_returnsList() {
        JobMatch m = JobMatch.builder()
                .id(1L).resume(processedResume).job(job1)
                .matchPercentage(66.6).missingSkills("[\"Docker\"]")
                .matchedAt(LocalDateTime.now()).build();

        when(jobMatchRepository.findByResumeIdOrderByMatchPercentageDesc(10L))
                .thenReturn(List.of(m));

        List<MatchResponse> result = matchService.getMatchesForResume(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getJobTitle()).isEqualTo("Java Dev");
        assertThat(result.get(0).getMissingSkills()).containsExactly("Docker");
    }

    @Test
    void getApplicantsForJob_accessDenied_throwsException() {
        when(jobRepository.findById(100L)).thenReturn(Optional.of(job1));

        assertThatThrownBy(() -> matchService.getApplicantsForJob(100L, 999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Access denied");
    }

    @Test
    void getApplicantsForJob_jobNotFound_throwsException() {
        when(jobRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> matchService.getApplicantsForJob(999L, 2L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Job not found");
    }

    @Test
    void getApplicantsForJob_success_includesStudentInfo() {
        JobMatch m = JobMatch.builder()
                .id(1L).resume(processedResume).job(job1)
                .matchPercentage(80.0).missingSkills("[]")
                .matchedAt(LocalDateTime.now()).build();

        when(jobRepository.findById(100L)).thenReturn(Optional.of(job1));
        when(jobMatchRepository.findByJobIdOrderByMatchPercentageDesc(100L))
                .thenReturn(List.of(m));

        List<MatchResponse> result = matchService.getApplicantsForJob(100L, 2L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStudentId()).isEqualTo(1L);
        assertThat(result.get(0).getStudentName()).isEqualTo("Alice");
        assertThat(result.get(0).getStudentEmail()).isEqualTo("alice@uni.edu");
    }
}
