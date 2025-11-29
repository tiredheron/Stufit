const express = require("express");
const router = express.Router();
const recordController = require("../controllers/recordController");

// GET /record/summary?mode=learning|exam
router.get("/summary", recordController.getRecordSummary);

module.exports = router;
