CREATE TABLE IF NOT EXISTS demo_job_postings (
    id BIGINT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200) NOT NULL,
    location VARCHAR(200) NOT NULL,
    salary VARCHAR(100) NOT NULL,
    experience_level VARCHAR(100) NOT NULL,
    required_skills JSONB NOT NULL CHECK (jsonb_typeof(required_skills) = 'array'),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_demo_job_postings_title
    ON demo_job_postings (title);
