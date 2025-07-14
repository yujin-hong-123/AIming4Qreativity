import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Recorder from "recorder-js";
import "../styles/Start.css";

function Start() {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("Waiting for speech...");

  const recorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const listeningRef = useRef(true);

  useEffect(() => {
    initMicAndDetectSpeech();
    return () => stopAll();
  }, []);

  const initMicAndDetectSpeech = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      recorderRef.current = new Recorder(audioContextRef.current);
      await recorderRef.current.init(stream);

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;

      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      detectSpeech(() => {
        startRecording();
      }, 0.03);
    } catch (err) {
      console.error("Microphone access error:", err);
    }
  };

  const startRecording = () => {
    recorderRef.current.start();
    setRecording(true);
    setStatus("Recording...");

    detectSilence(() => {
      stopRecording();
    }, 5000, 0.5);
  };

  const handleChatClick = () => {
    // Make a POST request to the Flask endpoint to run the script
    fetch("http://127.0.0.1:5000/run-audio-llm", {
      method: "POST",
    })
      .then(res => res.json())
      .then(data => {
        console.log("Script output:", data);
        // Navigate to the chat page after the script runs
        navigate("/chat");
      })
      .catch(err => {
        console.error("Error running the script:", err);
        alert("There was an error triggering the chat functionality.");
      });
  };

  const stopRecording = async () => {
    const { blob } = await recorderRef.current.stop();
  
    // ✅ 1. Download locally
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recording.wav";
    a.click();
  
    // ✅ 2. Upload to backend
    const formData = new FormData();
    formData.append("audio", blob, "recording.wav");
  
    try {
      const response = await fetch("http://127.0.0.1:5000/api/upload-audio", {
        method: "POST",
        body: formData,
      });
  
      const result = await response.json();
      console.log("Upload response:", result);
    } catch (err) {
      console.error("Upload error:", err);
    }
  
    setRecording(false);
    setStatus("Finished recording");
    stopAll();
  
    // ✅ 3. Restart listening
    setTimeout(() => {
      setStatus("Waiting for speech...");
      listeningRef.current = true;
      initMicAndDetectSpeech();
    }, 1000);
  };
  
  

  const stopAll = () => {
    silenceTimerRef.current && clearTimeout(silenceTimerRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const detectSpeech = (onSpeech, threshold = 0.06) => {
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.fftSize);

    const check = () => {
      analyser.getByteTimeDomainData(data);
      let sumSquares = 0;
      for (let i = 0; i < data.length; i++) {
        const normalized = (data[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / data.length);

      if (rms > threshold && listeningRef.current) {
        listeningRef.current = false;
        onSpeech();
        return;
      }
      requestAnimationFrame(check);
    };

    check();
  };

  const detectSilence = (onSilence, timeout = 2000, threshold = 0.03) => {
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.fftSize);

    const check = () => {
      analyser.getByteTimeDomainData(data);
      let sumSquares = 0;
      for (let i = 0; i < data.length; i++) {
        const normalized = (data[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / data.length);

      if (rms < threshold) {
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            onSilence();
            silenceTimerRef.current = null;
          }, timeout);
        }
      } else {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      if (recording) requestAnimationFrame(check);
    };

    check();
  };

  return (
  <div className="start-page">
    <div className="status">{status}</div>
    <button className="start-button" onClick={() => navigate("/home")}>
  <div className="logo-container">
    <img src="/AppLogo.png" alt="App Logo" className="logo" />
    <div className="logo-text">Gran-Bot</div>
  </div>
</button>
    <button className="send-button" onClick={handleChatClick}>Send</button>
  </div>
);

}

export default Start;
