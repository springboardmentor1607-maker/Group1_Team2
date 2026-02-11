const express = require("express");
const db = require("../db");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/add", upload.single("photo"), (req, res) => {
  if (!req.session.user) return res.send("login");

  const { title, description } = req.body;
  const photo = req.file ? req.file.filename : "";

  db.query(
    "INSERT INTO complaints(user_id,title,description,photo) VALUES(?,?,?,?)",
    [req.session.user.id, title, description, photo],
    () => res.send("success")
  );
});

router.get("/all", (req, res) => {
  db.query("SELECT * FROM complaints ORDER BY id DESC", (err, data) => {
    res.json(data);
  });
});

router.post("/update", (req, res) => {
  const { id, status, response } = req.body;

  db.query(
    "UPDATE complaints SET status=?, admin_response=? WHERE id=?",
    [status, response, id],
    () => res.send("updated")
  );
});

module.exports = router;
