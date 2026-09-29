package com.portal.service;

import com.portal.dto.ResumeResponse;
import com.portal.model.Resume;
import com.portal.model.ResumeStatus;
import com.portal.model.Role;
import com.portal.model.User;
import com.portal.repository.ResumeRepository;
import com.portal.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResumeServiceTest {

    @Mock ResumeRepository resumeRepository;
    @Mock UserRepository userRepository;
    @Mock ResumeProcessingService resumeProcessingService;
    @InjectMocks ResumeService resumeService;

    private User student;

    @BeforeEach
    void setUp() throws Exception {
        // Create a temp directory for uploads
        Path tempDir = Files.createTempDirectory("resume-test-uploads");
        ReflectionTestUtils.setField(resumeService, "uploadPath", tempDir.toString());

        student = User.builder()
                .id(5L).name("Student Alice").email("alice@uni.edu")
                .passwordHash("hash").role(Role.STUDENT)
                .phone("1234567890").institution("MIT")
                .build();
    }

    @Test
    void uploadResume_success() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "resume.pdf", "application/pdf", "PDF content".getBytes());

        Resume savedResume = Resume.builder()
                .id(1L).student(student)
                .filePath("/tmp/5/resume.pdf")
                .status(ResumeStatus.PENDING)
                .uploadedAt(LocalDateTime.now())
                .build();

        when(userRepository.findById(5L)).thenReturn(Optional.of(student));
        when(resumeRepository.save(any(Resume.class))).thenReturn(savedResume);
        doNothing().when(resumeProcessingService).processResume(1L);

        ResumeResponse resp = resumeService.uploadResume(file, 5L);

        assertThat(resp.getId()).isEqualTo(1L);
        assertThat(resp.getStatus()).isEqualTo("PENDING");
        verify(resumeProcessingService).processResume(1L);
    }

    @Test
    void uploadResume_userNotFound_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "resume.pdf", "application/pdf", "PDF".getBytes());

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resumeService.uploadResume(file, 99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");
    }

    @Test
    void getResumesByStudent_returnsList() {
        Resume r1 = Resume.builder()
                .id(1L).student(student).filePath("/tmp/1.pdf")
                .status(ResumeStatus.PROCESSED).extractedSkills("[\"Java\"]")
                .uploadedAt(LocalDateTime.now()).build();
        Resume r2 = Resume.builder()
                .id(2L).student(student).filePath("/tmp/2.pdf")
                .status(ResumeStatus.PENDING).extractedSkills(null)
                .uploadedAt(LocalDateTime.now()).build();

        when(resumeRepository.findByStudentId(5L)).thenReturn(List.of(r1, r2));

        List<ResumeResponse> result = resumeService.getResumesByStudent(5L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getStatus()).isEqualTo("PROCESSED");
        assertThat(result.get(1).getStatus()).isEqualTo("PENDING");
    }

    @Test
    void getResumesByStudent_noResumes_returnsEmpty() {
        when(resumeRepository.findByStudentId(5L)).thenReturn(List.of());

        List<ResumeResponse> result = resumeService.getResumesByStudent(5L);

        assertThat(result).isEmpty();
    }
}
