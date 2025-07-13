import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:5000/home")
      .then(res => res.json())
      .then(data => setMsg(data.message))
      .catch(err => console.error("Failed to fetch:", err));
  }, []);

  return (
    <div className="home">
      <h2>{msg || "Loading..."}</h2>
      <div className="home-buttons">
        <button onClick={() => navigate("/profile")}>Profile</button>
        <button onClick={() => navigate("/reminder")}>Reminder</button>
        <button onClick={() => navigate("/calendar")}>Calendar</button>
        <button onClick={() => navigate("/log")}>Log</button>
      </div>
    </div>
  );
}

export default Home;
