import sqlite3

def init_db():
    conn = sqlite3.connect("resume_matcher.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS job_descriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            text TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resume_id INTEGER,
            skill TEXT,
            FOREIGN KEY (resume_id) REFERENCES resumes(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER,
            resume_id INTEGER,
            similarity_score REAL,
            fit_label TEXT,
            FOREIGN KEY (job_id) REFERENCES job_descriptions(id),
            FOREIGN KEY (resume_id) REFERENCES resumes(id)
        )
    """)

    conn.commit()
    conn.close()
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_db()
