const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todoController");

// GET /todo/list?user_id=xxx&date=YYYY-MM-DD
router.get("/list", todoController.getTodoList);

router.patch("/status", todoController.updateStatus);
router.patch("/time", todoController.updateTime);

module.exports = router;
