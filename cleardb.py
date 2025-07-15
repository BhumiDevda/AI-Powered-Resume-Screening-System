#This is a mini program I wrote to wipe the database before every test I ran.

import sqlite3
conn = sqlite3.connect("resume_matcher.db")
cursor = conn.cursor()

tables = ["job_descriptions", "resumes", "skills", "matches"]

for table in tables:
    cursor.execute(f"DELETE FROM {table};")

conn.commit()
conn.close()