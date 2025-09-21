const express = require("express");
const router = express.Router();

// na razie atrapa płatności
router.post("/checkout", (req, res) => {
  const { username, plan } = req.body;
  res.json({ success: true, message: `Fake payment for ${plan} done` });
});

module.exports = router;

