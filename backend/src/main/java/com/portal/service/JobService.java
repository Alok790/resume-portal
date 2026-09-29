package com.portal.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portal.dto.*;
import com.portal.model.*;
import com.portal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public JobResponse createJob(JobRequest request, Long recruiterId) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String skillsJson;
        try {
            skillsJson = objectMapper.writeValueAsString(request.getRequiredSkills());
        } catch (Exception e) {
            skillsJson = "[]";
        }

        Job job = Job.builder()
                .recruiter(recruiter)
                .title(request.getTitle())
                .description(request.getDescription())
                .requiredSkills(skillsJson)
                .build();

        job = jobRepository.save(job);
        return toResponse(job);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getAllJobs() {
        return jobRepository.findAll().stream().map(this::toResponse).toList();
    }

    public JobResponse toResponse(Job job) {
        List<String> skills;
        try {
            skills = objectMapper.readValue(job.getRequiredSkills(), new TypeReference<>() {});
        } catch (Exception e) {
            skills = List.of();
        }
        return JobResponse.builder()
                .id(job.getId())
                .recruiterId(job.getRecruiter().getId())
                .recruiterName(job.getRecruiter().getName())
                .title(job.getTitle())
                .description(job.getDescription())
                .requiredSkills(skills)
                .postedAt(job.getPostedAt() != null ? job.getPostedAt().toString() : null)
                .build();
    }
}
