import React, { useState } from "react";

export default function Generator() {
  const [template, setTemplate] = useState("basic");

  const generate = async () => {
    const user = localStorage.getItem("user");
    const res = await fetch("http://localhost:5000/api/generator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, template })
    });
    const data = await res.json();
    alert("Generated: " + data.file);
  };

  return (
    <div>
      <h2>Site Generator</h2>
      <select value={template} onChange={e => setTemplate(e.target.value)}>
        <option value="basic">Basic</option>
        <option value="modern">Modern</option>
      </select>
      <button onClick={generate}>Generate Site</button>
    </div>
  );
}

