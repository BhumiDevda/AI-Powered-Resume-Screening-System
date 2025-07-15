import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";  // ✅ Import BrowserRouter
import App from "./App";
import './index.css';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>  {/* ✅ Wrap the entire app inside BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
