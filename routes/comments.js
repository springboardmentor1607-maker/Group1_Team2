const express = require("express");
const router = express.Router();
const { comments } = require("../db");

router.post("/add", (req, res) => {
  comments.push(req.body);
  res.json({ message: "Comment Added" });
});

module.exports = router;
