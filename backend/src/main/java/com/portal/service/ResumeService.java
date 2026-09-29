package com.portal.service;

import com.portal.dto.ResumeResponse;
import com.portal.model.*;
import com.portal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeProcessingService resumeProcessingService;

    @Value("${upload.path}")
    private String uploadPath;

    public ResumeResponse uploadResume(MultipartFile file, Long studentId) throws IOException {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Path dir = Paths.get(uploadPath, String.valueOf(studentId));
        Files.createDirectories(dir);

        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = dir.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        Resume resume = Resume.builder()
                .student(student)
                .filePath(filePath.toString())
                .status(ResumeStatus.PENDING)
                .build();

        resume = resumeRepository.save(resume);

        // Called on a separate Spring-managed bean so @Async proxy is respected
        resumeProcessingService.processResume(resume.getId());

        return toResponse(resume);
    }

    public List<ResumeResponse> getResumesByStudent(Long studentId) {
        return resumeRepository.findByStudentId(studentId)
                .stream().map(this::toResponse).toList();
    }

    public ResumeResponse reprocessResume(Long resumeId, Long studentId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
        if (!resume.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("Not your resume");
        }
        resume.setStatus(ResumeStatus.PENDING);
        resume.setExtractedSkills("[]");
        resumeRepository.save(resume);
        resumeProcessingService.processResume(resume.getId());
        return toResponse(resume);
    }

    private ResumeResponse toResponse(Resume r) {
        return ResumeResponse.builder()
                .id(r.getId())
                .filePath(r.getFilePath())
                .extractedSkills(r.getExtractedSkills())
                .status(r.getStatus().name())
                .uploadedAt(r.getUploadedAt() != null ? r.getUploadedAt().toString() : null)
                .build();
    }
}
