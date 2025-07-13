import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Start.css";

function Start() {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleStartClick = () => {
    navigate("/home");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const a = document.createElement("a");
        a.href = audioUrl;
        a.download = "recording.wav";
        a.click();
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleMicClick = () => {
    recording ? stopRecording() : startRecording();
  };

  return (
    <div className="start-page">
      <button className="start-button" onClick={handleStartClick}>
        Hello
      </button>

      <button className="mic-button" onClick={handleMicClick}>
        {recording ? "Stop Mic" : "🎤"}
      </button>
    </div>
  );
}

export default Start;
