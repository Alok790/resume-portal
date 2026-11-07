package com.portal.demo;

import java.time.LocalDateTime;
import java.util.List;

public record DemoJobPosting(
        Long id,
        String title,
        String company,
        String location,
        String salary,
        String experienceLevel,
        List<String> requiredSkills,
        String description,
        LocalDateTime createdAt) {
}
