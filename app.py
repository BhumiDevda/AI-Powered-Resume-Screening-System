from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sqlite3
from sentence_transformers import SentenceTransformer, util
from utils import extract_text, extract_skills, calculate_skill_match
from database import init_db

app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB limit
model = SentenceTransformer('all-MiniLM-L6-v2')

@app.route("/", methods=['GET', 'POST'])
def match_resumes():
    if request.method == 'GET':
        return "<h1>Welcome to Resume Matcher API</h1><p>Use POST request to submit resumes.</p>"

    try:
        job_description = request.form['job_description'].strip()
        resume_files = request.files.getlist('resumes')
        clear_database = request.form.get('clear_database', 'false').lower() == 'true'
        
        if not resume_files or not job_description:
            return jsonify({"message": "❌ Please upload resumes and enter a job description."}), 400

        conn = sqlite3.connect("resume_matcher.db", timeout=300)
        cursor = conn.cursor()
        if clear_database:
            tables = ["job_descriptions", "resumes", "skills", "matches"]
            for table in tables:
                cursor.execute(f"DELETE FROM {table};")
        conn.commit()
        try:
            cursor.execute("INSERT INTO job_descriptions (description) VALUES (?)", (job_description,))
            job_id = cursor.lastrowid
            conn.commit()

            job_skills = extract_skills(job_description)
            if not job_skills:
                job_skills = ["Python", "Java", "SQL"]

            results = []
            for resume_file in resume_files:
                try:
                    filename = os.path.join(app.config['UPLOAD_FOLDER'], resume_file.filename)
                    resume_file.save(filename)
                    resume_text = extract_text(filename)

                    resume_skills = extract_skills(resume_text)

                    cursor.execute("INSERT INTO resumes (filename, text) VALUES (?, ?)", (resume_file.filename, resume_text))
                    resume_id = cursor.lastrowid

                    for skill in resume_skills:
                        cursor.execute("INSERT INTO skills (resume_id, skill) VALUES (?, ?)", (resume_id, skill))

                    conn.commit()

                    skill_match_score, matched_skills = calculate_skill_match(resume_skills, job_skills)

                    job_embedding = model.encode(job_description, convert_to_tensor=True)
                    resume_embedding = model.encode(resume_text, convert_to_tensor=True)
                    similarity = util.pytorch_cos_sim(job_embedding, resume_embedding)[0].item()

                    final_score = (similarity * 0.6) + (skill_match_score * 0.4)
                    fit_label = "Fit" if final_score > 0.4 else "Not Fit"

                    cursor.execute("INSERT INTO matches (job_id, resume_id, similarity_score, fit_label) VALUES (?, ?, ?, ?)",
                                   (job_id, resume_id, final_score, fit_label))

                    conn.commit()

                    results.append({
                        "filename": resume_file.filename,
                        "similarity_score": round(final_score * 100, 2),  
                        "fit_label": fit_label, 
                        "skills": list(resume_skills) 
                    })

                except Exception as e:
                    print(f"Error processing resume {resume_file.filename}: {e}")
                    results.append({
                        "filename": resume_file.filename,
                        "similarity_score": "Error",
                        "fit_label": "Error",
                        "skills": []
                    })

        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return jsonify({"error": "Database error occurred."}), 500
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"error": "An error occurred during processing."}), 500
        finally:
            conn.close()

        return jsonify({"results": results})

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"message": "Failed to process the request"}), 500

@app.route("/download/<filename>")
def download_resume(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    try:
        return send_file(file_path, as_attachment=True)
    except FileNotFoundError:
        return jsonify({"message": "File not found"}), 404
    except Exception as e:
        print(f"Download error: {e}")
        return jsonify({"message": "Download failed"}), 500

@app.route('/favicon.ico')
def favicon():
    return "", 204

@app.route("/dashboard", methods=["GET"])
def dashboard():
    """Provide statistical data for the dashboard."""
    conn = sqlite3.connect("resume_matcher.db")
    cursor = conn.cursor()
    

    # Fetch total job descriptions
    cursor.execute("SELECT COUNT(*) FROM job_descriptions")
    total_jobs = cursor.fetchone()[0]

    # Fetch total resumes
    cursor.execute("SELECT COUNT(*) FROM resumes")
    total_resumes = cursor.fetchone()[0]

    # Fit vs. Not Fit count
    cursor.execute("SELECT fit_label, COUNT(*) FROM matches GROUP BY fit_label")
    fit_counts = {row[0]: row[1] for row in cursor.fetchall()}

    # Average similarity score
    cursor.execute("SELECT AVG(similarity_score) FROM matches")
    avg_similarity = cursor.fetchone()[0]

    # Top 5 skills
    cursor.execute("""
        SELECT skill, COUNT(*) as count FROM skills 
        GROUP BY skill ORDER BY count DESC LIMIT 5
    """)
    top_skills = [{"skill": row[0], "count": row[1]} for row in cursor.fetchall()]

    return jsonify({
        "total_jobs": total_jobs,
        "total_resumes": total_resumes,
        "fit_distribution": fit_counts,
        "avg_similarity": round(avg_similarity * 100, 2) if avg_similarity else 0,
        "top_skills": top_skills 
    })


if __name__ == "__main__":
    from database import init_db
    init_db()
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(debug=True)
