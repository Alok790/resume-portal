package com.portal.dto;

import lombok.*;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobResponse {
    private Long id;
    private Long recruiterId;
    private String recruiterName;
    private String title;
    private String description;
    private List<String> requiredSkills;
    private String postedAt;
}
