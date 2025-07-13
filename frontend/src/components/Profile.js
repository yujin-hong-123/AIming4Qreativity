import React, { useState, useEffect } from "react";
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

  // Fetch existing user data on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/users");
        if (res.ok) {
          const data = await res.json();
          setForm(data);
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
    console.log("Submitting form data:", form);
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

  return (
    <div className="profile-form">
      <h2>Patient Profile</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Patient Name" value={form.name} onChange={handleChange} required />
        <input name="age" type="number" placeholder="Patient Age" value={form.age} onChange={handleChange} />
        <input name="dementia_stage" placeholder="Stage of Dementia" value={form.dementia_stage} onChange={handleChange} />
        <input name="caretaker_name" placeholder="Caretaker Name" value={form.caretaker_name} onChange={handleChange} required />
        <input name="caretaker_relationship" placeholder="Caretaker Relationship" value={form.caretaker_relationship} onChange={handleChange} required />
        <input name="caretaker_number" placeholder="Caretaker Phone Number" value={form.caretaker_number} onChange={handleChange} required />
        <input name="caretaker_email" type="email" placeholder="Caretaker Email" value={form.caretaker_email} onChange={handleChange} required />
        <input name="doctor_name" placeholder="Doctor Name" value={form.doctor_name} onChange={handleChange} required />
        <input name="doctor_email" type="email" placeholder="Doctor Email" value={form.doctor_email} onChange={handleChange} required />
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
}

export default Profile;

