const express = require("express");
const router = express.Router();
const rankingController = require("../controllers/rankingController");

// GET /ranking/personal?user_id=xxx
router.get("/personal", rankingController.getPersonalRanking);

// GET /ranking/department?user_id=xxx
router.get("/department", rankingController.getDepartmentRanking);

module.exports = router;
