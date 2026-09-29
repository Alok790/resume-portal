package com.portal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portal.model.*;
import com.portal.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeProcessingService {

    private final ResumeRepository resumeRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Async
    public void processResume(Long resumeId) {
        try {
            Resume resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found: " + resumeId));

            byte[] fileBytes = Files.readAllBytes(Paths.get(resume.getFilePath()));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() { return "resume.pdf"; }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + "/extract-skills", requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<String> skills = (List<String>) response.getBody().get("skills");
                if (skills == null) skills = new ArrayList<>();
                String skillsJson = objectMapper.writeValueAsString(skills);
                Resume managed = resumeRepository.findById(resumeId)
                        .orElseThrow(() -> new RuntimeException("Resume disappeared: " + resumeId));
                managed.setExtractedSkills(skillsJson);
                managed.setStatus(ResumeStatus.PROCESSED);
                resumeRepository.save(managed);
                log.info("Resume {} processed: {} skills found: {}", resumeId, skills.size(), skillsJson);
            } else {
                log.warn("Resume {} — AI service returned non-2xx or empty body, marking PROCESSED with 0 skills", resumeId);
                markProcessed(resumeId, "[]");
            }
        } catch (Exception e) {
            log.error("Failed to process resume {}: {}", resumeId, e.getMessage(), e);
            try {
                markProcessed(resumeId, "[]");
            } catch (Exception ex) {
                log.error("Could not mark resume {} as processed after failure: {}", resumeId, ex.getMessage());
            }
        }
    }

    private void markProcessed(Long resumeId, String skillsJson) {
        resumeRepository.findById(resumeId).ifPresent(r -> {
            r.setExtractedSkills(skillsJson);
            r.setStatus(ResumeStatus.PROCESSED);
            resumeRepository.save(r);
        });
    }
}
