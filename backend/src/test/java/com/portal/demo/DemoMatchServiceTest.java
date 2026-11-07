package com.portal.demo;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portal.dto.MatchResponse;
import com.portal.model.Resume;
import com.portal.model.ResumeStatus;
import com.portal.model.Role;
import com.portal.model.User;
import com.portal.repository.ResumeRepository;
import com.portal.service.MatchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemoMatchServiceTest {

    @Mock DemoJobPostingRepository demoJobPostingRepository;
    @Mock ResumeRepository resumeRepository;
    @Mock MatchService matchService;
    @Spy ObjectMapper objectMapper = new ObjectMapper();
    @InjectMocks DemoMatchService demoMatchService;

    private Resume resume;
    private DemoJobPosting posting;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(demoMatchService, "demoMode", true);
        User student = User.builder().id(7L).role(Role.STUDENT).build();
        resume = Resume.builder()
                .id(12L)
                .student(student)
                .extractedSkills("[\"React\",\" JavaScript \",\"CSS\"]")
                .status(ResumeStatus.PROCESSED)
                .build();
        posting = new DemoJobPosting(1L, "Frontend Developer", "Northstar Labs",
                "Bengaluru, India", "INR 10-16 LPA", "Mid-level",
                List.of("React", "JavaScript", "TypeScript", "CSS"),
                "Build product interfaces.", null);
    }

    @Test
    void findMatches_sortsMatchesAndRecommendsMissingSkillsBelowThreshold() {
        when(resumeRepository.findById(12L)).thenReturn(Optional.of(resume));
        when(demoJobPostingRepository.findAll()).thenReturn(List.of(posting));

        List<DemoMatchResponse> results = demoMatchService.findMatches(12L, 7L);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).matchPercentage()).isEqualTo(87.5);
        assertThat(results.get(0).missingSkills()).containsExactly("TypeScript");
        assertThat(results.get(0).similarSkills()).containsExactly("TypeScript");
        assertThat(results.get(0).learningRecommended()).isFalse();
    }

    @Test
    void findMatches_returnsLearningRecommendationsBelowSeventyPercent() {
        when(resumeRepository.findById(12L)).thenReturn(Optional.of(resume));
        when(demoJobPostingRepository.findAll()).thenReturn(List.of(new DemoJobPosting(
                2L, "Platform Developer", "Blue Oak Technologies", "Pune, India",
                "INR 12-18 LPA", "Mid-level",
                List.of("React", "JavaScript", "TypeScript", "Docker", "Kubernetes"),
                "Build platforms.", null)));

        DemoMatchResponse result = demoMatchService.findMatches(12L, 7L).get(0);

        assertThat(result.matchPercentage()).isEqualTo(50.0);
        assertThat(result.learningRecommended()).isTrue();
        assertThat(result.learningRecommendations()).containsExactly("TypeScript", "Docker", "Kubernetes");
    }

    @Test
    void findMatches_rejectsAnotherUsersResume() {
        when(resumeRepository.findById(12L)).thenReturn(Optional.of(resume));

        assertThatThrownBy(() -> demoMatchService.findMatches(12L, 99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Access denied");
    }

    @Test
    void findMatches_whenDemoModeDisabledDelegatesToExistingMatcher() {
        ReflectionTestUtils.setField(demoMatchService, "demoMode", false);
        MatchResponse productionMatch = MatchResponse.builder()
                .matchId(20L)
                .jobId(30L)
                .jobTitle("Existing production job")
                .matchPercentage(82.0)
                .missingSkills(List.of("Docker"))
                .requiredSkills(List.of("Java", "Docker"))
                .build();
        when(matchService.runMatching(12L, 7L)).thenReturn(List.of(productionMatch));

        List<DemoMatchResponse> results = demoMatchService.findMatches(12L, 7L);

        verify(matchService).runMatching(12L, 7L);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).jobTitle()).isEqualTo("Existing production job");
        assertThat(results.get(0).learningRecommended()).isFalse();
    }

    @Test
    void calculateMatchPercentage_isCaseInsensitiveAndIgnoresDuplicateSkills() {
        assertThat(DemoMatchService.calculateMatchPercentage(
                List.of("react", "React", " CSS "),
                List.of("React", "CSS", "TypeScript"))).isEqualTo(83.33);
    }

    @Test
    void calculateMatchPercentage_handlesExactLearningRecommendationBoundary() {
        assertThat(DemoMatchService.calculateMatchPercentage(
                List.of("Java", "SQL", "Git", "Docker", "AWS", "Linux", "Maven"),
                List.of("Java", "SQL", "Git", "Docker", "AWS", "Linux", "Maven", "Power BI", "Tableau", "Excel")))
                .isEqualTo(70.0);
    }
}
