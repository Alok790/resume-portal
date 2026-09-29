package com.portal.dto;

import lombok.*;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MatchResponse {
    private Long matchId;
    private Long jobId;
    private String jobTitle;
    private String jobDescription;
    private Double matchPercentage;
    private List<String> missingSkills;
    private List<String> requiredSkills;
    private String matchedAt;
    // for recruiter view
    private Long studentId;
    private String studentName;
    private String studentEmail;
}
