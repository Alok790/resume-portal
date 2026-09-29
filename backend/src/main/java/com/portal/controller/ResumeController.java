package com.portal.controller;

import com.portal.dto.ResumeResponse;
import com.portal.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/upload")
    public ResponseEntity<ResumeResponse> upload(@RequestParam("file") MultipartFile file,
                                                  Authentication authentication) throws IOException {
        Long studentId = (Long) authentication.getPrincipal();
        ResumeResponse response = resumeService.uploadResume(file, studentId);
        return ResponseEntity.accepted().body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ResumeResponse>> myResumes(Authentication authentication) {
        Long studentId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(resumeService.getResumesByStudent(studentId));
    }

    @PostMapping("/{id}/reprocess")
    public ResponseEntity<ResumeResponse> reprocess(@PathVariable Long id,
                                                     Authentication authentication) {
        Long studentId = (Long) authentication.getPrincipal();
        return ResponseEntity.accepted().body(resumeService.reprocessResume(id, studentId));
    }
}
