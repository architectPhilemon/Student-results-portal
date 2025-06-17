import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../App.css";

function Home() {
  return (
    <motion.div className="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="overlay">
        <h1>Welcome to XYZ Academy</h1>
        <p>Your academic performance tracking made easy.</p>
        <Link to="/register" className="btn">Register</Link>
        <Link to="/results" className="btn">Check Results</Link>
      </div>
    </motion.div>
  );
}

export default Home;
