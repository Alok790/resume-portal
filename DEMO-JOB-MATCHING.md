# Isolated demo job matching

The demo matcher is additive. It uses a dedicated PostgreSQL table, a dedicated
authenticated endpoint (`POST /api/demo/match/run?resumeId=...`), and the
existing extracted skills on a processed resume. It does not write resume,
user, job, or job-match records.

## Database setup

Run these scripts against the PostgreSQL database selected for demo testing,
in order:

1. `backend/src/main/resources/db/demo/V1__create_demo_job_postings.sql`
2. `backend/src/main/resources/db/demo/V2__seed_demo_job_postings.sql`

The seed inserts 100 demo postings and is safe to re-run; rows with an existing
demo ID are left unchanged. Keep both scripts out of any automatic production
migration until the demo has been explicitly approved for that environment.

## Feature flag

Set `DEMO_MODE=true` on the backend process to use `demo_job_postings`.
`DEMO_MODE` defaults to `false`; with it unset or false, the new demo endpoint
delegates to the current production `MatchService`. The existing `/api/match/**`
endpoints do not change behavior.

To switch the student dashboard's **Find Matches** button and results page to
the isolated demo endpoints, also set `VITE_DEMO_MODE=true` on the frontend
process before starting Vite. Leave it unset or false to keep the current
production frontend flow. Both flags must be enabled to use the seeded demo
postings.

For local development, set the environment variable before launching Spring
Boot:

```powershell
$env:DEMO_MODE = 'true'
mvn spring-boot:run
```

For production, leave `DEMO_MODE` unset/false unless demo data has been
intentionally seeded in that database and demo matching has been approved.

## Endpoint and response

Call the new endpoint with the same JWT and resume ownership rules as existing
student matching:

```http
POST /api/demo/match/run?resumeId=42
Authorization: Bearer <existing JWT>
```

The response is sorted by match percentage (best first), capped at 20 jobs,
and keeps the existing match result fields (`jobTitle`, `matchPercentage`,
`missingSkills`, and `requiredSkills`). Demo results also include company,
location, salary, experience level, and learning recommendations.

Scores count exact normalized skill matches fully and a curated related-skill
match (for example, JavaScript for a TypeScript requirement) as half credit.
Results are ordered by score, related skills, then exact skills. If a score is
below 70%, `learningRecommended` is true and `learningRecommendations` lists
the missing skills. No skills are sent back to or re-extracted by the AI
service.

## Optional UI integration

The current dashboard continues to call its existing production endpoint.
To expose demo matching in the UI, make a separate opt-in UI change: call
`POST /api/demo/match/run?resumeId=${resume.id}`. With `VITE_DEMO_MODE=true`,
the dashboard does this and the results page reloads from
`GET /api/demo/match/my?resumeId=${resume.id}`. Do not silently replace
`/api/match/run`; the dedicated routes and paired flags keep the demo opt-in
and reversible.

The demo results page keeps the standard **Job Match Results** heading and
labels each sample opening. Its **Apply (Demo)** button stores a simulated
application in the browser's local storage and changes to **Applied (Demo)**.
It does not contact an employer or write an application to the backend or
database. The production match cards do not show this demo-only control.

## Why existing functionality is isolated

- Login, signup, logout, JWT handling, and user tables are not changed.
- Resume upload, parsing, and skill extraction are not changed.
- The new SQL only creates and seeds `demo_job_postings`.
- The existing jobs and job-match tables are not read or written in demo mode.
- Matching checks that the resume belongs to the authenticated user and is
  already processed before reading its extracted skills.
- The existing `/api/match/**` routes remain untouched. With demo mode off,
  this new endpoint delegates to the existing matching service.
