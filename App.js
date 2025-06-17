import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import StudentRegister from "./pages/StudentRegister";
import StudentResults from "./pages/StudentResults";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<StudentRegister />} />
        <Route path="/results" element={<StudentResults />} />
      </Routes>
    </Router>
  );
}

export default App;
