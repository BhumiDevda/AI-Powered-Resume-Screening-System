import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Label 
} from "recharts";
import "./Dashboard.css";  // ✅ Import custom styling

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/dashboard")
      .then(response => setData(response.data))
      .catch(error => console.error("Error fetching dashboard data:", error));
  }, []);

  if (!data) return <p className="loading-text">Loading dashboard...</p>;

  const COLORS = ["#0088FE", "#FF0000"];  // ✅ Blue for Fit, Red for Not Fit
  const fitStats = Object.entries(data.fit_distribution).map(([key, value], index) => ({
    name: key,
    value,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

      {/* Summary Stats */}
      <div className="dashboard-cards">
        <div className="card">
          <h4>Total Job Descriptions</h4>
          <p>{data.total_jobs}</p>
        </div>
        <div className="card">
          <h4>Total Resumes Processed</h4>
          <p>{data.total_resumes}</p>
        </div>
        <div className="card">
          <h4>Average Similarity Score</h4>
          <p>{data.avg_similarity}%</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-container">
        {/* Fit vs. Not Fit Ratio */}
        <div className="chart-box">
          <h4>Fit vs Not Fit</h4>
          <PieChart width={400} height={350}>  
            <Pie 
              data={fitStats} 
              dataKey="value" 
              nameKey="name" 
              cx="54.5%"   
              cy="44.5%" 
              outerRadius={110}  
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}  
              labelStyle={{ fontSize: "10px", fontWeight: "bold" }}  
              labelLine={true}  
            >
              {fitStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
            </Pie>
            <Tooltip />
            <Legend align="center" verticalAlign="bottom" iconSize={10} />  
          </PieChart>
        </div>

        {/* Top Skills Chart */}
        <div className="chart-box">
          <h4>Top Extracted Skills</h4>
          <BarChart
            width={500}  // ✅ Increased width for better label spacing
            height={320}
            data={data.top_skills}  
            margin={{ top: 20, right: 30, left: 40, bottom: 60 }}  // ✅ More bottom margin for rotated labels
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="skill" 
              tick={{ angle: -30, textAnchor: "end", fontSize: 12 }}  // ✅ Rotated labels for visibility
              interval={0}  // ✅ Ensures all labels are shown
            >
              <Label value="Skills" offset={-40} position="insideBottom" />
            </XAxis>
            <YAxis>
              <Label value="Count" angle={-90} position="insideLeft" />
            </YAxis>
            <Tooltip />
            <Legend verticalAlign="top" align="right" iconSize={12} wrapperStyle={{ paddingBottom: 10 }} />  {/* ✅ Fixed legend position */}
            <Bar dataKey="count" fill="#FF8C00" label={{ position: "top", fontSize: 12 }} />
          </BarChart>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
