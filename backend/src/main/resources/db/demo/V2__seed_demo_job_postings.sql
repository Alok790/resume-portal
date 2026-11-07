WITH role_catalog (
    role_id, title, salary_base, required_skills, description
) AS (
    VALUES
        (1, 'Frontend Developer', 9, '["JavaScript","HTML","CSS","React","Git"]'::jsonb,
         'Build accessible, responsive product interfaces and collaborate with design and API teams.'),
        (2, 'React Developer', 11, '["JavaScript","React","TypeScript","Redux","CSS"]'::jsonb,
         'Develop reusable React components, improve client-side performance, and maintain frontend tests.'),
        (3, 'Full Stack Developer', 12, '["JavaScript","React","Node.js","Express","PostgreSQL"]'::jsonb,
         'Deliver end-to-end web features across a React frontend, Node.js services, and relational data.'),
        (4, 'MERN Developer', 10, '["MongoDB","Express","React","Node.js","JavaScript"]'::jsonb,
         'Build and maintain MERN applications, REST APIs, and reliable data flows for customer products.'),
        (5, 'Backend Developer', 12, '["Java","Spring Boot","REST APIs","PostgreSQL","Docker"]'::jsonb,
         'Design secure backend services, versioned APIs, and resilient database integrations.'),
        (6, 'Java Developer', 13, '["Java","Spring Boot","Microservices","SQL","JUnit"]'::jsonb,
         'Implement Java services, write maintainable tests, and support production-grade integrations.'),
        (7, 'Python Developer', 10, '["Python","Flask","REST APIs","PostgreSQL","Git"]'::jsonb,
         'Create Python services and automation tools with clear API contracts and reliable tests.'),
        (8, 'Data Analyst', 8, '["SQL","Python","Excel","Tableau","Statistics"]'::jsonb,
         'Turn business questions into trusted analysis, clear dashboards, and actionable recommendations.'),
        (9, 'Data Scientist', 15, '["Python","SQL","Pandas","Machine Learning","Statistics"]'::jsonb,
         'Explore datasets, build predictive models, and communicate measurable product insights.'),
        (10, 'DevOps Engineer', 14, '["Linux","Docker","Kubernetes","CI/CD","AWS"]'::jsonb,
         'Automate cloud delivery pipelines, improve service reliability, and strengthen observability.'),
        (11, 'Cloud Engineer', 15, '["AWS","Terraform","Linux","Docker","Kubernetes"]'::jsonb,
         'Provision secure cloud infrastructure and improve cost, availability, and deployment workflows.'),
        (12, 'UI/UX Designer', 9, '["Figma","UX Research","Prototyping","Wireframing","Design Systems"]'::jsonb,
         'Research user needs and craft accessible flows, prototypes, and consistent design systems.'),
        (13, 'QA Engineer', 8, '["Manual Testing","Selenium","API Testing","SQL","Jira"]'::jsonb,
         'Plan functional and regression tests, automate critical paths, and help teams ship with confidence.'),
        (14, 'AI Engineer', 18, '["Python","Machine Learning","LLMs","FastAPI","Docker"]'::jsonb,
         'Integrate applied AI capabilities into production services with evaluation and responsible safeguards.'),
        (15, 'Machine Learning Engineer', 18, '["Python","PyTorch","Scikit-learn","MLOps","SQL"]'::jsonb,
         'Train, evaluate, and deploy machine learning models with reproducible data and monitoring pipelines.')
),
companies(company_name) AS (
    SELECT ARRAY[
        'Northstar Labs', 'Blue Oak Technologies', 'Orbit Systems', 'Cedarline Digital',
        'Brightpath Software', 'Meridian Cloud', 'Copperfield Analytics', 'SummitWorks',
        'Lattice Harbor', 'Evergreen Data', 'Pioneer Stack', 'Silverfern Products',
        'Juniper Ridge Tech', 'Atlas Grove', 'Daybreak Computing', 'Nimble Current',
        'Keystone Pixel', 'Maplewave Systems', 'Cloudwell Studio', 'Openfield Innovations'
    ]::text[]
),
locations(location_name) AS (
    SELECT ARRAY[
        'Bengaluru, India', 'Hyderabad, India', 'Pune, India', 'Mumbai, India',
        'New Delhi, India', 'Chennai, India', 'Kochi, India', 'Ahmedabad, India',
        'Jaipur, India', 'Remote, India'
    ]::text[]
),
job_numbers AS (
    SELECT
        n AS job_id,
        ((n - 1) % 15) + 1 AS role_id
    FROM generate_series(1, 100) AS n
)
INSERT INTO demo_job_postings (
    id, title, company, location, salary, experience_level,
    required_skills, description, created_at
)
SELECT
    jobs.job_id,
    roles.title,
    companies.company_name[((jobs.job_id - 1) % array_length(companies.company_name, 1)) + 1],
    locations.location_name[((jobs.job_id - 1) % array_length(locations.location_name, 1)) + 1],
    'INR ' || (roles.salary_base + jobs.job_id % 4)::text || '-' ||
        (roles.salary_base + 6 + jobs.job_id % 4)::text || ' LPA',
    CASE jobs.job_id % 4
        WHEN 0 THEN 'Senior (5+ years)'
        WHEN 1 THEN 'Entry (0-2 years)'
        WHEN 2 THEN 'Mid-level (2-5 years)'
        ELSE 'Mid-level (3-5 years)'
    END,
    roles.required_skills,
    roles.description || ' Join ' ||
        companies.company_name[((jobs.job_id - 1) % array_length(companies.company_name, 1)) + 1] ||
        ' and work with a cross-functional team on customer-facing technology products.',
    CURRENT_TIMESTAMP - (jobs.job_id % 60) * INTERVAL '1 day'
FROM job_numbers jobs
JOIN role_catalog roles ON roles.role_id = jobs.role_id
CROSS JOIN companies
CROSS JOIN locations
ON CONFLICT (id) DO NOTHING;
