const express = require("express");
const router = express.Router();

// tutaj tylko atrapa generowania zipa
router.post("/", (req, res) => {
  const { username, template } = req.body;
  res.json({ success: true, file: `${template}-site.zip` });
});

module.exports = router;

