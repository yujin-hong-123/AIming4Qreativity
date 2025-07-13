import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Start.css";

function Start() {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("Waiting for speech...");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const listeningRef = useRef(true);

  useEffect(() => {
    // Start mic immediately and wait for speech
    initMicAndDetectSpeech();
    return () => {
      stopAll(); // Cleanup
    };
  }, []);

  const initMicAndDetectSpeech = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;

      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      // Listen for speech
      detectSpeech(() => {
        startRecording();
      }, 0.03); // threshold = 0.03
    } catch (err) {
      console.error("Microphone access error:", err);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    audioChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
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
    setStatus("Recording...");

    detectSilence(() => {
      stopRecording();
    }, 2500, 0.07); // stop if 2 seconds of silence

  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  
    setRecording(false);
    setStatus("Finished recording");
  
    stopAll();
  
    // Wait briefly, then restart listening
    setTimeout(() => {
      setStatus("Waiting for speech...");
      listeningRef.current = true;
      initMicAndDetectSpeech(); // 🔁 Restart passive listening
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
        Hello
      </button>
    </div>
  );
}

export default Start;
