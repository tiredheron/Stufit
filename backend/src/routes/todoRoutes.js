const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todoController");

// GET /todo/list?user_id=xxx&date=YYYY-MM-DD
router.get("/list", todoController.getTodoList);

module.exports = router;
