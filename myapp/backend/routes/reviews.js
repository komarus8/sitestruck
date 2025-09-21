const express = require("express");
const router = express.Router();

let reviews = [];

router.get("/", (req, res) => {
  res.json(reviews);
});

router.post("/", (req, res) => {
  const { username, rating, text } = req.body;
  if (reviews.find(r => r.username === username)) {
    return res.status(400).json({ error: "You already reviewed" });
  }
  const review = { id: Date.now(), username, rating, text };
  reviews.push(review);
  res.json(review);
});

router.delete("/:id", (req, res) => {
  reviews = reviews.filter(r => r.id !== parseInt(req.params.id));
  res.json({ success: true });
});

module.exports = router;

