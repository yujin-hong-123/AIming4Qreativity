import React, { useState, useEffect } from "react";
import "../styles/Reminder.css";

function Reminder() {
  const [form, setForm] = useState({ time: "", label: "", repeat_daily: true });
  const [reminders, setReminders] = useState([]);

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
        setForm({ time: "", label: "", repeat_daily: true });
        const newReminders = await fetch("http://127.0.0.1:5000/api/reminders").then(r => r.json());
        setReminders(newReminders);
      } else {
        alert("Failed to save reminder");
      }
    } catch (err) {
      console.error("Error submitting reminder:", err);
    }
  };

  return (
    <div className="reminder-page">
      <h2>Create Reminder</h2>
      <form onSubmit={handleSubmit}>
        <input type="time" name="time" value={form.time} onChange={handleChange} required />
        <input type="text" name="label" placeholder="Reminder Label" value={form.label} onChange={handleChange} required />
        <label>
          <input type="checkbox" name="repeat_daily" checked={form.repeat_daily} onChange={handleChange} />
          Repeat Daily
        </label>
        <button type="submit">Add Reminder</button>
      </form>

      <h3>Saved Reminders</h3>
      <ul>
        {reminders.map((r) => (
          <li key={r.id}>
            {r.time} — {r.label} {r.repeat_daily ? "(Daily)" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Reminder;
