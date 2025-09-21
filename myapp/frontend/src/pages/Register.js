import React, { useState } from "react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      alert("Registered! You can log in now.");
    } else {
      alert(data.error);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="User" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button onClick={register}>Register</button>
    </div>
  );
}

