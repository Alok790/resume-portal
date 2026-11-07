package com.portal.demo;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/demo/match")
@RequiredArgsConstructor
public class DemoMatchController {

    private final DemoMatchService demoMatchService;

    @PostMapping("/run")
    public ResponseEntity<List<DemoMatchResponse>> runMatching(
            @RequestParam Long resumeId, Authentication authentication) {
        Long studentId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(demoMatchService.findMatches(resumeId, studentId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<DemoMatchResponse>> getMatches(
            @RequestParam Long resumeId, Authentication authentication) {
        Long studentId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(demoMatchService.findMatches(resumeId, studentId));
    }
}
