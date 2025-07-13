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
          setLogs(data);
        } else {
          console.error("Failed to fetch logs");
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    }

    fetchLogs();
  }, []);

  const handleClose = () => {
    navigate(-1); // Go back
  };

  return (
    <div className="log-container">
      <button className="close-button" onClick={handleClose}>
        &times;
      </button>
      <h2>Daily Log</h2>
      <ul className="log-list">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <li key={index}>
              <strong>{log.date}</strong>: {log.description}
            </li>
          ))
        ) : (
          <p>No logs available.</p>
        )}
      </ul>
    </div>
  );
}

export default Log;
