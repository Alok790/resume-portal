CREATE DATABASE IF NOT EXISTS resume_portal;
USE resume_portal;

CREATE TABLE users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role        ENUM('STUDENT', 'RECRUITER') NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resumes (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id       BIGINT        NOT NULL,
    file_path        VARCHAR(500)  NOT NULL,
    extracted_skills JSON,
    status           ENUM('PENDING', 'PROCESSED') NOT NULL DEFAULT 'PENDING',
    uploaded_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE jobs (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id     BIGINT        NOT NULL,
    title            VARCHAR(200)  NOT NULL,
    description      TEXT,
    required_skills  JSON          NOT NULL,
    posted_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE job_matches (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    resume_id         BIGINT         NOT NULL,
    job_id            BIGINT         NOT NULL,
    match_percentage  DOUBLE         NOT NULL DEFAULT 0.0,
    missing_skills    JSON,
    matched_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_match_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_job    FOREIGN KEY (job_id)    REFERENCES jobs(id)    ON DELETE CASCADE,
    CONSTRAINT uq_resume_job   UNIQUE (resume_id, job_id)
);
