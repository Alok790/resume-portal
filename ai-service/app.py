from flask import Flask, request, jsonify
from flask_cors import CORS
from extractor import extract_text_from_pdf, extract_skills
from matcher import calculate_match
import io

import os

app = Flask(__name__)
allowed = ["http://localhost:8080", "http://localhost:5173"]
extra = os.environ.get("ALLOWED_ORIGINS", "")
if extra:
    allowed += [o.strip() for o in extra.split(",") if o.strip()]
CORS(app, origins=allowed)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/extract-skills", methods=["POST"])
def extract_skills_route():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    try:
        file_stream = io.BytesIO(file.read())
        text = extract_text_from_pdf(file_stream)
        skills = extract_skills(text)
        return jsonify({"skills": skills})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/match-jobs", methods=["POST"])
def match_jobs_route():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    resume_skills = data.get("resume_skills", [])
    job_skills    = data.get("job_skills", [])

    try:
        match_pct, missing = calculate_match(resume_skills, job_skills)
        return jsonify({
            "match_percentage": match_pct,
            "missing_skills":   missing
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True, use_reloader=False)
