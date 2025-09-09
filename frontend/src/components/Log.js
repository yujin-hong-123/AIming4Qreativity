import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Log.css";

function Log() {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/logs");
        if (res.ok) {
          const data = await res.json();
          setLogs(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to fetch logs");
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    }
    fetchLogs();
  }, []);

  const handleClose = () => navigate(-1);

  return (
    <div className="log-page">
      <div className="log-card">
        <button className="close-button" onClick={handleClose} aria-label="Close">
          &times;
        </button>

        <header className="log-header">
          <h2>Daily Log</h2>
          <p className="subtitle">Quick snapshots of each day.</p>
        </header>

        {logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-bubble">No logs yet</div>
            <p>Add entries from other pages, and they’ll appear here.</p>
          </div>
        ) : (
          <ul className="log-list">
            {logs.map((log, index) => (
              <li className="log-item" key={index}>
                <div className="log-left-accent" />
                <div className="log-content">
                  <span className="date-badge">{log.date}</span>
                  <p className="log-text">{log.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Log;
