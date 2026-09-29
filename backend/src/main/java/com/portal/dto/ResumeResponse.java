package com.portal.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResumeResponse {
    private Long id;
    private String filePath;
    private String extractedSkills;
    private String status;
    private String uploadedAt;
}
