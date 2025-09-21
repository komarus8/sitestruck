import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyPages from "./pages/MyPages";
import Generator from "./pages/Generator";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mypages" element={<MyPages />} />
        <Route path="/generator" element={<Generator />} />
      </Routes>
    </Router>
  );
}

export default App;

