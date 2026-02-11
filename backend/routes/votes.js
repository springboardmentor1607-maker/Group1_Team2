const express = require("express");
const router = express.Router();
const { votes } = require("../db");

router.post("/add", (req, res) => {
  votes.push(req.body);
  res.json({ message: "Vote Added" });
});

module.exports = router;
