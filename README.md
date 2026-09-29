# AI-Based Resume Screening and Job Matching Portal

A full-stack web application that uses AI/NLP to match student resumes against job postings.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Java 17 + Spring Boot 3 |
| AI Service | Python 3.10+ + Flask + scikit-learn |
| Database | MySQL 8 |

---

## Project Structure

```
resume-portal/
├── db/                  → MySQL schema
├── backend/             → Spring Boot REST API
├── ai-service/          → Python Flask AI service
└── frontend/            → React + Tailwind UI
```

---

## Setup & Run

### 1. Database

```sql
-- In MySQL client:
source db/schema.sql
```

### 2. Backend (Spring Boot)

Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=YOUR_MYSQL_USER
spring.datasource.password=YOUR_MYSQL_PASSWORD
jwt.secret=your-very-long-secret-key-at-least-256-bits
```

```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

### 3. AI Service (Python Flask)

```bash
cd ai-service
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5001
```

### 4. Frontend (React)

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register (Student or Recruiter) |
| POST | `/api/auth/login` | Login → returns JWT |

### Resume (Student)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/resume/upload` | Upload PDF resume |
| GET | `/api/resume/my` | List my resumes + status |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs` | Post a job (Recruiter) |
| GET | `/api/jobs` | List all jobs |

### Matching
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/match/run?resumeId=` | Run AI matching for a resume |
| GET | `/api/match/my?resumeId=` | Get cached match results |
| GET | `/api/match/jobs/{id}/applicants` | Get ranked applicants (Recruiter) |

### AI Service (internal)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/extract-skills` | Extract skills from PDF |
| POST | `/match-jobs` | Calculate TF-IDF cosine match % |

---

## How It Works

1. **Student** registers, uploads a PDF resume
2. Spring Boot saves the file, fires an `@Async` background thread
3. The thread calls the **Flask AI service** → `pdfminer` extracts text → vocab matching finds skills
4. Skills are saved to MySQL; resume status flips to `PROCESSED`
5. Student clicks **"Find Matches"** → Spring Boot calls Flask for each job → stores match %
6. Student sees ranked jobs with green matched skills and red missing skills
7. **Recruiter** posts jobs with a skill tag input, views ranked applicant list with bar charts
