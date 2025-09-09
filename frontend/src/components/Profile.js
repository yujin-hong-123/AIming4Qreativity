import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

function Profile() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    dementia_stage: "",
    caretaker_name: "",
    caretaker_relationship: "",
    caretaker_number: "",
    caretaker_email: "",
    doctor_name: "",
    doctor_email: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/users");
        if (res.ok) {
          const data = await res.json();
          if (data && data.name) setForm(data);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    }
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert("User profile saved!");
      } else {
        alert("Failed to save user.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  const handleClose = () => navigate(-1);

  return (
    <div className="profile-page">
      <div className="profile-card">
        <button className="close-button" onClick={handleClose} aria-label="Close">
          &times;
        </button>

        <header className="profile-header">
          <h2>{form.name ? "Edit Patient Profile" : "Set Up Patient Profile"}</h2>
          <p className="profile-subtitle">
            Keep key info in one place so Gran-Bot can help faster.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="profile-grid">
          {/* Patient */}
          <div className="form-section">
            <h3 className="section-title">Patient</h3>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Patient Name" required />
            </div>
            <div className="field">
              <label htmlFor="age">Age</label>
              <input id="age" name="age" type="number" value={form.age} onChange={handleChange} placeholder="Patient Age" />
            </div>
            <div className="field">
              <label htmlFor="dementia_stage">Dementia Stage</label>
              <input id="dementia_stage" name="dementia_stage" value={form.dementia_stage} onChange={handleChange} placeholder="e.g., Mild" />
            </div>
          </div>

          {/* Caretaker */}
          <div className="form-section">
            <h3 className="section-title">Caretaker</h3>
            <div className="field">
              <label htmlFor="caretaker_name">Name</label>
              <input id="caretaker_name" name="caretaker_name" value={form.caretaker_name} onChange={handleChange} placeholder="Caretaker Name" required />
            </div>
            <div className="field">
              <label htmlFor="caretaker_relationship">Relationship</label>
              <input id="caretaker_relationship" name="caretaker_relationship" value={form.caretaker_relationship} onChange={handleChange} placeholder="e.g., Daughter" required />
            </div>
            <div className="field">
              <label htmlFor="caretaker_number">Phone</label>
              <input id="caretaker_number" name="caretaker_number" value={form.caretaker_number} onChange={handleChange} placeholder="(555) 555-5555" required />
            </div>
            <div className="field">
              <label htmlFor="caretaker_email">Email</label>
              <input id="caretaker_email" name="caretaker_email" type="email" value={form.caretaker_email} onChange={handleChange} placeholder="name@example.com" required />
            </div>
          </div>

          {/* Doctor */}
          <div className="form-section">
            <h3 className="section-title">Doctor</h3>
            <div className="field">
              <label htmlFor="doctor_name">Name</label>
              <input id="doctor_name" name="doctor_name" value={form.doctor_name} onChange={handleChange} placeholder="Doctor Name" required />
            </div>
            <div className="field">
              <label htmlFor="doctor_email">Email</label>
              <input id="doctor_email" name="doctor_email" type="email" value={form.doctor_email} onChange={handleChange} placeholder="doctor@example.com" required />
            </div>
          </div>

          <div className="actions">
            <button type="submit" className="send-button save-button">Save Profile</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
