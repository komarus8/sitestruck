const express = require("express");
const router = express.Router();

// dummy users
let users = [];

router.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: "User exists" });
  }
  users.push({ username, password, purchases: [] });
  res.json({ success: true });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(400).json({ error: "Invalid login" });
  res.json({ success: true, user });
});

module.exports = router;

