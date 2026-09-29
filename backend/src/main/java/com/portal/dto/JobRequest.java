package com.portal.dto;

import lombok.Data;
import java.util.List;

@Data
public class JobRequest {
    private String title;
    private String description;
    private List<String> requiredSkills;
}
