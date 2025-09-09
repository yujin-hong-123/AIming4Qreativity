import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Reminder.css";

function Reminder() {
  const [form, setForm] = useState({ time: "", label: "" });
  const [reminders, setReminders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/reminders")
      .then(res => res.json())
      .then(setReminders)
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
        setForm({ time: "", label: "" });
        const newReminders = await fetch("http://127.0.0.1:5000/api/reminders").then(r => r.json());
        setReminders(newReminders);
      } else {
        alert("Failed to save reminder");
      }
    } catch (err) {
      console.error("Error submitting reminder:", err);
    }
  };

  const handleClose = () => navigate(-1);

  return (
    <div className="reminder-page">
      <div className="reminder-card">
        <button className="close-button" onClick={handleClose} aria-label="Close">
          &times;
        </button>

        <header className="reminder-header">
          <h2>Create Reminder</h2>
          <p className="subtitle">Set gentle nudges for meds, appointments, and daily routines.</p>
        </header>

        <form onSubmit={handleSubmit} className="reminder-form">
          <div className="field">
            <label htmlFor="time">Time</label>
            <input
              id="time"
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="label">Label</label>
            <input
              id="label"
              type="text"
              name="label"
              placeholder="e.g., Take blood pressure meds"
              value={form.label}
              onChange={handleChange}
              required
            />
          </div>

          <div className="actions">
            {/* Reuse your pink button style */}
            <button type="submit" className="send-button add-button">Add Reminder</button>
          </div>
        </form>
      </div>

      <section className="reminder-list-wrap">
        <h3>Saved Reminders</h3>

        {reminders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-bubble">No reminders yet</div>
            <p>Add your first reminder above.</p>
          </div>
        ) : (
          <ul className="reminder-list">
            {reminders.map((r) => (
              <li className="reminder-item" key={r.id}>
                <span className="time-badge">{r.time}</span>
                <span className="item-label">{r.label}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Reminder;
