import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../styles/Calendar.css";

function Calendar() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data); // assuming backend returns array of { title, date }
        }
      })
      .catch((err) => console.error("Failed to fetch events:", err));
  }, []);

  const handleDateClick = (info) => {
    const title = prompt("Enter event title:");
    if (!title) return;

    const newEvent = { title, date: info.dateStr };

    fetch("http://127.0.0.1:5000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    })
      .then((res) => {
        if (res.ok) {
          setEvents((prev) => [...prev, newEvent]); // display immediately
        } else {
          alert("Failed to save event");
        }
      })
      .catch((err) => {
        console.error("Failed to save event", err);
        alert("Error saving event");
      });
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="calendar-container">
      <button className="close-button" onClick={handleClose}>&times;</button>
      <h2>My Calendar</h2>
      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: ""
          }}
          height="auto"
        />
      </div>
    </div>
  );
}

export default Calendar;
