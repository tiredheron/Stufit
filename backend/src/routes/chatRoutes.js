// src/routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// 채팅 저장
router.post("/save", chatController.saveChat);

// 특정 플랜 채팅 불러오기
router.get("/:plan_id", chatController.getChatByPlanId);

module.exports = router;
