import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Start.css";

function Start() {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  const handleStartClick = () => {
    navigate("/home");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
  
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
  
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
  
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recording.wav";
        a.click();
      };
  
      mediaRecorder.start();
      setRecording(true);
  
      // Setup audio context for silence detection
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
  
      detectSilence(() => {
        stopRecording();
      }, 2000, 0.03); // 2s of silence at < 0.02 RMS
    } catch (err) {
      console.error("Microphone access error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    setRecording(false);

    // Cleanup audio context
    silenceTimerRef.current && clearTimeout(silenceTimerRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const detectSilence = (onSilence, timeout = 2000, threshold = 0.02) => {
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.fftSize);
  
    analyser.fftSize = 512; // smaller = faster detection
    const check = () => {
      analyser.getByteTimeDomainData(data);
      let sumSquares = 0;
      for (let i = 0; i < data.length; i++) {
        const normalized = (data[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / data.length);
      // console.log("Volume RMS:", rms.toFixed(4));
  
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
  
      if (recording) {
        requestAnimationFrame(check);
      }
    };
  
    check();
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

