import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import './styles/App.css'
import Home from "./components/Home";
import Profile from "./components/Profile";
import Reminder from "./components/Reminder";
import Calendar from "./components/Calendar";
import Log from "./components/Log";

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reminder" element={<Reminder />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/log" element={<Log />} />
          <Route path="*" element={<Navigate replace to="/home" />} />
        </Routes>
    </Router>
  );
}

export default App;

