import React, { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("user", data.user.username);
      alert("Logged in!");
    } else {
      alert(data.error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="User" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button onClick={login}>Login</button>
    </div>
  );
}

