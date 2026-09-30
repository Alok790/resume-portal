-- Resume Portal — PostgreSQL Schema
-- This file is for reference/documentation only.
-- The actual tables are created automatically by Hibernate (spring.jpa.hibernate.ddl-auto=update).

CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          VARCHAR(20)   NOT NULL CHECK (role IN ('STUDENT', 'RECRUITER')),
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resumes (
    id               BIGSERIAL PRIMARY KEY,
    student_id       BIGINT        NOT NULL,
    file_path        VARCHAR(500)  NOT NULL,
    extracted_skills JSONB,
    status           VARCHAR(20)   NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSED')),
    uploaded_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jobs (
    id               BIGSERIAL PRIMARY KEY,
    recruiter_id     BIGINT        NOT NULL,
    title            VARCHAR(200)  NOT NULL,
    description      TEXT,
    required_skills  JSONB         NOT NULL,
    posted_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_matches (
    id                BIGSERIAL PRIMARY KEY,
    resume_id         BIGINT         NOT NULL,
    job_id            BIGINT         NOT NULL,
    match_percentage  DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    missing_skills    JSONB,
    matched_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_match_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_job    FOREIGN KEY (job_id)    REFERENCES jobs(id)    ON DELETE CASCADE,
    CONSTRAINT uq_resume_job   UNIQUE (resume_id, job_id)
);
