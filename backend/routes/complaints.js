const express = require("express");
const router = express.Router();
const controller = require("../controllers/complaintsController");

router.post("/add", controller.addComplaint);
router.get("/", controller.getComplaints);

module.exports = router;
