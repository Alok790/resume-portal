package com.portal.dto;

import lombok.Data;

@Data
public class GoogleAuthRequest {
    private String credential;   // Google ID token (JWT)
    private String role;         // "STUDENT" or "RECRUITER" – used only on first sign-in
}
