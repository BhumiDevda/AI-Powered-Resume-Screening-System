import os
import docx2txt
from PyPDF2 import PdfReader
import spacy
import re

SKILL_KEYWORDS = [
    "Python", "Java", "C++", "SQL", "Machine Learning", "Data Analysis",
    "Django", "Flask", "JavaScript", "React", "Node.js", "Docker",
    "Kubernetes", "TensorFlow", "PyTorch", "Power BI", "Excel",
    "Git", "AWS", "Azure", "PowerPoint", "Bloomberg", "Thomson Reuters",
    "Net Asset Value", "PL allocations", "Accrual Reconciliations", "Auditor",  "Reconciliations",
    "Investment Manager", "Operational deliverables"
]

nlp = spacy.load("en_core_web_sm")

def extract_text(file_path):
    text = ""
    try:
        if file_path.endswith('.pdf'):
            with open(file_path, 'rb') as file:
                reader = PdfReader(file)
                for page in reader.pages:
                    extracted_text = page.extract_text()
                    if extracted_text:
                        text += extracted_text
        elif file_path.endswith('.docx'):
            text = docx2txt.process(file_path)
        elif file_path.endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        return ""
    return text

def clean_text(text):
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_skills(text):
    found_skills = []
    for skill in SKILL_KEYWORDS:
        if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
            found_skills.append(skill)
    return found_skills

def calculate_skill_match(resume_skills, job_skills):
    matched_skills = set(resume_skills).intersection(set(job_skills))
    match_score = len(matched_skills) / len(job_skills) if job_skills else 0
    return match_score, matched_skills
