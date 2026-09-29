package com.portal.controller;

import com.portal.dto.MatchResponse;
import com.portal.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/match")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping("/run")
    public ResponseEntity<List<MatchResponse>> runMatching(@RequestParam Long resumeId,
                                                            Authentication authentication) {
        Long studentId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(matchService.runMatching(resumeId, studentId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<MatchResponse>> getMyMatches(@RequestParam Long resumeId) {
        return ResponseEntity.ok(matchService.getMatchesForResume(resumeId));
    }

    @GetMapping("/jobs/{jobId}/applicants")
    public ResponseEntity<List<MatchResponse>> getApplicants(@PathVariable Long jobId,
                                                              Authentication authentication) {
        Long recruiterId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(matchService.getApplicantsForJob(jobId, recruiterId));
    }
}
