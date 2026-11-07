package com.portal.demo;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class DemoJobPostingRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public List<DemoJobPosting> findAll() {
        return jdbcTemplate.query("""
                SELECT id, title, company, location, salary, experience_level,
                       required_skills::text AS required_skills, description, created_at
                FROM demo_job_postings
                ORDER BY id
                """, this::mapPosting);
    }

    private DemoJobPosting mapPosting(ResultSet resultSet, int rowNumber) throws SQLException {
        try {
            List<String> skills = objectMapper.readValue(
                    resultSet.getString("required_skills"), new TypeReference<>() {});
            return new DemoJobPosting(
                    resultSet.getLong("id"),
                    resultSet.getString("title"),
                    resultSet.getString("company"),
                    resultSet.getString("location"),
                    resultSet.getString("salary"),
                    resultSet.getString("experience_level"),
                    skills,
                    resultSet.getString("description"),
                    resultSet.getTimestamp("created_at").toLocalDateTime());
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException(
                    "Could not read required skills for demo job " + resultSet.getLong("id"),
                    exception);
        }
    }
}
