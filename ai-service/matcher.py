from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def calculate_match(resume_skills, job_skills):
    """
    Calculate job match percentage using TF-IDF cosine similarity.
    Returns (match_percentage: float, missing_skills: list[str])
    """
    if not resume_skills or not job_skills:
        return 0.0, list(job_skills) if job_skills else []

    resume_text = " ".join([s.lower() for s in resume_skills])
    job_text    = " ".join([s.lower() for s in job_skills])

    try:
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([resume_text, job_text])
        similarity = cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])[0][0]
        match_pct = round(float(similarity) * 100, 2)
    except Exception:
        match_pct = 0.0

    # Missing skills: job skills not present in resume (case-insensitive)
    resume_lower = {s.lower() for s in resume_skills}
    missing = [s for s in job_skills if s.lower() not in resume_lower]

    return match_pct, missing
