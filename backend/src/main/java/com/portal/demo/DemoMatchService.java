package com.portal.demo;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portal.dto.MatchResponse;
import com.portal.model.Resume;
import com.portal.model.ResumeStatus;
import com.portal.repository.ResumeRepository;
import com.portal.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Map;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DemoMatchService {

    private static final double LEARNING_RECOMMENDATION_THRESHOLD = 70.0;
    private static final int DEFAULT_RESULT_LIMIT = 20;
    private static final List<Set<String>> RELATED_SKILL_GROUPS = List.of(
            Set.of("javascript", "typescript", "react", "redux", "node.js", "html", "css"),
            Set.of("html", "css", "sass", "tailwind css", "bootstrap"),
            Set.of("java", "spring boot", "microservices", "maven", "junit"),
            Set.of("python", "flask", "django", "pandas", "fastapi"),
            Set.of("sql", "postgresql", "mysql", "pandas"),
            Set.of("docker", "kubernetes", "linux", "aws", "terraform", "ci/cd"),
            Set.of("machine learning", "pytorch", "scikit-learn", "mlops", "llms"),
            Set.of("figma", "ux research", "prototyping", "wireframing", "design systems"),
            Set.of("selenium", "manual testing", "api testing", "junit"));
    private static final Map<String, String> SKILL_ALIASES = Map.of(
            "js", "javascript",
            "react.js", "react",
            "node", "node.js",
            "postgres", "postgresql",
            "k8s", "kubernetes",
            "scikit learn", "scikit-learn");

    private final DemoJobPostingRepository demoJobPostingRepository;
    private final ResumeRepository resumeRepository;
    private final MatchService matchService;
    private final ObjectMapper objectMapper;

    @Value("${DEMO_MODE:false}")
    private boolean demoMode;

    @Transactional
    public List<DemoMatchResponse> findMatches(Long resumeId, Long studentId) {
        if (!demoMode) {
            return matchService.runMatching(resumeId, studentId).stream()
                    .map(DemoMatchService::fromProductionMatch)
                    .toList();
        }

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
        if (!resume.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("Access denied");
        }
        if (resume.getStatus() != ResumeStatus.PROCESSED) {
            throw new RuntimeException("Resume is still being processed. Please wait.");
        }

        List<String> resumeSkills = parseSkills(resume.getExtractedSkills());
        if (resumeSkills.isEmpty()) {
            throw new RuntimeException("Resume has no extracted skills to match.");
        }

        LocalDateTime matchedAt = LocalDateTime.now();
        return demoJobPostingRepository.findAll().stream()
                .map(job -> toMatch(job, resumeSkills, matchedAt))
                .sorted(Comparator.comparing(DemoMatchResponse::matchPercentage).reversed()
                        .thenComparing(Comparator.comparingInt(
                                (DemoMatchResponse match) -> match.similarSkills().size()).reversed())
                        .thenComparing(Comparator.comparingInt(
                                (DemoMatchResponse match) -> match.matchedSkills().size()).reversed())
                        .thenComparing(DemoMatchResponse::jobId))
                .limit(DEFAULT_RESULT_LIMIT)
                .toList();
    }

    static double calculateMatchPercentage(List<String> userSkills, List<String> requiredSkills) {
        Set<String> normalizedUserSkills = normalize(userSkills);
        Set<String> normalizedRequiredSkills = normalize(requiredSkills);
        if (normalizedRequiredSkills.isEmpty()) {
            return 0.0;
        }

        double weightedMatchedCount = 0.0;
        for (String requiredSkill : normalizedRequiredSkills) {
            if (normalizedUserSkills.contains(requiredSkill)) {
                weightedMatchedCount += 1.0;
            } else if (hasRelatedSkill(normalizedUserSkills, requiredSkill)) {
                weightedMatchedCount += 0.5;
            }
        }
        return BigDecimal.valueOf(weightedMatchedCount * 100.0 / normalizedRequiredSkills.size())
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private DemoMatchResponse toMatch(
            DemoJobPosting job, List<String> resumeSkills, LocalDateTime matchedAt) {
        List<String> missingSkills = findMissingSkills(resumeSkills, job.requiredSkills());
        List<String> matchedSkills = findMatchedSkills(resumeSkills, job.requiredSkills());
        List<String> similarSkills = findSimilarSkills(resumeSkills, missingSkills);
        double matchPercentage = calculateMatchPercentage(resumeSkills, job.requiredSkills());
        boolean learningRecommended = matchPercentage < LEARNING_RECOMMENDATION_THRESHOLD;

        return DemoMatchResponse.builder()
                .matchId(job.id())
                .jobId(job.id())
                .jobTitle(job.title())
                .jobDescription(job.description())
                .matchPercentage(matchPercentage)
                .missingSkills(missingSkills)
                .requiredSkills(job.requiredSkills())
                .matchedSkills(matchedSkills)
                .similarSkills(similarSkills)
                .matchedAt(matchedAt.toString())
                .company(job.company())
                .location(job.location())
                .salary(job.salary())
                .experienceLevel(job.experienceLevel())
                .learningRecommended(learningRecommended)
                .learningRecommendations(learningRecommended ? missingSkills : List.of())
                .build();
    }

    private static DemoMatchResponse fromProductionMatch(MatchResponse match) {
        List<String> missingSkills = match.getMissingSkills() == null
                ? List.of() : match.getMissingSkills();
        return DemoMatchResponse.builder()
                .matchId(match.getMatchId())
                .jobId(match.getJobId())
                .jobTitle(match.getJobTitle())
                .jobDescription(match.getJobDescription())
                .matchPercentage(match.getMatchPercentage())
                .missingSkills(missingSkills)
                .requiredSkills(match.getRequiredSkills())
                .matchedSkills(match.getRequiredSkills() == null ? List.of()
                        : match.getRequiredSkills().stream()
                                .filter(skill -> !missingSkills.contains(skill))
                                .toList())
                .similarSkills(List.of())
                .matchedAt(match.getMatchedAt())
                .learningRecommended(false)
                .learningRecommendations(List.of())
                .build();
    }

    private List<String> parseSkills(String skillsJson) {
        if (skillsJson == null || skillsJson.isBlank()) {
            return List.of();
        }
        String trimmedSkills = skillsJson.trim();
        if (trimmedSkills.startsWith("[") &&
                (trimmedSkills.length() == 1 || trimmedSkills.charAt(1) == '"')) {
            try {
                return objectMapper.readValue(skillsJson, new TypeReference<>() {});
            } catch (JsonProcessingException exception) {
                throw new IllegalStateException("Could not read extracted resume skills.", exception);
            }
        }

        String cleaned = trimmedSkills.replaceAll("[\\[\\]]", "").trim();
        if (cleaned.isBlank()) {
            return List.of();
        }
        List<String> skills = new ArrayList<>();
        for (String skill : cleaned.split(",")) {
            String trimmed = skill.trim();
            if (!trimmed.isEmpty()) {
                skills.add(trimmed);
            }
        }
        return skills;
    }

    private static List<String> findMissingSkills(List<String> userSkills, List<String> requiredSkills) {
        Set<String> normalizedUserSkills = normalize(userSkills);
        return requiredSkills.stream()
                .filter(skill -> !normalizedUserSkills.contains(normalize(skill)))
                .distinct()
                .toList();
    }

    private static List<String> findMatchedSkills(List<String> userSkills, List<String> requiredSkills) {
        Set<String> normalizedUserSkills = normalize(userSkills);
        return requiredSkills.stream()
                .filter(skill -> normalizedUserSkills.contains(normalize(skill)))
                .distinct()
                .toList();
    }

    private static List<String> findSimilarSkills(List<String> userSkills, List<String> missingSkills) {
        Set<String> normalizedUserSkills = normalize(userSkills);
        return missingSkills.stream()
                .filter(skill -> hasRelatedSkill(normalizedUserSkills, skill))
                .distinct()
                .toList();
    }

    private static boolean hasRelatedSkill(Set<String> userSkills, String requiredSkill) {
        String normalizedRequiredSkill = normalize(requiredSkill);
        String canonicalRequiredSkill = SKILL_ALIASES.getOrDefault(
                normalizedRequiredSkill, normalizedRequiredSkill);
        for (String userSkill : userSkills) {
            String canonicalUserSkill = SKILL_ALIASES.getOrDefault(userSkill, userSkill);
            if (!canonicalUserSkill.equals(canonicalRequiredSkill)
                    && RELATED_SKILL_GROUPS.stream().anyMatch(group ->
                            group.contains(canonicalUserSkill)
                                    && group.contains(canonicalRequiredSkill))) {
                return true;
            }
        }
        return false;
    }

    private static Set<String> normalize(List<String> skills) {
        Set<String> normalized = new LinkedHashSet<>();
        for (String skill : skills) {
            String key = normalize(skill);
            if (!key.isEmpty()) {
                normalized.add(SKILL_ALIASES.getOrDefault(key, key));
            }
        }
        return normalized;
    }

    private static String normalize(String skill) {
        return skill == null ? "" : skill.trim().toLowerCase(Locale.ROOT);
    }
}
