package com.portal.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role; // "STUDENT" or "RECRUITER"
    private String phone;
    private String institution;
}
