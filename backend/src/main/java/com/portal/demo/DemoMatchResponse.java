package com.portal.demo;

import lombok.Builder;

import java.util.List;

@Builder
public record DemoMatchResponse(
        Long matchId,
        Long jobId,
        String jobTitle,
        String jobDescription,
        Double matchPercentage,
        List<String> missingSkills,
        List<String> requiredSkills,
        List<String> matchedSkills,
        List<String> similarSkills,
        String matchedAt,
        String company,
        String location,
        String salary,
        String experienceLevel,
        boolean learningRecommended,
        List<String> learningRecommendations) {
}
