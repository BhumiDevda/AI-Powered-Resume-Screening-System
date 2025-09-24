import re
import random
from utils import extract_skills

# Question templates by category
TECHNICAL_QUESTIONS = {
    "Python": [
        "Explain the difference between lists and tuples in Python.",
        "How do you handle exceptions in Python? Can you give an example?",
        "What are Python decorators and when would you use them?",
        "Describe the difference between deep copy and shallow copy in Python.",
        "How would you optimize a slow Python script?"
    ],
    "SQL": [
        "What is the difference between INNER JOIN and LEFT JOIN?",
        "How would you optimize a slow-running SQL query?",
        "Explain the concept of database normalization.",
        "What are SQL indexes and how do they improve performance?",
        "How do you handle NULL values in SQL queries?"
    ],
    "JavaScript": [
        "Explain the concept of closures in JavaScript.",
        "What is the difference between == and === in JavaScript?",
        "How do you handle asynchronous operations in JavaScript?",
        "What is event delegation and why is it useful?",
        "Explain the difference between let, const, and var."
    ],
    "React": [
        "What is the virtual DOM and how does it work?",
        "Explain the difference between state and props in React.",
        "What are React hooks and why were they introduced?",
        "How do you handle state management in large React applications?",
        "What is the component lifecycle in React?"
    ],
    "Node.js": [
        "Explain the event loop in Node.js.",
        "What is the difference between synchronous and asynchronous operations in Node.js?",
        "How do you handle file operations in Node.js?",
        "What are middlewares in Express.js?",
        "How do you manage dependencies in a Node.js project?"
    ],
    "Power BI": [
        "How do you create relationships between tables in Power BI?",
        "What is the difference between calculated columns and measures in Power BI?",
        "How do you optimize Power BI report performance?",
        "Explain how to use DAX functions in Power BI.",
        "How do you implement row-level security in Power BI?"
    ],
    "Machine Learning": [
        "What is the difference between supervised and unsupervised learning?",
        "How do you handle overfitting in machine learning models?",
        "Explain the bias-variance tradeoff.",
        "What evaluation metrics would you use for a classification problem?",
        "How do you select features for a machine learning model?"
    ],
    "Data Analysis": [
        "How do you approach a new data analysis project?",
        "What steps would you take to clean messy data?",
        "How do you identify outliers in a dataset?",
        "Explain the difference between correlation and causation.",
        "How do you communicate complex data insights to non-technical stakeholders?"
    ],
    "AWS": [
        "What are the main components of AWS architecture?",
        "How do you ensure security in AWS deployments?",
        "Explain the difference between EC2 and Lambda.",
        "How do you manage costs in AWS?",
        "What is the purpose of VPC in AWS?"
    ],
    "Docker": [
        "What is containerization and how does Docker work?",
        "How do you optimize Docker images for production?",
        "Explain the difference between Docker images and containers.",
        "How do you manage data persistence in Docker containers?",
        "What is Docker Compose and when would you use it?"
    ]
}

BEHAVIORAL_QUESTIONS = [
    "Tell me about a challenging project you worked on recently.",
    "How do you handle tight deadlines and pressure?",
    "Describe a time when you had to learn a new technology quickly.",
    "How do you approach debugging a complex technical problem?",
    "Tell me about a time when you disagreed with a team member's approach.",
    "How do you stay updated with the latest technology trends?",
    "Describe a situation where you had to explain a technical concept to a non-technical person.",
    "How do you prioritize tasks when working on multiple projects?",
    "Tell me about a mistake you made in a project and how you handled it.",
    "What motivates you in your work as a developer/analyst?"
]

EXPERIENCE_QUESTIONS = [
    "Walk me through your experience with {experience}.",
    "What was your role in {experience}?",
    "What challenges did you face during {experience}?",
    "What technologies did you use in {experience}?",
    "How did you measure success in {experience}?",
    "What would you do differently if you could redo {experience}?"
]

EDUCATION_QUESTIONS = [
    "How has your {education} prepared you for this role?",
    "What was your favorite project during your {education}?",
    "How do you apply what you learned in {education} to practical work?",
    "What additional skills did you develop during your {education}?"
]

def extract_experience_info(resume_text):
    """Extract work experience information from resume text."""
    experience_info = []
    
    # Look for common experience patterns
    experience_patterns = [
        r'(Data Analyst|Software Developer|Developer|Analyst|Engineer|Intern)',
        r'(2024|2025|2023|2022|2021|2020)',
        r'([A-Z][\w\s]+(?:Inc|Ltd|Corp|Company|Solutions))',
    ]
    
    for pattern in experience_patterns:
        matches = re.findall(pattern, resume_text, re.IGNORECASE)
        experience_info.extend(matches)
    
    return list(set(experience_info))

def extract_education_info(resume_text):
    """Extract education information from resume text."""
    education_info = []
    
    education_patterns = [
        r'(Bachelor|Master|PhD|Degree|Diploma|Certificate)',
        r'(Data Science|Computer Science|Engineering|Business|Analytics)',
        r'(University|College|Institute)',
    ]
    
    for pattern in education_patterns:
        matches = re.findall(pattern, resume_text, re.IGNORECASE)
        education_info.extend(matches)
    
    return list(set(education_info))

def generate_technical_questions(skills, num_questions=5):
    """Generate technical questions based on identified skills."""
    questions = []
    
    for skill in skills[:num_questions]:
        if skill in TECHNICAL_QUESTIONS:
            question = random.choice(TECHNICAL_QUESTIONS[skill])
            questions.append({
                "question": question,
                "type": "technical",
                "skill_area": skill
            })
    
    # Fill remaining slots with general technical questions
    while len(questions) < num_questions:
        skill = random.choice(list(TECHNICAL_QUESTIONS.keys()))
        question = random.choice(TECHNICAL_QUESTIONS[skill])
        if not any(q["question"] == question for q in questions):
            questions.append({
                "question": question,
                "type": "technical",
                "skill_area": skill
            })
    
    return questions

def generate_behavioral_questions(num_questions=3):
    """Generate behavioral interview questions."""
    selected_questions = random.sample(BEHAVIORAL_QUESTIONS, min(num_questions, len(BEHAVIORAL_QUESTIONS)))
    return [{
        "question": q,
        "type": "behavioral",
        "skill_area": "general"
    } for q in selected_questions]

def generate_experience_questions(experience_info, num_questions=3):
    """Generate questions based on work experience."""
    questions = []
    
    if experience_info:
        for i, exp in enumerate(experience_info[:num_questions]):
            template = random.choice(EXPERIENCE_QUESTIONS)
            question = template.format(experience=exp)
            questions.append({
                "question": question,
                "type": "experience",
                "skill_area": "experience"
            })
    
    return questions

def generate_education_questions(education_info, num_questions=2):
    """Generate questions based on education."""
    questions = []
    
    if education_info:
        for edu in education_info[:num_questions]:
            template = random.choice(EDUCATION_QUESTIONS)
            question = template.format(education=edu)
            questions.append({
                "question": question,
                "type": "education",
                "skill_area": "education"
            })
    
    return questions

def generate_interview_questions(resume_text):
    """Generate a comprehensive set of interview questions based on resume content."""
    # Extract information from resume
    skills = extract_skills(resume_text)
    experience_info = extract_experience_info(resume_text)
    education_info = extract_education_info(resume_text)
    
    all_questions = []
    
    # Generate different types of questions
    all_questions.extend(generate_technical_questions(skills, 6))
    all_questions.extend(generate_behavioral_questions(4))
    all_questions.extend(generate_experience_questions(experience_info, 3))
    all_questions.extend(generate_education_questions(education_info, 2))
    
    # Shuffle questions for variety
    random.shuffle(all_questions)
    
    return all_questions[:15]  # Return top 15 questions