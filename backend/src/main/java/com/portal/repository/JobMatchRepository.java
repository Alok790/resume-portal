package com.portal.repository;

import com.portal.model.JobMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface JobMatchRepository extends JpaRepository<JobMatch, Long> {
    List<JobMatch> findByResumeIdOrderByMatchPercentageDesc(Long resumeId);
    List<JobMatch> findByJobIdOrderByMatchPercentageDesc(Long jobId);

    @Transactional
    void deleteByResumeId(Long resumeId);
}
