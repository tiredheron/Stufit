const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

// AI 계획 저장
router.post("/save", aiController.saveAiPlan);

module.exports = router;
