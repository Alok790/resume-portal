package com.portal.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portal.dto.MatchResponse;
import com.portal.model.*;
import com.portal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchService {

    private final JobMatchRepository jobMatchRepository;
    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Transactional
    public List<MatchResponse> runMatching(Long resumeId, Long studentId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        if (!resume.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("Access denied");
        }

        if (resume.getStatus() != ResumeStatus.PROCESSED) {
            throw new RuntimeException("Resume is still being processed. Please wait.");
        }

        List<String> resumeSkills = parseSkills(resume.getExtractedSkills());
        List<Job> jobs = jobRepository.findAll();

        // Delete old matches for this resume
        jobMatchRepository.deleteByResumeId(resumeId);

        List<JobMatch> matches = new ArrayList<>();
        for (Job job : jobs) {
            List<String> jobSkills = parseSkills(job.getRequiredSkills());
            double[] result = callFlaskMatcher(resumeSkills, jobSkills);

            double matchPct = result[0];
            List<String> missing = getMissingSkills(resumeSkills, jobSkills);

            String missingJson;
            try {
                missingJson = objectMapper.writeValueAsString(missing);
            } catch (Exception e) {
                missingJson = "[]";
            }

            JobMatch match = JobMatch.builder()
                    .resume(resume)
                    .job(job)
                    .matchPercentage(matchPct)
                    .missingSkills(missingJson)
                    .build();

            matches.add(jobMatchRepository.save(match));
        }

        matches.sort(Comparator.comparingDouble(JobMatch::getMatchPercentage).reversed());
        return matches.stream().map(m -> toMatchResponse(m, false)).toList();
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getMatchesForResume(Long resumeId) {
        return jobMatchRepository.findByResumeIdOrderByMatchPercentageDesc(resumeId)
                .stream().map(m -> toMatchResponse(m, false)).toList();
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getApplicantsForJob(Long jobId, Long recruiterId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Access denied");
        }

        return jobMatchRepository.findByJobIdOrderByMatchPercentageDesc(jobId)
                .stream().map(m -> toMatchResponse(m, true)).toList();
    }

    private double[] callFlaskMatcher(List<String> resumeSkills, List<String> jobSkills) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("resume_skills", resumeSkills);
            payload.put("job_skills", jobSkills);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceUrl + "/match-jobs", entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object pct = response.getBody().get("match_percentage");
                return new double[]{ pct instanceof Number ? ((Number) pct).doubleValue() : 0.0 };
            }
        } catch (Exception e) {
            log.error("Flask matcher call failed: {}", e.getMessage());
        }
        return new double[]{ 0.0 };
    }

    private List<String> getMissingSkills(List<String> resumeSkills, List<String> jobSkills) {
        Set<String> resumeLower = new HashSet<>();
        for (String s : resumeSkills) resumeLower.add(s.toLowerCase());
        List<String> missing = new ArrayList<>();
        for (String s : jobSkills) {
            if (!resumeLower.contains(s.toLowerCase())) missing.add(s);
        }
        return missing;
    }

    private List<String> parseSkills(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            // Handle both JSON array and toString() list format
            if (json.trim().startsWith("[") && json.trim().contains("\"")) {
                return objectMapper.readValue(json, new TypeReference<>() {});
            }
            // Handle [skill1, skill2] format from Python list toString
            String cleaned = json.replaceAll("[\\[\\]]", "").trim();
            if (cleaned.isBlank()) return List.of();
            return Arrays.stream(cleaned.split(","))
                    .map(String::trim).filter(s -> !s.isEmpty()).toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    private MatchResponse toMatchResponse(JobMatch m, boolean includeStudent) {
        List<String> missing;
        try {
            String ms = m.getMissingSkills();
            missing = (ms == null || ms.isBlank()) ? List.of()
                    : objectMapper.readValue(ms, new TypeReference<>() {});
        } catch (Exception e) {
            missing = List.of();
        }

        List<String> required = parseSkills(m.getJob().getRequiredSkills());

        MatchResponse resp = MatchResponse.builder()
                .matchId(m.getId())
                .jobId(m.getJob().getId())
                .jobTitle(m.getJob().getTitle())
                .jobDescription(m.getJob().getDescription())
                .matchPercentage(m.getMatchPercentage())
                .missingSkills(missing)
                .requiredSkills(required)
                .matchedAt(m.getMatchedAt() != null ? m.getMatchedAt().toString() : null)
                .build();

        if (includeStudent) {
            User student = m.getResume().getStudent();
            resp.setStudentId(student.getId());
            resp.setStudentName(student.getName());
            resp.setStudentEmail(student.getEmail());
        }

        return resp;
    }
}
