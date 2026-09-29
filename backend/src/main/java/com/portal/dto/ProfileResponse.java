package com.portal.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProfileResponse {
    private Long   userId;
    private String name;
    private String email;
    private String phone;
    private String institution;
    private String bio;
    private String role;
    private String profilePictureUrl;  // relative URL served by backend
    private String createdAt;
    private boolean googleLinked;
}
