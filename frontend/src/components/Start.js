import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Recorder from "recorder-js";
import "../styles/Start.css";

function Start() {
  const navigate = useNavigate();

  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("Ready");

  const recorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // Prepare mic + recorder once on mount
    initMic();
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current =
        new (window.AudioContext || window.webkitAudioContext)();

      recorderRef.current = new Recorder(audioContextRef.current);
      await recorderRef.current.init(stream);

      setStatus("Mic ready");
    } catch (err) {
      console.error("Microphone access error:", err);
      setStatus("Mic permission denied");
    }
  };

  const startRecording = async () => {
    try {
      // In case the context is suspended until user gesture
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }
      await recorderRef.current.start();
      setRecording(true);
      setStatus("Recording… Click to stop & send");
    } catch (err) {
      console.error("Start recording error:", err);
      setStatus("Failed to start recording");
    }
  };

  const stopRecording = async () => {
    try {
      setStatus("Stopping…");
      const { blob } = await recorderRef.current.stop();

      // Optional: download locally
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recording.wav";
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        // Non-fatal
      }

      // Upload to backend
      setStatus("Uploading audio…");
      const formData = new FormData();
      formData.append("audio", blob, "recording.wav");

      const uploadRes = await fetch("http://127.0.0.1:5000/api/upload-audio", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload failed: ${uploadRes.status}`);
      }

      // Trigger LLM run immediately after upload, then go to chat
      setStatus("Processing…");
      const runRes = await fetch("http://127.0.0.1:5000/run-audio-llm", {
        method: "POST",
      });

      if (!runRes.ok) {
        throw new Error(`Run failed: ${runRes.status}`);
      }

      setStatus("Sent! Redirecting…");
      navigate("/chat");
    } catch (err) {
      console.error("Stop/send error:", err);
      alert("There was an error sending your recording.");
      setStatus("Error while sending");
    } finally {
      setRecording(false);
      // Keep mic initialized for the next recording; if you prefer to fully stop:
      // stopAll();
    }
  };

  const stopAll = () => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      recorderRef.current = null;
    } catch (e) {
      // ignore
    }
  };

  const onRecordButtonClick = () => {
    if (!recorderRef.current) {
      // If init failed earlier (e.g., permission changed), try again
      initMic().then(() => startRecording());
      return;
    }
    if (!recording) startRecording();
    else stopRecording();
  };

  return (
    <div className="start-page">
      <div className="status">{status}</div>

      <button className="start-button" onClick={() => navigate("/home")}>
        <div className="logo-container">
          <img src="/AppLogo.png" alt="App Logo" className="logo" />
          <div className="logo-text">Gran-Bot</div>
          <div className="logo-subtext">Click here to start</div>
        </div>
      </button>

      <button
        className={`send-button ${recording ? "recording" : ""}`}
        onClick={onRecordButtonClick}
      >
        {recording ? "Stop & Send" : "Start Recording"}
      </button>
    </div>
  );
}

export default Start;
