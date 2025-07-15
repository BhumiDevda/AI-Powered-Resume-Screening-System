import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { Route, Routes } from "react-router-dom";  
import Dashboard from "./Dashboard";  

function App() {
    const [jobDescription, setJobDescription] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [totalBatches, setTotalBatches] = useState(0);
    const [processedBatches, setProcessedBatches] = useState(0);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [skillFilter, setSkillFilter] = useState('all');
    const [allSkills, setAllSkills] = useState([]);

    const fetchSkills = useCallback(() => {
        if (results.length > 0) {
            const uniqueSkills = new Set();
            results.forEach(result => {
                if (result.skills && Array.isArray(result.skills)) {
                    result.skills.forEach(skill => uniqueSkills.add(skill));
                }
            });
            setAllSkills([...uniqueSkills]);
        }
    }, [results]);

    useEffect(() => {
        fetchSkills();
    }, [results, fetchSkills]);

    const handleFileChange = (event) => {
        setSelectedFiles(event.target.files);
    };

    const handleDownload = (filename) => {
        const downloadLink = `http://127.0.0.1:5000/download/${filename}`;
        window.open(downloadLink, '_blank');  
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage('');

        const batchSize = 100;  
        const files = Array.from(selectedFiles);
        const totalBatches = Math.ceil(files.length / batchSize);
        setTotalBatches(totalBatches);
        setProcessedBatches(0);

        let allResults = []; // ✅ Store all results here
        

        for (let batch = 0; batch < totalBatches; batch++) {
            const start = batch * batchSize;
            const end = start + batchSize;
            const batchFiles = files.slice(start, end);

            const formData = new FormData();
            formData.append('job_description', jobDescription);
            batchFiles.forEach((file) => formData.append('resumes', file));
            formData.append('clear_database', batch === 0 ? 'true' : 'false');
            
            try {
                const response = await axios.post('http://127.0.0.1:5000/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                console.log('Batch Response:', response.data);

                if (response.data && response.data.results) {
                    allResults = [...allResults, ...response.data.results]; // ✅ Append batch results
                    setProcessedBatches(prev => prev + 1);
                } else {
                    setErrorMessage('Failed to process the request. Please try again.');
                    setResults([]);
                    break;
                }
            } catch (error) {
                console.error('Error:', error);
                setErrorMessage('Failed to connect to the server. Please try again.');
                setResults([]);
                break;
            }
        }

        setResults(allResults); // ✅ Update results state after processing all batches
        setLoading(false);

        // ✅ Automatically open the dashboard in a new tab after batch processing is complete
        setTimeout(() => {
            window.open("http://localhost:3000/dashboard", "_blank");
        }, 1000);
    };
    const filteredResults = () => {
        if (!results || !Array.isArray(results)) return [];
        
        let filteredData = [...results];
        if (filter !== 'all') {
            filteredData = filteredData.filter((item) => item.fit_label === filter);
        }
        
        if (searchQuery) {
            filteredData = filteredData.filter((item) =>
                item.filename.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        if (skillFilter !== 'all') {
            filteredData = filteredData.filter((item) =>
                item.skills.includes(skillFilter)
            );
        }

        return filteredData;
    };
    return (
        <div className="container">
            <Routes>  
                <Route path="/" element={
                    <>
                        <h2>Resume Matcher</h2>

                        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                        {loading && (
                            <div className="alert alert-info" role="alert">
                                <div>Processing batches ({processedBatches}/{totalBatches})</div>
                                <div className="progress mt-2">
                                    <div
                                        className="progress-bar"
                                        role="progressbar"
                                        style={{
                                            width: `${(processedBatches / totalBatches) * 100}%`,
                                            backgroundColor: '#000080'
                                        }}
                                        aria-valuenow={(processedBatches / totalBatches) * 100}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    >
                                        {Math.round((processedBatches / totalBatches) * 100)}%
                                    </div>
                                </div>
                                <div className="mt-2">
                                    Processing batch {processedBatches + 1} of {totalBatches}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="border p-4 rounded bg-light">
                            <div className="mb-3">
                                <label className="form-label">Job Description</label>
                                <textarea className="form-control" rows="4" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} required />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Upload Resumes</label>
                                <input type="file" className="form-control" multiple onChange={handleFileChange} required />
                            </div>

                            <div className="mb-3">
                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? 'Processing...' : 'Match Resumes'}
                                </button>
                            </div>
                        </form>
                        <div className="filter-section mb-3">
                <div>
                    <label>Filter by Fit:</label>
                    <select 
                        className="form-select" 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="Fit">Fit</option>
                        <option value="Not Fit">Not Fit</option>
                    </select>
                </div>
                <div>
                    <label>Search by Filename:</label>
                    <input 
                        type="text" 
                        className="form-control search-input" 
                        placeholder="Search..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div>
                    <label>Filter by Skill:</label>
                    <select 
                        className="form-select" 
                        value={skillFilter} 
                        onChange={(e) => setSkillFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        {allSkills.map((skill, index) => (
                            <option key={index} value={skill}>{skill}</option>
                        ))}
                    </select>
                </div>
            </div>

                        {/* Results Table (Now Displays Uploaded Resumes) */}
                        <div className="mt-4">
                          <h3>Results</h3>
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th>Filename</th>
                                <th>Similarity Score</th>
                                <th>Fit Label</th>
                                <th>Skills</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredResults().length > 0 ? (
                                filteredResults().map((result, index) => (
                                  <tr key={index}>
                                    <td>{result.filename}</td>
                                    <td>{result.similarity_score ?? "N/A"}</td>
                                    <td>{result.fit_label ?? "N/A"}</td>
                                    <td>{result.skills?.join(', ') || "No skills found"}</td>
                                    <td>
                                    <button 
                                        className="btn btn-link" 
                                        onClick={() => handleDownload(result.filename)}
                                    >
                                        Download
                                    </button>
                                </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="5" className="text-center">
                                    {results.length > 0 ? "No matching resumes found" : "No resumes processed yet"}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                    </>
                } />
                <Route path="/dashboard" element={<Dashboard />} />  
            </Routes>
        </div>
    );
}

export default App;
