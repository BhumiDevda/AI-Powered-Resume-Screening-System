import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const InterviewPractice = () => {
    const [resumeText, setResumeText] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [selectedQuestionType, setSelectedQuestionType] = useState('all');

    // Sample resume text from the problem statement
    const sampleResumeText = `BHUMI DEVDA
210 Steeles Ave W, Brampton, ON • 437-998-6413 • bhumidevda.07@gmail.com
www.linkedin.com/in/bhumi-devda • www.github.com/BhumiDevda

OBJECTIVE
Seeking a junior fullstack software developer and data analyst role to gain practical experience in building web applications using MERN stack, and applying Python, SQL, Power BI, and cloud technologies to analyze data, generate insights, and support data-driven decisions.

SUMMARY OF QUALIFICATIONS
• Over one year of experience as a Data Analyst using Python, SQL, Power BI, Excel, FastAPI, and cloud technologies
• Experienced in data research, analysis, and testing, including creating and reviewing test plans, strategies, test cases, test data, and defect lists
• Holds a Bachelor's degree in Data Science
• Familiar with Agile methodology and version control using Git
• Strong soft skills including time management, analytical thinking, and problem-solving

TECHNICAL SKILLS
• Programming and Scripting: Python, SQL, R, Bash, JavaScript, React.js, Node.js, Jupyter Notebook
• Data Analytics and Visualization: Power BI, Excel (Advanced), Matplotlib, Seaborn
• Databases and Data Engineering: MySQL, Oracle, BigQuery, Hadoop, Informatica, ETL processes
• Scheduling and Support Tools: Autosys, BMC Remedy
• CI/CD and DevOps Tools: Jenkins, GitLab CI, Docker, Kubernetes
• Cloud Platforms: AWS, Google Cloud Platform (GCP), Microsoft Azure, DigitalOcean
• Business and Productivity Tools: Microsoft Office 365, SharePoint, Confluence, JIRA

WORK EXPERIENCE
Fullstack Software Developer Intern (Volunteer Experience)
SM Software Solutions Inc, Toronto, Canada 08/2025 to present
• Developed fullstack web application using MERN stack for dynamic user interactions and seamless data management
• Built responsive front-end with React.js to enhance user experience
• Implemented robust back-end using Node.js and Express.js for scalable and secure APIs
• Managed and structured data efficiently with MongoDB
• Utilized Git for version control, collaboration, and effective code management
• Used VS Code for development, debugging, and testing workflows
• Strengthened skills in fullstack development, scalable web application design, and collaborative software engineering

Data Analyst 01/2024 – 04/2025
DND Software Pvt. Ltd., Rajkot, India
• Analyzed large-scale customer behaviour data using SQL and Power BI to uncover churn risk patterns, improving retention
• Interpreted A/B test results from dashboards in Power BI and Excel, guiding product design decisions that boosted user engagement by 15%
• Applied statistical methods, including mean, median, mode, hypothesis testing and regression analysis, to analyze user behavior patterns
• Communicated complex technical findings by breaking down large volumes of structured and unstructured data
• Developed and automated Python-based ETL pipelines, reducing manual reporting effort
• Identified anomaly trends with Matplotlib and Seaborn, enabling same day report fixes
• Built real time KPI dashboards in Power BI, giving sales, finance and product teams instant performance insights
• Optimized SQL queries and data workflows to enhance performance and reduce processing time on cloud platforms

EDUCATION
Internationally Trained Professional Co-op Program In progress
St. Kateri Tekakwitha Catholic Learning Centre, Mississauga, ON

Bachelor's degree in Data Science 2025
University of Mumbai, Mumbai, India`;

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/interview-sessions');
            setSessions(response.data.sessions || []);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const loadSampleResume = () => {
        setResumeText(sampleResumeText);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!resumeText.trim()) {
            setErrorMessage('Please enter resume text.');
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setQuestions([]);

        try {
            const formData = new FormData();
            formData.append('resume_text', resumeText);

            const response = await axios.post('http://127.0.0.1:5000/interview-practice', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data && response.data.questions) {
                setQuestions(response.data.questions);
                setSessionId(response.data.session_id);
                fetchSessions(); // Refresh sessions list
            } else {
                setErrorMessage('Failed to generate questions. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('Failed to connect to the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadSession = async (sessionId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/interview-session/${sessionId}`);
            if (response.data && response.data.questions) {
                setQuestions(response.data.questions);
                setSessionId(sessionId);
            }
        } catch (error) {
            console.error('Error loading session:', error);
            setErrorMessage('Failed to load session.');
        }
    };

    const filteredQuestions = selectedQuestionType === 'all' 
        ? questions 
        : questions.filter(q => q.type === selectedQuestionType);

    const questionTypeStats = questions.reduce((acc, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-12">
                    <h2 className="mb-4">🎯 Interview Practice</h2>
                    <p className="text-muted">
                        Generate personalized interview questions based on your resume content to help you prepare for technical interviews.
                    </p>
                </div>
            </div>

            <div className="row">
                <div className="col-md-8">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5>📝 Resume Input</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Resume Text</label>
                                    <textarea
                                        className="form-control"
                                        rows="10"
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                        placeholder="Paste your resume content here..."
                                        required
                                    />
                                    <div className="mt-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={loadSampleResume}
                                        >
                                            Load Sample Resume
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Generating Questions...
                                            </>
                                        ) : (
                                            '🚀 Generate Interview Questions'
                                        )}
                                    </button>
                                </div>

                                {errorMessage && (
                                    <div className="alert alert-danger" role="alert">
                                        {errorMessage}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {questions.length > 0 && (
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5>❓ Interview Questions ({filteredQuestions.length})</h5>
                                <div>
                                    <select
                                        className="form-select form-select-sm"
                                        value={selectedQuestionType}
                                        onChange={(e) => setSelectedQuestionType(e.target.value)}
                                    >
                                        <option value="all">All Questions</option>
                                        <option value="technical">Technical ({questionTypeStats.technical || 0})</option>
                                        <option value="behavioral">Behavioral ({questionTypeStats.behavioral || 0})</option>
                                        <option value="experience">Experience ({questionTypeStats.experience || 0})</option>
                                        <option value="education">Education ({questionTypeStats.education || 0})</option>
                                    </select>
                                </div>
                            </div>
                            <div className="card-body">
                                {filteredQuestions.map((q, index) => (
                                    <div key={index} className="mb-4 p-3 border rounded">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h6 className="mb-0">Question {index + 1}</h6>
                                            <div>
                                                <span className={`badge ${
                                                    q.type === 'technical' ? 'bg-primary' :
                                                    q.type === 'behavioral' ? 'bg-success' :
                                                    q.type === 'experience' ? 'bg-warning' :
                                                    'bg-info'
                                                } me-2`}>
                                                    {q.type}
                                                </span>
                                                {q.skill_area !== 'general' && q.skill_area !== 'experience' && q.skill_area !== 'education' && (
                                                    <span className="badge bg-secondary">
                                                        {q.skill_area}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="mb-0">{q.question}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header">
                            <h6>📚 Previous Sessions</h6>
                        </div>
                        <div className="card-body">
                            {sessions.length === 0 ? (
                                <p className="text-muted">No previous sessions found.</p>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className={`list-group-item list-group-item-action ${
                                                sessionId === session.id ? 'active' : ''
                                            }`}
                                            onClick={() => loadSession(session.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="d-flex w-100 justify-content-between">
                                                <small>Session #{session.id}</small>
                                                <small>{session.question_count} questions</small>
                                            </div>
                                            <small className="text-muted">
                                                {new Date(session.created_at).toLocaleDateString()}
                                            </small>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {questions.length > 0 && (
                        <div className="card mt-3">
                            <div className="card-header">
                                <h6>📊 Question Summary</h6>
                            </div>
                            <div className="card-body">
                                <div className="row text-center">
                                    <div className="col-6">
                                        <div className="h4 text-primary">{questions.length}</div>
                                        <div className="small text-muted">Total Questions</div>
                                    </div>
                                    <div className="col-6">
                                        <div className="h4 text-success">{Object.keys(questionTypeStats).length}</div>
                                        <div className="small text-muted">Question Types</div>
                                    </div>
                                </div>
                                <hr />
                                <div className="small">
                                    {Object.entries(questionTypeStats).map(([type, count]) => (
                                        <div key={type} className="d-flex justify-content-between">
                                            <span className="text-capitalize">{type}:</span>
                                            <span className="fw-bold">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewPractice;