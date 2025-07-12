import React, { useEffect, useState } from "react";

function Emergency() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/emergency")
      .then(res => res.json())
      .then(data => setMsg(data.message))
      .catch(err => console.error("Failed to fetch:", err));
  }, []);

  return <h2>{msg || "Loading..."}</h2>;
}

export default Emergency;