import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Reminder.css";

function Reminder() {
  const [form, setForm] = useState({ time: "", label: ""});
  const [reminders, setReminders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/reminders")
      .then(res => res.json())
      .then(setReminders)
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:5000/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert("Reminder saved!");
        setForm({ time: "", label: ""});
        const newReminders = await fetch("http://127.0.0.1:5000/api/reminders").then(r => r.json());
        setReminders(newReminders);
      } else {
        alert("Failed to save reminder");
      }
    } catch (err) {
      console.error("Error submitting reminder:", err);
    }
  };

  const handleClose = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="reminder-page">
      <button className="close-button" onClick={handleClose}>&times;</button>
      <h2>Create Reminder</h2>
      <form onSubmit={handleSubmit}>
        <input type="time" name="time" value={form.time} onChange={handleChange} required />
        <input type="text" name="label" placeholder="Reminder Label" value={form.label} onChange={handleChange} required />
        <button type="submit">Add Reminder</button>
      </form>

      <h3>Saved Reminders</h3>
      <ul>
        {reminders.map((r) => (
          <li key={r.id}>
            {r.time} — {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Reminder;
